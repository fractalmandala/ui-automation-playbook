<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
	import { CAROUSEL_KEY, type CarouselContext, type CarouselItemHandle } from './context.svelte.js';
	import './carousel-item.css';

	interface Props {
		/** The slide's content. Maps to WA's default slot. */
		children?: Snippet;
	}

	let { children }: Props = $props();

	// An item outside a carousel still works; it just renders as a standalone
	// slide and never registers. The future Carousel parent provides the context.
	const ctx = getContext<CarouselContext | undefined>(CAROUSEL_KEY);

	const handle: CarouselItemHandle = {
		el: undefined as unknown as HTMLElement
	};

	function join(node: HTMLElement) {
		handle.el = node;
		return ctx?.register(handle);
	}
</script>

<div class="wa-carousel-item" role="group" {@attach join}>
	{#if children}{@render children()}{/if}
</div>
