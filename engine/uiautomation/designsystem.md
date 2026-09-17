# Zero to One Design System in 2026

-   Start with core tokens (color, typography, spacing)—even small, consistent choices make a significant impact.
-   Design tokens follow a three-tier hierarchy: Global (primitives) → Alias (semantic) → Component tokens.
-   Build components your team uses daily first: buttons, form fields, cards, modals. Don’t over-engineer upfront.
-   Tokens are platform-agnostic—the same token generates CSS variables, iOS Swift, Android XML, and more.
-   Grow your system alongside product work: when designing new features, polish elements and add them to the system.
-   Document decisions, not just components. Future you needs to know why, not just what.
-   A design system is never “done”—it evolves with your product and team.


## The Minimalist Starting Point

Most design system resources show mature systems with hundreds of components. That’s the destination, not the starting point.

**What you actually need to start:**

-   5 colors
-   2 fonts
-   4 spacing values
-   3 components

That’s it. Everything else comes later, driven by real product needs.

## Phase 1: Core Tokens

### What Are Design Tokens?

Design tokens are the atomic values that power your visual language—named entities that store design decisions:

```
/* These are tokens */
--color-brand-primary: #C0FF00;
--font-family-sans: 'Plus Jakarta Sans', sans-serif;
--spacing-md: 16px;
--radius-lg: 12px;
```

Tokens are platform-agnostic. The same token definition generates:

-   CSS custom properties
-   Tailwind config
-   iOS Swift constants
-   Android XML resources
-   Figma styles

### Token Categories

Start with these five categories:

| Category | Purpose | Example Values |
| --- | --- | --- |
| **Color** | Brand, semantic, neutral | Primary, secondary, success, error |
| **Typography** | Font families, sizes, weights | Sans, serif, mono; sm, base, lg, xl |
| **Spacing** | Margins, padding, gaps | xs (4px), sm (8px), md (16px), lg (24px) |
| **Radius** | Border curvature | sm (4px), md (8px), lg (12px), full (9999px) |
| **Shadow** | Elevation and depth | sm, md, lg |

### The Three-Tier Hierarchy

Tokens should be organized in tiers:

**Tier 1: Global (Primitives)** Raw values without semantic meaning:

```
--gray-50: #FAFAFA;
--gray-100: #F4F4F5;
--gray-900: #18181B;
--blue-500: #3B82F6;
--green-500: #22C55E;
```

**Tier 2: Alias (Semantic)** Named for purpose, reference primitives:

```
--color-text-primary: var(--gray-900);
--color-text-secondary: var(--gray-500);
--color-bg-surface: var(--gray-50);
--color-accent-success: var(--green-500);
```

**Tier 3: Component** Specific to components, reference aliases:

```
--button-primary-bg: var(--color-brand-primary);
--button-primary-text: var(--color-text-on-primary);
--button-padding-x: var(--spacing-lg);
--button-radius: var(--radius-md);
```

### Starting Token Set

Here’s a minimal but complete starting point:

```
:root {
  /* Colors */
  --color-brand-primary: #C0FF00;
  --color-brand-primary-hover: #A8E600;
  --color-text-primary: #EDEDED;
  --color-text-secondary: #A1A1AA;
  --color-bg-primary: #0A0A0A;
  --color-bg-secondary: #121212;
  --color-border: rgba(255, 255, 255, 0.08);
  
  /* Typography */
  --font-sans: 'Plus Jakarta Sans', sans-serif;
  --font-serif: 'Instrument Serif', serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  
  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.2);
}
```

## Phase 2: Core Components

### Start with What You Use

Don’t build components speculatively. Start with the 3–5 components you use most:

| Component | Priority | Why First |
| --- | --- | --- |
| Button | High | Every interface has buttons |
| Input | High | Every form needs inputs |
| Card | High | Common container pattern |
| Modal | Medium | Standard overlay pattern |
| Badge | Medium | Status and labels |

### Button Component Example

Start simple, add variants as needed:

```
/* Button base */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  
  padding: var(--space-sm) var(--space-lg);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  
  transition: background 0.15s ease, transform 0.1s ease;
}

/* Primary variant */
.btn-primary {
  background: var(--color-brand-primary);
  color: #000;
}

.btn-primary:hover {
  background: var(--color-brand-primary-hover);
}

.btn-primary:active {
  transform: translateY(1px);
}

/* Secondary variant */
.btn-secondary {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Sizes */
.btn-sm { padding: var(--space-xs) var(--space-md); font-size: var(--text-xs); }
.btn-lg { padding: var(--space-md) var(--space-xl); font-size: var(--text-base); }
```

### Input Component Example

```
.input {
  display: block;
  width: 100%;
  
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  color: var(--color-text-primary);
  
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input::placeholder {
  color: var(--color-text-secondary);
}

.input:focus {
  outline: none;
  border-color: var(--color-brand-primary);
  box-shadow: 0 0 0 3px rgba(192, 255, 0, 0.2);
}

.input-error {
  border-color: var(--color-error);
}

.input-label {
  display: block;
  margin-bottom: var(--space-xs);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}
```

## Phase 3: Documentation

### What to Document

Documentation serves future you and future teammates:

| Section | Purpose | Content |
| --- | --- | --- |
| **Principles** | Why decisions were made | Design philosophy, constraints |
| **Tokens** | Available design values | All token categories with examples |
| **Components** | How to use each component | Props, variants, code snippets |
| **Patterns** | Common combinations | Layout patterns, form patterns |
| **Changelog** | What changed when | Version history, breaking changes |

### Decision Documentation

Document the “why,” not just the “what”:

```
## Color Decisions

### Brand Primary: #C0FF00 (Lime)
- **Why this color:** High contrast on dark backgrounds, distinctive
- **When to use:** CTAs, active states, key highlights
- **When NOT to use:** Large background fills (too intense)
- **Accessibility:** Passes WCAG AA on dark backgrounds (#0A0A0A)
```

### Component Documentation Template

```
## Button

### Overview
Buttons trigger actions. Use primary for main actions, secondary for alternatives.

### Variants
| Variant | Use Case |
|---------|----------|
| Primary | Main action on page |
| Secondary | Alternative actions |
| Ghost | Low-emphasis actions |

### Sizes
- `sm`: Tight spaces, inline actions
- `md`: Default, most contexts
- `lg`: Hero sections, prominent CTAs

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'primary' | Visual style |
| size | string | 'md' | Button size |
| disabled | boolean | false | Disable interactions |

### Usage
'''html
<button class="btn btn-primary">Primary Action</button>
<button class="btn btn-secondary btn-sm">Small Secondary</button>
'''

### Do / Don't
✅ Use one primary button per section
❌ Don't use multiple primary buttons competing for attention
```

## Phase 4: Growing the System

### The Habit Pattern

Grow your system as part of regular product work:

1.  **Design a feature**: You need a new component (e.g., a dropdown)
2.  **Build it well**: Extra 20% effort to make it reusable
3.  **Add to system**: Document props, variants, usage
4.  **Use it again**: Next feature gets the component for free

This turns scattered design into reliable building blocks.

### When to Add Components

Add to the system when:

-   Used in 2+ places
-   Likely to be used again
-   Has clear, consistent behavior
-   Worth documenting

Don’t add when:

-   One-off, highly specific
-   Still evolving (wait until stable)
-   Unclear use case

### Version Control

As your system grows, track changes:

```
## Changelog

### 2.1.0 (2026-01-27)
- Added: Tooltip component
- Changed: Button hover states use scale instead of shadow
- Fixed: Input focus ring visible on keyboard only

### 2.0.0 (2026-01-15)
- Breaking: Renamed `--color-primary` to `--color-brand-primary`
- Breaking: Button sizes changed from px to relative units
- Added: Dark mode token variants
```

### Token Management

| Tool | Best For | Notes |
| --- | --- | --- |
| **CSS Custom Properties** | Simple, web-only | Built-in, no build step |
| **Tailwind Config** | Tailwind projects | Tokens become utilities |
| **Style Dictionary** | Multi-platform | Generates iOS, Android, web |
| **Tokens Studio** | Figma-first | Syncs Figma ↔ code |

### Component Libraries

| Tool | Best For | Notes |
| --- | --- | --- |
| **Storybook** | Documentation, testing | Industry standard |
| **Histoire** | Vue/Vite projects | Lighter weight |
| **Ladle** | React, fast iteration | Fast dev experience |

### Figma Setup

1.  Create a dedicated “Design System” Figma file
2.  Define color styles, text styles, effects
3.  Build components with variants
4.  Publish as a library
5.  Team members link to the library

## Implementation Checklist

### Phase 1: Foundation

-   Define 5 core colors (brand + semantic)
-   Choose 2 font families (sans + optional serif/mono)
-   Set 4 spacing values (xs, sm, md, lg)
-   Define border radius scale
-   Document initial tokens

### Phase 2: Core Components

-   Build button with 2+ variants
-   Build input with states (default, focus, error)
-   Build card as container component
-   Document each component
-   Create usage examples

### Phase 3: Scale

-   Set up Storybook or equivalent
-   Create contribution guidelines
-   Establish versioning approach
-   Connect Figma to code tokens
-   Add components as product needs arise

## FAQ

### How many tokens do I need to start?

15–25 tokens covering color, typography, spacing, and radius. You can always add more; starting minimal is better than over-engineering.

### Should I build everything in Figma first?

Build in parallel. Figma for design exploration, code for production components. They should stay in sync but neither needs to lead.

### What if I’m the only designer/developer?

Start anyway. Even for solo projects, consistent tokens save time and improve quality. Future team members will thank you.

### How do I get buy-in for design system work?

Frame it as efficiency: “Building this button once means we never build it again.” Track time saved on repeated components.

### Should I use an existing system (Material, Chakra, etc.)?

For speed, yes. For uniqueness, build your own. Many teams start with an existing system and customize over time.

### How long until the system provides value?

Immediately, if you’re using the tokens. Within 2–4 weeks, you’ll have reusable components saving time on every feature.
