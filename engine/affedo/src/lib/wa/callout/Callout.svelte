<script lang="ts" module>
	const warnedSizes = new Set<string>();
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import './callout.css';

	export type CalloutVariant = 'brand' | 'neutral' | 'success' | 'warning' | 'danger';
	export type CalloutAppearance = 'accent' | 'filled' | 'outlined' | 'plain' | 'filled-outlined';
	export type CalloutSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'small' | 'medium' | 'large';

	interface Props {
		/** The callout's theme variant. Defaults to `brand` if not within another element with a variant. */
		variant?: CalloutVariant;
		/** The callout's visual appearance. With no `appearance` set, renders with a quiet fill and border, matching `filled-outlined`. */
		appearance?: CalloutAppearance;
		/** The callout's size. `small` / `medium` / `large` are deprecated aliases for `s` / `m` / `l`. */
		size?: CalloutSize;
		/** The callout's main content. */
		children?: Snippet;
		/** An icon to show in the callout. Works best with an icon component. */
		icon?: Snippet;
	}

	let { variant = 'brand', appearance, size = 'm', children, icon }: Props = $props();

	// Port of WA's `@watch('size')` + `warnDeprecatedSize`: a genuine side effect,
	// so `$effect` is correct here (`$derived` is for computations).
	$effect(() => {
		if (
			(size === 'small' || size === 'medium' || size === 'large') &&
			!warnedSizes.has(size)
		) {
			warnedSizes.add(size);
			const canonical = size === 'small' ? 's' : size === 'medium' ? 'm' : 'l';
			console.warn(
				`[wa-callout] size="${size}" is deprecated. Use size="${canonical}" instead. The long-form value will be removed in the next major version.`
			);
		}
	});
</script>

<div class="wa-callout" data-variant={variant} data-appearance={appearance} data-size={size}>
	<div part="icon">
		{#if icon}
			{@render icon()}
		{/if}
	</div>

	<div part="message">
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
