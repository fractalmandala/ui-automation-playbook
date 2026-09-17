# engine/ — the two projects, in full (single source of truth)

Complete copies of both experiments live here. This is authoritative: the originals in `fractaldev/uiautomation/` and `fractaldev/affedo/` are redundant and can be deleted. Nothing in this folder points back into them.

Everything committed in each project was copied — source, scripts, contracts, authored recipes, generated component library, stylesheets, playground/routes, Tauri shell, configs, docs, and `pnpm-lock.yaml`. **Only reproducible caches were excluded**: `node_modules/`, `.svelte-kit/`, `build/`, `dist/`, `src-tauri/target/`. Reinstall from the preserved lockfiles with `pnpm install` inside either project.

```
engine/
├── uiautomation/     the experiments: pure compiler + 11 gates + real-library extractor + playground
└── affedo/           the formalized system: self-gen 38-component library + cui-lint + multi-theme + Tauri
```

---

## `uiautomation/` — pure compiler + eleven gates + real-library extractor

A pnpm workspace (`pipeline` + `playground`). The sharper half: deterministic compilation against real bits-ui, a logic-free emitter, cascade-as-data, 11 gates. The PLAYBOOK's compiler claims all refer to this code.

Top level: `CORE-IDEA.md` (the original spec), `designsystem.md` / `scaling.md` / `tw-variables.md` / `tw-vars.css` (reference material), `pnpm-workspace.yaml`.

`pipeline/` — the engine:

| Path | Role |
| --- | --- |
| `src/compose.mjs` | the pure compiler core — `planComponent` (lookup) + `render*` (plan→bytes). **No per-component logic.** |
| `src/lib.mjs` | `@generated` banner, byte-compare, stable stringify, `Diagnostics` |
| `scripts/extract-anatomy.mjs` | Stage-1 extractor: three readers (barrel / state-module / part-source) — handles the seven real-library traps |
| `scripts/extract-all.mjs` | whole-library runner (per-namespace isolation) |
| `scripts/gen.mjs` | Stage-5 emitter (`--check` = byte gate, refuses to write) |
| `scripts/check.mjs` | Stage-6 verifier → `report.json` (the eleven gates) |
| `roles.json` | the role taxonomy (full declarations + states + when + behavior) |
| `axes.json` · `vocabulary.json` | axis registry · closed vocabulary + cascade order |
| `tokens/kitui.json` | the token adapter (only file with raw values) |
| `recipes/*.json` (15) | authored recipes (the multiple-choice layer) |
| `schemas/*.json` | JSON-Schema for anatomy / axes / recipe / roles |
| `anatomy/*.json` (42) · `generated/**` (93) · `report.json` | extractor output · emitter output · gate results — **regenerable**, kept so the project runs and inspects without bits-ui installed |

`playground/` — a Vite app that renders the generated components over real bits-ui, driven entirely by `pipeline/generated/plan/*.json`.

Run: `pnpm install` → `pnpm --dir pipeline verify` (extract → gen → check) → `pnpm --dir playground dev`.

---

## `affedo/` — self-authored library + agent-coach linter + multi-theme + Tauri

The product half: a 38-component self-generated Svelte 5 library (does **not** wrap bits-ui), multi-theme tokens, `cui-lint`, and a Tauri desktop shell with playgrounds.

| Path | Role |
| --- | --- |
| `scripts/cui-lint.mjs` | the agent-coach linter entry (`--json`, `--fix`) |
| `scripts/lib/token-linter.mjs` | `cui/token-purity` (hex / px>2 / unmapped / deprecated) |
| `scripts/lib/svelte-ast-linter.mjs` | `no-in-component-styles`, `no-component-restyle`, `strict-props-and-slots` |
| `scripts/lib/fuzzy.mjs` · `scripts/lib/agent-reporter.mjs` | Levenshtein + closest-scale-token · three-part diagnostic formatter |
| `scripts/gen.mjs` + `scripts/generators/wave2\|3\|4.mjs` | the component generators (Waves 1–4, 38 components) |
| `scripts/extract-anatomy.mjs` · `scripts/lint-tokens.mjs` | own-source anatomy extractor · standalone token lint |
| `cui.config.json` | linter config (token sources, dirs, allow/deny props, scales) |
| `roles.sass.json` | affedo's shorthand role map (bg/fg/border/pad…) consumed by the generators |
| `tokens/{createui,neobrutalist}.json` | multi-theme adapters (light/dark inline + whole-theme variant) |
| `recipes/*.json` (38) · `anatomy/*.json` (38) · `schemas/*.json` | authored recipes · committed anatomy contracts cui-lint reads · schemas |
| `src/lib/components/generated/` (39) | **the generated component library** — the shipped output |
| `src/lib/styles/components/` (39) | the indented-Sass stylesheets |
| `src/routes/{generator,playground2}/` | the interactive playgrounds |
| `src-tauri/` (no `target/`) · `static/` · `vite.config.js` · `tsconfig.json` · `docs/` | desktop shell · assets · build config · the project's own architecture/linter/integration docs |

Run the app: `pnpm install` → `pnpm dev` (or `pnpm tauri dev`). Run the linter: `pnpm lint:agent` / `pnpm lint:agent:json` / `node scripts/cui-lint.mjs --fix`.

> When adopting `cui-lint` in a *different* project, copy `scripts/cui-lint.mjs` + `scripts/lib/*`, the two `lint:agent*` `package.json` scripts, and `cui.config.json` — then point `cui.config.json`'s dir paths at that project.

---

## The go-forward move (stated honestly)

These are two separate codebases with two role models. The backlog item in `PLAYBOOK.md §8` — *merge `uiautomation`'s full role/state/when/behavior taxonomy into `affedo`'s multi-theme + generator + linter product* — is real engineering, not a copy. Until then, this folder holds both, side by side, as the one place they live.
