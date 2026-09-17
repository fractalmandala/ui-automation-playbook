# uiautomation playground

Renders the pipeline's generated components over **real bits-ui**, with a sidebar of every component the compiler produced, so you can watch its output behave rather than read it.

```bash
pnpm --dir uiautomation/pipeline verify     # regenerate first, or the demo shows stale output
pnpm --dir uiautomation/playground dev      # http://127.0.0.1:5273
```

## What's on screen

- **Sidebar** — every component in `generated/plan/`, grouped, with its finding count. It is discovered from the pipeline's output, not a hand-maintained list: add a recipe, reload, and it appears. A component with no demo yet still shows up, with its recipe, Sass, plan and gates intact.
- **Live** — the real component, styled only by `generated/styles/index.sass`, imported as-is. The frame renders one instance per value of the component's first axis (read from the resolved plan) and chips for the rest, so `size` and `tone` come out of the data rather than out of the shell. "outline parts" is an opt-in toggle: with it off (the default) hovering still drives the inspector, but nothing is drawn over the component.
- **Generated output** — the actual Sass block for the selected part, read from disk with `?raw` rather than re-rendered from a copy.
- **Plan** — roles, resolved declarations, states and axis modifiers for whichever part the pointer is over. Hover tracking reads `data-slot` off the live DOM, so if the pipeline ever stopped stamping it, this panel would go blank. Parts that were re-exported rather than wrapped are listed too, with the reason, as are the states the recipe declares deliberately unstyled.
- **Gate results** — `report.json`, written by `check.mjs` on every verification run: per-gate counts, this component's findings, and the adapter-wide ones.
- **Tokens** — the adapter values *this recipe* reaches, with live overrides written straight to `:root`.

## What it demonstrably proves

Checked against the running page with computed styles, not by eye:

| Claim | Evidence |
| --- | --- |
| Axis modifiers reach the DOM through the wrapper | the `sm` column's accordion trigger computes `min-height: 26px`, the `lg` column `38px`, from `control.ghost`'s `when` blocks |
| Roles, not attributes, drive appearance | an accordion item computes `background: rgb(18, 18, 18)` = `--bg-raised` from `surface.raised` |
| The axis really swaps tokens | with `--radius-m` overridden to `22px`, the md item becomes `22px` while lg stays `12px` (`radius-l`) and sm stays `4px` (`radius-s`) |
| Cross-part state works | the switch thumb computes `inset-inline-start: 23px` when the root is checked and `3px` when it is not, from `control.switch-thumb`'s `[data-state="checked"] &` |
| One role serves several components | an open disclosure trigger computes `background: rgb(31, 31, 31)` on both Accordion and Collapsible — `control.expanded`, listed after the control role in each recipe |
| Role composition order is real | the tooltip computes `color: #71717A` — `typography.muted` beating `surface.floating`'s `text-primary`, because it is listed second |
| Snippet parameters survive the wrapper | the slider renders 5 ticks and a thumb from `{ tickItems, thumbItems }`, and pagination pages render their default `{page.value}` labels |
| The gates describe the output, not a wish | the panel lists this component's findings and the adapter-wide ones; the current run is 0 errors and 0 warnings, with the gate chips showing where each class of finding would appear |

## Wiring notes

- `uiautomation/` is a pnpm workspace (`pipeline` + `playground`) so `svelte`, `bits-ui` and `sass` resolve to **one physical copy**. Two Svelte runtimes in one tab fail in confusing ways.
- `$generated` and `$pipeline` aliases point at the pipeline's output and root; `server.fs.allow` opens the parent directory because those live outside this package. The shell's registry discovers components with `import.meta.glob` over `$generated/plan/*.json`, `$generated/styles/components/*.sass` and `./demos/*.svelte`.
- `optimizeDeps.exclude: ['bits-ui']` is required: bits-ui ships uncompiled `.svelte` parts and esbuild's dep pre-bundler has no loader for them.
- `pnpm-workspace.yaml` approves the `esbuild` and `@parcel/watcher` build scripts. Without the approval `pnpm install` exits non-zero, which makes every `pnpm <script>` fail its pre-run dependency check.
- The only hand-written data in the shell is `src/lib/registry.ts`'s `META`: a group and one sentence per component. No compiler writes copy.
