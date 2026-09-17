# uiautomation pipeline

A working prototype of [CORE-IDEA.md](../CORE-IDEA.md). Headless parts own behaviour, `roles.json` owns aesthetics, the emitter is a pure lookup. It runs end to end on **real bits-ui 2.19.2** — not on a fixture — and it runs over the **whole library**: 42 component namespaces extracted, 15 of them generated from recipes.

```bash
pnpm install                                          # uiautomation/ is a pnpm workspace
pnpm anatomy:all   # Stage 1: every bits-ui namespace -> anatomy/*.json (42 files)
pnpm anatomy       # Stage 1, one namespace        -> anatomy/accordion.json
pnpm gen           # Stages 4-5: recipes + taxonomy -> 93 files in generated/
pnpm check         # Stage 6: eleven gates          -> report.json
pnpm verify        # all three, in order
pnpm verify:clean  # gen --check + check: the "is the output clean?" CI gate
```

`uiautomation/playground` renders the result against the real library with a sidebar of every generated component: `pnpm --dir uiautomation/playground dev`.

## Who owns what

| File | Owns | Authored by |
| --- | --- | --- |
| `anatomy/<component>.json` | parts, runtime `data-*` attributes, states, props, snippets | `extract-anatomy.mjs`, never a human |
| `roles.json` | the aesthetics: declarations, pseudo-states, axis responses, lint flags | human, once per system |
| `axes.json` | axis scales (`size`, `tone`): allowed values, default, data attribute | human, once per system |
| `vocabulary.json` | the closed vocabulary: allowed CSS properties, keyword literals, state selectors **and their cascade order** | human, reviewed |
| `tokens/<adapter>.json` | **all** raw values; the only file with hex/px/ms | human/designer |
| `recipes/<component>.json` | part -> roles, exposed axes, import source, and `unstyled` (states that deliberately need no declaration) | human or agent, multiple choice only |
| `generated/**` | wrappers, plan JSON, Sass | `gen.mjs`, never a human |

Every generated file carries an `@generated` banner (JSON uses a `$generated` field) and `check.mjs` fails if it is missing, so a hand edit becomes a loud failure rather than a silent revert.

A recipe is small. This is the whole of `recipes/separator.json`:

```json
{ "component": "Separator", "importFrom": "bits-ui", "importName": "Separator",
  "parts": { "root": ["layout.divider"] }, "source": "bits-ui" }
```

## What real bits-ui taught the extractor

CORE-IDEA.md's Stage 1 says: walk the template, read `data-slot` / `data-state` / `aria-*` off the elements, done. Real bits-ui is nothing like that, and each surprise was a silent-wrongness bug waiting to happen:

1. **State attributes are built in JS, not in the markup.** A bits-ui part is one element with a single `{...mergedProps}` spread; `data-state`, `data-disabled` and `data-orientation` are constructed in `accordion.svelte.js`. A template-only AST walk returns an anatomy with *zero* states and no error. The extractor therefore reads the state module too (with `acorn`), and attributes each props object to a part through the computed key `[accordionAttrs.<part>]` — a structural signal from the code itself, not a class-name guess.
2. **Parts are namespace members, not files.** `exports.js` maps `Root -> components/accordion.svelte`, so the filename cannot be the component tag (`<Headless.accordion-item>` is invalid Svelte).
3. **The state module is named after the directory, not the component.** `PinInput.toLowerCase()` is `pininput`; the file is `pin-input.svelte.js`. Deriving the name quietly loses every multi-word component, so the module is discovered instead.
4. **Not every part is styleable at all.** `dialog.svelte` is a pure context provider whose entire body is `{@render children?.()}`; tooltip's `arrow` renders `FloatingLayerArrow`, a *component*, so a `class` on it is a prop, not a hook. Neither is an error — those parts are **re-exported from bits-ui** rather than wrapped, and a recipe may still claim one as styleable by listing it. Four of Tooltip's seven parts work this way.
5. **Snippet props must be forwarded as props.** `Slider.Root` hands its `children` snippet `{ tickItems, thumbItems }`, and `Pagination.Page` renders `{page.value}` *only when it has no children*. A wrapper that declares its own `{#snippet children(...)}` is therefore wrong twice over: it drops the library's arguments, and it makes `children` defined when nobody passed one, so default content silently disappears. Generated wrappers pass `children={childrenProp}` and own attributes only, never content.
6. **`$bindable()` has to survive the wrapper.** `ref` and `value` are bindable in bits-ui; the extractor records that and the emitter re-declares them as `$bindable(...)`, so `bind:value` on a generated wrapper still reaches the library.
7. **Requiredness is not claimable through an imported type alias.** `let { href, type, ... } = $props(): ButtonRootProps` looks like two required props; bits-ui marks both optional (`href?: never` on the anchor branch). The extractor only claims `required` when it actually resolved a type, so a wrapper never invents a constraint the library does not have.

One design consequence: generated wrappers **destructure only what the pipeline owns** (the role class, the axes, `children`, bindable props) and forward everything else through `...restProps`. Nothing duplicates the library's prop defaults, which is the most likely place for silent drift.

`data-slot` is a pipeline convention (real parts have no marker of their own), kebab-cased from the component name, so the marker, the class, the anatomy filename, the recipe and the playground slug are all spelled the same way: `radio-group-item`, not `radiogroup-item`.

## Where the emitter's shape comes from

- **Axes.** `axes.json` owns the scale, each role declares its own responses under `when: { "size=sm": {...} }`. Without this, the emitted `&[data-size="sm"]` blocks would have to be hand-written inside the compiler — which is exactly what CORE-IDEA.md's Stage 5 example does, and exactly what "pure compiler" is supposed to forbid. `gen.mjs` has no per-component logic.
- **States are explicit selector suffixes** (`":hover"`, `"[data-state=\"open\"]"`) instead of the spec's `"bg:hover"` magic keys, so the compiler never guesses at pseudo-state expansion.
- **The state list is the cascade contract.** Every state selector has the same specificity, so source order decides ties — and source order is `vocabulary.json`'s `stateSelectors` array. Read it as priority: `:hover` → `:focus-visible` → `:active` → `[data-disabled]` → … → `[data-state="*"]`. That is why a pressed control does not fall back to its hover look and why library state outranks pointer state. Putting the decision in the data file is the alternative to `!important` and nesting tricks.
- **`behavior` flags drive linting, not codegen** (`interactive` requires a declared `:focus-visible` state).
- **Recipe part order is emission order.** With single-class selectors and no `!important`, source order decides every cascade tie, so the authored order is part of the contract.
- **The resolved plan is emitted as data** (`generated/plan/<slug>.json`). The playground renders its whole shell from those files, so what you see on screen is literally what the compiler resolved.

## The eleven gates

1. **referential integrity** — recipe parts/roles/axes exist; the adapter satisfies the whole taxonomy, not just the parts in use
2. **anatomy coverage** — every *styleable* part has a role; every declared state is *accounted for*: styled by a role, or declared `unstyled` in the recipe. Reported once per component rather than once per part-state pair. The `unstyled` declaration is validated in both directions, so it cannot rot - naming a state the anatomy does not have is an error, and declaring one that a role styles is an error too.
3. **taxonomy lint** — interactive roles declare focus; state selectors come from the vocabulary
4. **token lint** — no hex, no px, no rem/ms, no `rgb()`, no `!important` in component Sass; every `var(--x)` is reachable from the recipe's roles and nothing else
5. **vocabulary** — every declaration names an allowed property, and `transition` is exactly `[property, duration-token, easing-token]`
6. **format contract** — single-tab indented Sass only; braces and semicolons are errors
7. **prop parity** — every anatomy prop is forwarded; every axis has its data attribute
8. **Svelte compile** — each wrapper compiles under `svelte/compiler` 5.57
9. **Sass compile** — `generated/styles/index.sass` compiles and emits a rule per part
10. **cascade ties** — equal-specificity blocks that can both match and set the same property are reported with the resolved winner. A tie resolved the way `vocabulary.json`'s ordering already documents (library state outranking pointer state) is the contract working and is silent; a pointer state beating a library state, or two states of the same kind fighting, is reported because neither is a decision anyone recorded.
11. **byte stability** — a fresh render is byte-identical to disk, with no stale files in `generated/`

`check.mjs` writes `report.json` with per-gate counts, which is what the playground's gate panel renders.

Verified by hand: a hand edit to a generated file fails gate 11 with the exact line number; a styleable part left out of a recipe fails gate 2 and blocks writing; two consecutive renders hash identically; deleting a role reference fails gate 1 before anything is written.

## What the current run says

`0 errors, 0 warnings`, for 42 anatomies, 15 components and 93 generated files. Two of the three warning classes that used to appear are gone because the tool learned to distinguish "no decision" from "decided"; the third was the adapter carrying tokens nothing reached.

The design rule this run produced: roles originally gave `:hover` and `[data-disabled]` a shared `color`, and `:active` a `background-color` that collided with `:hover`, so every interactive role produced two or three ties. `roles.json` now says **each state owns one visual channel** — hover owns `background-color`, `:active` owns `box-shadow`, `:focus-visible` owns the outline, `[data-disabled]` owns `opacity` and `cursor`, data-states own colour. What remains are ties where a library state beats `:hover` on `background-color` (`control.expanded` on an open disclosure, `[data-selected]` on a pagination page, `[data-state="on"]` on a toggle): the contract resolving them the documented way, which is the point, not a collision to fix.

The three classes, and what happened to each:

- **cascade** — used to re-report every tie that resolved the documented way. It now reports only ties that contradict the contract or that pit two states of the same kind against each other, which is the case that is actually undecided.
- **coverage** — used to report every resting and aria-only state on every part (26 lines from one library). The recipe now has a third answer: `unstyled: { part: [state] }`. Declaring `required` on a switch root or `unchecked` on a thumb says "nothing to draw" once, in the file that owns the component's decisions, instead of leaving a permanent warning. Two of the declarations replaced real work rather than suppressing it: `slider.track` gained a `[data-disabled]` state and the collapsible trigger gained `control.expanded`.
- **tokens** — was 14, then 9, now 0: the adapter carries what the taxonomy reaches, plus `$chromeOnly: ["--warning"]` for the playground chrome the checker cannot see.

Axis siblings (`size=sm` vs `size=lg`) are deliberately *not* flagged: they can never both match. Verified by hand that the sharpening did not soften the gates: declaring a state the anatomy does not have fails, declaring one a role already styles fails, and a same-kind tie (adding `background-color` to both `:hover` and `:focus-visible`) still warns with the resolved winner.

## Limits, honestly

- **15 of 42 namespaces have recipes.** The gap is authoring, not capability: every one of the 42 extracts, and adding a component means writing a recipe (about 15 lines) plus a demo. Menu-family components (dropdown-menu, context-menu, menubar, select) are the largest unsupported group.
- **Prop types stop at the library boundary.** Anything typed through an imported alias or a `WithChild`/`Without` intersection comes through as `unknown`, and the same blind spot is why requiredness is not claimed. The fix is a TypeScript type resolver over the library's shipped `.d.ts` files; guessing would be worse than admitting it.
- **Anatomy drift is caught only when you re-run the extractor.** A real drift gate pins the version and diffs the anatomy in CI.
- **No contrast/a11y audit** over tone × role combinations, no dark adapter, no visual regression.
- **Recipe authoring is still manual.** The agent step (pick a role per part from a closed list) isn't implemented; the taxonomy is small enough that the pipeline could be proven without it.
- `extract-anatomy.mjs` needs the library's `.svelte` sources. bits-ui ships them; a library that ships only compiled output would need a different reader for the props/tag half (the state-module reader would still work).
