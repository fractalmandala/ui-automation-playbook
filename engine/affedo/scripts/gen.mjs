import fs from "node:fs";
import path from "node:path";
import { WAVE2_GENERATORS } from "./generators/wave2.mjs";
import { WAVE3_GENERATORS } from "./generators/wave3.mjs";
import { WAVE4_GENERATORS } from "./generators/wave4.mjs";

const COMPONENT_GENERATORS = {
  button: generateButton,
  popup: generatePopup,
  drawer: generateDrawer,
  dropdown: generateDropdown,
  dialog: generateDialog,
  switch: generateSwitch,
  input: generateInput,
  textarea: generateTextarea,
  checkbox: generateCheckbox,
  checkboxgroup: generateCheckboxGroup,
  radio: generateRadio,
  radiogroup: generateRadioGroup,
  slider: generateSlider,
  ...WAVE2_GENERATORS,
  ...WAVE3_GENERATORS,
  ...WAVE4_GENERATORS
};

// ==========================================
// 1. BUTTON
// ==========================================
function generateButton(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    children?: Snippet;
    start?: Snippet;
    end?: Snippet;
    onclick?: (e: MouseEvent) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    type = 'button',
    children,
    start,
    end,
    onclick,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<button
  {type}
  {disabled}
  data-slot="button-root"
  data-variant={variant}
  data-size={size}
  data-loading={loading ? '' : undefined}
  class="cui-button {className}"
  {onclick}
  {...restProps}
>
  {#if loading}
    <span class="cui-button-spinner" data-slot="spinner" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="cui-spin-icon">
        <circle cx="12" cy="12" r="9" stroke-opacity="0.25" />
        <path d="M12 3a9 9 0 0 1 9 9" stroke-linecap="round" />
      </svg>
    </span>
  {/if}
  {#if start}
    <span class="cui-button-start" data-slot="start">
      {@render start()}
    </span>
  {/if}
  <span class="cui-button-label" data-slot="label">
    {#if children}
      {@render children()}
    {:else}
      Button
    {/if}
  </span>
  {#if end}
    <span class="cui-button-end" data-slot="end">
      {@render end()}
    </span>
  {/if}
</button>
`;

  const sassCode = `.cui-button
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\tgap: var(--space-2)
\tfont-family: var(--font-sans)
\tfont-weight: 500
\tline-height: 1
\tborder-radius: var(--radius-md)
\tcursor: pointer
\tuser-select: none
\twhite-space: nowrap
\ttext-decoration: none
\ttransition: background-color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out)

\t&:focus-visible
\t\toutline: 2px solid var(--state-focus)
\t\toutline-offset: 2px

\t&:active:not(:disabled)
\t\ttransform: scale(0.98)

\t&:disabled
\t\topacity: var(--state-disabled)
\t\tcursor: not-allowed
\t\tpointer-events: none

\t// --- Size Axes ---
\t&[data-size="sm"]
\t\tpadding: var(--space-1) var(--space-3)
\t\tfont-size: var(--text-xs)
\t\theight: 1.75rem

\t&[data-size="md"]
\t\tpadding: var(--space-2) var(--space-4)
\t\tfont-size: var(--text-sm)
\t\theight: 2.25rem

\t&[data-size="lg"]
\t\tpadding: var(--space-3) var(--space-5)
\t\tfont-size: var(--text-base)
\t\theight: 2.75rem

\t// --- Variant Axes ---
\t&[data-variant="primary"]
\t\tbackground-color: var(--color-primary)
\t\tcolor: var(--color-primary-fg)
\t\tborder: 1px solid transparent
\t\tbox-shadow: var(--shadow-xs)

\t\t&:hover:not(:disabled)
\t\t\tbackground-color: var(--color-primary-hover)

\t\t&:active:not(:disabled)
\t\t\tbackground-color: var(--color-primary-active)

\t&[data-variant="secondary"]
\t\tbackground-color: var(--bg-base)
\t\tcolor: var(--text-primary)
\t\tborder: 1px solid var(--stroke-weaker)

\t\t&:hover:not(:disabled)
\t\t\tbackground-color: var(--bg-stronger)
\t\t\tborder-color: var(--stroke-base)

\t&[data-variant="ghost"]
\t\tbackground-color: transparent
\t\tcolor: var(--text-secondary)
\t\tborder: 1px solid transparent

\t\t&:hover:not(:disabled)
\t\t\tbackground-color: var(--state-hover)
\t\t\tcolor: var(--text-primary)

\t&[data-variant="danger"]
\t\tbackground-color: var(--status-danger-bg)
\t\tcolor: var(--status-danger-fg)
\t\tborder: 1px solid var(--status-danger-border)

\t\t&:hover:not(:disabled)
\t\t\tbackground-color: var(--status-danger-border)
\t\t\tcolor: var(--text-inverse)

.cui-button-spinner
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center

.cui-spin-icon
\twidth: 1rem
\theight: 1rem
\tanimation: cui-spin 0.8s linear infinite

@keyframes cui-spin
\tfrom
\t\ttransform: rotate(0deg)
\tto
\t\ttransform: rotate(360deg)

.cui-button-start, .cui-button-end
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center

.cui-button-label
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
`;

  return { svelteCode, sassCode };
}

// ==========================================
// 2. POPUP
// ==========================================
function generatePopup(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open?: boolean;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    trigger?: Snippet;
    content?: Snippet;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    open = $bindable(false),
    placement = 'bottom',
    trigger,
    content,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  function toggle() {
    open = !open;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      open = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  data-slot="popup-root"
  data-placement={placement}
  data-state={open ? 'open' : 'closed'}
  class="cui-popup-container {className}"
  {...restProps}
>
  <div
    class="cui-popup-anchor"
    data-slot="anchor"
    onclick={toggle}
    role="button"
    tabindex="0"
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
  >
    {#if trigger}
      {@render trigger()}
    {:else if children}
      {@render children()}
    {:else}
      <button type="button" class="cui-button" data-variant="secondary" data-size="sm">Toggle Popup</button>
    {/if}
  </div>

  {#if open}
    <div class="cui-popup-floating" data-slot="popup" role="tooltip">
      {#if content}
        {@render content()}
      {:else}
        <div class="cui-popup-default-content">Popup Content</div>
      {/if}
      <div class="cui-popup-arrow" data-slot="arrow"></div>
    </div>
  {/if}
</div>
`;

  const sassCode = `.cui-popup-container
\tposition: relative
\tdisplay: inline-block

.cui-popup-anchor
\tdisplay: inline-flex
\tcursor: pointer

.cui-popup-floating
\tposition: absolute
\tz-index: 100
\tbackground-color: var(--bg)
\tcolor: var(--text-primary)
\tborder: 1px solid var(--stroke-weakest)
\tborder-radius: var(--radius-md)
\tbox-shadow: var(--shadow-lg)
\tpadding: var(--space-3)
\tfont-family: var(--font-sans)
\tfont-size: var(--text-sm)
\twhite-space: normal
\tanimation: cui-pop-in var(--duration-fast) var(--ease-out)

\t// Placement logic
\t.cui-popup-container[data-placement="bottom"] &
\t\ttop: calc(100% + var(--space-2))
\t\tleft: 50%
\t\ttransform: translateX(-50%)

\t.cui-popup-container[data-placement="top"] &
\t\tbottom: calc(100% + var(--space-2))
\t\tleft: 50%
\t\ttransform: translateX(-50%)

\t.cui-popup-container[data-placement="left"] &
\t\tright: calc(100% + var(--space-2))
\t\ttop: 50%
\t\ttransform: translateY(-50%)

\t.cui-popup-container[data-placement="right"] &
\t\tleft: calc(100% + var(--space-2))
\t\ttop: 50%
\t\ttransform: translateY(-50%)

.cui-popup-arrow
\tposition: absolute
\twidth: var(--space-2)
\theight: var(--space-2)
\tbackground-color: var(--bg)
\tborder: 1px solid var(--stroke-weakest)
\ttransform: rotate(45deg)

\t.cui-popup-container[data-placement="bottom"] &
\t\ttop: calc(-1 * var(--space-1) - 1px)
\t\tleft: calc(50% - var(--space-1))
\t\tborder-bottom: none
\t\tborder-right: none

\t.cui-popup-container[data-placement="top"] &
\t\tbottom: calc(-1 * var(--space-1) - 1px)
\t\tleft: calc(50% - var(--space-1))
\t\tborder-top: none
\t\tborder-left: none

\t.cui-popup-container[data-placement="left"] &
\t\tright: calc(-1 * var(--space-1) - 1px)
\t\ttop: calc(50% - var(--space-1))
\t\tborder-left: none
\t\tborder-bottom: none

\t.cui-popup-container[data-placement="right"] &
\t\tleft: calc(-1 * var(--space-1) - 1px)
\t\ttop: calc(50% - var(--space-1))
\t\tborder-right: none
\t\tborder-top: none

@keyframes cui-pop-in
\tfrom
\t\topacity: 0
\t\ttransform: translateY(var(--space-1)) scale(0.96)
\tto
\t\topacity: 1
\t\ttransform: translateY(0) scale(1)
`;

  return { svelteCode, sassCode };
}

// ==========================================
// 3. DRAWER
// ==========================================
function generateDrawer(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open?: boolean;
    placement?: 'left' | 'right' | 'top' | 'bottom';
    title?: string;
    children?: Snippet;
    header?: Snippet;
    footer?: Snippet;
    onclose?: () => void;
    class?: string;
    [key: string]: any;
  }

  let {
    open = $bindable(false),
    placement = 'right',
    title = 'Drawer',
    children,
    header,
    footer,
    onclose,
    class: className = '',
    ...restProps
  }: Props = $props();

  function close() {
    open = false;
    onclose?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      close();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="cui-drawer-root"
    data-slot="drawer-root"
    data-placement={placement}
    data-state={open ? 'open' : 'closed'}
    {...restProps}
  >
    <div
      class="cui-drawer-overlay"
      data-slot="overlay"
      onclick={close}
      role="presentation"
    ></div>

    <div class="cui-drawer-panel {className}" data-slot="panel" role="dialog" aria-modal="true">
      <header class="cui-drawer-header" data-slot="header">
        {#if header}
          {@render header()}
        {:else}
          <h3 class="cui-drawer-title" data-slot="title">{title}</h3>
        {/if}
        <button
          type="button"
          class="cui-drawer-close"
          data-slot="closeButton"
          onclick={close}
          aria-label="Close drawer"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </header>

      <div class="cui-drawer-body" data-slot="body">
        {#if children}
          {@render children()}
        {:else}
          <p class="cui-drawer-placeholder">Drawer Content</p>
        {/if}
      </div>

      {#if footer}
        <footer class="cui-drawer-footer" data-slot="footer">
          {@render footer()}
        </footer>
      {/if}
    </div>
  </div>
{/if}
`;

  const sassCode = `.cui-drawer-root
\tposition: fixed
\tinset: 0
\tz-index: 1000
\tdisplay: flex

.cui-drawer-overlay
\tposition: fixed
\tinset: 0
\tbackground-color: var(--overlay-dimmer)
\tbackdrop-filter: blur(var(--blur-xs))
\tanimation: cui-fade-in var(--duration-fast) var(--ease-out)

.cui-drawer-panel
\tposition: relative
\tz-index: 1001
\tdisplay: flex
\tflex-direction: column
\tbackground-color: var(--bg)
\tcolor: var(--text-primary)
\tbox-shadow: var(--shadow-xl)
\tfont-family: var(--font-sans)
\ttransition: transform var(--duration-normal) var(--ease-spring)

\t// Placement styles
\t.cui-drawer-root[data-placement="right"] &
\t\tmargin-left: auto
\t\twidth: 24rem
\t\tmax-width: 90vw
\t\theight: 100%
\t\tborder-left: 1px solid var(--stroke-weakest)
\t\tanimation: cui-slide-left var(--duration-normal) var(--ease-out)

\t.cui-drawer-root[data-placement="left"] &
\t\tmargin-right: auto
\t\twidth: 24rem
\t\tmax-width: 90vw
\t\theight: 100%
\t\tborder-right: 1px solid var(--stroke-weakest)
\t\tanimation: cui-slide-right var(--duration-normal) var(--ease-out)

\t.cui-drawer-root[data-placement="bottom"] &
\t\tmargin-top: auto
\t\twidth: 100%
\t\theight: auto
\t\tmax-height: min(85vh, 36rem)
\t\tborder-top: 1px solid var(--stroke-weakest)
\t\tanimation: cui-slide-up var(--duration-normal) var(--ease-out)

\t.cui-drawer-root[data-placement="top"] &
\t\tmargin-bottom: auto
\t\twidth: 100%
\t\theight: auto
\t\tmax-height: min(85vh, 36rem)
\t\tborder-bottom: 1px solid var(--stroke-weakest)
\t\tanimation: cui-slide-down var(--duration-normal) var(--ease-out)

.cui-drawer-header
\tflex-shrink: 0
\tdisplay: flex
\talign-items: center
\tjustify-content: space-between
\tpadding: var(--space-4) var(--space-5)
\tborder-bottom: 1px solid var(--stroke-weakest)

.cui-drawer-title
\tmargin: 0
\tfont-size: var(--text-lg)
\tfont-weight: 600
\tcolor: var(--text-primary)

.cui-drawer-close
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\twidth: 2rem
\theight: 2rem
\tborder: none
\tborder-radius: var(--radius-sm)
\tbackground-color: transparent
\tcolor: var(--text-secondary)
\tcursor: pointer
\ttransition: background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)

\t&:hover
\t\tbackground-color: var(--state-hover)
\t\tcolor: var(--text-primary)

.cui-drawer-body
\tflex: 1 1 auto
\tmin-height: 0
\tpadding: var(--space-5)
\toverflow-y: auto
\tcolor: var(--text-secondary)
\tfont-size: var(--text-sm)

.cui-drawer-footer
\tflex-shrink: 0
\tdisplay: flex
\talign-items: center
\tjustify-content: flex-end
\tgap: var(--space-3)
\tpadding: var(--space-4) var(--space-5)
\tborder-top: 1px solid var(--stroke-weakest)

@keyframes cui-fade-in
\tfrom
\t\topacity: 0
\tto
\t\topacity: 1

@keyframes cui-slide-left
\tfrom
\t\ttransform: translateX(100%)
\tto
\t\ttransform: translateX(0)

@keyframes cui-slide-right
\tfrom
\t\ttransform: translateX(-100%)
\tto
\t\ttransform: translateX(0)

@keyframes cui-slide-up
\tfrom
\t\ttransform: translateY(100%)
\tto
\t\ttransform: translateY(0)

@keyframes cui-slide-down
\tfrom
\t\ttransform: translateY(-100%)
\tto
\t\ttransform: translateY(0)
`;

  return { svelteCode, sassCode };
}

// ==========================================
// 4. DROPDOWN
// ==========================================
function generateDropdown(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  export interface DropdownItem {
    id: string;
    label: string;
    disabled?: boolean;
    danger?: boolean;
    divider?: boolean;
  }

  interface Props {
    open?: boolean;
    items?: DropdownItem[];
    trigger?: Snippet;
    children?: Snippet;
    onselect?: (item: DropdownItem) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    open = $bindable(false),
    items = [
      { id: '1', label: 'Account Profile' },
      { id: '2', label: 'Settings' },
      { id: 'div-1', label: '', divider: true },
      { id: '3', label: 'Sign Out', danger: true }
    ],
    trigger,
    children,
    onselect,
    class: className = '',
    ...restProps
  }: Props = $props();

  function toggle() {
    open = !open;
  }

  function handleSelect(item: DropdownItem) {
    if (item.disabled || item.divider) return;
    onselect?.(item);
    open = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      open = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="cui-dropdown-root {className}"
  data-slot="dropdown-root"
  data-state={open ? 'open' : 'closed'}
  {...restProps}
>
  <div
    class="cui-dropdown-trigger"
    data-slot="trigger"
    onclick={toggle}
    role="button"
    tabindex="0"
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
  >
    {#if trigger}
      {@render trigger()}
    {:else}
      <button type="button" class="cui-button" data-variant="secondary" data-size="md">
        <span>Options</span>
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="margin-left: var(--space-1)">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
    {/if}
  </div>

  {#if open}
    <div class="cui-dropdown-panel" data-slot="panel" role="menu">
      {#if children}
        {@render children()}
      {:else if items && items.length > 0}
        {#each items as item (item.id)}
          {#if item.divider}
            <div class="cui-dropdown-divider" data-slot="divider" role="separator"></div>
          {:else}
            <button
              type="button"
              class="cui-dropdown-item"
              data-slot="item"
              data-danger={item.danger ? '' : undefined}
              disabled={item.disabled}
              onclick={() => handleSelect(item)}
              role="menuitem"
            >
              <span>{item.label}</span>
            </button>
          {/if}
        {/each}
      {/if}
    </div>
  {/if}
</div>
`;

  const sassCode = `.cui-dropdown-root
\tposition: relative
\tdisplay: inline-block

.cui-dropdown-trigger
\tdisplay: inline-flex
\tcursor: pointer

.cui-dropdown-panel
\tposition: absolute
\ttop: calc(100% + var(--space-1))
\tleft: 0
\tz-index: 200
\tmin-width: 12rem
\tbackground-color: var(--bg)
\tborder: 1px solid var(--stroke-weakest)
\tborder-radius: var(--radius-md)
\tbox-shadow: var(--shadow-lg)
\tpadding: var(--space-1)
\tdisplay: flex
\tflex-direction: column
\tgap: 2px
\tanimation: cui-dropdown-in var(--duration-fast) var(--ease-out)

.cui-dropdown-item
\tdisplay: flex
\talign-items: center
\tjustify-content: space-between
\twidth: 100%
\tpadding: var(--space-2) var(--space-3)
\tborder: none
\tborder-radius: var(--radius-sm)
\tbackground-color: transparent
\tcolor: var(--text-primary)
\tfont-family: var(--font-sans)
\tfont-size: var(--text-sm)
\ttext-align: left
\tcursor: pointer
\ttransition: background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)

\t&:hover:not(:disabled)
\t\tbackground-color: var(--state-hover)

\t&[data-danger]
\t\tcolor: var(--status-danger-fg)

\t\t&:hover:not(:disabled)
\t\t\tbackground-color: var(--status-danger-bg)

\t&:disabled
\t\topacity: var(--state-disabled)
\t\tcursor: not-allowed

.cui-dropdown-divider
\theight: 1px
\tbackground-color: var(--stroke-weakest)
\tmargin: var(--space-1) 0

@keyframes cui-dropdown-in
\tfrom
\t\topacity: 0
\t\ttransform: translateY(calc(-1 * var(--space-1))) scale(0.97)
\tto
\t\topacity: 1
\t\ttransform: translateY(0) scale(1)
`;

  return { svelteCode, sassCode };
}

// ==========================================
// 5. DIALOG
// ==========================================
function generateDialog(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open?: boolean;
    size?: 'sm' | 'md' | 'lg';
    title?: string;
    children?: Snippet;
    header?: Snippet;
    footer?: Snippet;
    onclose?: () => void;
    class?: string;
    [key: string]: any;
  }

  let {
    open = $bindable(false),
    size = 'md',
    title = 'Dialog Title',
    children,
    header,
    footer,
    onclose,
    class: className = '',
    ...restProps
  }: Props = $props();

  function close() {
    open = false;
    onclose?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      close();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="cui-dialog-root"
    data-slot="dialog-root"
    data-size={size}
    data-state={open ? 'open' : 'closed'}
    {...restProps}
  >
    <div
      class="cui-dialog-overlay"
      data-slot="overlay"
      onclick={close}
      role="presentation"
    ></div>

    <div class="cui-dialog-panel {className}" data-slot="panel" role="dialog" aria-modal="true">
      <header class="cui-dialog-header" data-slot="header">
        {#if header}
          {@render header()}
        {:else}
          <h2 class="cui-dialog-title" data-slot="title">{title}</h2>
        {/if}
        <button
          type="button"
          class="cui-dialog-close"
          data-slot="closeButton"
          onclick={close}
          aria-label="Close dialog"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </header>

      <div class="cui-dialog-body" data-slot="body">
        {#if children}
          {@render children()}
        {:else}
          <p class="cui-dialog-placeholder">This is the dialog body content.</p>
        {/if}
      </div>

      {#if footer}
        <footer class="cui-dialog-footer" data-slot="footer">
          {@render footer()}
        </footer>
      {/if}
    </div>
  </div>
{/if}
`;

  const sassCode = `.cui-dialog-root
\tposition: fixed
\tinset: 0
\tz-index: 1000
\tdisplay: flex
\talign-items: center
\tjustify-content: center
\tpadding: var(--space-4)

.cui-dialog-overlay
\tposition: fixed
\tinset: 0
\tbackground-color: var(--overlay-dimmer)
\tbackdrop-filter: blur(var(--blur-sm))
\tanimation: cui-dialog-fade var(--duration-fast) var(--ease-out)

.cui-dialog-panel
\tposition: relative
\tz-index: 1001
\twidth: 100%
\tbackground-color: var(--bg)
\tcolor: var(--text-primary)
\tborder: 1px solid var(--stroke-weakest)
\tborder-radius: var(--radius-lg)
\tbox-shadow: var(--shadow-xl)
\tpadding: var(--space-6)
\tfont-family: var(--font-sans)
\tanimation: cui-dialog-scale var(--duration-normal) var(--ease-spring)

\t// Size axes
\t.cui-dialog-root[data-size="sm"] &
\t\tmax-width: 24rem
\t\tpadding: var(--space-4)

\t.cui-dialog-root[data-size="md"] &
\t\tmax-width: 32rem
\t\tpadding: var(--space-6)

\t.cui-dialog-root[data-size="lg"] &
\t\tmax-width: 42rem
\t\tpadding: var(--space-8)

.cui-dialog-header
\tflex-shrink: 0
\tdisplay: flex
\talign-items: center
\tjustify-content: space-between
\tmargin-bottom: var(--space-4)

.cui-dialog-title
\tmargin: 0
\tfont-size: var(--text-lg)
\tfont-weight: 600
\tcolor: var(--text-primary)

.cui-dialog-close
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\twidth: 2rem
\theight: 2rem
\tborder: none
\tborder-radius: var(--radius-sm)
\tbackground-color: transparent
\tcolor: var(--text-secondary)
\tcursor: pointer
\ttransition: background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)

\t&:hover
\t\tbackground-color: var(--state-hover)
\t\tcolor: var(--text-primary)

.cui-dialog-body
\tflex: 1 1 auto
\tmin-height: 0
\tcolor: var(--text-secondary)
\tfont-size: var(--text-sm)
\tline-height: 1.5
\tmargin-bottom: var(--space-6)

.cui-dialog-footer
\tflex-shrink: 0
\tdisplay: flex
\talign-items: center
\tjustify-content: flex-end
\tgap: var(--space-3)

@keyframes cui-dialog-fade
\tfrom
\t\topacity: 0
\tto
\t\topacity: 1

@keyframes cui-dialog-scale
\tfrom
\t\topacity: 0
\t\ttransform: scale(0.95) translateY(var(--space-2))
\tto
\t\topacity: 1
\t\ttransform: scale(1) translateY(0)
`;

  return { svelteCode, sassCode };
}

// ==========================================
// 6. SWITCH
// ==========================================
function generateSwitch(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    checked?: boolean;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    required?: boolean;
    name?: string;
    label?: string;
    hint?: string;
    children?: Snippet;
    onchange?: (checked: boolean) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    checked = $bindable(false),
    size = 'md',
    disabled = false,
    required = false,
    name,
    label = '',
    hint = '',
    children,
    onchange,
    class: className = '',
    ...restProps
  }: Props = $props();

  function toggle() {
    if (disabled) return;
    checked = !checked;
    onchange?.(checked);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  }
</script>

<label
  class="cui-switch-root {className}"
  data-slot="switch-root"
  data-size={size}
  data-checked={checked ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  {...restProps}
>
  <span
    class="cui-switch-track"
    data-slot="track"
    role="switch"
    aria-checked={checked}
    aria-required={required}
    aria-disabled={disabled}
    tabindex={disabled ? -1 : 0}
    onclick={toggle}
    onkeydown={handleKeydown}
  >
    <span class="cui-switch-thumb" data-slot="thumb"></span>
  </span>

  {#if label || children}
    <div class="cui-switch-content" data-slot="content">
      <span class="cui-switch-label" data-slot="label">
        {#if children}
          {@render children()}
        {:else}
          {label}
        {/if}
      </span>
      {#if hint}
        <span class="cui-switch-hint" data-slot="hint">{hint}</span>
      {/if}
    </div>
  {/if}

  {#if name}
    <input type="checkbox" {name} {checked} {disabled} {required} style="display: none;" />
  {/if}
</label>
`;

  const sassCode = `.cui-switch-root
\tdisplay: inline-flex
\talign-items: center
\tgap: var(--space-3)
\tcursor: pointer
\tuser-select: none
\tfont-family: var(--font-sans)

\t&[data-disabled]
\t\topacity: var(--state-disabled)
\t\tcursor: not-allowed

.cui-switch-track
\tposition: relative
\tdisplay: inline-flex
\talign-items: center
\tbackground-color: var(--bg-base)
\tborder: 1px solid var(--stroke-weaker)
\tborder-radius: var(--radius-full)
\tpadding: 2px
\ttransition: background-color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)

\t&:focus-visible
\t\toutline: 2px solid var(--state-focus)
\t\toutline-offset: 2px

\t// Size axes
\t.cui-switch-root[data-size="sm"] &
\t\twidth: 2.25rem
\t\theight: 1.25rem

\t.cui-switch-root[data-size="md"] &
\t\twidth: 2.75rem
\t\theight: 1.5rem

\t.cui-switch-root[data-size="lg"] &
\t\twidth: 3.25rem
\t\theight: 1.75rem

\t// Checked state
\t.cui-switch-root[data-checked] &
\t\tbackground-color: var(--color-primary)
\t\tborder-color: var(--color-primary)

.cui-switch-thumb
\tdisplay: block
\tbackground-color: var(--color-white)
\tborder-radius: var(--radius-full)
\tbox-shadow: var(--shadow-xs)
\ttransition: transform var(--duration-fast) var(--ease-spring)
\ttransform: translateX(0)

\t// Thumb sizes
\t.cui-switch-root[data-size="sm"] &
\t\twidth: 0.95rem
\t\theight: 0.95rem

\t.cui-switch-root[data-size="md"] &
\t\twidth: 1.2rem
\t\theight: 1.2rem

\t.cui-switch-root[data-size="lg"] &
\t\twidth: 1.45rem
\t\theight: 1.45rem

\t// Checked translations
\t.cui-switch-root[data-size="sm"][data-checked] &
\t\ttransform: translateX(1rem)

\t.cui-switch-root[data-size="md"][data-checked] &
\t\ttransform: translateX(1.25rem)

\t.cui-switch-root[data-size="lg"][data-checked] &
\t\ttransform: translateX(1.5rem)

.cui-switch-content
\tdisplay: flex
\tflex-direction: column
\tgap: 2px

.cui-switch-label
\tfont-size: var(--text-sm)
\tfont-weight: 500
\tcolor: var(--text-primary)

.cui-switch-hint
\tfont-size: var(--text-xs)
\tcolor: var(--text-muted)
`;

  return { svelteCode, sassCode };
}

// ==========================================
// 7. INPUT
// ==========================================
function generateInput(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    value?: string;
    label?: string;
    hint?: string;
    error?: string;
    placeholder?: string;
    size?: 'sm' | 'md' | 'lg';
    appearance?: 'outlined' | 'filled';
    type?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    clearable?: boolean;
    start?: Snippet;
    end?: Snippet;
    oninput?: (e: Event) => void;
    onchange?: (e: Event) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    id = 'cui-input-' + Math.random().toString(36).slice(2, 8),
    value = $bindable(''),
    label = '',
    hint = '',
    error = '',
    placeholder = '',
    size = 'md',
    appearance = 'outlined',
    type = 'text',
    disabled = false,
    readonly = false,
    required = false,
    clearable = false,
    start,
    end,
    oninput,
    onchange,
    class: className = '',
    ...restProps
  }: Props = $props();

  function handleClear() {
    value = '';
  }
</script>

<div
  class="cui-input-root {className}"
  data-slot="input-root"
  data-size={size}
  data-appearance={appearance}
  data-invalid={error ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
>
  {#if label}
    <label for={id} class="cui-input-label" data-slot="label">
      {label}
      {#if required}<span class="cui-input-required">*</span>{/if}
    </label>
  {/if}

  <div class="cui-input-wrapper" data-slot="wrapper">
    {#if start}
      <span class="cui-input-start" data-slot="start">
        {@render start()}
      </span>
    {/if}

    <input
      {id}
      {type}
      {placeholder}
      {disabled}
      {readonly}
      {required}
      bind:value
      class="cui-input-control"
      data-slot="control"
      {oninput}
      {onchange}
      {...restProps}
    />

    {#if clearable && value && !disabled && !readonly}
      <button
        type="button"
        class="cui-input-clear"
        data-slot="clearButton"
        onclick={handleClear}
        aria-label="Clear input"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    {/if}

    {#if end}
      <span class="cui-input-end" data-slot="end">
        {@render end()}
      </span>
    {/if}
  </div>

  {#if error}
    <span class="cui-input-error" data-slot="error">{error}</span>
  {:else if hint}
    <span class="cui-input-hint" data-slot="hint">{hint}</span>
  {/if}
</div>
`;

  const sassCode = `.cui-input-root
\tdisplay: flex
\tflex-direction: column
\tgap: var(--space-1)
\tfont-family: var(--font-sans)
\twidth: 100%

\t&[data-disabled]
\t\topacity: var(--state-disabled)
\t\tcursor: not-allowed

.cui-input-label
\tfont-size: var(--text-xs)
\tfont-weight: 600
\tcolor: var(--text-primary)
\tletter-spacing: 0.02em

.cui-input-required
\tcolor: var(--status-danger-fg)
\tmargin-left: 2px

.cui-input-wrapper
\tdisplay: flex
\talign-items: center
\tgap: var(--space-2)
\tborder-radius: var(--radius-md)
\ttransition: border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)

\t// Appearance
\t.cui-input-root[data-appearance="outlined"] &
\t\tbackground-color: transparent
\t\tborder: 1px solid var(--stroke-weaker)

\t\t&:focus-within
\t\t\tborder-color: var(--state-focus)
\t\t\tbox-shadow: 0 0 0 1px var(--state-focus)

\t.cui-input-root[data-appearance="filled"] &
\t\tbackground-color: var(--bg-weaker)
\t\tborder: 1px solid transparent

\t\t&:focus-within
\t\t\tbackground-color: var(--bg)
\t\t\tborder-color: var(--state-focus)
\t\t\tbox-shadow: 0 0 0 1px var(--state-focus)

\t// Sizes
\t.cui-input-root[data-size="sm"] &
\t\theight: 1.75rem
\t\tpadding: 0 var(--space-2)
\t\tfont-size: var(--text-xs)

\t.cui-input-root[data-size="md"] &
\t\theight: 2.25rem
\t\tpadding: 0 var(--space-3)
\t\tfont-size: var(--text-sm)

\t.cui-input-root[data-size="lg"] &
\t\theight: 2.75rem
\t\tpadding: 0 var(--space-4)
\t\tfont-size: var(--text-base)

\t// Invalid state
\t.cui-input-root[data-invalid] &
\t\tborder-color: var(--status-danger-border) !important
\t\tbox-shadow: 0 0 0 1px var(--status-danger-border) !important

.cui-input-control
\tflex: 1
\twidth: 100%
\theight: 100%
\tborder: none
\tbackground: transparent
\tcolor: var(--text-primary)
\tfont-family: inherit
\tfont-size: inherit
\toutline: none

\t&::placeholder
\t\tcolor: var(--text-muted)

.cui-input-start, .cui-input-end
\tdisplay: inline-flex
\talign-items: center
\tcolor: var(--text-secondary)

.cui-input-clear
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\tborder: none
\tbackground: transparent
\tcolor: var(--text-muted)
\tcursor: pointer
\tpadding: 2px
\tborder-radius: var(--radius-sm)
\ttransition: color var(--duration-fast) var(--ease-out)

\t&:hover
\t\tcolor: var(--text-primary)

.cui-input-hint
\tfont-size: var(--text-xs)
\tcolor: var(--text-muted)

.cui-input-error
\tfont-size: var(--text-xs)
\tcolor: var(--status-danger-fg)
`;

  return { svelteCode, sassCode };
}

// ==========================================
// 8. TEXTAREA
// ==========================================
function generateTextarea(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  interface Props {
    value?: string;
    label?: string;
    hint?: string;
    error?: string;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    maxlength?: number;
    oninput?: (e: Event) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    id = 'cui-textarea-' + Math.random().toString(36).slice(2, 8),
    value = $bindable(''),
    label = '',
    hint = '',
    error = '',
    placeholder = '',
    rows = 3,
    disabled = false,
    readonly = false,
    required = false,
    maxlength,
    oninput,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<div
  class="cui-textarea-root {className}"
  data-slot="textarea-root"
  data-invalid={error ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
>
  {#if label}
    <label for={id} class="cui-textarea-label" data-slot="label">
      {label}
      {#if required}<span class="cui-textarea-required">*</span>{/if}
    </label>
  {/if}

  <textarea
    {id}
    {placeholder}
    {rows}
    {disabled}
    {readonly}
    {required}
    {maxlength}
    bind:value
    class="cui-textarea-control"
    data-slot="control"
    {oninput}
    {...restProps}
  ></textarea>

  <div class="cui-textarea-meta">
    {#if error}
      <span class="cui-textarea-error" data-slot="error">{error}</span>
    {:else if hint}
      <span class="cui-textarea-hint" data-slot="hint">{hint}</span>
    {/if}
    {#if maxlength}
      <span class="cui-textarea-count">{value.length} / {maxlength}</span>
    {/if}
  </div>
</div>
`;

  const sassCode = `.cui-textarea-root
\tdisplay: flex
\tflex-direction: column
\tgap: var(--space-1)
\tfont-family: var(--font-sans)
\twidth: 100%

\t&[data-disabled]
\t\topacity: var(--state-disabled)
\t\tcursor: not-allowed

.cui-textarea-label
\tfont-size: var(--text-xs)
\tfont-weight: 600
\tcolor: var(--text-primary)

.cui-textarea-required
\tcolor: var(--status-danger-fg)
\tmargin-left: 2px

.cui-textarea-control
\twidth: 100%
\tpadding: var(--space-3)
\tbackground-color: transparent
\tcolor: var(--text-primary)
\tborder: 1px solid var(--stroke-weaker)
\tborder-radius: var(--radius-md)
\tfont-family: inherit
\tfont-size: var(--text-sm)
\tline-height: 1.5
\tresize: vertical
\toutline: none
\ttransition: border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)

\t&:focus
\t\tborder-color: var(--state-focus)
\t\tbox-shadow: 0 0 0 1px var(--state-focus)

\t&::placeholder
\t\tcolor: var(--text-muted)

\t.cui-textarea-root[data-invalid] &
\t\tborder-color: var(--status-danger-border) !important
\t\tbox-shadow: 0 0 0 1px var(--status-danger-border) !important

.cui-textarea-meta
\tdisplay: flex
\talign-items: center
\tjustify-content: space-between
\tfont-size: var(--text-xs)

.cui-textarea-hint
\tcolor: var(--text-muted)

.cui-textarea-error
\tcolor: var(--status-danger-fg)

.cui-textarea-count
\tcolor: var(--text-muted)
\tmargin-left: auto
`;

  return { svelteCode, sassCode };
}

// ==========================================
// 9. CHECKBOX
// ==========================================
function generateCheckbox(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    checked?: boolean;
    indeterminate?: boolean;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    required?: boolean;
    name?: string;
    value?: string;
    label?: string;
    hint?: string;
    children?: Snippet;
    onchange?: (checked: boolean) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    checked = $bindable(false),
    indeterminate = $bindable(false),
    size = 'md',
    disabled = false,
    required = false,
    name,
    value,
    label = '',
    hint = '',
    children,
    onchange,
    class: className = '',
    ...restProps
  }: Props = $props();

  function toggle() {
    if (disabled) return;
    if (indeterminate) {
      indeterminate = false;
      checked = true;
    } else {
      checked = !checked;
    }
    onchange?.(checked);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  }
</script>

<label
  class="cui-checkbox-root {className}"
  data-slot="checkbox-root"
  data-size={size}
  data-checked={checked ? '' : undefined}
  data-indeterminate={indeterminate ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  {...restProps}
>
  <span
    class="cui-checkbox-control"
    data-slot="control"
    role="checkbox"
    aria-checked={indeterminate ? 'mixed' : checked}
    aria-disabled={disabled}
    tabindex={disabled ? -1 : 0}
    onclick={toggle}
    onkeydown={handleKeydown}
  >
    {#if indeterminate}
      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="3" fill="none">
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    {:else if checked}
      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="3" fill="none">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    {/if}
  </span>

  {#if label || children}
    <div class="cui-checkbox-content" data-slot="content">
      <span class="cui-checkbox-label" data-slot="label">
        {#if children}
          {@render children()}
        {:else}
          {label}
        {/if}
      </span>
      {#if hint}
        <span class="cui-checkbox-hint" data-slot="hint">{hint}</span>
      {/if}
    </div>
  {/if}

  {#if name}
    <input type="checkbox" {name} {value} {checked} {disabled} {required} style="display: none;" />
  {/if}
</label>
`;

  const sassCode = `.cui-checkbox-root
\tdisplay: inline-flex
\talign-items: flex-start
\tgap: var(--space-3)
\tcursor: pointer
\tuser-select: none
\tfont-family: var(--font-sans)

\t&[data-disabled]
\t\topacity: var(--state-disabled)
\t\tcursor: not-allowed

.cui-checkbox-control
\tposition: relative
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\tflex-shrink: 0
\tbackground-color: var(--bg-base)
\tborder: 1px solid var(--stroke-weaker)
\tborder-radius: var(--radius-sm)
\tcolor: var(--color-primary-fg)
\ttransition: background-color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out)

\t&:focus-visible
\t\toutline: 2px solid var(--state-focus)
\t\toutline-offset: 2px

\t// Sizes
\t.cui-checkbox-root[data-size="sm"] &
\t\twidth: 1rem
\t\theight: 1rem

\t.cui-checkbox-root[data-size="md"] &
\t\twidth: 1.25rem
\t\theight: 1.25rem

\t.cui-checkbox-root[data-size="lg"] &
\t\twidth: 1.5rem
\t\theight: 1.5rem

\t// Checked and Indeterminate
\t.cui-checkbox-root[data-checked] &,
\t.cui-checkbox-root[data-indeterminate] &
\t\tbackground-color: var(--color-primary)
\t\tborder-color: var(--color-primary)

.cui-checkbox-content
\tdisplay: flex
\tflex-direction: column
\tgap: 2px

.cui-checkbox-label
\tfont-size: var(--text-sm)
\tfont-weight: 500
\tcolor: var(--text-primary)
\tline-height: 1.25

.cui-checkbox-hint
\tfont-size: var(--text-xs)
\tcolor: var(--text-muted)
`;

  return { svelteCode, sassCode };
}

// ==========================================
// 10. CHECKBOX GROUP
// ==========================================
function generateCheckboxGroup(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label?: string;
    hint?: string;
    orientation?: 'vertical' | 'horizontal';
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    label = '',
    hint = '',
    orientation = 'vertical',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<fieldset
  class="cui-checkbox-group-root {className}"
  data-slot="checkboxgroup-root"
  data-orientation={orientation}
  {...restProps}
>
  {#if label}
    <legend class="cui-checkbox-group-label" data-slot="label">{label}</legend>
  {/if}

  <div class="cui-checkbox-group-items" data-slot="items">
    {#if children}
      {@render children()}
    {/if}
  </div>

  {#if hint}
    <span class="cui-checkbox-group-hint" data-slot="hint">{hint}</span>
  {/if}
</fieldset>
`;

  const sassCode = `.cui-checkbox-group-root
\tborder: none
\tpadding: 0
\tmargin: 0
\tdisplay: flex
\tflex-direction: column
\tgap: var(--space-2)
\tfont-family: var(--font-sans)

.cui-checkbox-group-label
\tfont-size: var(--text-xs)
\tfont-weight: 600
\tcolor: var(--text-primary)
\tmargin-bottom: var(--space-1)

.cui-checkbox-group-items
\tdisplay: flex
\tgap: var(--space-3)

\t.cui-checkbox-group-root[data-orientation="vertical"] &
\t\tflex-direction: column

\t.cui-checkbox-group-root[data-orientation="horizontal"] &
\t\tflex-direction: row
\t\tflex-wrap: wrap

.cui-checkbox-group-hint
\tfont-size: var(--text-xs)
\tcolor: var(--text-muted)
`;

  return { svelteCode, sassCode };
}

// ==========================================
// 11. RADIO
// ==========================================
function generateRadio(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    value?: string;
    checked?: boolean;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    name?: string;
    label?: string;
    hint?: string;
    children?: Snippet;
    onchange?: (value: string) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    value = '',
    checked = false,
    size = 'md',
    disabled = false,
    name,
    label = '',
    hint = '',
    children,
    onchange,
    class: className = '',
    ...restProps
  }: Props = $props();

  function select() {
    if (disabled) return;
    onchange?.(value);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      select();
    }
  }
</script>

<label
  class="cui-radio-root {className}"
  data-slot="radio-root"
  data-size={size}
  data-checked={checked ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  {...restProps}
>
  <span
    class="cui-radio-control"
    data-slot="control"
    role="radio"
    aria-checked={checked}
    aria-disabled={disabled}
    tabindex={disabled ? -1 : 0}
    onclick={select}
    onkeydown={handleKeydown}
  >
    <span class="cui-radio-dot" data-slot="indicator"></span>
  </span>

  {#if label || children}
    <div class="cui-radio-content" data-slot="content">
      <span class="cui-radio-label" data-slot="label">
        {#if children}
          {@render children()}
        {:else}
          {label}
        {/if}
      </span>
      {#if hint}
        <span class="cui-radio-hint" data-slot="hint">{hint}</span>
      {/if}
    </div>
  {/if}

  {#if name}
    <input type="radio" {name} {value} {checked} {disabled} style="display: none;" />
  {/if}
</label>
`;

  const sassCode = `.cui-radio-root
\tdisplay: inline-flex
\talign-items: flex-start
\tgap: var(--space-3)
\tcursor: pointer
\tuser-select: none
\tfont-family: var(--font-sans)

\t&[data-disabled]
\t\topacity: var(--state-disabled)
\t\tcursor: not-allowed

.cui-radio-control
\tposition: relative
\tdisplay: inline-flex
\talign-items: center
\tjustify-content: center
\tflex-shrink: 0
\tbackground-color: var(--bg-base)
\tborder: 1px solid var(--stroke-weaker)
\tborder-radius: var(--radius-full)
\ttransition: background-color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)

\t&:focus-visible
\t\toutline: 2px solid var(--state-focus)
\t\toutline-offset: 2px

\t// Sizes
\t.cui-radio-root[data-size="sm"] &
\t\twidth: 1rem
\t\theight: 1rem

\t.cui-radio-root[data-size="md"] &
\t\twidth: 1.25rem
\t\theight: 1.25rem

\t.cui-radio-root[data-size="lg"] &
\t\twidth: 1.5rem
\t\theight: 1.5rem

\t// Checked
\t.cui-radio-root[data-checked] &
\t\tborder-color: var(--color-primary)
\t\tbackground-color: var(--bg)

.cui-radio-dot
\tdisplay: block
\tbackground-color: var(--color-primary)
\tborder-radius: var(--radius-full)
\ttransform: scale(0)
\ttransition: transform var(--duration-fast) var(--ease-spring)

\t.cui-radio-root[data-size="sm"] &
\t\twidth: 0.375rem
\t\theight: 0.375rem

\t.cui-radio-root[data-size="md"] &
\t\twidth: 0.5rem
\t\theight: 0.5rem

\t.cui-radio-root[data-size="lg"] &
\t\twidth: 0.625rem
\t\theight: 0.625rem

\t.cui-radio-root[data-checked] &
\t\ttransform: scale(1)

.cui-radio-content
\tdisplay: flex
\tflex-direction: column
\tgap: 2px

.cui-radio-label
\tfont-size: var(--text-sm)
\tfont-weight: 500
\tcolor: var(--text-primary)
\tline-height: 1.25

.cui-radio-hint
\tfont-size: var(--text-xs)
\tcolor: var(--text-muted)
`;

  return { svelteCode, sassCode };
}

// ==========================================
// 12. RADIO GROUP
// ==========================================
function generateRadioGroup(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    value?: string;
    name?: string;
    label?: string;
    hint?: string;
    orientation?: 'vertical' | 'horizontal';
    children?: Snippet;
    onchange?: (value: string) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    value = $bindable(''),
    name = 'radio-group',
    label = '',
    hint = '',
    orientation = 'vertical',
    children,
    onchange,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<fieldset
  class="cui-radio-group-root {className}"
  data-slot="radiogroup-root"
  data-orientation={orientation}
  {...restProps}
>
  {#if label}
    <legend class="cui-radio-group-label" data-slot="label">{label}</legend>
  {/if}

  <div class="cui-radio-group-items" data-slot="items">
    {#if children}
      {@render children()}
    {/if}
  </div>

  {#if hint}
    <span class="cui-radio-group-hint" data-slot="hint">{hint}</span>
  {/if}
</fieldset>
`;

  const sassCode = `.cui-radio-group-root
\tborder: none
\tpadding: 0
\tmargin: 0
\tdisplay: flex
\tflex-direction: column
\tgap: var(--space-2)
\tfont-family: var(--font-sans)

.cui-radio-group-label
\tfont-size: var(--text-xs)
\tfont-weight: 600
\tcolor: var(--text-primary)
\tmargin-bottom: var(--space-1)

.cui-radio-group-items
\tdisplay: flex
\tgap: var(--space-3)

\t.cui-radio-group-root[data-orientation="vertical"] &
\t\tflex-direction: column

\t.cui-radio-group-root[data-orientation="horizontal"] &
\t\tflex-direction: row
\t\tflex-wrap: wrap

.cui-radio-group-hint
\tfont-size: var(--text-xs)
\tcolor: var(--text-muted)
`;

  return { svelteCode, sassCode };
}

// ==========================================
// 13. SLIDER
// ==========================================
function generateSlider(anatomy, recipe, roles) {
  const svelteCode = `<script lang="ts">
  interface Props {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    size?: 'sm' | 'md' | 'lg';
    label?: string;
    hint?: string;
    disabled?: boolean;
    showValue?: boolean;
    onchange?: (value: number) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    value = $bindable(50),
    min = 0,
    max = 100,
    step = 1,
    size = 'md',
    label = '',
    hint = '',
    disabled = false,
    showValue = true,
    onchange,
    class: className = '',
    ...restProps
  }: Props = $props();

  let percentage = $derived(Math.round(((value - min) / (max - min)) * 100));

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = Number(target.value);
    onchange?.(value);
  }
</script>

<div
  class="cui-slider-root {className}"
  data-slot="slider-root"
  data-size={size}
  data-disabled={disabled ? '' : undefined}
  style="--slider-pct: {percentage}%;"
  {...restProps}
>
  {#if label || showValue}
    <div class="cui-slider-header" data-slot="header">
      {#if label}
        <span class="cui-slider-label" data-slot="label">{label}</span>
      {/if}
      {#if showValue}
        <span class="cui-slider-value" data-slot="value">{value}</span>
      {/if}
    </div>
  {/if}

  <div class="cui-slider-track-wrap" data-slot="trackWrap">
    <div class="cui-slider-fill" data-slot="fill"></div>
    <input
      type="range"
      {min}
      {max}
      {step}
      {value}
      {disabled}
      class="cui-slider-input"
      data-slot="input"
      oninput={handleInput}
    />
  </div>

  {#if hint}
    <span class="cui-slider-hint" data-slot="hint">{hint}</span>
  {/if}
</div>
`;

  const sassCode = `.cui-slider-root
\tdisplay: flex
\tflex-direction: column
\tgap: var(--space-2)
\tfont-family: var(--font-sans)
\twidth: 100%

\t&[data-disabled]
\t\topacity: var(--state-disabled)
\t\tcursor: not-allowed

.cui-slider-header
\tdisplay: flex
\talign-items: center
\tjustify-content: space-between
\tfont-size: var(--text-xs)

.cui-slider-label
\tfont-weight: 600
\tcolor: var(--text-primary)

.cui-slider-value
\tfont-family: var(--font-mono)
\tcolor: var(--color-primary)
\tfont-weight: 600

.cui-slider-track-wrap
\tposition: relative
\tdisplay: flex
\talign-items: center
\twidth: 100%
\tbackground-color: var(--bg-base)
\tborder-radius: var(--radius-full)

\t.cui-slider-root[data-size="sm"] &
\t\theight: var(--space-1)

\t.cui-slider-root[data-size="md"] &
\t\theight: var(--space-2)

\t.cui-slider-root[data-size="lg"] &
\t\theight: var(--space-3)

.cui-slider-fill
\tposition: absolute
\tleft: 0
\theight: 100%
\twidth: var(--slider-pct, 0%)
\tbackground-color: var(--color-primary)
\tborder-radius: var(--radius-full)
\tpointer-events: none

.cui-slider-input
\tposition: relative
\tz-index: 10
\twidth: 100%
\theight: 100%
\tmargin: 0
\topacity: 0
\tcursor: pointer

\t&:focus-visible
\t\toutline: 2px solid var(--state-focus)
\t\toutline-offset: 2px

.cui-slider-hint
\tfont-size: var(--text-xs)
\tcolor: var(--text-muted)
`;

  return { svelteCode, sassCode };
}

// ==========================================
// COMPILER CORE
// ==========================================
function compileComponent(name) {
  const normName = name.toLowerCase();
  const generator = COMPONENT_GENERATORS[normName];
  if (!generator) {
    console.error("No generator found for component: " + name);
    return false;
  }

  const anatomyPath = path.resolve("anatomy", normName + ".json");
  const recipePath = path.resolve("recipes", normName + ".createui.json");
  const rolesPath = path.resolve("roles.sass.json");

  const anatomy = fs.existsSync(anatomyPath) ? JSON.parse(fs.readFileSync(anatomyPath, "utf8")) : {};
  const recipe = fs.existsSync(recipePath) ? JSON.parse(fs.readFileSync(recipePath, "utf8")) : {};
  const roles = fs.existsSync(rolesPath) ? JSON.parse(fs.readFileSync(rolesPath, "utf8")) : {};

  const { svelteCode, sassCode, subComponents } = generator(anatomy, recipe, roles);

  // Capitalize name for Svelte component
  const capMap = {
    tab: "TabGroup",
    buttongroup: "ButtonGroup",
    progressbar: "ProgressBar",
    progressring: "ProgressRing",
    copybutton: "CopyButton"
  };
  let compCap = capMap[normName] || (normName.charAt(0).toUpperCase() + normName.slice(1));

  // 1. Write Svelte component
  const compDir = path.resolve("src/lib/components/generated", compCap);
  if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true });
  fs.writeFileSync(path.join(compDir, compCap + ".svelte"), svelteCode);

  // 1b. Write subcomponents if present
  if (subComponents) {
    for (const [subName, subCode] of Object.entries(subComponents)) {
      fs.writeFileSync(path.join(compDir, subName + ".svelte"), subCode);
    }
  }

  // 2. Write Sass file
  const sassDir = path.resolve("src/lib/styles/components");
  if (!fs.existsSync(sassDir)) fs.mkdirSync(sassDir, { recursive: true });
  fs.writeFileSync(path.join(sassDir, normName + ".sass"), sassCode);

  console.log(`Compiled ${compCap}: ${compDir}/${compCap}.svelte + ${sassDir}/${normName}.sass`);
  return true;
}

const arg = process.argv[2] || "all";
if (arg === "all") {
  for (const name of Object.keys(COMPONENT_GENERATORS)) {
    compileComponent(name);
  }

  // Create generated index.ts
  const exportLines = [
    "export { default as Button } from './Button/Button.svelte';",
    "export { default as Popup } from './Popup/Popup.svelte';",
    "export { default as Drawer } from './Drawer/Drawer.svelte';",
    "export { default as Dropdown } from './Dropdown/Dropdown.svelte';",
    "export { default as Dialog } from './Dialog/Dialog.svelte';",
    "export { default as Switch } from './Switch/Switch.svelte';",
    "export { default as Input } from './Input/Input.svelte';",
    "export { default as Textarea } from './Textarea/Textarea.svelte';",
    "export { default as Checkbox } from './Checkbox/Checkbox.svelte';",
    "export { default as CheckboxGroup } from './Checkboxgroup/Checkboxgroup.svelte';",
    "export { default as Checkboxgroup } from './Checkboxgroup/Checkboxgroup.svelte';",
    "export { default as Radio } from './Radio/Radio.svelte';",
    "export { default as RadioGroup } from './Radiogroup/Radiogroup.svelte';",
    "export { default as Radiogroup } from './Radiogroup/Radiogroup.svelte';",
    "export { default as Slider } from './Slider/Slider.svelte';",
    "export { default as Badge } from './Badge/Badge.svelte';",
    "export { default as Callout } from './Callout/Callout.svelte';",
    "export { default as Card } from './Card/Card.svelte';",
    "export { default as Tag } from './Tag/Tag.svelte';",
    "export { default as Accordion } from './Accordion/Accordion.svelte';",
    "export { default as AccordionItem } from './Accordion/AccordionItem.svelte';",
    "export { default as TabGroup } from './TabGroup/TabGroup.svelte';",
    "export { default as Tab } from './TabGroup/Tab.svelte';",
    "export { default as TabPanel } from './TabGroup/TabPanel.svelte';",
    "export { default as Toast } from './Toast/Toast.svelte';",
    "export { default as ToastItem } from './Toast/ToastItem.svelte';",
    "export { default as Tree } from './Tree/Tree.svelte';",
    "export { default as TreeItem } from './Tree/TreeItem.svelte';",
    "export { default as Avatar } from './Avatar/Avatar.svelte';",
    "export { default as Breadcrumb } from './Breadcrumb/Breadcrumb.svelte';",
    "export { default as BreadcrumbItem } from './Breadcrumb/BreadcrumbItem.svelte';",
    "export { default as ButtonGroup } from './ButtonGroup/ButtonGroup.svelte';",
    "export { default as Divider } from './Divider/Divider.svelte';",
    "export { default as ProgressBar } from './ProgressBar/ProgressBar.svelte';",
    "export { default as ProgressRing } from './ProgressRing/ProgressRing.svelte';",
    "export { default as Popover } from './Popover/Popover.svelte';",
    "export { default as Tooltip } from './Tooltip/Tooltip.svelte';",
    "export { default as Select } from './Select/Select.svelte';",
    "export { default as Option } from './Select/Option.svelte';",
    "export { default as Details } from './Details/Details.svelte';",
    "export { default as CopyButton } from './CopyButton/CopyButton.svelte';",
    "export { default as NumberInput } from './Numberinput/Numberinput.svelte';",
    "export { default as Pagination } from './Pagination/Pagination.svelte';",
    "export { default as Carousel } from './Carousel/Carousel.svelte';",
    "export { default as SplitPanel } from './Splitpanel/Splitpanel.svelte';",
    "export { default as Scroller } from './Scroller/Scroller.svelte';",
    "export { default as Comparison } from './Comparison/Comparison.svelte';"
  ];
  fs.writeFileSync(path.resolve("src/lib/components/generated/index.ts"), exportLines.join("\n") + "\n");

  // Create components/index.sass
  const sassForwardLines = Object.keys(COMPONENT_GENERATORS).map(name => `@forward '${name}'`);
  fs.writeFileSync(path.resolve("src/lib/styles/components/index.sass"), sassForwardLines.join("\n") + "\n");

  console.log(`All ${Object.keys(COMPONENT_GENERATORS).length} components generated and indexed successfully!`);
} else {
  compileComponent(arg);
}
