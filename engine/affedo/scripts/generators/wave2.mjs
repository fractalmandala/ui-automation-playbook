// =============================================================================
// WAVE 2 COMPONENT GENERATORS
// Accordion, Badge, Callout, Card, TabGroup, Tag, Toast, Tree
// =============================================================================

// 1. BADGE
export function generateBadge(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'brand' | 'neutral' | 'success' | 'warning' | 'danger';
    appearance?: 'accent' | 'filled' | 'outlined';
    size?: 'sm' | 'md' | 'lg';
    pill?: boolean;
    start?: Snippet;
    end?: Snippet;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'brand',
    appearance = 'accent',
    size = 'md',
    pill = false,
    start,
    end,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<span
  class="cui-badge {className}"
  data-slot="badge-root"
  data-variant={variant}
  data-appearance={appearance}
  data-size={size}
  data-pill={pill ? '' : undefined}
  {...restProps}
>
  {#if start}
    <span class="cui-badge-start" data-slot="start">
      {@render start()}
    </span>
  {/if}
  <span class="cui-badge-label" data-slot="label" role="status">
    {#if children}
      {@render children()}
    {:else}
      Badge
    {/if}
  </span>
  {#if end}
    <span class="cui-badge-end" data-slot="end">
      {@render end()}
    </span>
  {/if}
</span>
`;

  const sassCode = `.cui-badge
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\tgap: var(--space-1)
\tfont-family: var(--font-sans)
\tfont-weight: 600
\tline-height: 1
\twhite-space: nowrap
\tvertical-align: middle
\tborder-radius: var(--radius-sm)
\tborder: 1px solid transparent
\ttransition: background-color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)

\t&[data-pill]
\t\tborder-radius: var(--radius-full)

\t&[data-size="sm"]
\t\tpadding: 2px var(--space-1)
\t\tfont-size: var(--text-xs)

\t&[data-size="md"]
\t\tpadding: var(--space-1) var(--space-2)
\t\tfont-size: var(--text-xs)

\t&[data-size="lg"]
\t\tpadding: var(--space-1) var(--space-3)
\t\tfont-size: var(--text-sm)

\t// Accent Appearance
\t&[data-appearance="accent"]
\t\t&[data-variant="brand"]
\t\t\tbackground-color: var(--color-primary-subtle)
\t\t\tcolor: var(--color-primary)
\t\t\tborder-color: var(--stroke-weaker)

\t\t&[data-variant="neutral"]
\t\t\tbackground-color: var(--bg-weaker)
\t\t\tcolor: var(--text-secondary)
\t\t\tborder-color: var(--stroke-weakest)

\t\t&[data-variant="success"]
\t\t\tbackground-color: var(--status-success-bg)
\t\t\tcolor: var(--status-success-fg)
\t\t\tborder-color: var(--status-success-border)

\t\t&[data-variant="warning"]
\t\t\tbackground-color: var(--status-warning-bg)
\t\t\tcolor: var(--status-warning-fg)
\t\t\tborder-color: var(--status-warning-border)

\t\t&[data-variant="danger"]
\t\t\tbackground-color: var(--status-danger-bg)
\t\t\tcolor: var(--status-danger-fg)
\t\t\tborder-color: var(--status-danger-border)

\t// Filled Appearance
\t&[data-appearance="filled"]
\t\t&[data-variant="brand"]
\t\t\tbackground-color: var(--color-primary)
\t\t\tcolor: var(--color-primary-fg)

\t\t&[data-variant="neutral"]
\t\t\tbackground-color: var(--stroke-stronger)
\t\t\tcolor: var(--bg)

\t\t&[data-variant="success"]
\t\t\tbackground-color: var(--status-success-fg)
\t\t\tcolor: var(--bg)

\t\t&[data-variant="warning"]
\t\t\tbackground-color: var(--status-warning-fg)
\t\t\tcolor: var(--bg)

\t\t&[data-variant="danger"]
\t\t\tbackground-color: var(--status-danger-fg)
\t\t\tcolor: var(--bg)

\t// Outlined Appearance
\t&[data-appearance="outlined"]
\t\tbackground-color: transparent

\t\t&[data-variant="brand"]
\t\t\tcolor: var(--color-primary)
\t\t\tborder-color: var(--color-primary)

\t\t&[data-variant="neutral"]
\t\t\tcolor: var(--text-secondary)
\t\t\tborder-color: var(--stroke-weaker)

\t\t&[data-variant="success"]
\t\t\tcolor: var(--status-success-fg)
\t\t\tborder-color: var(--status-success-border)

\t\t&[data-variant="warning"]
\t\t\tcolor: var(--status-warning-fg)
\t\t\tborder-color: var(--status-warning-border)

\t\t&[data-variant="danger"]
\t\t\tcolor: var(--status-danger-fg)
\t\t\tborder-color: var(--status-danger-border)

.cui-badge-start,
.cui-badge-end
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center

.cui-badge-label
\tdisplay: inline-block
`;

  return { svelteCode, sassCode };
}

// 2. CALLOUT
export function generateCallout(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'brand' | 'neutral' | 'success' | 'warning' | 'danger';
    appearance?: 'accent' | 'filled' | 'outlined';
    size?: 'sm' | 'md' | 'lg';
    title?: string;
    closable?: boolean;
    onclose?: () => void;
    icon?: Snippet;
    actions?: Snippet;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'brand',
    appearance = 'accent',
    size = 'md',
    title,
    closable = false,
    onclose,
    icon,
    actions,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  let dismissed = $state(false);

  function handleClose() {
    dismissed = true;
    onclose?.();
  }
</script>

{#if !dismissed}
  <div
    class="cui-callout {className}"
    data-slot="callout-root"
    data-variant={variant}
    data-appearance={appearance}
    data-size={size}
    role="status"
    {...restProps}
  >
    <div class="cui-callout-icon" data-slot="icon">
      {#if icon}
        {@render icon()}
      {:else if variant === 'success'}
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      {:else if variant === 'warning'}
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      {:else if variant === 'danger'}
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      {/if}
    </div>

    <div class="cui-callout-body" data-slot="body">
      {#if title}
        <div class="cui-callout-title" data-slot="title">{title}</div>
      {/if}
      <div class="cui-callout-message" data-slot="message">
        {@render children?.()}
      </div>
      {#if actions}
        <div class="cui-callout-actions" data-slot="actions">
          {@render actions()}
        </div>
      {/if}
    </div>

    {#if closable}
      <button
        type="button"
        class="cui-callout-close"
        data-slot="close"
        onclick={handleClose}
        aria-label="Dismiss notice"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    {/if}
  </div>
{/if}
`;

  const sassCode = `.cui-callout
\tdisplay: flex
\talign-items: flex-start
\tgap: var(--space-3)
\tpadding: var(--space-3) var(--space-4)
\tborder-radius: var(--radius-md)
\tborder: 1px solid var(--stroke-weakest)
\tbackground-color: var(--bg-weaker)
\tcolor: var(--text-primary)
\tfont-family: var(--font-sans)
\ttransition: all var(--duration-fast) var(--ease-out)

\t&[data-size="sm"]
\t\tpadding: var(--space-2) var(--space-3)
\t\tgap: var(--space-2)
\t\tfont-size: var(--text-xs)

\t&[data-size="lg"]
\t\tpadding: var(--space-4) var(--space-6)
\t\tgap: var(--space-4)
\t\tfont-size: var(--text-base)

\t// Variant styling
\t&[data-variant="brand"]
\t\tborder-color: var(--stroke-weaker)
\t\t.cui-callout-icon
\t\t\tcolor: var(--color-primary)

\t&[data-variant="success"]
\t\tborder-color: var(--status-success-border)
\t\tbackground-color: var(--status-success-bg)
\t\t.cui-callout-icon
\t\t\tcolor: var(--status-success-fg)

\t&[data-variant="warning"]
\t\tborder-color: var(--status-warning-border)
\t\tbackground-color: var(--status-warning-bg)
\t\t.cui-callout-icon
\t\t\tcolor: var(--status-warning-fg)

\t&[data-variant="danger"]
\t\tborder-color: var(--status-danger-border)
\t\tbackground-color: var(--status-danger-bg)
\t\t.cui-callout-icon
\t\t\tcolor: var(--status-danger-fg)

\t&[data-variant="neutral"]
\t\tborder-color: var(--stroke-weakest)
\t\t.cui-callout-icon
\t\t\tcolor: var(--text-secondary)

.cui-callout-icon
\tflex-shrink: 0
\tmargin-top: 2px
\tdisplay: flex
\talign-items: center
\tjustify-content: center

.cui-callout-body
\tflex: 1
\tmin-width: 0
\tdisplay: flex
\tflex-direction: column
\tgap: var(--space-1)

.cui-callout-title
\tfont-weight: 600
\tfont-size: var(--text-sm)
\tcolor: var(--text-primary)
\tline-height: 1.3

.cui-callout-message
\tfont-size: var(--text-sm)
\tcolor: var(--text-secondary)
\tline-height: 1.5

.cui-callout-actions
\tdisplay: flex
\talign-items: center
\tgap: var(--space-2)
\tmargin-top: var(--space-2)

.cui-callout-close
\tflex-shrink: 0
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\tbackground: transparent
\tborder: none
\tcolor: var(--text-muted)
\tcursor: pointer
\tpadding: var(--space-1)
\tborder-radius: var(--radius-sm)
\ttransition: background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)

\t&:hover
\t\tcolor: var(--text-primary)
\t\tbackground-color: var(--state-hover)
`;

  return { svelteCode, sassCode };
}

// 3. CARD
export function generateCard(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    appearance?: 'outlined' | 'filled' | 'elevated';
    orientation?: 'vertical' | 'horizontal';
    children?: Snippet;
    media?: Snippet;
    header?: Snippet;
    headerActions?: Snippet;
    footer?: Snippet;
    footerActions?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    appearance = 'outlined',
    orientation = 'vertical',
    children,
    media,
    header,
    headerActions,
    footer,
    footerActions,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<div
  class="cui-card {className}"
  data-slot="card-root"
  data-appearance={appearance}
  data-orientation={orientation}
  {...restProps}
>
  {#if media}
    <div class="cui-card-media" data-slot="media">
      {@render media()}
    </div>
  {/if}
  <div class="cui-card-content-wrap">
    {#if header || headerActions}
      <div class="cui-card-header" data-slot="header">
        <div class="cui-card-header-main">
          {@render header?.()}
        </div>
        {#if headerActions}
          <div class="cui-card-header-actions" data-slot="header-actions">
            {@render headerActions()}
          </div>
        {/if}
      </div>
    {/if}
    {#if children}
      <div class="cui-card-body" data-slot="body">
        {@render children()}
      </div>
    {/if}
    {#if footer || footerActions}
      <div class="cui-card-footer" data-slot="footer">
        <div class="cui-card-footer-main">
          {@render footer?.()}
        </div>
        {#if footerActions}
          <div class="cui-card-footer-actions" data-slot="footer-actions">
            {@render footerActions()}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
`;

  const sassCode = `.cui-card
\tdisplay: flex
\tflex-direction: column
\tbackground-color: var(--bg)
\tborder-radius: var(--radius-lg)
\toverflow: hidden
\tfont-family: var(--font-sans)
\tborder: 1px solid var(--stroke-weakest)
\ttransition: border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)

\t&[data-appearance="filled"]
\t\tbackground-color: var(--bg-weaker)

\t&[data-appearance="elevated"]
\t\tbox-shadow: var(--shadow-md)

\t&[data-orientation="horizontal"]
\t\tflex-direction: row

\t\t.cui-card-media
\t\t\twidth: 35%
\t\t\tmin-width: 8rem

\t\t\timg, video
\t\t\t\theight: 100%
\t\t\t\tobject-fit: cover

\t\t.cui-card-content-wrap
\t\t\tflex: 1
\t\t\tdisplay: flex
\t\t\tflex-direction: column

.cui-card-media
\tposition: relative
\toverflow: hidden
\tbackground-color: var(--bg-weaker)

\timg, video
\t\tdisplay: block
\t\twidth: 100%
\t\theight: auto

.cui-card-content-wrap
\tdisplay: flex
\tflex-direction: column
\tflex: 1

.cui-card-header
\tdisplay: flex
\talign-items: center
\tjustify-content: space-between
\tgap: var(--space-3)
\tpadding: var(--space-4)
\tborder-bottom: 1px solid var(--stroke-weakest)

.cui-card-header-main
\tfont-size: var(--text-base)
\tfont-weight: 600
\tcolor: var(--text-primary)
\tflex: 1

.cui-card-header-actions
\tdisplay: flex
\talign-items: center
\tgap: var(--space-2)

.cui-card-body
\tpadding: var(--space-4)
\tcolor: var(--text-secondary)
\tfont-size: var(--text-sm)
\tline-height: 1.5
\tflex: 1

.cui-card-footer
\tdisplay: flex
\talign-items: center
\tjustify-content: space-between
\tgap: var(--space-3)
\tpadding: var(--space-3) var(--space-4)
\tborder-top: 1px solid var(--stroke-weakest)
\tbackground-color: var(--bg-weaker)

.cui-card-footer-main
\tfont-size: var(--text-xs)
\tcolor: var(--text-muted)

.cui-card-footer-actions
\tdisplay: flex
\talign-items: center
\tgap: var(--space-2)
`;

  return { svelteCode, sassCode };
}

// 4. TAG
export function generateTag(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
    appearance?: 'filled-outlined' | 'accent' | 'outlined';
    size?: 'sm' | 'md' | 'lg';
    pill?: boolean;
    withRemove?: boolean;
    onremove?: () => void;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'neutral',
    appearance = 'filled-outlined',
    size = 'md',
    pill = false,
    withRemove = false,
    onremove,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  function handleRemove(e: MouseEvent) {
    e.stopPropagation();
    onremove?.();
  }
</script>

<span
  class="cui-tag {className}"
  data-slot="tag-root"
  data-variant={variant}
  data-appearance={appearance}
  data-size={size}
  data-pill={pill ? '' : undefined}
  {...restProps}
>
  <span class="cui-tag-content" data-slot="content">
    {#if children}
      {@render children()}
    {:else}
      Tag
    {/if}
  </span>
  {#if withRemove}
    <button
      type="button"
      class="cui-tag-remove"
      data-slot="remove"
      aria-label="Remove tag"
      onclick={handleRemove}
    >
      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  {/if}
</span>
`;

  const sassCode = `.cui-tag
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
\tline-height: 1.2
\tvertical-align: middle
\ttransition: all var(--duration-fast) var(--ease-out)

\t&[data-pill]
\t\tborder-radius: var(--radius-full)

\t&[data-size="sm"]
\t\tpadding: 2px var(--space-1)
\t\tfont-size: var(--text-xs)

\t&[data-size="lg"]
\t\tpadding: var(--space-1) var(--space-3)
\t\tfont-size: var(--text-sm)

\t// Variants
\t&[data-variant="brand"]
\t\tcolor: var(--color-primary)
\t\tborder-color: var(--stroke-weaker)

\t&[data-variant="success"]
\t\tcolor: var(--status-success-fg)
\t\tborder-color: var(--status-success-border)

\t&[data-variant="warning"]
\t\tcolor: var(--status-warning-fg)
\t\tborder-color: var(--status-warning-border)

\t&[data-variant="danger"]
\t\tcolor: var(--status-danger-fg)
\t\tborder-color: var(--status-danger-border)

.cui-tag-content
\tdisplay: inline-flex
\talign-items: center

.cui-tag-remove
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\tbackground: transparent
\tborder: none
\tcolor: var(--text-muted)
\tcursor: pointer
\tpadding: 2px
\tmargin-left: 2px
\tborder-radius: var(--radius-full)
\ttransition: background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)

\t&:hover
\t\tcolor: var(--text-primary)
\t\tbackground-color: var(--state-hover)
`;

  return { svelteCode, sassCode };
}

// 5. ACCORDION
export function generateAccordion(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import { setContext, type Snippet } from 'svelte';

  interface Props {
    mode?: 'multiple' | 'single' | 'single-collapsible';
    appearance?: 'outlined' | 'separated' | 'plain';
    children: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    mode = 'multiple',
    appearance = 'outlined',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  let activeItems = $state<string[]>([]);

  function toggleItem(id: string) {
    if (mode === 'multiple') {
      if (activeItems.includes(id)) {
        activeItems = activeItems.filter(i => i !== id);
      } else {
        activeItems = [...activeItems, id];
      }
    } else if (mode === 'single-collapsible') {
      if (activeItems.includes(id)) {
        activeItems = [];
      } else {
        activeItems = [id];
      }
    } else {
      // single
      activeItems = [id];
    }
  }

  setContext('cui-accordion-ctx', {
    getMode: () => mode,
    getAppearance: () => appearance,
    isActive: (id: string) => activeItems.includes(id),
    toggle: toggleItem
  });
</script>

<div
  class="cui-accordion-root {className}"
  data-slot="accordion-root"
  data-appearance={appearance}
  data-mode={mode}
  {...restProps}
>
  {@render children()}
</div>
`;

  const itemCode = `<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  interface Props {
    value?: string;
    title?: string;
    open?: boolean;
    disabled?: boolean;
    header?: Snippet;
    children: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    value,
    title = '',
    open = $bindable(false),
    disabled = false,
    header,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const ctx = getContext<any>('cui-accordion-ctx');
  const uid = $props.id();
  const itemId = $derived(value || uid);

  const isOpen = $derived(ctx ? ctx.isActive(itemId) : open);

  function handleClick() {
    if (disabled) return;
    if (ctx) {
      ctx.toggle(itemId);
    } else {
      open = !open;
    }
  }
</script>

<div
  class="cui-accordion-item {className}"
  data-slot="accordion-item"
  data-open={isOpen ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  {...restProps}
>
  <button
    type="button"
    class="cui-accordion-trigger"
    data-slot="trigger"
    aria-expanded={isOpen}
    {disabled}
    onclick={handleClick}
  >
    <div class="cui-accordion-header-content" data-slot="header">
      {#if header}
        {@render header()}
      {:else}
        {title}
      {/if}
    </div>
    <span class="cui-accordion-chevron" data-slot="indicator" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>
  </button>

  {#if isOpen}
    <div class="cui-accordion-panel" data-slot="panel" role="region">
      {@render children()}
    </div>
  {/if}
</div>
`;

  const sassCode = `.cui-accordion-root
\tdisplay: flex
\tflex-direction: column
\twidth: 100%
\tfont-family: var(--font-sans)

\t&[data-appearance="outlined"]
\t\tborder: 1px solid var(--stroke-weakest)
\t\tborder-radius: var(--radius-md)
\t\toverflow: hidden

\t\t.cui-accordion-item + .cui-accordion-item
\t\t\tborder-top: 1px solid var(--stroke-weakest)

\t&[data-appearance="separated"]
\t\tgap: var(--space-2)

\t\t.cui-accordion-item
\t\t\tborder: 1px solid var(--stroke-weakest)
\t\t\tborder-radius: var(--radius-md)
\t\t\toverflow: hidden

.cui-accordion-item
\tdisplay: flex
\tflex-direction: column
\tbackground-color: var(--bg)

.cui-accordion-trigger
\twidth: 100%
\tdisplay: flex
\talign-items: center
\tjustify-content: space-between
\tpadding: var(--space-3) var(--space-4)
\tbackground-color: var(--bg)
\tborder: none
\tcolor: var(--text-primary)
\tfont-size: var(--text-sm)
\tfont-weight: 500
\tcursor: pointer
\ttext-align: left
\ttransition: background-color var(--duration-fast) var(--ease-out)

\t&:hover:not([disabled])
\t\tbackground-color: var(--state-hover)

\t&:disabled
\t\topacity: 0.5
\t\tcursor: not-allowed

.cui-accordion-header-content
\tflex: 1
\tfont-weight: 500

.cui-accordion-chevron
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\tcolor: var(--text-muted)
\ttransition: transform var(--duration-fast) var(--ease-out)

\t.cui-accordion-item[data-open] &
\t\ttransform: rotate(180deg)

.cui-accordion-panel
\tpadding: var(--space-4)
\tbackground-color: var(--bg-weaker)
\tcolor: var(--text-secondary)
\tfont-size: var(--text-sm)
\tline-height: 1.5
\tborder-top: 1px solid var(--stroke-weakest)
`;

  return { svelteCode, sassCode, subComponents: { AccordionItem: itemCode } };
}

// 6. TAB
export function generateTab(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import { setContext, type Snippet } from 'svelte';

  interface Props {
    active?: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    children: Snippet;
    class?: string;
    onchange?: (active: string) => void;
    [key: string]: any;
  }

  let {
    active = $bindable(''),
    placement = 'top',
    children,
    class: className = '',
    onchange,
    ...restProps
  }: Props = $props();

  function selectTab(val: string) {
    active = val;
    onchange?.(val);
  }

  setContext('cui-tab-ctx', {
    getActive: () => active,
    select: selectTab,
    getPlacement: () => placement
  });
</script>

<div
  class="cui-tab-group {className}"
  data-slot="tab-group"
  data-placement={placement}
  {...restProps}
>
  {@render children()}
</div>
`;

  const tabItemCode = `<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  interface Props {
    value: string;
    disabled?: boolean;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    value,
    disabled = false,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const ctx = getContext<any>('cui-tab-ctx');
  const isActive = $derived(ctx ? ctx.getActive() === value : false);

  function handleClick() {
    if (disabled) return;
    ctx?.select(value);
  }
</script>

<button
  type="button"
  role="tab"
  class="cui-tab-item {className}"
  data-slot="tab"
  data-active={isActive ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  aria-selected={isActive}
  {disabled}
  onclick={handleClick}
  {...restProps}
>
  {@render children?.()}
</button>
`;

  const tabPanelCode = `<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  interface Props {
    value: string;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    value,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const ctx = getContext<any>('cui-tab-ctx');
  const isActive = $derived(ctx ? ctx.getActive() === value : true);
</script>

{#if isActive}
  <div
    role="tabpanel"
    class="cui-tab-panel {className}"
    data-slot="tab-panel"
    {...restProps}
  >
    {@render children?.()}
  </div>
{/if}
`;

  const sassCode = `.cui-tab-group
\tdisplay: flex
\tflex-direction: column
\twidth: 100%
\tfont-family: var(--font-sans)

.cui-tab-nav
\tdisplay: flex
\talign-items: center
\tgap: var(--space-1)
\tborder-bottom: 1px solid var(--stroke-weakest)
\tposition: relative

.cui-tab-item
\tdisplay: inline-flex
\talign-items: center
\tgap: var(--space-2)
\tpadding: var(--space-2) var(--space-4)
\tbackground: transparent
\tborder: none
\tborder-bottom: 2px solid transparent
\tcolor: var(--text-secondary)
\tfont-size: var(--text-sm)
\tfont-weight: 500
\tcursor: pointer
\ttransition: all var(--duration-fast) var(--ease-out)
\tmargin-bottom: -1px

\t&:hover:not([disabled])
\t\tcolor: var(--text-primary)
\t\tbackground-color: var(--state-hover)

\t&[data-active]
\t\tcolor: var(--text-primary)
\t\tborder-bottom-color: var(--color-primary)
\t\tfont-weight: 600

\t&:disabled
\t\topacity: 0.5
\t\tcursor: not-allowed

.cui-tab-panel
\tpadding: var(--space-4) 0
\tcolor: var(--text-secondary)
\tfont-size: var(--text-sm)
\tline-height: 1.5
`;

  return {
    svelteCode,
    sassCode,
    subComponents: {
      Tab: tabItemCode,
      TabPanel: tabPanelCode
    }
  };
}

// 7. TOAST
export function generateToast(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    placement?: 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start' | 'top-center' | 'bottom-center';
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    placement = 'bottom-end',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<div
  class="cui-toast-region {className}"
  data-slot="toast-region"
  data-placement={placement}
  role="region"
  aria-label="Notifications"
  {...restProps}
>
  {@render children?.()}
</div>
`;

  const itemCode = `<script lang="ts">
  import { onMount, type Snippet } from 'svelte';

  interface Props {
    variant?: 'brand' | 'neutral' | 'success' | 'warning' | 'danger';
    open?: boolean;
    duration?: number;
    title?: string;
    onclose?: () => void;
    icon?: Snippet;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'neutral',
    open = $bindable(true),
    duration = 4000,
    title,
    onclose,
    icon,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  let timer: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    if (duration > 0) {
      timer = setTimeout(() => {
        close();
      }, duration);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  });

  function close() {
    open = false;
    onclose?.();
  }
</script>

{#if open}
  <div
    class="cui-toast-item {className}"
    data-slot="toast-item"
    data-variant={variant}
    role="status"
    {...restProps}
  >
    <div class="cui-toast-icon" data-slot="icon">
      {#if icon}
        {@render icon()}
      {:else if variant === 'success'}
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      {:else if variant === 'danger'}
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      {:else if variant === 'warning'}
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      {/if}
    </div>

    <div class="cui-toast-body" data-slot="body">
      {#if title}
        <div class="cui-toast-title" data-slot="title">{title}</div>
      {/if}
      <div class="cui-toast-message" data-slot="message">
        {@render children?.()}
      </div>
    </div>

    <button
      type="button"
      class="cui-toast-close"
      data-slot="close"
      onclick={close}
      aria-label="Dismiss notification"
    >
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
{/if}
`;

  const sassCode = `.cui-toast-region
\tposition: fixed
\tz-index: 1000
\tdisplay: flex
\tflex-direction: column
\tgap: var(--space-2)
\tpointer-events: none
\tpadding: var(--space-4)

\t&[data-placement="bottom-end"]
\t\tbottom: 0
\t\tright: 0

\t&[data-placement="bottom-start"]
\t\tbottom: 0
\t\tleft: 0

\t&[data-placement="top-end"]
\t\ttop: 0
\t\tright: 0

\t&[data-placement="top-start"]
\t\ttop: 0
\t\tleft: 0

.cui-toast-item
\tpointer-events: auto
\tmin-width: 18rem
\tmax-width: 26rem
\tdisplay: flex
\talign-items: flex-start
\tgap: var(--space-3)
\tpadding: var(--space-3) var(--space-4)
\tbackground-color: var(--bg)
\tborder: 1px solid var(--stroke-weakest)
\tborder-left: 2px solid var(--stroke-weaker)
\tborder-radius: var(--radius-md)
\tbox-shadow: var(--shadow-lg)
\tcolor: var(--text-primary)
\tfont-family: var(--font-sans)
\ttransition: all var(--duration-fast) var(--ease-out)

\t&[data-variant="brand"]
\t\tborder-left-color: var(--color-primary)
\t\t.cui-toast-icon
\t\t\tcolor: var(--color-primary)

\t&[data-variant="success"]
\t\tborder-left-color: var(--status-success-fg)
\t\t.cui-toast-icon
\t\t\tcolor: var(--status-success-fg)

\t&[data-variant="warning"]
\t\tborder-left-color: var(--status-warning-fg)
\t\t.cui-toast-icon
\t\t\tcolor: var(--status-warning-fg)

\t&[data-variant="danger"]
\t\tborder-left-color: var(--status-danger-fg)
\t\t.cui-toast-icon
\t\t\tcolor: var(--status-danger-fg)

.cui-toast-icon
\tflex-shrink: 0
\tmargin-top: 2px
\tdisplay: flex
\talign-items: center
\tjustify-content: center
\tcolor: var(--text-secondary)

.cui-toast-body
\tflex: 1
\tmin-width: 0
\tdisplay: flex
\tflex-direction: column
\tgap: 2px

.cui-toast-title
\tfont-weight: 600
\tfont-size: var(--text-sm)
\tcolor: var(--text-primary)

.cui-toast-message
\tfont-size: var(--text-xs)
\tcolor: var(--text-secondary)
\tline-height: 1.4

.cui-toast-close
\tflex-shrink: 0
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\tbackground: transparent
\tborder: none
\tcolor: var(--text-muted)
\tcursor: pointer
\tpadding: var(--space-1)
\tborder-radius: var(--radius-sm)
\ttransition: background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)

\t&:hover
\t\tcolor: var(--text-primary)
\t\tbackground-color: var(--state-hover)
`;

  return { svelteCode, sassCode, subComponents: { ToastItem: itemCode } };
}

// 8. TREE
export function generateTree(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import { setContext, type Snippet } from 'svelte';

  interface Props {
    selection?: 'single' | 'multiple';
    selected?: string[];
    children?: Snippet;
    class?: string;
    onselect?: (selected: string[]) => void;
    [key: string]: any;
  }

  let {
    selection = 'single',
    selected = $bindable([]),
    children,
    class: className = '',
    onselect,
    ...restProps
  }: Props = $props();

  function selectNode(id: string) {
    if (selection === 'single') {
      selected = [id];
    } else {
      if (selected.includes(id)) {
        selected = selected.filter(i => i !== id);
      } else {
        selected = [...selected, id];
      }
    }
    onselect?.(selected);
  }

  setContext('cui-tree-ctx', {
    getSelection: () => selection,
    isSelected: (id: string) => selected.includes(id),
    select: selectNode
  });
</script>

<div
  class="cui-tree-root {className}"
  data-slot="tree-root"
  role="tree"
  {...restProps}
>
  {@render children?.()}
</div>
`;

  const itemCode = `<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  interface Props {
    value: string;
    label?: string;
    expanded?: boolean;
    disabled?: boolean;
    icon?: Snippet;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    value,
    label = '',
    expanded = $bindable(false),
    disabled = false,
    icon,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const ctx = getContext<any>('cui-tree-ctx');
  const isSelected = $derived(ctx ? ctx.isSelected(value) : false);
  const hasChildren = $derived(Boolean(children));

  function handleRowClick() {
    if (disabled) return;
    ctx?.select(value);
    if (hasChildren) {
      expanded = !expanded;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick();
    }
  }

  function handleToggle(e: MouseEvent) {
    e.stopPropagation();
    expanded = !expanded;
  }
</script>

<div
  class="cui-tree-item {className}"
  data-slot="tree-item"
  role="treeitem"
  aria-expanded={hasChildren ? expanded : undefined}
  aria-selected={isSelected}
  {...restProps}
>
  <div
    class="cui-tree-row"
    data-selected={isSelected ? '' : undefined}
    data-disabled={disabled ? '' : undefined}
    onclick={handleRowClick}
    onkeydown={handleKeyDown}
    role="button"
    tabindex="0"
  >
    {#if hasChildren}
      <button
        type="button"
        class="cui-tree-toggle"
        data-slot="trigger"
        data-expanded={expanded ? '' : undefined}
        onclick={handleToggle}
        aria-label="Toggle branch"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    {:else}
      <span class="cui-tree-spacer"></span>
    {/if}

    {#if icon}
      <span class="cui-tree-icon" data-slot="icon">
        {@render icon()}
      </span>
    {/if}

    <span class="cui-tree-label" data-slot="label">
      {#if label}
        {label}
      {:else}
        {value}
      {/if}
    </span>
  </div>

  {#if hasChildren && expanded}
    <div class="cui-tree-branch" data-slot="children" role="group">
      {@render children?.()}
    </div>
  {/if}
</div>
`;

  const sassCode = `.cui-tree-root
\tdisplay: flex
\tflex-direction: column
\tgap: 2px
\tfont-family: var(--font-sans)
\tfont-size: var(--text-sm)

.cui-tree-item
\tdisplay: flex
\tflex-direction: column

.cui-tree-row
\tdisplay: flex
\talign-items: center
\tgap: var(--space-2)
\tpadding: var(--space-1) var(--space-2)
\tborder-radius: var(--radius-sm)
\tcursor: pointer
\tcolor: var(--text-primary)
\ttransition: background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)

\t&:hover:not([data-disabled])
\t\tbackground-color: var(--state-hover)

\t&[data-selected]
\t\tbackground-color: var(--bg-weaker)
\t\tcolor: var(--color-primary)
\t\tfont-weight: 500

\t&[data-disabled]
\t\topacity: 0.5
\t\tcursor: not-allowed

.cui-tree-toggle
\twidth: var(--space-4)
\theight: var(--space-4)
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\tbackground: transparent
\tborder: none
\tcolor: var(--text-muted)
\tcursor: pointer
\tpadding: 0
\ttransition: transform var(--duration-fast) var(--ease-out)

\t&[data-expanded]
\t\ttransform: rotate(90deg)

.cui-tree-spacer
\twidth: var(--space-4)
\theight: var(--space-4)
\tflex-shrink: 0

.cui-tree-icon
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\tcolor: var(--text-secondary)

.cui-tree-label
\tflex: 1
\tuser-select: none

.cui-tree-branch
\tmargin-left: var(--space-4)
\tpadding-left: var(--space-2)
\tborder-left: 1px solid var(--stroke-weakest)
\tdisplay: flex
\tflex-direction: column
\tgap: 2px
`;

  return { svelteCode, sassCode, subComponents: { TreeItem: itemCode } };
}

export const WAVE2_GENERATORS = {
  badge: generateBadge,
  callout: generateCallout,
  card: generateCard,
  tag: generateTag,
  accordion: generateAccordion,
  tab: generateTab,
  toast: generateToast,
  tree: generateTree
};
