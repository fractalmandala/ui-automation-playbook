<script lang="ts">
	import type { Snippet } from 'svelte';
	import './badge.css';
	import '../_shared/wa-styles/component/variants.css';

	export type BadgeVariant = 'brand' | 'neutral' | 'success' | 'warning' | 'danger';
	export type BadgeAppearance = 'accent' | 'filled' | 'outlined' | 'filled-outlined';
	export type BadgeAttention = 'none' | 'pulse' | 'bounce';

	interface Props {
		/** The badge's theme variant. */
		variant?: BadgeVariant;
		/** The badge's visual appearance. */
		appearance?: BadgeAppearance;
		/** Draws a pill-style badge with rounded edges. */
		pill?: boolean;
		/** Adds an animation to draw attention to the badge. */
		attention?: BadgeAttention;
		/** An element, such as an icon, placed before the label. */
		start?: Snippet;
		/** An element, such as an icon, placed after the label. */
		end?: Snippet;
		/** The badge's content. */
		children?: Snippet;
	}

	let {
		variant = 'brand',
		appearance = 'accent',
		pill = false,
		attention = 'none',
		start,
		end,
		children
	}: Props = $props();
</script>

<span
	class="wa-badge"
	data-variant={variant}
	data-appearance={appearance}
	data-pill={pill ? '' : undefined}
	data-attention={attention}
>
	{#if start}
		<span part="start">{@render start()}</span>
	{/if}
	<span part="base badge" role="status">{@render children?.()}</span>
	{#if end}
		<span part="end">{@render end()}</span>
	{/if}
</span>
