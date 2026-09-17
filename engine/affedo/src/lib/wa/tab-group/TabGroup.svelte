<script lang="ts">
	import { setContext, tick, type Snippet } from 'svelte';
	import {
		TAB_GROUP_KEY,
		TabGroupContext,
		type TabActivation,
		type TabPlacement
	} from '../tab/context.svelte.js';
	import './tab-group.css';

	interface Props {
		/** Sets the active tab. */
		active?: string;
		/** The placement of the tabs. */
		placement?: TabPlacement;
		/** When set to auto, navigating tabs with the arrow keys will instantly show the corresponding tab panel. */
		activation?: TabActivation;
		/** Disables the scroll arrows that appear when tabs overflow. */
		withoutScrollControls?: boolean;
		/** Used for grouping tabs in the tab group. */
		nav?: Snippet;
		/** Used for grouping tab panels in the tab group. */
		children?: Snippet;
		/** Emitted when a tab is shown. */
		onshow?: (detail: { name: string }) => void;
		/** Emitted when a tab is hidden. */
		onhide?: (detail: { name: string }) => void;
	}

	let {
		active = $bindable(''),
		placement = 'top',
		activation = 'auto',
		withoutScrollControls = false,
		nav,
		children,
		onshow,
		onhide
	}: Props = $props();

	let navEl = $state<HTMLElement>();
	let tabsEl = $state<HTMLElement>();
	let indicatorEl = $state<HTMLElement>();
	let hasScrollControls = $state(false);

	const ctx = new TabGroupContext(
		() => ({ active, placement, activation }),
		{
			onActiveChange: (next) => {
				active = next;
				tick().then(updateIndicator);
			},
			onShow: (detail) => onshow?.(detail),
			onHide: (detail) => onhide?.(detail)
		}
	);

	setContext(TAB_GROUP_KEY, ctx);

	function updateIndicator() {
		if (!tabsEl || !indicatorEl) return;
		const activeTab = ctx.tabs().find((t) => t.active);
		if (!activeTab || !activeTab.el) {
			indicatorEl.style.display = 'none';
			return;
		}
		indicatorEl.style.display = '';
		const tabRect = activeTab.el.getBoundingClientRect();
		const tabsRect = tabsEl.getBoundingClientRect();

		if (placement === 'top' || placement === 'bottom') {
			indicatorEl.style.width = `${tabRect.width}px`;
			indicatorEl.style.height = '0';
			indicatorEl.style.transform = `translateX(${tabRect.left - tabsRect.left}px)`;
		} else {
			indicatorEl.style.width = '0';
			indicatorEl.style.height = `${tabRect.height}px`;
			indicatorEl.style.transform = `translateY(${tabRect.top - tabsRect.top}px)`;
		}
	}

	function updateScrollControls() {
		if (!navEl || withoutScrollControls) {
			hasScrollControls = false;
			return;
		}
		hasScrollControls = navEl.scrollWidth > navEl.clientWidth;
	}

	function handleScrollStart() {
		navEl?.scrollBy({ left: -200, behavior: 'smooth' });
	}

	function handleScrollEnd() {
		navEl?.scrollBy({ left: 200, behavior: 'smooth' });
	}

	$effect(() => {
		tick().then(() => {
			if (active) {
				ctx.syncActive(active);
			} else {
				const first = ctx.focusableTabs()[0];
				if (first) {
					ctx.setActiveTab(first, { emitEvents: false });
				}
			}
			ctx.setAriaLabels();
			updateIndicator();
			updateScrollControls();
		});
	});
</script>

<div
	class="wa-tab-group"
	data-placement={placement}
>
	<div
		part="base tab-group"
		class="tab-group tab-group-{placement}"
		class:tab-group-has-scroll-controls={hasScrollControls}
	>
		<div class="nav-container" part="nav">
			{#if hasScrollControls}
				<button
					type="button"
					part="scroll-button scroll-button-start"
					class="scroll-button scroll-button-start"
					onclick={handleScrollStart}
					aria-label="Previous tabs"
				>
					◀
				</button>
			{/if}

			<div
				bind:this={navEl}
				class="nav"
				onscroll={updateIndicator}
			>
				<div
					bind:this={tabsEl}
					part="tabs"
					class="tabs"
					role="tablist"
				>
					<div
						bind:this={indicatorEl}
						class="indicator"
						part="indicator"
					></div>
					{#if nav}
						{@render nav()}
					{/if}
				</div>
			</div>

			{#if hasScrollControls}
				<button
					type="button"
					part="scroll-button scroll-button-end"
					class="scroll-button scroll-button-end"
					onclick={handleScrollEnd}
					aria-label="Next tabs"
				>
					▶
				</button>
			{/if}
		</div>

		<div part="body" class="body">
			{#if children}
				{@render children()}
			{/if}
		</div>
	</div>
</div>
