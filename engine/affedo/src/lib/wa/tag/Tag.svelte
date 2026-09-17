<script lang="ts">
	import type { Snippet } from 'svelte';
	import './tag.css';

	export type TagVariant = 'brand' | 'neutral' | 'success' | 'warning' | 'danger';
	export type TagAppearance = 'accent' | 'filled' | 'outlined' | 'filled-outlined';
	export type TagSize = 's' | 'm' | 'l';

	interface Props {
		/** The tag's theme variant. */
		variant?: TagVariant;
		/** The tag's visual appearance. */
		appearance?: TagAppearance;
		/** The tag's size. */
		size?: TagSize;
		/** Draws a pill-style tag with rounded edges. */
		pill?: boolean;
		/** Makes the tag removable and shows a remove button. */
		withRemove?: boolean;
		/** The tag's content. */
		children?: Snippet;
		/** Called when the remove button is clicked. */
		onremove?: () => void;
	}

	let {
		variant = 'neutral',
		appearance = 'filled-outlined',
		size = 'm',
		pill = false,
		withRemove = false,
		children,
		onremove
	}: Props = $props();

	function handleRemoveClick(e: MouseEvent) {
		e.stopPropagation();
		onremove?.();
	}
</script>

<span
	class="wa-tag"
	data-variant={variant}
	data-appearance={appearance}
	data-size={size}
	data-pill={pill ? '' : undefined}
>
	<span part="content" class="content">
		{@render children?.()}
	</span>

	{#if withRemove}
		<button
			type="button"
			part="remove-button"
			class="remove-button"
			aria-label="Remove"
			onclick={handleRemoveClick}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="0.75em" height="0.75em" fill="currentColor">
				<path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
			</svg>
		</button>
	{/if}
</span>
