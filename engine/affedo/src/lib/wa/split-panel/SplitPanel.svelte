<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import './split-panel.css';

	export type SplitPanelOrientation = 'horizontal' | 'vertical';

	interface Props {
		/** Current divider position as a percentage 0-100. */
		position?: number;
		/** Current divider position in pixels. */
		positionInPixels?: number;
		/** Split panel orientation. */
		orientation?: SplitPanelOrientation;
		/** Disables resizing. */
		disabled?: boolean;
		/** Primary panel that retains its size on host resize. */
		primary?: 'start' | 'end';
		/** Space-separated snap points, e.g. "100px 50%". */
		snap?: string;
		/** How close the divider must be to snap. */
		snapThreshold?: number;
		/** Optional element id. */
		id?: string;
		/** Additional CSS classes. */
		class?: string;
		/** Start panel content. */
		start?: Snippet;
		/** End panel content. */
		end?: Snippet;
		/** Custom divider content / handle. */
		divider?: Snippet;
		/** Default slot fallback for start panel. */
		children?: Snippet;
		/** Emitted when the divider position changes. */
		onreposition?: (detail: { position: number }) => void;
	}

	let {
		position = $bindable(50),
		positionInPixels = $bindable(undefined),
		orientation = 'horizontal',
		disabled = false,
		primary = undefined,
		snap = '',
		snapThreshold = 12,
		id = undefined,
		class: className = '',
		start,
		end,
		divider,
		children,
		onreposition
	}: Props = $props();

	let rootEl: HTMLElement | null = $state(null);
	let isDragging = $state(false);
	let isCollapsed = $state(false);
	let positionBeforeCollapsing = 0;

	const primaryStyle = $derived(`
		clamp(
			0%,
			clamp(
				var(--min, 0%),
				${position}% - var(--divider-width, 0.25rem) / 2,
				var(--max, 100%)
			),
			calc(100% - var(--divider-width, 0.25rem))
		)
	`);

	const gridTemplate = $derived.by(() => {
		const secondary = '1fr';
		const div = 'var(--divider-width, 0.25rem)';
		if (primary === 'end') {
			return `${secondary} ${div} ${primaryStyle}`;
		}
		return `${primaryStyle} ${div} ${secondary}`;
	});

	function handlePointerDown(event: PointerEvent) {
		if (disabled || !rootEl) return;
		event.preventDefault();

		isDragging = true;
		const rect = rootEl.getBoundingClientRect();
		const size = orientation === 'vertical' ? rect.height : rect.width;

		function onPointerMove(e: PointerEvent) {
			if (!rootEl) return;
			const r = rootEl.getBoundingClientRect();
			let posPx = orientation === 'vertical' ? e.clientY - r.top : e.clientX - r.left;

			if (primary === 'end') {
				posPx = size - posPx;
			}

			// Check snap
			if (snap) {
				const snaps = snap.split(/\s+/).filter(Boolean);
				for (const val of snaps) {
					let snapPx: number;
					if (val.endsWith('%')) {
						snapPx = size * (parseFloat(val) / 100);
					} else {
						snapPx = parseFloat(val);
					}
					if (Math.abs(posPx - snapPx) <= snapThreshold) {
						posPx = snapPx;
						break;
					}
				}
			}

			const pct = Math.max(0, Math.min(100, (posPx / size) * 100));
			position = Math.round(pct * 100) / 100;
			positionInPixels = Math.round(posPx);
			isCollapsed = false;
			onreposition?.({ position });
		}

		function onPointerUp() {
			isDragging = false;
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
			window.removeEventListener('pointercancel', onPointerUp);
		}

		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointercancel', onPointerUp);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (disabled) return;

		if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'].includes(event.key)) {
			let newPosition = position;
			const incr = (event.shiftKey ? 10 : 1) * (primary === 'end' ? -1 : 1);
			event.preventDefault();

			if (
				(event.key === 'ArrowLeft' && orientation === 'horizontal') ||
				(event.key === 'ArrowUp' && orientation === 'vertical')
			) {
				newPosition -= incr;
			}

			if (
				(event.key === 'ArrowRight' && orientation === 'horizontal') ||
				(event.key === 'ArrowDown' && orientation === 'vertical')
			) {
				newPosition += incr;
			}

			if (event.key === 'Home') {
				newPosition = primary === 'end' ? 100 : 0;
			}

			if (event.key === 'End') {
				newPosition = primary === 'end' ? 0 : 100;
			}

			if (event.key === 'Enter') {
				if (isCollapsed) {
					newPosition = positionBeforeCollapsing;
					isCollapsed = false;
				} else {
					positionBeforeCollapsing = position;
					newPosition = 0;
					isCollapsed = true;
				}
			}

			position = Math.max(0, Math.min(100, newPosition));
			onreposition?.({ position });
		}
	}
</script>

<div
	bind:this={rootEl}
	{id}
	class="wa-split-panel {className}"
	data-orientation={orientation}
	data-disabled={disabled ? '' : undefined}
	style:grid-template-columns={orientation === 'horizontal' ? gridTemplate : 'unset'}
	style:grid-template-rows={orientation === 'vertical' ? gridTemplate : 'unset'}
>
	<div class="start" part="panel start">
		{#if start}
			{@render start()}
		{:else if children}
			{@render children()}
		{/if}
	</div>

	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="divider"
		part="divider"
		role="separator"
		tabindex={disabled ? -1 : 0}
		aria-valuenow={Math.round(position)}
		aria-valuemin="0"
		aria-valuemax="100"
		aria-label="Resize"
		onpointerdown={handlePointerDown}
		onkeydown={handleKeyDown}
	>
		{#if divider}
			{@render divider()}
		{/if}
	</div>

	<div class="end" part="panel end">
		{#if end}
			{@render end()}
		{/if}
	</div>
</div>
