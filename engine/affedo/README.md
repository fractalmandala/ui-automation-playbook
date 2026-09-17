# Affedo · Svelte 5 Design System & Agent Verification Engine

An agent-verified component library, multi-theme design token system, and interactive playground suite built natively with **Svelte 5 runes**, **single-tab indented Sass**, and an **agent-first contract verification engine (`cui-lint`)**.

---

## What's Inside

### 1. 32-Component Svelte 5 Runes Library (`src/lib/components/generated/`)
Pure runes (`$props()`, `$state()`, `$derived()`, snippets `{#snippet}`) implementation with **zero in-component `<style>` blocks**:
- **Actions & Forms**: `Button`, `ButtonGroup`, `Input`, `Textarea`, `Select`, `Option`, `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Switch`, `Slider`
- **Containers & Hierarchy**: `Card`, `Accordion`, `AccordionItem`, `TabGroup`, `Tab`, `TabPanel`, `Tree`, `TreeItem`, `Breadcrumb`, `BreadcrumbItem`, `Details`
- **Overlays**: `Dialog`, `Drawer`, `Popup`, `Popover`, `Tooltip`
- **Feedback & Indicators**: `Badge`, `Tag`, `Callout`, `ProgressBar`, `ProgressRing`, `Toast`, `ToastItem`
- **Identity & Actions**: `Avatar`, `CopyButton`, `Divider`

### 2. Multi-Mode Design Tokens (`tokens/`)
- **102 Semantic Tokens**: declared in `tokens/createui.json` and `tokens/neobrutalist.json`.
- **Themes**: Default Light, Obsidian Dark, Neo-Brutalist, Terminal Mono.
- **Dynamic Live Modifiers**: Sizing Density (`compact`, `normal`, `spacious`) and Corner Geometry (`0px Stark`, `Brutalist 2-4px`, `Round Pill`).

### 3. Agent-First Linter (`cui-lint`)
Inspired by [`@shadcn/lint`](https://github.com/shadcn-ui/lint), `cui-lint` coaches autonomous coding agents with prescriptive fixes instead of cryptic compiler errors:
- **`cui/token-purity`**: Prohibits raw hex and arbitrary pixel dimensions > 2px in `.sass` files.
- **`cui/no-in-component-styles`**: Enforces zero `<style>` blocks in library components.
- **`cui/no-component-restyle`**: Enforces component encapsulation against caller style overrides (`padding`, `background`, `border-radius`).
- **`cui/strict-props-and-slots`**: Dynamically verifies component props against `interface Props` and `anatomy/*.json` with Levenshtein fuzzy suggestions.

### 4. Interactive Playgrounds
- **`/generator`**: Interactive spec visualizer, token matrix inspector, density switcher, and generator playground.
- **`/playground2`**: Live demo showcase featuring all 38 components with live theme, density, and geometry switching.

---

## Documentation

Detailed architectural and operational documentation is available in `docs/`:

- **[docs/architecture.md](docs/architecture.md)**: Component templates, indented Sass discipline, token schemas, anatomy contracts, and generator architecture.
- **[docs/agent-linter.md](docs/agent-linter.md)**: Agent-coach philosophy, the 4 contract rules, negative test suite results, and benchmark metrics.
- **[docs/agent-integration-guide.md](docs/agent-integration-guide.md)**: CLI usage, agent prompt directives, multi-agent pipeline integration (Santa Method, Boss Orchestration), and CI/CD setup.

---

## Getting Started

```bash
# Start development server
pnpm dev

# Run agent design system linter (interactive terminal mode)
pnpm lint:agent

# Run agent design system linter (machine JSON mode for AI agents)
pnpm lint:agent:json

# Type check with svelte-check
pnpm check

# Static production build
pnpm build
```

---

## Component Usage Example

```svelte
<script lang="ts">
  import { Button, Card, Badge, Input } from '$lib/components/generated';
</script>

<Card appearance="outlined">
  {#snippet header()}
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h3>Agent Verification Cluster</h3>
      <Badge variant="success">Online</Badge>
    </div>
  {/snippet}

  <Input label="Instance URL" placeholder="https://api.cluster.dev" hint="HTTPS endpoint" />

  {#snippet footer()}
    <Button variant="primary" size="md">
      Deploy Agent
    </Button>
  {/snippet}
</Card>
```
