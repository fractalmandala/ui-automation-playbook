<script lang="ts">
	import type { Snippet } from 'svelte';
	import './progress-ring.css';

	interface Props {
		/** Current progress percentage (0 to 100). */
		value?: number;
		/** Accessible label for screen readers. */
		label?: string;
		/** Diameter of the progress ring. */
		size?: string;
		/** Track width. */
		trackWidth?: string;
		/** Indicator stroke width. */
		indicatorWidth?: string;
		/** Color of the progress indicator. */
		indicatorColor?: string;
		/** Color of the background track. */
		trackColor?: string;
		/** Content to show in the center of the ring. */
		children?: Snippet;
	}

	let {
		value = 0,
		label = '',
		size,
		trackWidth,
		indicatorWidth,
		indicatorColor,
		trackColor,
		children
	}: Props = $props();

	const clampedValue = $derived(Math.max(0, Math.min(value, 100)));
	const percentageFraction = $derived(clampedValue / 100);
</script>

<div
	class="wa-progress-ring"
	style:--percentage={percentageFraction}
	style:--size={size}
	style:--track-width={trackWidth}
	style:--indicator-width={indicatorWidth}
	style:--indicator-color={indicatorColor}
	style:--track-color={trackColor}
>
	<div
		part="base progress-ring"
		class="progress-ring"
		role="progressbar"
		aria-label={label || 'Progress'}
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={clampedValue}
	>
		<svg part="image" class="image" aria-hidden="true">
			<circle part="track" class="track" />
			<circle part="indicator" class="indicator" />
		</svg>

		{#if children}
			<span part="label" class="label">
				{@render children()}
			</span>
		{/if}
	</div>
</div>
