<script lang="ts">
	import type { Snippet } from 'svelte';
	import './progress-bar.css';

	interface Props {
		/** The current progress as a percentage, 0 to 100. */
		value?: number;
		/** When true, draws the progress bar in an indeterminate state. */
		indeterminate?: boolean;
		/** A custom label for assistive devices. */
		label?: string;
		/** Content to show inside the progress indicator. */
		children?: Snippet;
	}

	let {
		value = 0,
		indeterminate = false,
		label = '',
		children
	}: Props = $props();

	const clampedValue = $derived(Math.max(0, Math.min(value, 100)));
</script>

<div
	class="wa-progress-bar"
	data-indeterminate={indeterminate ? '' : undefined}
	style:--percentage="{clampedValue}%"
>
	<div
		part="base progress-bar"
		class="progress-bar"
		role="progressbar"
		aria-label={label || 'Progress'}
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={indeterminate ? undefined : clampedValue}
	>
		<div part="indicator" class="indicator">
			{#if !indeterminate && children}
				<span part="label" class="label">
					{@render children()}
				</span>
			{/if}
		</div>
	</div>
</div>
