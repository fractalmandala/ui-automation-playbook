<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import './pagination.css';
	import { announce } from '../_shared/live-announcer.js';

	export type PaginationFormat = 'standard' | 'compact';
	export type PaginationAppearance = 'outlined' | 'filled' | 'plain';

	export interface PageChangeDetail {
		/** The page that will become / has become active. */
		page: number;
		/** The current page size. */
		pageSize: number;
	}

	/** Default navigation icon names (WA system library, Font Awesome paths inlined below). */
	type IconName = 'chevron-left' | 'chevron-right' | 'angles-left' | 'angles-right';

	interface Props {
		/** The total number of items to paginate. */
		total?: number;
		/** The number of items shown per page. */
		pageSize?: number;
		/** The current page, starting at 1. Bindable: kept within bounds like the source. */
		page?: number;
		/** The number of pages to show on each side of the current page. */
		siblingCount?: number;
		/** The number of pages to always show at the start and end. */
		boundaryCount?: number;
		/** Hides the previous and next buttons. */
		withoutNav?: boolean;
		/** Shows buttons that jump to the first and last pages. */
		withEdges?: boolean;
		/** Shows a summary of the items on the current page, e.g. "1–10 of 237". */
		withSummary?: boolean;
		/** `standard` shows the full page list with ellipses; `compact` collapses it into a short "1 of 5" label. */
		format?: PaginationFormat;
		/**
		 * A URL template used to render page items as links instead of buttons. When set, items render as `<a>`
		 * elements for SSR, SEO, and no-JS support. Provide a string with `{page}` as a placeholder, e.g.
		 * `/products?page={page}`, or a function that receives the page number and returns the URL.
		 * In link mode the component navigates instead of updating itself, exactly like the source.
		 */
		hrefTemplate?: string | ((page: number) => string);
		/** Renders nothing when there's only one page. */
		hideSinglePage?: boolean;
		/** Describes the pagination to assistive devices. Announced as the nav's accessible name. */
		label?: string;
		/** The pagination's visual appearance. */
		appearance?: PaginationAppearance;
		/** Disables the pagination. */
		disabled?: boolean;
		/** An icon to use in lieu of the default previous icon. */
		previousIcon?: Snippet;
		/** An icon to use in lieu of the default next icon. */
		nextIcon?: Snippet;
		/** An icon to use in lieu of the default first icon. */
		firstIcon?: Snippet;
		/** An icon to use in lieu of the default last icon. */
		lastIcon?: Snippet;
		/**
		 * Emitted when the page is about to change but before it does. Return `false` to cancel
		 * (port of `event.preventDefault()` on the cancelable `wa-before-page-change` event).
		 */
		onbeforepagechange?: (detail: PageChangeDetail) => boolean | void;
		/** Emitted after the page changes (port of `wa-page-change`). */
		onpagechange?: (detail: PageChangeDetail) => void;
	}

	let {
		total = 0,
		pageSize = 10,
		page = $bindable(1),
		siblingCount = 2,
		boundaryCount = 1,
		withoutNav = false,
		withEdges = false,
		withSummary = false,
		format = 'standard',
		hrefTemplate = '',
		hideSinglePage = false,
		label = '',
		appearance = 'outlined',
		disabled = false,
		previousIcon,
		nextIcon,
		firstIcon,
		lastIcon,
		onbeforepagechange,
		onpagechange
	}: Props = $props();

	/** How many pages an ellipsis skips when clicked. Matches the source convention (e.g. Ant Design). */
	const JUMP_DISTANCE = 5;

	// English defaults from webawesome/src/translations/en.ts. There is no
	// _shared/localize yet, so only English is available — recorded as a gap.
	const STRINGS = {
		pagination: 'Pagination',
		previousPage: 'Previous page',
		nextPage: 'Next page',
		firstPage: 'First page',
		lastPage: 'Last page',
		compactPageXOfY: (current: number, count: number) => `${current} of ${count}`,
		pageXOfY: (current: number, count: number) => `Page ${current} of ${count}`,
		jumpBackwardX: (count: number) => `Jump back ${count} pages`,
		jumpForwardX: (count: number) => `Jump forward ${count} pages`,
		showingXtoYofZ: (start: number, end: number, count: number) => `${start}–${end} of ${count}`
	};

	let rootEl = $state<HTMLElement>();
	// Direction the component renders in. Synced from the live DOM on mount so RTL
	// pages mirror the icons exactly like WA's LocalizeController did (same approach
	// as the comparison port).
	let rtl = $state(false);

	$effect(() => {
		if (rootEl) {
			rtl = getComputedStyle(rootEl).direction === 'rtl';
		}
	});

	/** Live direction check so icon mirroring stays correct even if `dir` flips after mount. */
	function isRtlNow(): boolean {
		if (rootEl) {
			try {
				if (rootEl.matches(':dir(rtl)')) return true;
				if (rootEl.matches(':dir(ltr)')) return false;
			} catch {
				/* engines without :dir() support — fall through to tracked state */
			}
		}
		return rtl;
	}

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max);
	}

	/** The total number of pages, derived from `total` and `pageSize` (port of the source getter). */
	const totalPages = $derived(pageSize <= 0 ? 1 : Math.max(1, Math.ceil(total / pageSize)));

	// Port of `@watch('page') @watch('total') @watch('pageSize') handlePageBoundsChange`:
	// keep `page` within bounds whenever the inputs change. Guarded write, so no loop.
	$effect(() => {
		const clamped = clamp(Math.trunc(page) || 1, 1, totalPages);
		if (clamped !== page) page = clamped;
	});

	/** Produces an inclusive array of integers from `start` to `end`. */
	function range(start: number, end: number): number[] {
		const length = end - start + 1;
		return length > 0 ? Array.from({ length }, (_, i) => start + i) : [];
	}

	interface PaginationPageItem {
		type: 'page';
		value: number;
	}
	interface PaginationEllipsisItem {
		type: 'ellipsis';
		position: 'start' | 'end';
	}
	type PaginationRangeItem = PaginationPageItem | PaginationEllipsisItem;

	/**
	 * Computes the items to render, collapsing long runs of pages into ellipses. Ported verbatim
	 * from the source: the total item count stays constant across every page so the control keeps
	 * a consistent width as the user navigates.
	 */
	function getPaginationRange(
		current: number,
		pageCount: number,
		siblings: number,
		boundaries: number
	): PaginationRangeItem[] {
		const totalSlots = siblings * 2 + boundaries * 2 + 3;

		if (totalSlots >= pageCount) {
			return range(1, pageCount).map((value) => ({ type: 'page', value }));
		}

		const firstMiddle = boundaries + 1;
		const lastMiddle = pageCount - boundaries;

		let windowStart = current - siblings;
		let windowEnd = current + siblings;

		if (windowStart < firstMiddle) {
			windowEnd += firstMiddle - windowStart;
			windowStart = firstMiddle;
		}
		if (windowEnd > lastMiddle) {
			windowStart -= windowEnd - lastMiddle;
			windowEnd = lastMiddle;
		}
		windowStart = Math.max(windowStart, firstMiddle);
		windowEnd = Math.min(windowEnd, lastMiddle);

		let freedSlots = (windowStart > firstMiddle ? 0 : 1) + (windowEnd < lastMiddle ? 0 : 1);
		while (freedSlots > 0) {
			if (windowEnd < lastMiddle) {
				windowEnd++;
			} else if (windowStart > firstMiddle) {
				windowStart--;
			} else {
				break;
			}
			freedSlots--;
		}

		const showStartEllipsis = windowStart > firstMiddle;
		const showEndEllipsis = windowEnd < lastMiddle;

		const items: PaginationRangeItem[] = [];
		range(1, boundaries).forEach((value) => items.push({ type: 'page', value }));
		if (showStartEllipsis) items.push({ type: 'ellipsis', position: 'start' });
		range(windowStart, windowEnd).forEach((value) => items.push({ type: 'page', value }));
		if (showEndEllipsis) items.push({ type: 'ellipsis', position: 'end' });
		range(pageCount - boundaries + 1, pageCount).forEach((value) =>
			items.push({ type: 'page', value })
		);

		return items;
	}

	// Render items with stable keys plus each ellipsis's ordinal (port of the source's
	// `ellipsisCount` for `data-ellipsis`, which lets the styles collapse an ellipsis).
	const renderItems = $derived.by(() => {
		const raw = getPaginationRange(page, totalPages, siblingCount, boundaryCount);
		let ellipsisOrdinal = 0;
		return raw.map((item) => {
			if (item.type === 'ellipsis') {
				ellipsisOrdinal++;
				return { ...item, key: `ellipsis-${ellipsisOrdinal}`, ordinal: ellipsisOrdinal };
			}
			return { ...item, key: `page-${item.value}`, ordinal: 0 };
		});
	});

	const summaryStart = $derived(total === 0 ? 0 : (page - 1) * pageSize + 1);
	const summaryEnd = $derived(Math.min(page * pageSize, total));

	/** Resolves the URL for a given page when `hrefTemplate` is set (string and function forms). */
	function getHref(pageNumber: number): string | undefined {
		if (!hrefTemplate) return undefined;
		if (typeof hrefTemplate === 'function') return hrefTemplate(pageNumber);
		return hrefTemplate.split('{page}').join(String(pageNumber));
	}

	/**
	 * Requests a change to the given page. Port of the source `requestPage`: runs the cancelable
	 * before-change callback (returning `false` vetoes), updates `page`, restores focus to the new
	 * current page, then emits the page-change callback and announces the change.
	 */
	async function requestPage(targetPage: number, restoreFocus: boolean) {
		const target = clamp(targetPage, 1, totalPages);
		if (disabled || target === page) return;

		if (onbeforepagechange?.({ page: target, pageSize }) === false) return;

		page = target;
		await tick();

		// Port of `restoreFocusToCurrentPage` (source `updated()` hook): only steal focus if focus
		// was inside this component (i.e. a button we just re-rendered). In compact layout there is
		// no current page item, so the lookup is a guarded no-op.
		if (restoreFocus && rootEl?.contains(document.activeElement)) {
			rootEl.querySelector<HTMLElement>('[part~="page-current"]')?.focus();
		}

		onpagechange?.({ page, pageSize });
		announce(STRINGS.pageXOfY(page, totalPages), 'polite');
	}
</script>

{#snippet defaultIcon(name: IconName)}
	<!-- Inlined WA system icons (Font Awesome paths from icon/library.system.ts) so pagination works standalone. -->
	{#if name === 'chevron-left'}
		<svg
			class="default-icon"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 320 512"
			width="1em"
			height="1em"
			fill="currentColor"
			aria-hidden="true"
		><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" /></svg>
	{:else if name === 'chevron-right'}
		<svg
			class="default-icon"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 320 512"
			width="1em"
			height="1em"
			fill="currentColor"
			aria-hidden="true"
		><path d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" /></svg>
	{:else if name === 'angles-left'}
		<svg
			class="default-icon"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 512 512"
			width="1em"
			height="1em"
			fill="currentColor"
			aria-hidden="true"
		><path d="M77.3 256 214.7 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256zm192 0L406.7 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L269.3 256z" /></svg>
	{:else}
		<svg
			class="default-icon"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 512 512"
			width="1em"
			height="1em"
			fill="currentColor"
			aria-hidden="true"
		><path d="M434.7 256 297.3 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L434.7 256zm-192 0L105.3 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256z" /></svg>
	{/if}
{/snippet}

<!-- Port of source `renderNavButton` (first/previous/next/last). Custom snippet icons are used
     as-is; only the defaults flip in RTL, exactly like the source icon-name switch. -->
{#snippet navButton(
	partName: string,
	target: number,
	enabled: boolean,
	labelText: string,
	custom: Snippet | undefined,
	ltr: IconName,
	rtlIcon: IconName
)}
	{@const isDisabled = disabled || !enabled}
	{@const href = getHref(target)}
	<li role="listitem">
		{#if href !== undefined}
			<a
				part="button {partName}"
				class="button nav-button"
				href={isDisabled ? undefined : href}
				aria-label={labelText}
				aria-disabled={isDisabled ? 'true' : 'false'}
			>{#if custom}{@render custom()}{:else}{@render defaultIcon(isRtlNow() ? rtlIcon : ltr)}{/if}</a>
		{:else}
			<button
				part="button {partName}"
				class="button nav-button"
				type="button"
				aria-label={labelText}
				aria-disabled={isDisabled ? 'true' : 'false'}
				onclick={isDisabled ? undefined : () => requestPage(target, true)}
			>{#if custom}{@render custom()}{:else}{@render defaultIcon(isRtlNow() ? rtlIcon : ltr)}{/if}</button>
		{/if}
	</li>
{/snippet}

<!-- Port of source `renderPage`. The visible number is the accessible name — no redundant aria-label. -->
{#snippet pageButton(pageNumber: number)}
	{@const isCurrent = pageNumber === page}
	{@const href = getHref(pageNumber)}
	{@const partValue = isCurrent ? 'button page page-current' : 'button page'}
	<li role="listitem">
		{#if href !== undefined}
			<a
				part={partValue}
				class="button page"
				class:current={isCurrent}
				href={isCurrent || disabled ? undefined : href}
				aria-current={isCurrent ? 'page' : undefined}
				aria-disabled={disabled ? 'true' : undefined}
			>{pageNumber}</a>
		{:else}
			<button
				part={partValue}
				class="button page"
				class:current={isCurrent}
				type="button"
				aria-current={isCurrent ? 'page' : undefined}
				aria-disabled={disabled ? 'true' : undefined}
				onclick={disabled || isCurrent ? undefined : () => requestPage(pageNumber, true)}
			>{pageNumber}</button>
		{/if}
	</li>
{/snippet}

<!-- Port of source `renderEllipsis`: clicking jumps a fixed number of pages toward that side. -->
{#snippet ellipsisButton(position: 'start' | 'end', ordinal: number)}
	{@const isStart = position === 'start'}
	{@const target = clamp(isStart ? page - JUMP_DISTANCE : page + JUMP_DISTANCE, 1, totalPages)}
	{@const labelText = isStart
		? STRINGS.jumpBackwardX(JUMP_DISTANCE)
		: STRINGS.jumpForwardX(JUMP_DISTANCE)}
	{@const href = getHref(target)}
	<li role="listitem">
		{#if href !== undefined}
			<a
				part="ellipsis"
				class="button ellipsis"
				data-ellipsis={ordinal}
				href={disabled ? undefined : href}
				aria-label={labelText}
				aria-disabled={disabled ? 'true' : undefined}
			><svg
				class="default-icon ellipsis-default"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 640 640"
				width="1em"
				height="1em"
				fill="currentColor"
				role="img"
				aria-label={labelText}
			><path d="M96 320C96 289.1 121.1 264 152 264C182.9 264 208 289.1 208 320C208 350.9 182.9 376 152 376C121.1 376 96 350.9 96 320zM264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320zM488 264C518.9 264 544 289.1 544 320C544 350.9 518.9 376 488 376C457.1 376 432 350.9 432 320C432 289.1 457.1 264 488 264z" /></svg></a>
		{:else}
			<button
				part="ellipsis"
				class="button ellipsis"
				data-ellipsis={ordinal}
				type="button"
				aria-label={labelText}
				aria-disabled={disabled ? 'true' : undefined}
				onclick={disabled ? undefined : () => requestPage(target, true)}
			><svg
				class="default-icon ellipsis-default"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 640 640"
				width="1em"
				height="1em"
				fill="currentColor"
				role="img"
				aria-label={labelText}
			><path d="M96 320C96 289.1 121.1 264 152 264C182.9 264 208 289.1 208 320C208 350.9 182.9 376 152 376C121.1 376 96 350.9 96 320zM264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320zM488 264C518.9 264 544 289.1 544 320C544 350.9 518.9 376 488 376C457.1 376 432 350.9 432 320C432 289.1 457.1 264 488 264z" /></svg></button>
		{/if}
	</li>
{/snippet}

{#if !(hideSinglePage && totalPages <= 1)}
	<div
		class="wa-pagination"
		data-appearance={appearance}
		data-format={format}
		data-disabled={disabled ? '' : undefined}
		bind:this={rootEl}
	>
		<div class="container">
			{#if withSummary}
				<span part="summary" class="summary"
					>{STRINGS.showingXtoYofZ(summaryStart, summaryEnd, total)}</span>
			{/if}
			{#if format === 'compact'}
				<nav part="base pagination" class="pagination" aria-label={label || STRINGS.pagination}>
					<ul part="pages" class="pages" role="list">
						{@render navButton(
							'previous-button',
							page - 1,
							page > 1,
							STRINGS.previousPage,
							previousIcon,
							'chevron-left',
							'chevron-right'
						)}
						<li role="listitem">
							<span part="label" class="label" aria-current="page">
								{STRINGS.compactPageXOfY(page, totalPages)}
							</span>
						</li>
						{@render navButton(
							'next-button',
							page + 1,
							page < totalPages,
							STRINGS.nextPage,
							nextIcon,
							'chevron-right',
							'chevron-left'
						)}
					</ul>
				</nav>
			{:else}
				<nav part="base pagination" class="pagination" aria-label={label || STRINGS.pagination}>
					<ul part="pages" class="pages" role="list">
						{#if withEdges}
							{@render navButton(
								'first-button',
								1,
								page > 1,
								STRINGS.firstPage,
								firstIcon,
								'angles-left',
								'angles-right'
							)}
						{/if}
						{#if !withoutNav}
							{@render navButton(
								'previous-button',
								page - 1,
								page > 1,
								STRINGS.previousPage,
								previousIcon,
								'chevron-left',
								'chevron-right'
							)}
						{/if}
						{#each renderItems as item (item.key)}
							{#if item.type === 'ellipsis'}
								{@render ellipsisButton(item.position, item.ordinal)}
							{:else}
								{@render pageButton(item.value)}
							{/if}
						{/each}
						{#if !withoutNav}
							{@render navButton(
								'next-button',
								page + 1,
								page < totalPages,
								STRINGS.nextPage,
								nextIcon,
								'chevron-right',
								'chevron-left'
							)}
						{/if}
						{#if withEdges}
							{@render navButton(
								'last-button',
								totalPages,
								page < totalPages,
								STRINGS.lastPage,
								lastIcon,
								'angles-right',
								'angles-left'
							)}
						{/if}
					</ul>
				</nav>
			{/if}
		</div>
	</div>
{/if}
