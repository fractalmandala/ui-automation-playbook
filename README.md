# UI Compiler Playbook

**This folder is the single source of truth.** It holds both experiments in full — the complete, runnable code of each — under [`engine/`](./engine/), plus a distilled write-up on top. The original `fractaldev/uiautomation/` and `fractaldev/affedo/` folders are now redundant and can be deleted; nothing here points back into them.

The two halves:

- **`engine/uiautomation/`** — the experiments. Proved the core thesis end-to-end against a *real* third-party headless library (bits-ui 2.19.2): a deterministic compiler + a closed vocabulary + an eleven-gate verifier, with a live playground. Current run: **42 anatomies extracted, 15 components generated, 93 files, 0 errors / 0 warnings.**
- **`engine/affedo/`** — the formalized system. Took the thesis into a shipping product: a **38-component self-authored Svelte 5 library** (components + stylesheets + routes + Tauri shell), multi-theme tokens (light / dark / neo-brutalist / terminal), and **`cui-lint`** — an *agent-first* contract verifier that coaches LLMs with prescriptive fixes instead of compiler errors. Baseline: **0 violations, `check` clean, build 2.3s.**

The write-up (this README, `PLAYBOOK.md`, `REPLICATION.md`, `canonical/`) does not restate either project's own README — it captures the **thesis, what each half proved, and the steps to stand this up on a new project.**

## The one-sentence thesis

> LLMs hallucinate CSS but excel at discrete classification — so make the code emitter a **pure deterministic compiler**, restrict the agent to **multiple-choice role assignment against a closed vocabulary**, and make "zero-bloat / on-system" a **gate**, not a promise.

Everything else is mechanism for keeping those three properties true.

## Layout

| Path | What it is |
| --- | --- |
| [`PLAYBOOK.md`](./PLAYBOOK.md) | The detailed document: the inversion-of-control architecture, the two lineages, the seven things real bits-ui taught the extractor, the gate catalog, the agent-coach linter, the consolidated takeaways, and the go-forward backlog. |
| [`REPLICATION.md`](./REPLICATION.md) | Zero-to-one steps to reproduce the pipeline on a new project, in the order that keeps each property enforceable. |
| [`canonical/gates.md`](./canonical/gates.md) | The eleven verification gates, each with what it proves and how it fails loudly. |
| [`canonical/cui-lint-rules.md`](./canonical/cui-lint-rules.md) | The four agent-coach lint rules + the three-part diagnostic format that makes them agent-legible. |
| [`engine/`](./engine/) | **The working code** — both projects in full ([`engine/README.md`](./engine/README.md) maps every file). |

The write-up references the code by its real path in `engine/`; it does not keep its own copies of the contract files, so there is nothing to drift.

## Where the code is (all under [`engine/`](./engine/))

- Pure compiler core: [`engine/uiautomation/pipeline/src/compose.mjs`](./engine/uiautomation/pipeline/src/compose.mjs) (`planComponent`, `render*`) + `src/lib.mjs`
- Deterministic extractor (three readers: barrel / state-module / part-source): [`engine/uiautomation/pipeline/scripts/extract-anatomy.mjs`](./engine/uiautomation/pipeline/scripts/extract-anatomy.mjs)
- Eleven-gate verifier: [`engine/uiautomation/pipeline/scripts/check.mjs`](./engine/uiautomation/pipeline/scripts/check.mjs)
- The contracts: [`vocabulary.json`](./engine/uiautomation/pipeline/vocabulary.json) · [`axes.json`](./engine/uiautomation/pipeline/axes.json) · [`roles.json`](./engine/uiautomation/pipeline/roles.json) · [`schemas/`](./engine/uiautomation/pipeline/schemas/) · token adapter [`tokens/kitui.json`](./engine/uiautomation/pipeline/tokens/kitui.json)
- Live playground: [`engine/uiautomation/playground/`](./engine/uiautomation/playground/)
- Agent-coach linter engine: [`engine/affedo/scripts/lib/`](./engine/affedo/scripts/lib/)`{token-linter,svelte-ast-linter,fuzzy,agent-reporter}.mjs` + `scripts/cui-lint.mjs`
- Component generators (38 components, Waves 1–4): [`engine/affedo/scripts/generators/`](./engine/affedo/scripts/generators/)
- The generated library it produces: [`engine/affedo/src/lib/components/generated/`](./engine/affedo/src/lib/components/generated/) + stylesheets in `src/lib/styles/components/`
- Multi-theme token adapters: [`engine/affedo/tokens/`](./engine/affedo/tokens/)`{createui,neobrutalist}.json`
