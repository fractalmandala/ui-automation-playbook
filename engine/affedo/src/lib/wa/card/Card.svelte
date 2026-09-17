<script lang="ts">
	import type { Snippet } from 'svelte';
	import './card.css';

	export type CardAppearance = 'accent' | 'filled' | 'outlined' | 'filled-outlined' | 'plain';
	export type CardOrientation = 'horizontal' | 'vertical';
	export type CardSize = 'xs' | 's' | 'small' | 'm' | 'medium' | 'l' | 'large' | 'xl';

	interface Props {
		/** The card's visual appearance. */
		appearance?: CardAppearance;
		/** Renders the card's orientation. Horizontal cards render media, body, and actions side-by-side and do not render header/footer slots. */
		orientation?: CardOrientation;
		/** Scales the card's font size (from WA's shared size styles). */
		size?: CardSize;
		/** The card's main content. */
		children?: Snippet;
		/** An optional header for the card (vertical orientation only). */
		header?: Snippet;
		/** An optional footer for the card (vertical orientation only). */
		footer?: Snippet;
		/** An optional media section rendered at the start of the card. */
		media?: Snippet;
		/** An optional actions section rendered at the end (horizontal orientation only). */
		actions?: Snippet;
		/** An optional actions section rendered in the header (vertical orientation only). */
		headerActions?: Snippet;
		/** An optional actions section rendered in the footer (vertical orientation only). */
		footerActions?: Snippet;
	}

	let {
		appearance = 'outlined',
		orientation = 'vertical',
		size = undefined,
		children,
		header,
		footer,
		media,
		actions,
		headerActions,
		footerActions
	}: Props = $props();

	// Port of HasSlotController.test('header-actions' / 'footer-actions'): the snippet
	// being present is the whole answer — no slot introspection needed.
	const showHeaderActions = $derived(!!headerActions);
	const showFooterActions = $derived(!!footerActions);
</script>

{#if orientation === 'horizontal'}
	<div
		class="wa-card"
		data-appearance={appearance}
		data-orientation={orientation}
		data-size={size}
		data-with-media={media ? '' : undefined}
	>
		{#if media}
			<div part="media" class="media">{@render media()}</div>
		{/if}
		<div part="body" class="body">
			{#if children}{@render children()}{/if}
		</div>
		{#if actions}
			<div part="actions" class="actions">{@render actions()}</div>
		{/if}
	</div>
{:else}
	<div
		class="wa-card"
		data-appearance={appearance}
		data-orientation={orientation}
		data-size={size}
		data-with-media={media ? '' : undefined}
		data-with-header={header ? '' : undefined}
		data-with-footer={footer ? '' : undefined}
	>
		{#if media}
			<div part="media" class="media">{@render media()}</div>
		{/if}

		{#if header || headerActions}
			<div part="header" class="header" class:has-actions={showHeaderActions}>
				{#if header}{@render header()}{/if}
				{#if headerActions}{@render headerActions()}{/if}
			</div>
		{/if}

		<div part="body" class="body">
			{#if children}{@render children()}{/if}
		</div>

		{#if footer || footerActions}
			<div part="footer" class="footer" class:has-actions={showFooterActions}>
				{#if footer}{@render footer()}{/if}
				{#if footerActions}{@render footerActions()}{/if}
			</div>
		{/if}
	</div>
{/if}
