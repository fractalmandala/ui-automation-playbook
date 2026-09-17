<script lang="ts">
  import type { Snippet } from 'svelte';

  export interface CarouselItem {
    id: string | number;
    [key: string]: any;
  }

  interface Props {
    items?: CarouselItem[];
    index?: number;
    loop?: boolean;
    showArrows?: boolean;
    showDots?: boolean;
    label?: string;
    slide?: Snippet<[{ item: CarouselItem; active: boolean; position: number }]>;
    onchange?: (index: number) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    items = [], // Defensive default: prevents undefined.length / undefined[index] crashes
    index = $bindable(0),
    loop = false,
    showArrows = true,
    showDots = true,
    label = 'Carousel',
    slide,
    onchange,
    class: className = '',
    ...restProps
  }: Props = $props();

  let safeItems = $derived(items ?? []);
  let count = $derived(safeItems.length);

  function moveTo(target: number) {
    if (count === 0) return;
    let next = target;
    if (loop) {
      next = ((target % count) + count) % count;
    } else {
      next = Math.min(count - 1, Math.max(0, target));
    }
    if (next !== index) {
      index = next;
      onchange?.(next);
    }
  }
</script>

<section
  class="cui-carousel-root {className}"
  data-slot="carousel-root"
  aria-roledescription="carousel"
  aria-label={label}
  {...restProps}
>
  <div class="cui-carousel-viewport" data-slot="viewport">
    <div
      class="cui-carousel-track"
      data-slot="track"
      style="transform: translateX({count > 0 ? -(index * 100) : 0}%);"
    >
      {#if count > 0}
        {#each safeItems as item, i (item.id ?? i)}
          <div
            class="cui-carousel-slide"
            data-slot="slide"
            data-active={i === index ? '' : undefined}
            role="group"
            aria-roledescription="slide"
            aria-label={(i + 1) + ' of ' + count}
          >
            {#if slide}
              {@render slide({ item, active: i === index, position: i })}
            {:else}
              <span class="cui-carousel-fallback" data-slot="fallback">
                {item.title ?? item.label ?? 'Slide ' + (i + 1)}
              </span>
            {/if}
          </div>
        {/each}
      {:else}
        <div class="cui-carousel-empty" data-slot="empty">
          <span>No slides configured</span>
        </div>
      {/if}
    </div>
  </div>

  {#if showArrows && count > 1}
    <button
      type="button"
      class="cui-carousel-arrow cui-carousel-arrow-prev"
      data-slot="arrowPrev"
      aria-label="Previous slide"
      disabled={!loop && index <= 0}
      onclick={() => moveTo(index - 1)}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
    <button
      type="button"
      class="cui-carousel-arrow cui-carousel-arrow-next"
      data-slot="arrowNext"
      aria-label="Next slide"
      disabled={!loop && index >= count - 1}
      onclick={() => moveTo(index + 1)}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  {/if}

  {#if showDots && count > 1}
    <div class="cui-carousel-dots" data-slot="dots" role="tablist" aria-label="Slide navigation">
      {#each safeItems as item, i (item.id ?? i)}
        <button
          type="button"
          class="cui-carousel-dot"
          data-slot="dot"
          data-active={i === index ? '' : undefined}
          role="tab"
          aria-selected={i === index}
          aria-label={'Go to slide ' + (i + 1)}
          onclick={() => moveTo(i)}
        ></button>
      {/each}
    </div>
  {/if}
</section>
