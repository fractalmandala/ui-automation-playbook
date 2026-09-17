<script lang="ts">
	import { getContext, untrack, type Snippet } from 'svelte';
	import { BREADCRUMB_KEY, type BreadcrumbContext, type BreadcrumbItemHandle } from './context.svelte.js';
	import './breadcrumb-item.css';

	interface Props {
		/** Optional URL. When set, a link is rendered; when unset, a button is rendered.
		 *  Use `href=""` on the last item so it points at itself (WA marks it
		 *  `aria-current="page"` automatically). */
		href?: string;
		/** Tells the browser where to open the link. Only used when `href` is set. */
		target?: '_blank' | '_parent' | '_self' | '_top';
		/** The `rel` attribute on the link. Only applied when `target` is set (WA parity). */
		rel?: string;
		/** Set when the default content is a dropdown menu. WA detects a slotted
		 *  `wa-dropdown` via `assignedElements()`; Svelte cannot introspect the
		 *  `children` snippet, so this prop selects the `div` wrapper explicitly. */
		dropdown?: boolean;
		/** Explicit `aria-current` override. When omitted, the last registered item
		 *  in the group is marked `aria-current="page"` automatically. Standalone
		 *  items (no group context) default to not-current. */
		current?: boolean;
		/** Click handler for the label (link/button). WA consumers add their own
		 *  listeners for SPA navigation; this is the Svelte equivalent. */
		onclick?: (event: MouseEvent) => void;
		/** An element, such as an icon, placed before the label. */
		start?: Snippet;
		/** An element, such as an icon, placed after the label. */
		end?: Snippet;
		/** Per-item separator override. Falls back to the group's `separator`,
		 *  then to the default chevron. */
		separator?: Snippet;
		/** The breadcrumb item's label (or dropdown menu). */
		children: Snippet;
	}

	let {
		href,
		target,
		rel = 'noreferrer noopener',
		dropdown = false,
		current,
		onclick,
		start,
		end,
		separator,
		children
	}: Props = $props();

	// An item outside a group still works; it just governs itself.
	const ctx = getContext<BreadcrumbContext | undefined>(BREADCRUMB_KEY);

	/** WA `setRenderType()`: `href` string wins, then slotted dropdown, else button.
	 *  `href !== undefined` preserves WA's `typeof href === 'string'` check, including
	 *  the documented `href=""` self-link on the last item. */
	const renderType = $derived(href !== undefined ? 'link' : dropdown ? 'dropdown' : 'button');

	const handle: BreadcrumbItemHandle = {
		el: undefined as unknown as HTMLElement
	};

	function join(node: HTMLElement) {
		handle.el = node;
		// register() bumps the group's reactive `version`, and {@attach} callbacks
		// re-run when state they read changes — without untrack, the bump
		// re-triggers this attach (whose cleanup bumps again): an infinite
		// register/unregister loop that kills hydration page-wide. Registration is
		// mount-only work; `isLast` below stays reactive through `version` itself.
		return untrack(() => ctx?.register(handle));
	}

	const isLast = $derived(ctx ? ctx.isLast(handle) : false);
	const isCurrent = $derived(current ?? isLast);
	const groupSeparator = $derived(ctx?.separator);
</script>

{#snippet separatorContent()}
	{#if separator}
		{@render separator()}
	{:else if groupSeparator}
		{@render groupSeparator()}
	{:else}
		<svg
			class="default-separator"
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 320 512"
			fill="currentColor"
			aria-hidden="true"
		>
			<!-- Default chevron (WA system `chevron-right`, flipped to `chevron-left` in RTL).
			     WA swaps the icon name by `localize.dir()`; here one glyph flips via CSS `:dir(rtl)`. -->
			<path
				d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
			/>
		</svg>
	{/if}
{/snippet}

<div
	class="wa-breadcrumb-item"
	data-last={isLast ? '' : undefined}
	aria-current={isCurrent ? 'page' : undefined}
	{@attach join}
>
	<span part="start" class="start">
		{#if start}{@render start()}{/if}
	</span>

	{#if renderType === 'link'}
		<a
			part="label"
			class="label label-link"
			{href}
			target={target ?? undefined}
			rel={target ? rel : undefined}
			{onclick}
		>
			{@render children()}
		</a>
	{:else if renderType === 'dropdown'}
		<div part="label" class="label label-dropdown">
			{@render children()}
		</div>
	{:else}
		<button part="label" type="button" class="label label-button" {onclick}>
			{@render children()}
		</button>
	{/if}

	<span part="end" class="end">
		{#if end}{@render end()}{/if}
	</span>

	<span part="separator" class="separator" aria-hidden="true">
		{@render separatorContent()}
	</span>
</div>
