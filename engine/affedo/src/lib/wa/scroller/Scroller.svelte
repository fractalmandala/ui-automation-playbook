<script lang="ts">
	import type { Snippet } from 'svelte';
	import './scroller.css';

	export type ScrollerOrientation = 'horizontal' | 'vertical';

	interface Props {
		/** The scroller orientation. */
		orientation?: ScrollerOrientation;
		/** Removes the visible scrollbar. */
		withoutScrollbar?: boolean;
		/** Removes the edge shadows. */
		withoutShadow?: boolean;
		/** Content to show inside the scroller. */
		children?: Snippet;
	}

	let {
		orientation = 'horizontal',
		withoutScrollbar = false,
		withoutShadow = false,
		children
	}: Props = $props();

	let contentEl = $state<HTMLElement>();
	let canScroll = $state(false);
	let startShadowOpacity = $state(0);
	let endShadowOpacity = $state(0);

	function updateScroll() {
		if (!contentEl) return;
		if (orientation === 'horizontal') {
			const clientWidth = Math.ceil(contentEl.clientWidth);
			const scrollLeft = Math.abs(Math.ceil(contentEl.scrollLeft));
			const scrollWidth = Math.ceil(contentEl.scrollWidth);
			const maxScroll = scrollWidth - clientWidth;
			canScroll = maxScroll > 0;

			if (maxScroll <= 0) {
				startShadowOpacity = 0;
				endShadowOpacity = 0;
				return;
			}
			const step = maxScroll * 0.05 || 1;
			startShadowOpacity = Math.max(0, Math.min(1, scrollLeft / step));
			endShadowOpacity = Math.max(0, Math.min(1, (maxScroll - scrollLeft) / step));
		} else {
			const clientHeight = Math.ceil(contentEl.clientHeight);
			const scrollTop = Math.abs(Math.ceil(contentEl.scrollTop));
			const scrollHeight = Math.ceil(contentEl.scrollHeight);
			const maxScroll = scrollHeight - clientHeight;
			canScroll = maxScroll > 0;

			if (maxScroll <= 0) {
				startShadowOpacity = 0;
				endShadowOpacity = 0;
				return;
			}
			const step = maxScroll * 0.05 || 1;
			startShadowOpacity = Math.max(0, Math.min(1, scrollTop / step));
			endShadowOpacity = Math.max(0, Math.min(1, (maxScroll - scrollTop) / step));
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!contentEl) return;
		if (event.key === 'Home') {
			event.preventDefault();
			contentEl.scrollTo({
				left: orientation === 'horizontal' ? 0 : undefined,
				top: orientation === 'vertical' ? 0 : undefined
			});
		} else if (event.key === 'End') {
			event.preventDefault();
			contentEl.scrollTo({
				left: orientation === 'horizontal' ? contentEl.scrollWidth : undefined,
				top: orientation === 'vertical' ? contentEl.scrollHeight : undefined
			});
		}
	}

	$effect(() => {
		if (!contentEl || typeof window === 'undefined') return;
		const ro = new ResizeObserver(() => updateScroll());
		ro.observe(contentEl);
		updateScroll();
		return () => ro.disconnect();
	});
</script>

<div
	class="wa-scroller"
	data-orientation={orientation}
	data-without-scrollbar={withoutScrollbar ? '' : undefined}
	style:--start-shadow-opacity={startShadowOpacity}
	style:--end-shadow-opacity={endShadowOpacity}
>
	{#if !withoutShadow}
		<div part="start-shadow" class="start-shadow" aria-hidden="true"></div>
		<div part="end-shadow" class="end-shadow" aria-hidden="true"></div>
	{/if}

	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<div
		part="content"
		class="scroller-content"
		role="region"
		aria-label="Scrollable region"
		tabindex={canScroll ? 0 : -1}
		bind:this={contentEl}
		onscroll={updateScroll}
		onkeydown={handleKeyDown}
	>
		{@render children?.()}
	</div>
</div>
