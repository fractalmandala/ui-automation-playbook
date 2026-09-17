<script lang="ts">
	import type { Snippet } from 'svelte';
	import './toast.css';

	export type ToastPlacement =
		| 'top-start'
		| 'top-center'
		| 'top-end'
		| 'bottom-start'
		| 'bottom-center'
		| 'bottom-end';

	interface Props {
		/** Preferred placement of the toast stack. */
		placement?: ToastPlacement;
		/** Optional ID. */
		id?: string;
		/** Additional CSS classes. */
		class?: string;
		/** Toast items. */
		children?: Snippet;
	}

	let {
		placement = 'bottom-end',
		id = undefined,
		class: className = '',
		children
	}: Props = $props();
</script>

<div
	{id}
	class="wa-toast {className}"
	data-placement={placement}
	role="region"
	aria-label="Notifications"
	part="base"
>
	<div class="stack" part="stack">
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
