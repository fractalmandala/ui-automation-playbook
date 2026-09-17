<script lang="ts">
	import type { Snippet } from 'svelte';
	import './avatar.css';

	export type AvatarShape = 'circle' | 'square' | 'rounded';
	export type AvatarLoading = 'eager' | 'lazy';

	interface Props {
		/** The image source to use for the avatar. Takes priority over initials and icon. */
		image?: string;
		/** A label to use to describe the avatar to assistive devices. */
		label?: string;
		/** Initials to use as a fallback when no image is available (1-2 characters max recommended). */
		initials?: string;
		/** Indicates how the browser should load the image. */
		loading?: AvatarLoading;
		/** The shape of the avatar. */
		shape?: AvatarShape;
		/** Called when the image fails to load. The WA `wa-error` event carries no detail and is not cancelable. */
		onerror?: () => void;
		/** The custom icon shown when no image or initials are present. Defaults to a generic user icon. */
		icon?: Snippet;
	}

	let {
		image = '',
		label = '',
		initials = '',
		loading = 'eager',
		shape = 'circle',
		onerror,
		icon
	}: Props = $props();

	let hasError = $state(false);

	// Port of WA's `@watch('image')`: a new image clears a previous load failure
	// so the component retries instead of staying stuck on the fallback.
	$effect(() => {
		void image;
		hasError = false;
	});

	function handleImageLoadError() {
		hasError = true;
		onerror?.();
	}

	// Image wins over initials, initials win over the icon — same priority as WA's render().
	const showImage = $derived(!!image && !hasError);
</script>

<div class="wa-avatar" data-shape={shape}>
	{#if showImage}
		<!-- svelte-ignore a11y_missing_attribute, a11y_no_redundant_roles: WA wires the image as role="img" + aria-label with no alt attribute — kept verbatim for fidelity. -->
		<img
			part="image"
			class="image"
			src={image}
			{loading}
			role="img"
			aria-label={label}
			onerror={handleImageLoadError}
		/>
	{:else if initials}
		<div part="initials" class="initials" role="img" aria-label={label}>
			{initials}
		</div>
	{:else}
		<div part="icon" class="icon" role="img" aria-label={label}>
			{#if icon}
				{@render icon()}
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 448 512"
					width="1em"
					height="1em"
					fill="currentColor"
					aria-hidden="true"
				>
					<!-- Default "user" icon from WA's system library (Font Awesome solid), inlined so avatar works standalone. -->
					<path
						d="M224 248a120 120 0 1 0 0-240 120 120 0 1 0 0 240zm-29.7 56C95.8 304 16 383.8 16 482.3 16 498.7 29.3 512 45.7 512l356.6 0c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3l-59.4 0z"
					/>
				</svg>
			{/if}
		</div>
	{/if}
</div>
