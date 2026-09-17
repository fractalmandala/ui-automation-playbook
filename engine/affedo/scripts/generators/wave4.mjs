// =============================================================================
// WAVE 4 COMPONENT GENERATORS
// NumberInput, Pagination, Carousel, SplitPanel, Scroller, Comparison
// =============================================================================

// 1. NUMBER INPUT
export function generateNumberInput(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    id?: string;
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    size?: 'sm' | 'md' | 'lg';
    label?: string;
    hint?: string;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    start?: Snippet;
    end?: Snippet;
    onchange?: (value: number) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    id = 'cui-numberinput-' + Math.random().toString(36).slice(2, 8),
    value = $bindable(0),
    min = 0,
    max = 100,
    step = 1,
    size = 'md',
    label = '',
    hint = '',
    error = '',
    placeholder = '',
    disabled = false,
    readonly = false,
    required = false,
    start,
    end,
    onchange,
    class: className = '',
    ...restProps
  }: Props = $props();

  function clamp(n: number): number {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    return Math.min(hi, Math.max(lo, n));
  }

  function stepBy(direction: number) {
    if (disabled || readonly) return;
    const base = Number.isFinite(value) ? value : clamp(min);
    const next = clamp(base + direction * step);
    value = next;
    onchange?.(next);
  }

  function handleInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value;
    if (raw === '') return;
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      value = parsed;
      onchange?.(parsed);
    }
  }

  function handleBlur() {
    if (!Number.isFinite(value)) {
      const next = clamp(min);
      value = next;
      onchange?.(next);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      stepBy(1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      stepBy(-1);
    }
  }
</script>

<div
  class="cui-numberinput-root {className}"
  data-slot="numberinput-root"
  data-size={size}
  data-invalid={error ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
>
  {#if label}
    <label for={id} class="cui-numberinput-label" data-slot="label">
      {label}
      {#if required}<span class="cui-numberinput-required" data-slot="required">*</span>{/if}
    </label>
  {/if}

  <div class="cui-numberinput-wrapper" data-slot="wrapper" role="group">
    {#if start}
      <span class="cui-numberinput-affix" data-slot="start">
        {@render start()}
      </span>
    {/if}

    <button
      type="button"
      class="cui-numberinput-stepper"
      data-slot="stepperDecrement"
      data-dir="down"
      aria-label="Decrease value"
      disabled={disabled || readonly}
      onclick={() => stepBy(-1)}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>

    <input
      {id}
      type="number"
      inputmode="numeric"
      {placeholder}
      {min}
      {max}
      {step}
      {disabled}
      {readonly}
      {required}
      bind:value
      aria-invalid={error ? 'true' : undefined}
      class="cui-numberinput-control"
      data-slot="control"
      oninput={handleInput}
      onblur={handleBlur}
      onkeydown={handleKeydown}
      {...restProps}
    />

    <button
      type="button"
      class="cui-numberinput-stepper"
      data-slot="stepperIncrement"
      data-dir="up"
      aria-label="Increase value"
      disabled={disabled || readonly}
      onclick={() => stepBy(1)}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>

    {#if end}
      <span class="cui-numberinput-affix" data-slot="end">
        {@render end()}
      </span>
    {/if}
  </div>

  {#if error}
    <span class="cui-numberinput-error" data-slot="error">{error}</span>
  {:else if hint}
    <span class="cui-numberinput-hint" data-slot="hint">{hint}</span>
  {/if}
</div>
`;

  const sassCode = `.cui-numberinput-root
	display: flex
	flex-direction: column
	gap: var(--space-1)
	font-family: var(--font-sans)
	width: 100%

	&[data-disabled]
		opacity: var(--state-disabled)
		cursor: not-allowed

.cui-numberinput-label
	font-size: var(--text-xs)
	font-weight: 600
	color: var(--text-primary)
	letter-spacing: 0.02em

.cui-numberinput-required
	color: var(--status-danger-fg)
	margin-left: 2px

.cui-numberinput-wrapper
	display: flex
	align-items: center
	gap: var(--space-1)
	border: 1px solid var(--stroke-weaker)
	border-radius: var(--radius-md)
	background-color: transparent
	transition: border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)

	&:focus-within
		border-color: var(--state-focus)
		box-shadow: 0 0 0 1px var(--state-focus)

	.cui-numberinput-root[data-size="sm"] &
		height: 1.75rem
		font-size: var(--text-xs)

	.cui-numberinput-root[data-size="md"] &
		height: 2.25rem
		font-size: var(--text-sm)

	.cui-numberinput-root[data-size="lg"] &
		height: 2.75rem
		font-size: var(--text-base)

	.cui-numberinput-root[data-invalid] &
		border-color: var(--status-danger-border) !important
		box-shadow: 0 0 0 1px var(--status-danger-border) !important

.cui-numberinput-control
	flex: 1
	min-width: 0
	height: 100%
	border: none
	background: transparent
	color: var(--text-primary)
	font-family: inherit
	font-size: inherit
	text-align: center
	outline: none

	&::placeholder
		color: var(--text-muted)

	&::-webkit-inner-spin-button, &::-webkit-outer-spin-button
		appearance: none
		margin: 0

	-moz-appearance: textfield

.cui-numberinput-stepper
	display: inline-flex
	align-items: center
	justify-content: center
	flex-shrink: 0
	width: 1.75rem
	height: calc(100% - var(--space-1))
	margin: 2px
	border: none
	border-radius: var(--radius-sm)
	background-color: var(--bg-weaker)
	color: var(--text-secondary)
	cursor: pointer
	transition: background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)

	&:hover:not(:disabled)
		background-color: var(--state-hover)
		color: var(--text-primary)

	&:disabled
		opacity: var(--state-disabled)
		cursor: not-allowed

.cui-numberinput-affix
	display: inline-flex
	align-items: center
	color: var(--text-secondary)

.cui-numberinput-hint
	font-size: var(--text-xs)
	color: var(--text-muted)

.cui-numberinput-error
	font-size: var(--text-xs)
	color: var(--status-danger-fg)
`;

  return { svelteCode, sassCode };
}

// 2. PAGINATION
export function generatePagination(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  interface Props {
    page?: number;
    totalPages?: number;
    siblingCount?: number;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    showEdges?: boolean;
    onchange?: (page: number) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    page = $bindable(1),
    totalPages = 10,
    siblingCount = 1,
    size = 'md',
    disabled = false,
    showEdges = false,
    onchange,
    class: className = '',
    ...restProps
  }: Props = $props();

  let safeTotal = $derived(Math.max(1, Math.floor(totalPages)));

  function goTo(target: number) {
    if (disabled) return;
    const next = Math.min(safeTotal, Math.max(1, target));
    if (next !== page) {
      page = next;
      onchange?.(next);
    }
  }

  function buildRange(current: number, total: number, siblings: number): (number | string)[] {
    const totalSlots = siblings * 2 + 5;
    if (total <= totalSlots) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const startPage = Math.max(2, current - siblings);
    const endPage = Math.min(total - 1, current + siblings);
    const range: (number | string)[] = [1];
    if (startPage > 2) range.push('ellipsis-start');
    for (let p = startPage; p <= endPage; p++) range.push(p);
    if (endPage < total - 1) range.push('ellipsis-end');
    range.push(total);
    return range;
  }

  let items = $derived(buildRange(page, safeTotal, siblingCount));
</script>

<nav
  class="cui-pagination-root {className}"
  data-slot="pagination-root"
  data-size={size}
  data-disabled={disabled ? '' : undefined}
  aria-label="Pagination"
  {...restProps}
>
  {#if showEdges}
    <button
      type="button"
      class="cui-pagination-nav"
      data-slot="pageFirst"
      aria-label="First page"
      disabled={disabled || page <= 1}
      onclick={() => goTo(1)}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
        <polyline points="11 17 6 12 11 7" />
        <polyline points="18 17 13 12 18 7" />
      </svg>
    </button>
  {/if}

  <button
    type="button"
    class="cui-pagination-nav"
    data-slot="pagePrev"
    aria-label="Previous page"
    disabled={disabled || page <= 1}
    onclick={() => goTo(page - 1)}
  >
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  </button>

  <div class="cui-pagination-list" data-slot="list">
    {#each items as item (String(item))}
      {#if typeof item === 'number'}
        <button
          type="button"
          class="cui-pagination-page"
          data-slot="pageItem"
          data-active={item === page ? '' : undefined}
          aria-current={item === page ? 'page' : undefined}
          aria-label={'Page ' + item}
          disabled={disabled}
          onclick={() => goTo(item)}
        >
          {item}
        </button>
      {:else}
        <span class="cui-pagination-ellipsis" data-slot="ellipsis" aria-hidden="true">…</span>
      {/if}
    {/each}
  </div>

  <button
    type="button"
    class="cui-pagination-nav"
    data-slot="pageNext"
    aria-label="Next page"
    disabled={disabled || page >= safeTotal}
    onclick={() => goTo(page + 1)}
  >
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  </button>

  {#if showEdges}
    <button
      type="button"
      class="cui-pagination-nav"
      data-slot="pageLast"
      aria-label="Last page"
      disabled={disabled || page >= safeTotal}
      onclick={() => goTo(safeTotal)}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
        <polyline points="13 17 18 12 13 7" />
        <polyline points="6 17 11 12 6 7" />
      </svg>
    </button>
  {/if}
</nav>
`;

  const sassCode = `.cui-pagination-root
	display: inline-flex
	align-items: center
	gap: var(--space-1)
	font-family: var(--font-sans)
	user-select: none

	&[data-disabled]
		opacity: var(--state-disabled)
		pointer-events: none

.cui-pagination-list
	display: flex
	align-items: center
	gap: var(--space-1)

.cui-pagination-page, .cui-pagination-nav
	display: inline-flex
	align-items: center
	justify-content: center
	border: 1px solid var(--stroke-weaker)
	border-radius: var(--radius-sm)
	background-color: var(--bg-base)
	color: var(--text-primary)
	cursor: pointer
	transition: background-color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)

	&:hover:not(:disabled)
		background-color: var(--state-hover)
		border-color: var(--stroke-base)

	&:focus-visible
		outline: 2px solid var(--state-focus)
		outline-offset: 2px

	&:disabled
		opacity: var(--state-disabled)
		cursor: not-allowed

	.cui-pagination-root[data-size="sm"] &
		min-width: 1.75rem
		height: 1.75rem
		padding: 0 var(--space-1)
		font-size: var(--text-xs)

	.cui-pagination-root[data-size="md"] &
		min-width: 2.25rem
		height: 2.25rem
		padding: 0 var(--space-2)
		font-size: var(--text-sm)

	.cui-pagination-root[data-size="lg"] &
		min-width: 2.75rem
		height: 2.75rem
		padding: 0 var(--space-3)
		font-size: var(--text-base)

.cui-pagination-page[data-active]
	background-color: var(--color-primary)
	border-color: var(--color-primary)
	color: var(--color-primary-fg)
	font-weight: 600

	&:hover
		background-color: var(--color-primary-hover)
		border-color: var(--color-primary-hover)

.cui-pagination-ellipsis
	display: inline-flex
	align-items: center
	justify-content: center
	color: var(--text-muted)

	.cui-pagination-root[data-size="sm"] &
		min-width: 1.75rem
		height: 1.75rem
		font-size: var(--text-xs)

	.cui-pagination-root[data-size="md"] &
		min-width: 2.25rem
		height: 2.25rem
		font-size: var(--text-sm)

	.cui-pagination-root[data-size="lg"] &
		min-width: 2.75rem
		height: 2.75rem
		font-size: var(--text-base)
`;

  return { svelteCode, sassCode };
}

// 3. CAROUSEL
export function generateCarousel(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
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
`;

  const sassCode = `.cui-carousel-root
	position: relative
	display: flex
	flex-direction: column
	gap: var(--space-2)
	font-family: var(--font-sans)

.cui-carousel-viewport
	position: relative
	width: 100%
	overflow: hidden
	border: 1px solid var(--stroke-weakest)
	border-radius: var(--radius-lg)
	background-color: var(--bg)

.cui-carousel-track
	display: flex
	transition: transform var(--duration-normal) var(--ease-spring)

.cui-carousel-slide
	flex: 0 0 100%
	min-width: 0
	min-height: 0
	display: flex
	align-items: center
	justify-content: center
	padding: var(--space-6)
	box-sizing: border-box
	color: var(--text-secondary)
	font-size: var(--text-sm)
	text-align: center

	&[data-active]
		color: var(--text-primary)

.cui-carousel-empty
	flex: 0 0 100%
	display: flex
	align-items: center
	justify-content: center
	margin: var(--space-4)
	padding: var(--space-6)
	color: var(--text-muted)
	font-size: var(--text-sm)
	text-align: center
	border: 1px dashed var(--stroke-weaker)
	border-radius: var(--radius-md)

.cui-carousel-arrow
	position: absolute
	top: 50%
	transform: translateY(-50%)
	z-index: 10
	display: inline-flex
	align-items: center
	justify-content: center
	width: 2rem
	height: 2rem
	border: 1px solid var(--stroke-weakest)
	border-radius: var(--radius-full)
	background-color: var(--bg)
	color: var(--text-primary)
	cursor: pointer
	box-shadow: var(--shadow-sm)
	transition: background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)

	&:hover:not(:disabled)
		background-color: var(--state-hover)

	&:focus-visible
		outline: 2px solid var(--state-focus)
		outline-offset: 2px

	&:disabled
		opacity: var(--state-disabled)
		cursor: not-allowed

.cui-carousel-arrow-prev
	left: var(--space-2)

.cui-carousel-arrow-next
	right: var(--space-2)

.cui-carousel-dots
	display: flex
	align-items: center
	justify-content: center
	gap: var(--space-2)

.cui-carousel-dot
	width: var(--space-2)
	height: var(--space-2)
	padding: 0
	border: none
	border-radius: var(--radius-full)
	background-color: var(--stroke-base)
	cursor: pointer
	transition: background-color var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out)

	&:hover
		background-color: var(--text-secondary)

	&:focus-visible
		outline: 2px solid var(--state-focus)
		outline-offset: 2px

	&[data-active]
		background-color: var(--color-primary)
		transform: scale(1.25)
`;

  return { svelteCode, sassCode };
}

// 4. SPLIT PANEL
export function generateSplitPanel(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    split?: number;
    orientation?: 'horizontal' | 'vertical';
    min?: number;
    max?: number;
    disabled?: boolean;
    start?: Snippet;
    end?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    split = $bindable(50),
    orientation = 'horizontal',
    min = 10,
    max = 90,
    disabled = false,
    start,
    end,
    class: className = '',
    ...restProps
  }: Props = $props();

  let rootEl: HTMLDivElement | undefined = $state();

  let lo = $derived(Math.min(min, max));
  let hi = $derived(Math.max(min, max));

  function clamp(n: number): number {
    return Math.min(hi, Math.max(lo, n));
  }

  let clampedSplit = $derived(clamp(split));

  function handlePointerDown(e: PointerEvent) {
    if (disabled) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (disabled || !rootEl) return;
    if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
    const rect = rootEl.getBoundingClientRect();
    const pct = orientation === 'vertical'
      ? ((e.clientY - rect.top) / rect.height) * 100
      : ((e.clientX - rect.left) / rect.width) * 100;
    split = clamp(Math.round(pct * 10) / 10);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (disabled) return;
    const big = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      split = clamp(split - big);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      split = clamp(split + big);
    }
  }
</script>

<div
  bind:this={rootEl}
  class="cui-splitpanel-root {className}"
  data-slot="splitpanel-root"
  data-orientation={orientation}
  data-disabled={disabled ? '' : undefined}
  style="--cui-split: {clampedSplit}%;"
  {...restProps}
>
  <div class="cui-splitpanel-pane" data-slot="paneStart">
    {#if start}
      {@render start()}
    {:else}
      <p class="cui-splitpanel-placeholder">Start pane</p>
    {/if}
  </div>

  <div
    class="cui-splitpanel-divider"
    data-slot="divider"
  >
    <div
      class="cui-splitpanel-handle"
      data-slot="handle"
      role="slider"
      aria-orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
      aria-valuenow={Math.round(clampedSplit)}
      aria-valuemin={lo}
      aria-valuemax={hi}
      aria-label="Resize panes"
      tabindex={disabled ? -1 : 0}
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onkeydown={handleKeydown}
    >
      <div class="cui-splitpanel-grip" aria-hidden="true"></div>
    </div>
  </div>

  <div class="cui-splitpanel-pane" data-slot="paneEnd">
    {#if end}
      {@render end()}
    {:else}
      <p class="cui-splitpanel-placeholder">End pane</p>
    {/if}
  </div>
</div>
`;

  const sassCode = `.cui-splitpanel-root
	display: flex
	width: 100%
	min-width: 0
	min-height: 0
	font-family: var(--font-sans)

	&[data-orientation="horizontal"]
		flex-direction: row

	&[data-orientation="vertical"]
		flex-direction: column

	&[data-disabled]
		opacity: var(--state-disabled)

.cui-splitpanel-pane
	flex: 1 1 0
	min-width: 0
	min-height: 0
	display: flex
	flex-direction: column
	overflow: hidden
	background-color: var(--bg)
	border: 1px solid var(--stroke-weakest)
	border-radius: var(--radius-md)
	padding: var(--space-3)
	box-sizing: border-box

	.cui-splitpanel-root[data-orientation="horizontal"] &:first-child
		width: var(--cui-split, 50%)
		flex: 0 0 auto

	.cui-splitpanel-root[data-orientation="vertical"] &:first-child
		height: var(--cui-split, 50%)
		flex: 0 0 auto

.cui-splitpanel-placeholder
	margin: auto
	color: var(--text-muted)
	font-size: var(--text-sm)

.cui-splitpanel-divider
	flex-shrink: 0
	display: flex
	align-items: center
	justify-content: center
	background-color: transparent
	touch-action: none

	.cui-splitpanel-root[data-orientation="horizontal"] &
		width: var(--space-2)
		cursor: col-resize

	.cui-splitpanel-root[data-orientation="vertical"] &
		height: var(--space-2)
		cursor: row-resize

	&:focus-visible
		outline: 2px solid var(--state-focus)
		outline-offset: 2px
		border-radius: var(--radius-sm)

.cui-splitpanel-handle
	display: flex
	align-items: center
	justify-content: center
	width: 100%
	height: 100%
	touch-action: none

	&:focus-visible
		outline: 2px solid var(--state-focus)
		outline-offset: 2px
		border-radius: var(--radius-sm)

.cui-splitpanel-grip
	background-color: var(--stroke-base)
	border-radius: var(--radius-full)
	transition: background-color var(--duration-fast) var(--ease-out)

	.cui-splitpanel-root[data-orientation="horizontal"] &
		width: 2px
		height: var(--space-6)

	.cui-splitpanel-root[data-orientation="vertical"] &
		width: var(--space-6)
		height: 2px

	.cui-splitpanel-handle:hover &
		background-color: var(--color-primary)
`;

  return { svelteCode, sassCode };
}

// 5. SCROLLER
export function generateScroller(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    direction?: 'vertical' | 'horizontal' | 'both';
    snap?: 'none' | 'proximity' | 'mandatory';
    fade?: boolean;
    maxHeight?: string;
    children?: Snippet;
    onscroll?: (e: Event) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    direction = 'vertical',
    snap = 'none',
    fade = false,
    maxHeight = '',
    children,
    onscroll,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<div
  class="cui-scroller-root {className}"
  data-slot="scroller-root"
  data-direction={direction}
  data-snap={snap}
  data-fade={fade ? '' : undefined}
  style={maxHeight ? '--cui-scroller-max: ' + maxHeight + ';' : undefined}
  {...restProps}
>
  <div class="cui-scroller-viewport" data-slot="viewport" {onscroll}>
    <div class="cui-scroller-content" data-slot="content">
      {#if children}
        {@render children()}
      {:else}
        <p class="cui-scroller-placeholder">Scroll content</p>
      {/if}
    </div>
  </div>
</div>
`;

  const sassCode = `.cui-scroller-root
	position: relative
	display: flex
	width: 100%
	height: auto
	max-height: var(--cui-scroller-max, 100%)
	min-height: 0
	font-family: var(--font-sans)

.cui-scroller-viewport
	flex: 1 1 auto
	min-width: 0
	min-height: 0
	overflow-y: auto
	overscroll-behavior: contain
	border: 1px solid var(--stroke-weakest)
	border-radius: var(--radius-md)
	background-color: var(--bg)
	transition: border-color var(--duration-fast) var(--ease-out)

	.cui-scroller-root[data-direction="horizontal"] &
		overflow-y: hidden
		overflow-x: auto

	.cui-scroller-root[data-direction="both"] &
		overflow: auto

	.cui-scroller-root[data-snap="mandatory"] &
		scroll-snap-type: y mandatory

	.cui-scroller-root[data-snap="proximity"] &
		scroll-snap-type: y proximity

	.cui-scroller-root[data-direction="horizontal"][data-snap="mandatory"] &
		scroll-snap-type: x mandatory

	.cui-scroller-root[data-direction="horizontal"][data-snap="proximity"] &
		scroll-snap-type: x proximity

.cui-scroller-content
	display: flex
	flex-direction: column
	min-width: 0
	min-height: 0

	.cui-scroller-root[data-direction="horizontal"] &
		flex-direction: row

	.cui-scroller-root[data-direction="both"] &
		display: block

	.cui-scroller-root[data-snap="mandatory"] & > *,
	.cui-scroller-root[data-snap="proximity"] & > *
		scroll-snap-align: start

.cui-scroller-placeholder
	margin: auto
	color: var(--text-muted)
	font-size: var(--text-sm)

.cui-scroller-root[data-fade]::after
	content: ''
	position: absolute
	pointer-events: none
	z-index: 5
	height: var(--space-4)
	left: 1px
	right: 1px
	bottom: 1px
	background: linear-gradient(to top, var(--bg), transparent)
	border-radius: 0 0 var(--radius-md) var(--radius-md)

.cui-scroller-root[data-fade][data-direction="horizontal"]::after,
.cui-scroller-root[data-fade][data-direction="both"]::after
	top: 1px
	height: auto
	width: var(--space-4)
	left: auto
	background: linear-gradient(to left, var(--bg), transparent)
	border-radius: 0 var(--radius-md) var(--radius-md) 0
`;

  return { svelteCode, sassCode };
}

// 6. COMPARISON
export function generateComparison(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    position?: number;
    beforeLabel?: string;
    afterLabel?: string;
    disabled?: boolean;
    before?: Snippet;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    position = $bindable(50),
    beforeLabel = 'Before',
    afterLabel = 'After',
    disabled = false,
    before,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  let rootEl: HTMLDivElement | undefined = $state();

  function clamp(n: number): number {
    return Math.min(100, Math.max(0, n));
  }

  let clampedPosition = $derived(clamp(position));

  function handlePointerDown(e: PointerEvent) {
    if (disabled) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (disabled || !rootEl) return;
    if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
    const rect = rootEl.getBoundingClientRect();
    position = clamp(Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (disabled) return;
    const big = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      position = clamp(position - big);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      position = clamp(position + big);
    }
  }
</script>

<div
  bind:this={rootEl}
  class="cui-comparison-root {className}"
  data-slot="comparison-root"
  data-disabled={disabled ? '' : undefined}
  style="--cui-compare: {clampedPosition}%;"
  {...restProps}
>
  <div class="cui-comparison-layer cui-comparison-after" data-slot="afterLayer">
    {#if children}
      {@render children()}
    {:else}
      <p class="cui-comparison-placeholder">{afterLabel}</p>
    {/if}
  </div>

  <div class="cui-comparison-layer cui-comparison-before" data-slot="beforeLayer">
    {#if before}
      {@render before()}
    {:else}
      <p class="cui-comparison-placeholder">{beforeLabel}</p>
    {/if}
  </div>

  <span class="cui-comparison-label cui-comparison-label-before" data-slot="labelBefore">{beforeLabel}</span>
  <span class="cui-comparison-label cui-comparison-label-after" data-slot="labelAfter">{afterLabel}</span>

  <div
    class="cui-comparison-divider"
    data-slot="divider"
  >
    <div
      class="cui-comparison-handle"
      data-slot="handle"
      role="slider"
      aria-orientation="vertical"
      aria-valuenow={Math.round(clampedPosition)}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Comparison slider"
      aria-valuetext={Math.round(clampedPosition) + '% before visible'}
      tabindex={disabled ? -1 : 0}
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onkeydown={handleKeydown}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
        <polyline points="9 18 3 12 9 6" />
        <polyline points="15 6 21 12 15 18" />
      </svg>
    </div>
  </div>
</div>
`;

  const sassCode = `.cui-comparison-root
	position: relative
	display: block
	width: 100%
	overflow: hidden
	border: 1px solid var(--stroke-weakest)
	border-radius: var(--radius-lg)
	box-sizing: border-box
	font-family: var(--font-sans)

	&[data-disabled]
		opacity: var(--state-disabled)
		cursor: not-allowed

.cui-comparison-layer
	display: flex
	align-items: center
	justify-content: center
	min-height: 12rem
	padding: var(--space-6)
	box-sizing: border-box

.cui-comparison-after
	background-color: var(--bg-weakest)

.cui-comparison-before
	position: absolute
	inset: 0
	background-color: var(--bg-base)
	clip-path: inset(0 calc(100% - var(--cui-compare, 50%)) 0 0)

.cui-comparison-placeholder
	margin: 0
	color: var(--text-secondary)
	font-size: var(--text-sm)

.cui-comparison-label
	position: absolute
	top: var(--space-2)
	padding: 2px var(--space-2)
	border-radius: var(--radius-full)
	background-color: var(--overlay-dimmer)
	color: var(--text-inverse)
	font-size: var(--text-xs)
	font-weight: 600
	pointer-events: none

.cui-comparison-label-before
	left: var(--space-2)

.cui-comparison-label-after
	right: var(--space-2)

.cui-comparison-divider
	position: absolute
	top: 0
	bottom: 0
	left: var(--cui-compare, 50%)
	width: var(--space-4)
	transform: translateX(-50%)
	display: flex
	align-items: center
	justify-content: center

.cui-comparison-handle
	display: inline-flex
	align-items: center
	justify-content: center
	width: 2rem
	height: 2rem
	border-radius: var(--radius-full)
	background-color: var(--bg)
	border: 1px solid var(--stroke-weakest)
	color: var(--text-primary)
	box-shadow: var(--shadow-md)
	cursor: ew-resize
	touch-action: none

	&:focus-visible
		outline: 2px solid var(--state-focus)
		outline-offset: 2px
`;

  return { svelteCode, sassCode };
}

// ==========================================
// WAVE 4 GENERATOR REGISTRY
// ==========================================
export const WAVE4_GENERATORS = {
  numberinput: generateNumberInput,
  pagination: generatePagination,
  carousel: generateCarousel,
  splitpanel: generateSplitPanel,
  scroller: generateScroller,
  comparison: generateComparison
};
