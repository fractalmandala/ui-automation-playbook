# ui automation `(?)`

> look at the images, see the .md files 

1. Generate a templatized set of variables
	- colors
	- semantic colors
	- sizes
	- text scales
	- spacing scales
	- shape types - rounded, square, ...
	- and many more, look at the images, see tailwind and other example docs attached

2. Generate a set such that any set of headless components can be paired with it to generate a multiple-branching tree of styling UI

> A solution to the fundamental flaw of LLM UI generation: LLMs hallucinate CSS and invent ad-hoc layouts when asked to write raw styling from scratch, but they excel at discrete categorical classification.

> By making the code emitter a pure deterministic compiler and restricting the agent to multiple-choice role assignment against a closed vocabulary (or bypassing the agent entirely via preset library maps), component generation becomes 100% reliable, zero-bloat, and scriptable.

1. Architectural Thesis: The Inversion of Control
Traditional LLM component generation fails predictably because models are asked to do two incompatible things at once:

Parse & preserve complex state machines / accessibility contracts (ARIA, keyboard navigation, focus traps, event forwarding).
Invent visual styling from scratch (inventing arbitrary CSS class names, guessing colors, adding 300-line `<style>` blocks with raw hex and pixel values).
By separating concerns into a deterministic compilation pipeline, we invert control:

Headless Libraries (e.g. Bits UI, Melt UI, Radix-svelte) own 100% of accessibility, DOM mechanics, and state machines.
roles.json owns 100% of the design system aesthetics and interactive behavior patterns.
tokens/`<library>`.json owns 100% of the design token mappings.
recipes/`<name>`.json is a simple, closed-vocabulary lookup table that connects parts to roles.
The Agent's reasoning space is reduced to a multiple-choice classification (or bypassed completely when a preset mapping is supplied).

```
                      ┌──────────────────────────────────────┐
                      │    Headless Svelte 5 Component       │
                      └──────────────────┬───────────────────┘
                                         │
                                         ▼ [svelte/compiler AST parser]
                      ┌──────────────────────────────────────┐
                      │         anatomy/<name>.json          │
                      │  (parts, states, props, slots)       │
                      └──────────────────┬───────────────────┘
                                         │
              ┌──────────────────────────┴───────────────────────────┐
              ▼                                                      ▼
  [Preset Map: bits-ui.json]                            [Agent: Multiple-Choice Only]
              │                                                      │
              └──────────────────────────┬───────────────────────────┘
                                         ▼
                      ┌──────────────────────────────────────┐
                      │         recipes/<name>.json          │
                      │  (part -> role, axes: size, tone)    │
                      └──────────────────┬───────────────────┘
                                         │
 ┌──────────────────────┐                │                ┌──────────────────────┐
 │   roles.sass.json    ├────────────────┼────────────────┤ tokens/<adapter>.json│
 │ (surface, control...)│                │                │  (--bg, --space...)  │
 └──────────────────────┘                ▼                └──────────────────────┘
                              ┌────────────────────┐
                              │  pnpm gen <name>   │
                              │  (Pure Compiler)   │
                              └──────────┬─────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
     ┌─────────────────────────────┐           ┌─────────────────────────────┐
     │ src/lib/components/<Name>/  │           │   src/lib/styles/           │
     │       <Name>.svelte         │           │   components/<name>.sass    │
     │  (Zero bloat, data-slots)   │           │ (Single-tab indented Sass)  │
     └──────────────┬──────────────┘           └──────────────┬──────────────┘
                    │                                         │
                    └────────────────────┬────────────────────┘
                                         ▼
                              ┌────────────────────┐
                              │ Strict Gatekeeper  │
                              │ - pnpm check (0 err│
                              │ - sass compilation │
                              │ - zero-raw hex/px  │
                              └────────────────────┘
```

2. Pipeline Stages
Stage 1: Deterministic Anatomy Extractor (scripts/extract-anatomy.mjs)
Uses svelte/compiler parse to extract component anatomy with zero human or LLM interpretation:

Script AST (ast.instance):
Walks ESTree to identify $props() destructuring.
Extracts prop names, default values, and TypeScript type signatures (e.g. orientation?: 'horizontal' | 'vertical').
HTML AST (ast.html):
Walks template tree to discover data-slot, data-part, role, and class attributes.
Detects conditional state attributes (e.g. data-state="open", data-disabled, aria-expanded).
Identifies snippet outlets ({@render children()}, {@render leading?.()}).

```
{
  "component": "Accordion",
  "source": "bits-ui",
  "parts": {
    "root": { "tag": "div", "role": "region", "dataSlot": "accordion-root" },
    "item": { "tag": "div", "role": null, "dataSlot": "accordion-item" },
    "header": { "tag": "h3", "role": "heading", "dataSlot": "accordion-header" },
    "trigger": { "tag": "button", "role": "button", "dataSlot": "accordion-trigger" },
    "content": { "tag": "div", "role": "region", "dataSlot": "accordion-content" }
  },
  "states": {
    "trigger": ["open", "closed", "disabled"],
    "content": ["open", "closed"]
  },
  "props": {
    "multiple": { "type": "boolean", "default": false },
    "disabled": { "type": "boolean", "default": false },
    "orientation": { "type": "union", "values": ["horizontal", "vertical"], "default": "vertical" }
  },
  "snippets": ["children", "trigger", "content"]
}
```


## Stage 2: The Semantic Role Taxonomy (roles.sass.json)
The design system vocabulary is written once. Roles are categorized by intent:

surface.*: Backgrounds, borders, elevations, paddings, rounded corners.
control.*: Interactive triggers, buttons, inputs, list rows with focus/hover/active states.
layout.*: Flexbox, grid, dividers, positioning stacks.
typography.*: Headings, labels, muted hints, monospace indicators.

```
{
  "surface.canvas": {
    "bg": "bg",
    "fg": "text-primary"
  },
  "surface.raised": {
    "bg": "bg",
    "fg": "text-primary",
    "border": "border-subtle",
    "radius": "radius-md",
    "pad": "space-4",
    "elevation": 2
  },
  "control.ghost": {
    "bg": "transparent",
    "bg:hover": "bg-hover",
    "fg": "text-secondary",
    "fg:hover": "text-primary",
    "border": "transparent",
    "radius": "radius-sm",
    "pad": "space-2 space-3",
    "interactive": true,
    "focus": "outline-focus"
  },
  "control.list-item": {
    "bg": "transparent",
    "bg:hover": "bg-hover",
    "fg": "text-primary",
    "pad": "space-2 space-3",
    "interactive": true,
    "transition": "color 0.15s ease, background-color 0.15s ease"
  },
  "layout.stack": {
    "display": "flex",
    "flexDirection": "column",
    "gap": "space-2"
  },
  "layout.row": {
    "display": "flex",
    "alignItems": "center",
    "gap": "space-2"
  }
}
```


## Stage 4: Recipe Contract (recipes/<name>.json)
The recipe assigns a role from roles.sass.json to each part identified in anatomy/<name>.json:

```
{
  "$schema": "./schemas/recipe.schema.json",
  "component": "Accordion",
  "parts": {
    "root": "layout.stack",
    "item": "surface.raised",
    "header": "layout.row",
    "trigger": "control.ghost",
    "content": "surface.canvas"
  },
  "axes": ["size"]
}
```

```
{
  "type": "object",
  "required": ["component", "parts"],
  "properties": {
    "component": { "type": "string" },
    "parts": {
      "type": "object",
      "additionalProperties": { "enum": ["surface.canvas", "surface.raised", "control.ghost", "control.list-item", "layout.stack", "layout.row"] }
    },
    "axes": {
      "type": "array",
      "items": { "enum": ["size", "tone", "variant"] }
    }
  }
}
```

## Stage 5: Pure Compiler (scripts/gen.mjs)
Running pnpm gen accordion performs two deterministic file writes:

1. Svelte Component Wrapper (src/lib/components/Accordion/Accordion.svelte)
Implements Svelte 5 runes ($props()).
Passes props to underlying headless primitive.
Renders data-slot and axes (data-size={size}).
Zero `<style>` tags.

```
<script lang="ts">
  import { Accordion as BitsAccordion } from 'bits-ui';
  import type { Snippet } from 'svelte';

  let {
    multiple = false,
    disabled = false,
    size = 'md',
    children,
    class: className = '',
    ...restProps
  }: {
    multiple?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    children?: Snippet;
    class?: string;
    [key: string]: any;
  } = $props();
</script>

<BitsAccordion.Root
  {multiple}
  {disabled}
  data-slot="accordion-root"
  data-size={size}
  class="accordion-root {className}"
  {...restProps}
>
  {@render children?.()}
</BitsAccordion.Root>
```


## 2. Indented SASS File (src/lib/styles/components/accordion.sass)
Single-tab indented syntax.
No curly braces, no semicolons.
Pure semantic tokens.


```
.accordion-root
	display: flex
	flex-direction: column
	gap: var(--space-2)
	width: 100%

	&[data-size="sm"]
		font-size: 0.75rem
		gap: var(--space-1)

	&[data-size="lg"]
		font-size: 0.9375rem
		gap: var(--space-3)

.accordion-item
	background-color: var(--bg)
	border: 1px solid var(--border-subtle)
	border-radius: var(--radius-md)
	overflow: hidden

.accordion-trigger
	display: flex
	align-items: center
	justify-content: space-between
	width: 100%
	padding: var(--space-2) var(--space-3)
	background-color: transparent
	color: var(--text-secondary)
	border-radius: var(--radius-sm)
	cursor: pointer
	transition: color 0.15s ease, background-color 0.15s ease

	&:hover
		background-color: var(--bg-hover)
		color: var(--text-primary)

	&[data-state="open"]
		color: var(--text-primary)

	&[data-disabled]
		opacity: 0.4
		cursor: not-allowed

.accordion-content
	padding: var(--space-3)
	color: var(--text-primary)
	background-color: var(--bg)
```

## Stage 6: The Unattended Verification Suite

```
# 1. Type & Svelte 5 AST Check
pnpm check

# 2. Sass Compilation Check
pnpm sass src/lib/styles/components/accordion.sass build/test.css

# 3. Design Token Linter
node scripts/lint-tokens.mjs src/lib/styles/components/accordion.sass
```


Token Linter Rules (scripts/lint-tokens.mjs):
Rule 1: No Raw Hex — Rejects #[0-9a-fA-F]{3,8}.
Rule 2: No Hardcoded Pixels — Rejects \d+px (must use --space-*, --radius-*, or --font-size-*).
Rule 3: Strict Surface Rule — Rejects --bg-surface, enforces var(--bg).
Rule 4: Unmapped Variable Check — Validates every var(--name) against the active token adapter map.