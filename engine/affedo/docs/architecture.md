# Architecture & Template Specification

This document details the architectural foundation, templates, schemas, and generator engine of the **CUI (CreateUI) Component & Design System** for Svelte 5.

---

## 1. System Overview

The system provides a developer-grade, contract-verified component suite built on five pillars:
1. **Svelte 5 Runes Architecture**: Components utilize `$state()`, `$derived()`, `$props()`, and snippets (`{#snippet}`, `{@render}`) with zero legacy Svelte 4 reactivity.
2. **Zero In-Component Styles**: Svelte components contain strictly markup and logic. Component styling is externalized to single-tab indented Sass files.
3. **Two-Layer Semantic Token System**: Styles consume 102 semantic CSS custom properties defined in JSON token schemas, enabling instant multi-mode theming (Default Light, Obsidian Dark, Neo-Brutalist, Terminal Mono).
4. **Machine-Readable Contracts**: Every component has a machine-readable schema (`anatomy/*.json`, `recipes/*.json`) defining allowable props, parts, slots, and states.
5. **Agent-First Verification (`cui-lint`)**: A native AST linter that coaches LLM coding agents with prescriptive fixes when architectural rules are broken.

---

## 2. Component Templates (`.svelte`)

All library components live under [`src/lib/components/generated/`](file:///Users/amrit/fractalmandala/fractaldev/ui-compiler-playbook/engine/affedo/src/lib/components/generated) and adhere to a strict template pattern.

### Template Pattern Example: `Button.svelte`
```svelte
<script lang="ts">
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
```

### Component Rules
- **Explicit `interface Props`**: All props must be declared in a TypeScript `interface Props` block. This allows both TypeScript and the `cui-lint` AST parser to extract valid props deterministically.
- **`data-slot` Selectors**: Every structural DOM element receives a descriptive `data-slot="..."` attribute (e.g. `data-slot="button-root"`, `data-slot="label"`).
- **`data-variant` & `data-size`**: State variations are conveyed through HTML data attributes, keeping class names clean and allowing external stylesheets to target them efficiently.
- **Zero `<style>` Blocks**: No component in `src/lib/components/generated/` may contain a `<style>` tag.

---

## 3. Indented Sass Templates (`.sass`)

All component stylesheets reside under [`src/lib/styles/components/`](file:///Users/amrit/fractalmandala/fractaldev/ui-compiler-playbook/engine/affedo/src/lib/styles/components).

### Template Pattern Example: `button.sass`
```sass
// Button Component Styles
.fs-button
	display: inline-flex
	align-items: center
	justify-content: center
	gap: var(--space-2)
	font-family: var(--font-sans)
	font-weight: 500
	line-height: 1
	border-radius: var(--radius-md)
	border: 1px solid transparent
	cursor: pointer
	user-select: none
	transition: background-color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)

	// Sizes
	&[data-size="sm"]
		height: var(--size-sm)
		padding: 0 var(--space-2)
		font-size: var(--text-xs)

	&[data-size="md"]
		height: var(--size-md)
		padding: 0 var(--space-3)
		font-size: var(--text-sm)

	&[data-size="lg"]
		height: var(--size-lg)
		padding: 0 var(--space-4)
		font-size: var(--text-base)

	// Variants
	&[data-variant="primary"]
		background-color: var(--color-primary)
		color: var(--color-primary-fg)
		border-color: var(--color-primary)

		&:hover:not(:disabled)
			background-color: var(--color-primary-hover)

	&[data-variant="secondary"]
		background-color: var(--bg-subtle)
		color: var(--text)
		border-color: var(--stroke-base)

		&:hover:not(:disabled)
			background-color: var(--bg-hover)

	&:disabled
		opacity: 0.5
		cursor: not-allowed
```

### Styling Discipline
1. **Single-Tab Indentation**: No curly braces `{}` and no semicolons `;`.
2. **Token Exclusivity**: All colors, dimensions, borders, and animations must consume `var(--...)` custom properties.
3. **No Arbitrary Units**: Pixel units are restricted to 1px or 2px for hairline borders. Spacing and sizing must use the `--space-*`, `--radius-*`, or `--size-*` scales.

---

## 4. Token Schemas (`tokens/*.json`)

The design system maintains its source of truth in JSON token definitions:
- [`tokens/createui.json`](file:///Users/amrit/fractalmandala/fractaldev/ui-compiler-playbook/engine/affedo/tokens/createui.json): Base 102 semantic tokens for light and dark modes.
- [`tokens/neobrutalist.json`](file:///Users/amrit/fractalmandala/fractaldev/ui-compiler-playbook/engine/affedo/tokens/neobrutalist.json): Neo-Brutalist theme variation with high-contrast surfaces, stark borders, and bold accent tokens.

### Token Schema Structure
```json
{
  "name": "createui",
  "version": "1.1.0",
  "modes": ["light", "dark"],
  "categories": [
    "background",
    "stroke",
    "text",
    "icon",
    "primary",
    "state",
    "status",
    "overlay",
    "shadow",
    "static"
  ],
  "tokens": {
    "background": {
      "--bg": { "light": "#ffffff", "dark": "#0a0a0b" },
      "--bg-subtle": { "light": "#f4f4f5", "dark": "#18181b" },
      "--bg-hover": { "light": "#e4e4e7", "dark": "#27272a" }
    },
    "stroke": {
      "--stroke-base": { "light": "#e4e4e7", "dark": "#27272a" },
      "--stroke-strong": { "light": "#a1a1aa", "dark": "#52525b" }
    }
  },
  "scales": {
    "spacing": {
      "--space-1": "0.25rem",
      "--space-2": "0.5rem",
      "--space-3": "0.75rem",
      "--space-4": "1rem",
      "--space-5": "1.25rem",
      "--space-6": "1.5rem",
      "--space-7": "2rem",
      "--space-8": "2.5rem"
    },
    "radius": {
      "--radius-xs": "2px",
      "--radius-sm": "4px",
      "--radius-md": "6px",
      "--radius-lg": "8px",
      "--radius-xl": "12px",
      "--radius-full": "9999px"
    }
  }
}
```

---

## 5. Anatomy & Recipe Schemas (`anatomy/*.json`)

Each component is paired with a contract file in [`anatomy/`](file:///Users/amrit/fractalmandala/fractaldev/ui-compiler-playbook/engine/affedo/anatomy) extracted from AST analysis:

```json
{
  "component": "Button",
  "source": "src/lib/components/generated/Button/Button.svelte",
  "parts": {
    "start": { "tag": "span", "dataSlot": "start" },
    "label": { "tag": "span", "dataSlot": "label" },
    "end": { "tag": "span", "dataSlot": "end" },
    "spinner": { "tag": "span", "dataSlot": "spinner" }
  },
  "props": {
    "variant": { "type": "string", "default": "primary" },
    "size": { "type": "string", "default": "md" },
    "disabled": { "type": "boolean", "default": false },
    "loading": { "type": "boolean", "default": false },
    "type": { "type": "string", "default": "button" }
  },
  "snippets": [
    "inner",
    "start",
    "children",
    "end"
  ]
}
```

These machine-readable schemas provide the ground truth that enables `cui-lint` to validate props and snippets statically.

---

## 6. Component Roster (38 Components)

All components are produced by `scripts/gen.mjs` from anatomy + recipe + generator modules (`scripts/generators/wave2|3|4.mjs`) and exported from `src/lib/components/generated/index.ts`.

- **Wave 1 — Core Controls & Inputs (13)**: Button, Popup, Drawer, Dropdown, Dialog, Switch, Input, Textarea, Checkbox, CheckboxGroup, Radio, RadioGroup, Slider
- **Wave 2 — Surfaces & Feedback (8)**: Accordion (+AccordionItem), Badge, Callout, Card, TabGroup (+Tab, TabPanel), Tag, Toast (+ToastItem), Tree (+TreeItem)
- **Wave 3 — Specialty & Utilities (11)**: Avatar, Breadcrumb (+BreadcrumbItem), ButtonGroup, Divider, ProgressBar, ProgressRing, Popover, Tooltip, Select (+Option), Details, CopyButton
- **Wave 4 — Complex Layout & Precision (6)**:
  - **NumberInput** — `$bindable` value with min/max/step clamping, −/+ stepper buttons, ↑/↓ keyboard support, start/end snippet slots, size axes (`control.spinbutton`)
  - **Pagination** — `$bindable` page, sibling-count ellipsis truncation, optional first/last edges, disabled edge states (`control.pagination`)
  - **Carousel** — items array (defensive `[]`) with `slide` snippet override, `$bindable` index, loop wrap-around, arrows + dot indicators (`surface.carousel-track`)
  - **SplitPanel** — two-pane layout with pointer-captured draggable divider (role=`slider`, keyboard ±1/Shift ±10), `$bindable` split %, min/max clamping, horizontal/vertical orientation (`layout.split`)
  - **Scroller** — Layout-Law scroll body (`flex: 1 1 auto`, `min-height: 0`, `overscroll-behavior: contain`), vertical/horizontal/both directions, edge fade mask, scroll snap (`layout.scroll-body`)
  - **Comparison** — layered before/after reveal via `clip-path: inset(0 calc(100% - var(--cui-compare)) 0 0)`, pointer-draggable handle (role=`slider`), arrow-key stepping (`surface.comparison`)

Wave 4 introduces three component-runtime CSS custom properties (`--cui-split`, `--cui-scroller-max`, `--cui-compare`) set inline by the components and registered as valid local tokens in both `scripts/lint-tokens.mjs` and `scripts/lib/token-linter.mjs`.

