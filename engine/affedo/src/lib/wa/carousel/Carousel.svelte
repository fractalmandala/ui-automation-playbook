<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import { CAROUSEL_KEY, CarouselContext, type CarouselItemHandle } from '../carousel-item/context.svelte.js';
	import './carousel.css';

	export type CarouselOrientation = 'horizontal' | 'vertical';

	interface Props {
		/** When set, allows the user to navigate the carousel indefinitely. */
		loop?: boolean;
		/** Show navigation buttons (previous/next). */
		navigation?: boolean;
		/** Show pagination indicators. */
		pagination?: boolean;
		/** Automatically advance slides. */
		autoplay?: boolean;
		/** Cadence between autoplay steps in milliseconds. */
		autoplayInterval?: number;
		/** Number of slides displayed per view. */
		slidesPerPage?: number;
		/** Number of slides to advance on scroll. */
		slidesPerMove?: number;
		/** Layout orientation: horizontal or vertical. */
		orientation?: CarouselOrientation;
		/** Allow dragging slides with mouse. */
		mouseDragging?: boolean;
		/** Currently active slide index (0-indexed). */
		activeSlide?: number;
		/** Called when the active slide changes. */
		onslidechange?: (detail: { index: number; slide?: CarouselItemHandle }) => void;
		/** Main content containing slides (`wa-carousel-item`). */
		children?: Snippet;
		/** Custom previous button icon. */
		previousIcon?: Snippet;
		/** Custom next button icon. */
		nextIcon?: Snippet;
	}

	let {
		loop = false,
		navigation = false,
		pagination = false,
		autoplay = false,
		autoplayInterval = 3000,
		slidesPerPage = 1,
		slidesPerMove = 1,
		orientation = 'horizontal',
		mouseDragging = false,
		activeSlide = $bindable(0),
		onslidechange,
		children,
		previousIcon,
		nextIcon
	}: Props = $props();

	let scrollContainer = $state<HTMLElement>();
	let items = $state<CarouselItemHandle[]>([]);
	const totalSlides = $derived(items.length);

	const ctx = new CarouselContext();
	const originalRegister = ctx.register.bind(ctx);
	ctx.register = (item: CarouselItemHandle) => {
		const unreg = originalRegister(item);
		items = ctx.items();
		return () => {
			const res = unreg();
			items = ctx.items();
			return res;
		};
	};

	setContext(CAROUSEL_KEY, ctx);

	export function next() {
		if (totalSlides === 0) return;
		if (activeSlide + slidesPerMove < totalSlides) {
			goToSlide(activeSlide + slidesPerMove);
		} else if (loop) {
			goToSlide(0);
		}
	}

	export function previous() {
		if (totalSlides === 0) return;
		if (activeSlide - slidesPerMove >= 0) {
			goToSlide(activeSlide - slidesPerMove);
		} else if (loop) {
			goToSlide(Math.max(0, totalSlides - slidesPerPage));
		}
	}

	export function goToSlide(index: number) {
		const clamped = Math.max(0, Math.min(index, Math.max(0, totalSlides - 1)));
		activeSlide = clamped;
		scrollToSlide(clamped);
		onslidechange?.({ index: clamped, slide: items[clamped] });
	}

	function scrollToSlide(index: number) {
		if (!scrollContainer) return;
		const targetItem = items[index]?.el;
		if (targetItem) {
			if (orientation === 'horizontal') {
				scrollContainer.scrollTo({
					left: targetItem.offsetLeft - scrollContainer.offsetLeft,
					behavior: 'smooth'
				});
			} else {
				scrollContainer.scrollTo({
					top: targetItem.offsetTop - scrollContainer.offsetTop,
					behavior: 'smooth'
				});
			}
		}
	}

	// Autoplay timer
	$effect(() => {
		if (!autoplay || totalSlides <= 1) return;
		const timer = setInterval(() => {
			next();
		}, autoplayInterval);
		return () => clearInterval(timer);
	});

	// Can navigate prev/next
	const canPrev = $derived(loop || activeSlide > 0);
	const canNext = $derived(loop || activeSlide + slidesPerPage < totalSlides);
</script>

<div
	class="wa-carousel"
	data-orientation={orientation}
	data-loop={loop ? '' : undefined}
	style:--slides-per-page={slidesPerPage}
>
	<div part="carousel base" class="carousel">
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			part="scroll-container"
			class="slides"
			class:slides-horizontal={orientation === 'horizontal'}
			class:slides-vertical={orientation === 'vertical'}
			bind:this={scrollContainer}
			tabindex="0"
			role="region"
			aria-label="Carousel content"
		>
			{@render children?.()}
		</div>

		{#if navigation}
			<div part="navigation" class="navigation">
				<button
					type="button"
					part="navigation-button navigation-button-previous"
					class="navigation-button navigation-button-previous"
					class:navigation-button-disabled={!canPrev}
					disabled={!canPrev}
					aria-label="Previous slide"
					onclick={() => previous()}
				>
					{#if previousIcon}
						{@render previousIcon()}
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512" width="1em" height="1em" fill="currentColor">
							<path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L61.3 256 214.6 102.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
						</svg>
					{/if}
				</button>

				<button
					type="button"
					part="navigation-button navigation-button-next"
					class="navigation-button navigation-button-next"
					class:navigation-button-disabled={!canNext}
					disabled={!canNext}
					aria-label="Next slide"
					onclick={() => next()}
				>
					{#if nextIcon}
						{@render nextIcon()}
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512" width="1em" height="1em" fill="currentColor">
							<path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L194.7 256 41.4 409.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/>
						</svg>
					{/if}
				</button>
			</div>
		{/if}

		{#if pagination && totalSlides > 0}
			<div part="pagination" class="pagination" role="tablist" aria-label="Slide pagination">
				{#each Array(totalSlides) as _, i}
					<button
						type="button"
						part="pagination-item {i === activeSlide ? 'pagination-item-active' : ''}"
						class="pagination-item"
						class:pagination-item-active={i === activeSlide}
						role="tab"
						aria-selected={i === activeSlide}
						aria-label="Slide {i + 1}"
						onclick={() => goToSlide(i)}
					></button>
				{/each}
			</div>
		{/if}
	</div>
</div>
