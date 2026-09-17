// =============================================================================
// WAVE 3 COMPONENT GENERATORS
// Avatar, Breadcrumb, ButtonGroup, Divider, ProgressBar, ProgressRing,
// Popover, Tooltip, Select, Details, CopyButton
// =============================================================================

// 1. AVATAR
export function generateAvatar(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    image?: string;
    label?: string;
    initials?: string;
    shape?: 'circle' | 'square' | 'rounded';
    size?: 'sm' | 'md' | 'lg';
    status?: 'online' | 'offline' | 'busy' | 'away';
    icon?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    image = '',
    label = '',
    initials = '',
    shape = 'circle',
    size = 'md',
    status,
    icon,
    class: className = '',
    ...restProps
  }: Props = $props();

  let hasError = $state(false);
  const showImage = $derived(Boolean(image) && !hasError);
</script>

<div
  class="cui-avatar {className}"
  data-slot="avatar-root"
  data-shape={shape}
  data-size={size}
  role="img"
  aria-label={label || initials || 'Avatar'}
  {...restProps}
>
  {#if showImage}
    <img
      src={image}
      alt={label || initials || 'Avatar'}
      class="cui-avatar-img"
      data-slot="image"
      onerror={() => hasError = true}
    />
  {:else if initials}
    <span class="cui-avatar-initials" data-slot="initials">
      {initials}
    </span>
  {:else if icon}
    <span class="cui-avatar-icon" data-slot="icon">
      {@render icon()}
    </span>
  {:else}
    <span class="cui-avatar-fallback" data-slot="fallback" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </span>
  {/if}

  {#if status}
    <span
      class="cui-avatar-status"
      data-slot="indicator"
      data-status={status}
      aria-label="Status: {status}"
    ></span>
  {/if}
</div>
`;

  const sassCode = `.cui-avatar
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\tposition: relative
\tbackground-color: var(--bg-weaker)
\tcolor: var(--text-primary)
\tfont-family: var(--font-sans)
\tfont-weight: 600
\tuser-select: none
\tvertical-align: middle
\tborder: 1px solid var(--stroke-weakest)

\t&[data-shape="circle"]
\t\tborder-radius: var(--radius-full)
\t\t.cui-avatar-img
\t\t\tborder-radius: var(--radius-full)

\t&[data-shape="rounded"]
\t\tborder-radius: var(--radius-md)
\t\t.cui-avatar-img
\t\t\tborder-radius: var(--radius-md)

\t&[data-shape="square"]
\t\tborder-radius: var(--radius-xs)
\t\t.cui-avatar-img
\t\t\tborder-radius: var(--radius-xs)

\t&[data-size="sm"]
\t\twidth: var(--space-6)
\t\theight: var(--space-6)
\t\tfont-size: var(--text-xs)

\t&[data-size="md"]
\t\twidth: var(--space-8)
\t\theight: var(--space-8)
\t\tfont-size: var(--text-sm)

\t&[data-size="lg"]
\t\twidth: var(--space-12)
\t\theight: var(--space-12)
\t\tfont-size: var(--text-base)

.cui-avatar-img
\twidth: 100%
\theight: 100%
\tobject-fit: cover

.cui-avatar-initials
\ttext-transform: uppercase
\tletter-spacing: 0.05em

.cui-avatar-fallback,
.cui-avatar-icon
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\tcolor: var(--text-secondary)

.cui-avatar-status
\tposition: absolute
\tbottom: 0
\tright: 0
\twidth: var(--space-2)
\theight: var(--space-2)
\tborder-radius: var(--radius-full)
\tborder: 2px solid var(--bg)

\t&[data-status="online"]
\t\tbackground-color: var(--status-success-fg)

\t&[data-status="offline"]
\t\tbackground-color: var(--text-muted)

\t&[data-status="busy"]
\t\tbackground-color: var(--status-danger-fg)

\t&[data-status="away"]
\t\tbackground-color: var(--status-warning-fg)
`;

  return { svelteCode, sassCode };
}

// 2. BREADCRUMB
export function generateBreadcrumb(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import { setContext, type Snippet } from 'svelte';

  interface Props {
    label?: string;
    children: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    label = 'Breadcrumb',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  setContext('cui-breadcrumb-ctx', {
    hasContext: true
  });
</script>

<nav
  class="cui-breadcrumb {className}"
  data-slot="breadcrumb-root"
  aria-label={label}
  {...restProps}
>
  <ol class="cui-breadcrumb-list">
    {@render children()}
  </ol>
</nav>
`;

  const itemCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    href?: string;
    current?: boolean;
    children: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    href,
    current = false,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<li class="cui-breadcrumb-item {className}" data-slot="item" {...restProps}>
  {#if href && !current}
    <a {href} class="cui-breadcrumb-link">
      {@render children()}
    </a>
  {:else}
    <span class="cui-breadcrumb-current" aria-current={current ? 'page' : undefined}>
      {@render children()}
    </span>
  {/if}
  {#if !current}
    <span class="cui-breadcrumb-separator" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </span>
  {/if}
</li>
`;

  const sassCode = `.cui-breadcrumb
\tdisplay: flex
\talign-items: center
\tfont-family: var(--font-sans)
\tfont-size: var(--text-sm)

.cui-breadcrumb-list
\tdisplay: flex
\talign-items: center
\tflex-wrap: wrap
\tgap: var(--space-1)
\tlist-style: none
\tmargin: 0
\tpadding: 0

.cui-breadcrumb-item
\tdisplay: inline-flex
\talign-items: center
\tgap: var(--space-1)

.cui-breadcrumb-link
\tcolor: var(--text-secondary)
\ttext-decoration: none
\ttransition: color var(--duration-fast) var(--ease-out)

\t&:hover
\t\tcolor: var(--color-primary)

.cui-breadcrumb-current
\tcolor: var(--text-primary)
\tfont-weight: 600

.cui-breadcrumb-separator
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\tcolor: var(--text-muted)
`;

  return { svelteCode, sassCode, subComponents: { BreadcrumbItem: itemCode } };
}

// 3. BUTTON GROUP
export function generateButtonGroup(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    orientation?: 'horizontal' | 'vertical';
    children: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    orientation = 'horizontal',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<div
  class="cui-button-group {className}"
  data-slot="button-group-root"
  data-orientation={orientation}
  role="group"
  {...restProps}
>
  {@render children()}
</div>
`;

  const sassCode = `.cui-button-group
\tdisplay: inline-flex
\tvertical-align: middle
\tborder-radius: var(--radius-md)

\t&[data-orientation="horizontal"]
\t\tflex-direction: row

\t\t.cui-button
\t\t\tborder-radius: 0

\t\t\t&:first-child
\t\t\t\tborder-top-left-radius: var(--radius-md)
\t\t\t\tborder-bottom-left-radius: var(--radius-md)

\t\t\t&:last-child
\t\t\t\tborder-top-right-radius: var(--radius-md)
\t\t\t\tborder-bottom-right-radius: var(--radius-md)

\t\t\t&:not(:first-child)
\t\t\t\tmargin-left: -1px

\t&[data-orientation="vertical"]
\t\tflex-direction: column

\t\t.cui-button
\t\t\tborder-radius: 0

\t\t\t&:first-child
\t\t\t\tborder-top-left-radius: var(--radius-md)
\t\t\t\tborder-top-right-radius: var(--radius-md)

\t\t\t&:last-child
\t\t\t\tborder-bottom-left-radius: var(--radius-md)
\t\t\t\tborder-bottom-right-radius: var(--radius-md)

\t\t\t&:not(:first-child)
\t\t\t\tmargin-top: -1px
`;

  return { svelteCode, sassCode };
}

// 4. DIVIDER
export function generateDivider(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    orientation?: 'horizontal' | 'vertical';
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    orientation = 'horizontal',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<div
  class="cui-divider {className}"
  data-slot="divider-root"
  data-orientation={orientation}
  role="separator"
  aria-orientation={orientation}
  {...restProps}
>
  {#if children && orientation === 'horizontal'}
    <span class="cui-divider-content" data-slot="label">
      {@render children()}
    </span>
  {/if}
</div>
`;

  const sassCode = `.cui-divider
\tdisplay: flex
\talign-items: center
\tborder: none
\tmargin: 0
\tfont-family: var(--font-sans)
\tcolor: var(--text-muted)

\t&[data-orientation="horizontal"]
\t\twidth: 100%
\t\tmargin: var(--space-3) 0

\t\t&::before,
\t\t&::after
\t\t\tcontent: ''
\t\t\tflex: 1
\t\t\theight: 1px
\t\t\tbackground-color: var(--stroke-weakest)

\t&[data-orientation="vertical"]
\t\twidth: 1px
\t\theight: 1.5rem
\t\tbackground-color: var(--stroke-weakest)
\t\tdisplay: inline-block
\t\tvertical-align: middle
\t\tmargin: 0 var(--space-2)

.cui-divider-content
\tpadding: 0 var(--space-3)
\tfont-size: var(--text-xs)
\tfont-weight: 500
\twhite-space: nowrap
`;

  return { svelteCode, sassCode };
}

// 5. PROGRESS BAR
export function generateProgressBar(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    value?: number;
    indeterminate?: boolean;
    label?: string;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    value = 0,
    indeterminate = false,
    label = 'Progress',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const clamped = $derived(Math.max(0, Math.min(value, 100)));
</script>

<div
  class="cui-progress-bar {className}"
  data-slot="progress-root"
  data-indeterminate={indeterminate ? '' : undefined}
  role="progressbar"
  aria-valuenow={indeterminate ? undefined : clamped}
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label={label}
  {...restProps}
>
  <div
    class="cui-progress-fill"
    data-slot="fill"
    style="width: {indeterminate ? '100%' : clamped + '%'};"
  >
    {#if !indeterminate && children}
      <span class="cui-progress-label" data-slot="label">
        {@render children()}
      </span>
    {/if}
  </div>
</div>
`;

  const sassCode = `.cui-progress-bar
\twidth: 100%
\theight: var(--space-2)
\tbackground-color: var(--bg-weaker)
\tborder-radius: var(--radius-full)
\toverflow: hidden
\tposition: relative

\t&[data-indeterminate]
\t\t.cui-progress-fill
\t\t\twidth: 40% !important
\t\t\tanimation: cui-progress-slide 1.5s infinite ease-in-out

.cui-progress-fill
\theight: 100%
\tbackground-color: var(--color-primary)
\tborder-radius: var(--radius-full)
\ttransition: width var(--duration-normal) var(--ease-out)
\tdisplay: flex
\talign-items: center
\tjustify-content: flex-end
\tpadding-right: var(--space-1)

.cui-progress-label
\tfont-size: var(--text-xs)
\tcolor: var(--bg)
\tfont-weight: 600
\tline-height: 1

@keyframes cui-progress-slide
\t0%
\t\ttransform: translateX(-100%)
\t100%
\t\ttransform: translateX(300%)
`;

  return { svelteCode, sassCode };
}

// 6. PROGRESS RING
export function generateProgressRing(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    value?: number;
    label?: string;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    value = 0,
    label = 'Progress Ring',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const clamped = $derived(Math.max(0, Math.min(value, 100)));
  const circumference = 2 * Math.PI * 18; // r=18
  const offset = $derived(circumference - (circumference * clamped) / 100);
</script>

<div
  class="cui-progress-ring {className}"
  data-slot="progress-ring-root"
  role="progressbar"
  aria-valuenow={clamped}
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label={label}
  {...restProps}
>
  <svg class="cui-progress-ring-svg" viewBox="0 0 44 44" width="44" height="44">
    <circle
      class="cui-progress-ring-track"
      cx="22"
      cy="22"
      r="18"
      fill="none"
      stroke-width="4"
    />
    <circle
      class="cui-progress-ring-fill"
      cx="22"
      cy="22"
      r="18"
      fill="none"
      stroke-width="4"
      stroke-dasharray={circumference}
      stroke-dashoffset={offset}
      transform="rotate(-90 22 22)"
    />
  </svg>
  <div class="cui-progress-ring-center">
    {#if children}
      {@render children()}
    {:else}
      {Math.round(clamped)}%
    {/if}
  </div>
</div>
`;

  const sassCode = `.cui-progress-ring
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\tposition: relative
\twidth: var(--space-12)
\theight: var(--space-12)
\tvertical-align: middle

.cui-progress-ring-svg
\ttransform: rotate(0deg)

.cui-progress-ring-track
\tstroke: var(--stroke-weakest)

.cui-progress-ring-fill
\tstroke: var(--color-primary)
\tstroke-linecap: round
\ttransition: stroke-dashoffset var(--duration-normal) var(--ease-out)

.cui-progress-ring-center
\tposition: absolute
\tfont-family: var(--font-sans)
\tfont-size: var(--text-xs)
\tfont-weight: 600
\tcolor: var(--text-primary)
`;

  return { svelteCode, sassCode };
}

// 7. POPOVER
export function generatePopover(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open?: boolean;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    trigger?: Snippet;
    children: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    open = $bindable(false),
    placement = 'bottom',
    trigger,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  function toggle() {
    open = !open;
  }
</script>

<div
  class="cui-popover-root {className}"
  data-slot="popover-root"
  data-open={open ? '' : undefined}
  {...restProps}
>
  <div class="cui-popover-trigger" onclick={toggle} role="button" tabindex="0" onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}>
    {#if trigger}
      {@render trigger()}
    {:else}
      <button type="button" class="cui-button">Toggle Popover</button>
    {/if}
  </div>

  {#if open}
    <div
      class="cui-popover-panel"
      data-slot="panel"
      data-placement={placement}
      role="dialog"
    >
      {@render children()}
    </div>
  {/if}
</div>
`;

  const sassCode = `.cui-popover-root
\tposition: relative
\tdisplay: inline-block

.cui-popover-panel
\tposition: absolute
\tz-index: 100
\tmin-width: 16rem
\tbackground-color: var(--bg)
\tborder: 1px solid var(--stroke-weakest)
\tborder-radius: var(--radius-md)
\tbox-shadow: var(--shadow-lg)
\tpadding: var(--space-4)
\tcolor: var(--text-primary)
\tfont-family: var(--font-sans)
\tfont-size: var(--text-sm)
\tline-height: 1.5

\t&[data-placement="bottom"]
\t\ttop: calc(100% + var(--space-2))
\t\tleft: 0

\t&[data-placement="top"]
\t\tbottom: calc(100% + var(--space-2))
\t\tleft: 0

\t&[data-placement="right"]
\t\tleft: calc(100% + var(--space-2))
\t\ttop: 0

\t&[data-placement="left"]
\t\tright: calc(100% + var(--space-2))
\t\ttop: 0
`;

  return { svelteCode, sassCode };
}

// 8. TOOLTIP
export function generateTooltip(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    content?: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    children: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    content = '',
    placement = 'top',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<span
  class="cui-tooltip-anchor {className}"
  data-slot="tooltip-root"
  {...restProps}
>
  {@render children()}
  {#if content}
    <span
      class="cui-tooltip-balloon"
      data-slot="panel"
      data-placement={placement}
      role="tooltip"
    >
      {content}
    </span>
  {/if}
</span>
`;

  const sassCode = `.cui-tooltip-anchor
\tposition: relative
\tdisplay: inline-flex
\talign-items: center

.cui-tooltip-balloon
\tposition: absolute
\tz-index: 200
\twhite-space: nowrap
\tbackground-color: var(--stroke-stronger)
\tcolor: var(--bg)
\tpadding: var(--space-1) var(--space-2)
\tborder-radius: var(--radius-sm)
\tfont-family: var(--font-sans)
\tfont-size: var(--text-xs)
\tfont-weight: 500
\tpointer-events: none
\topacity: 0
\ttransition: opacity var(--duration-fast) var(--ease-out)

\t.cui-tooltip-anchor:hover &
\t\topacity: 1

\t&[data-placement="top"]
\t\tbottom: calc(100% + var(--space-1))
\t\tleft: 50%
\t\ttransform: translateX(-50%)

\t&[data-placement="bottom"]
\t\ttop: calc(100% + var(--space-1))
\t\tleft: 50%
\t\ttransform: translateX(-50%)

\t&[data-placement="left"]
\t\tright: calc(100% + var(--space-1))
\t\ttop: 50%
\t\ttransform: translateY(-50%)

\t&[data-placement="right"]
\t\tleft: calc(100% + var(--space-1))
\t\ttop: 50%
\t\ttransform: translateY(-50%)
`;

  return { svelteCode, sassCode };
}

// 9. SELECT
export function generateSelect(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import { setContext, type Snippet } from 'svelte';

  interface Props {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    label?: string;
    children: Snippet;
    class?: string;
    onchange?: (val: string) => void;
    [key: string]: any;
  }

  let {
    value = $bindable(''),
    placeholder = 'Select an option...',
    disabled = false,
    label,
    children,
    class: className = '',
    onchange,
    ...restProps
  }: Props = $props();

  let isOpen = $state(false);
  let selectedDisplay = $state('');

  function selectOption(val: string, displayLabel: string) {
    value = val;
    selectedDisplay = displayLabel;
    isOpen = false;
    onchange?.(val);
  }

  setContext('cui-select-ctx', {
    getSelected: () => value,
    select: selectOption
  });
</script>

<div
  class="cui-select-root {className}"
  data-slot="select-root"
  data-open={isOpen ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  {...restProps}
>
  {#if label}
    <span class="cui-select-label" data-slot="label">{label}</span>
  {/if}

  <button
    type="button"
    class="cui-select-trigger"
    data-slot="trigger"
    aria-expanded={isOpen}
    {disabled}
    onclick={() => { if (!disabled) isOpen = !isOpen; }}
  >
    <span class="cui-select-value" class:placeholder={!value}>
      {selectedDisplay || value || placeholder}
    </span>
    <span class="cui-select-chevron" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>
  </button>

  {#if isOpen}
    <div class="cui-select-menu" data-slot="menu" role="listbox">
      {@render children()}
    </div>
  {/if}
</div>
`;

  const optionCode = `<script lang="ts">
  import { getContext, onMount, type Snippet } from 'svelte';

  interface Props {
    value: string;
    label?: string;
    disabled?: boolean;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    value,
    label = '',
    disabled = false,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const ctx = getContext<any>('cui-select-ctx');
  const isSelected = $derived(ctx ? ctx.getSelected() === value : false);

  function handleClick() {
    if (disabled) return;
    ctx?.select(value, label || value);
  }
</script>

<div
  class="cui-option-item {className}"
  data-slot="option"
  data-selected={isSelected ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  role="option"
  aria-selected={isSelected}
  tabindex="0"
  onclick={handleClick}
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
  {...restProps}
>
  <span class="cui-option-label">
    {#if children}
      {@render children()}
    {:else}
      {label || value}
    {/if}
  </span>
  {#if isSelected}
    <span class="cui-option-check" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
  {/if}
</div>
`;

  const sassCode = `.cui-select-root
\tposition: relative
\tdisplay: flex
\tflex-direction: column
\tgap: var(--space-1)
\twidth: 100%
\tfont-family: var(--font-sans)

.cui-select-label
\tfont-size: var(--text-xs)
\tfont-weight: 500
\tcolor: var(--text-secondary)

.cui-select-trigger
\twidth: 100%
\tdisplay: flex
\talign-items: center
\tjustify-content: space-between
\tpadding: var(--space-2) var(--space-3)
\tbackground-color: var(--bg)
\tborder: 1px solid var(--stroke-weakest)
\tborder-radius: var(--radius-md)
\tcolor: var(--text-primary)
\tfont-size: var(--text-sm)
\tcursor: pointer
\ttransition: border-color var(--duration-fast) var(--ease-out)

\t&:hover:not([disabled])
\t\tborder-color: var(--stroke-weaker)

\t&:focus-visible
\t\toutline: 2px solid var(--state-focus)
\t\toutline-offset: 2px

\t&:disabled
\t\topacity: 0.5
\t\tcursor: not-allowed

.cui-select-value
\t&.placeholder
\t\tcolor: var(--text-muted)

.cui-select-chevron
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\tcolor: var(--text-muted)
\ttransition: transform var(--duration-fast) var(--ease-out)

\t.cui-select-root[data-open] &
\t\ttransform: rotate(180deg)

.cui-select-menu
\tposition: absolute
\tz-index: 100
\ttop: calc(100% + var(--space-1))
\tleft: 0
\tright: 0
\tmax-height: 14rem
\toverflow-y: auto
\tbackground-color: var(--bg)
\tborder: 1px solid var(--stroke-weakest)
\tborder-radius: var(--radius-md)
\tbox-shadow: var(--shadow-lg)
\tpadding: var(--space-1)

.cui-option-item
\tdisplay: flex
\talign-items: center
\tjustify-content: space-between
\tpadding: var(--space-2) var(--space-3)
\tborder-radius: var(--radius-sm)
\tcursor: pointer
\tcolor: var(--text-primary)
\tfont-size: var(--text-sm)
\ttransition: background-color var(--duration-fast) var(--ease-out)

\t&:hover:not([data-disabled])
\t\tbackground-color: var(--state-hover)

\t&[data-selected]
\t\tbackground-color: var(--bg-weaker)
\t\tcolor: var(--color-primary)
\t\tfont-weight: 600

\t&[data-disabled]
\t\topacity: 0.5
\t\tcursor: not-allowed

.cui-option-check
\tdisplay: inline-flex
\talign-items: center
\tcolor: var(--color-primary)
`;

  return { svelteCode, sassCode, subComponents: { Option: optionCode } };
}

// 10. DETAILS
export function generateDetails(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    summary?: string;
    open?: boolean;
    children: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    summary = 'Details',
    open = false,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<details
  class="cui-details {className}"
  data-slot="details-root"
  {open}
  {...restProps}
>
  <summary class="cui-details-summary" data-slot="summary">
    <span>{summary}</span>
    <span class="cui-details-chevron" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>
  </summary>
  <div class="cui-details-content" data-slot="content">
    {@render children()}
  </div>
</details>
`;

  const sassCode = `.cui-details
\tborder: 1px solid var(--stroke-weakest)
\tborder-radius: var(--radius-md)
\tbackground-color: var(--bg)
\toverflow: hidden
\tfont-family: var(--font-sans)

.cui-details-summary
\tpadding: var(--space-3) var(--space-4)
\tfont-size: var(--text-sm)
\tfont-weight: 600
\tcursor: pointer
\tdisplay: flex
\talign-items: center
\tjustify-content: space-between
\tcolor: var(--text-primary)
\tuser-select: none
\tlist-style: none
\ttransition: background-color var(--duration-fast) var(--ease-out)

\t&::-webkit-details-marker
\t\tdisplay: none

\t&:hover
\t\tbackground-color: var(--state-hover)

.cui-details-chevron
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\tcolor: var(--text-muted)
\ttransition: transform var(--duration-fast) var(--ease-out)

\tdetails[open] &
\t\ttransform: rotate(180deg)

.cui-details-content
\tpadding: var(--space-4)
\tcolor: var(--text-secondary)
\tfont-size: var(--text-sm)
\tline-height: 1.5
\tborder-top: 1px solid var(--stroke-weakest)
`;

  return { svelteCode, sassCode };
}

// 11. COPY BUTTON
export function generateCopyButton(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  interface Props {
    value: string;
    label?: string;
    copiedLabel?: string;
    class?: string;
    [key: string]: any;
  }

  let {
    value,
    label = 'Copy',
    copiedLabel = 'Copied!',
    class: className = '',
    ...restProps
  }: Props = $props();

  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  async function handleCopy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      copied = true;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        copied = false;
      }, 2000);
    } catch (e) {
      console.error('Failed to copy text: ', e);
    }
  }
</script>

<button
  type="button"
  class="cui-copy-btn {className}"
  data-slot="copy-root"
  data-copied={copied ? '' : undefined}
  onclick={handleCopy}
  aria-label={copied ? copiedLabel : label}
  {...restProps}
>
  {#if copied}
    <span class="cui-copy-icon" data-slot="check-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
    <span class="cui-copy-label">{copiedLabel}</span>
  {:else}
    <span class="cui-copy-icon" data-slot="copy-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </span>
    <span class="cui-copy-label">{label}</span>
  {/if}
</button>
`;

  const sassCode = `.cui-copy-btn
\tdisplay: inline-flex
\talign-items: center
\tgap: var(--space-1)
\tpadding: var(--space-1) var(--space-2)
\tborder-radius: var(--radius-sm)
\tborder: 1px solid var(--stroke-weakest)
\tbackground-color: var(--bg-weaker)
\tcolor: var(--text-primary)
\tfont-family: var(--font-sans)
\tfont-size: var(--text-xs)
\tfont-weight: 500
\tcursor: pointer
\ttransition: all var(--duration-fast) var(--ease-out)

\t&:hover
\t\tbackground-color: var(--state-hover)

\t&[data-copied]
\t\tbackground-color: var(--color-primary-subtle)
\t\tcolor: var(--color-primary)
\t\tborder-color: var(--stroke-weaker)

.cui-copy-icon
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center

.cui-copy-label
\tline-height: 1
`;

  return { svelteCode, sassCode };
}

export const WAVE3_GENERATORS = {
  avatar: generateAvatar,
  breadcrumb: generateBreadcrumb,
  buttongroup: generateButtonGroup,
  divider: generateDivider,
  progressbar: generateProgressBar,
  progressring: generateProgressRing,
  popover: generatePopover,
  tooltip: generateTooltip,
  select: generateSelect,
  details: generateDetails,
  copybutton: generateCopyButton
};
