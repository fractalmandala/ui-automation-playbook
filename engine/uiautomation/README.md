# uiautomation

- **[CORE-IDEA.md](./CORE-IDEA.md)** — the spec: replace LLM-authored CSS with a deterministic compiler fed by multiple-choice role assignment against a closed vocabulary.
- **[designsystem.md](./designsystem.md)**, **[scaling.md](./scaling.md)**, **[tw-variables.md](./tw-variables.md)** — reference material: a zero-to-one design system guide, a tokens-at-scale guide with motion tokens, and the Tailwind v4 default theme.
- **`kitui-v*.jpg`**, **`Screenshot *.png`** — 157 frames of reference UI (five sequences, `v1`–`v4` and `v6`; there is no `v5`). These are the visual target for the token adapter.
- **[`pipeline/`](./pipeline/README.md)** — the working prototype: anatomy extraction from real bits-ui (all 42 namespaces), the semantic role taxonomy, the pure emitter, and eleven verification gates.
- **[`playground/`](./playground/README.md)** — a Vite app with a sidebar of every generated component: live demos, the resolved plan, the emitted Sass, the gate findings and live token overrides.

```bash
pnpm install                              # workspace root: pipeline + playground
pnpm --dir pipeline verify                # extract all anatomies -> gen -> check
pnpm --dir playground dev                 # http://127.0.0.1:5273
```

Current run: **42 anatomies, 15 generated components, 93 generated files, 0 errors and 0 warnings** across the eleven gates.

Start with `pipeline/README.md` — in particular the section on what the real library taught the extractor, since that is where the spec and reality diverge most. The seven numbered findings there are the substance: a template-only reader returns a confident, empty answer, and every one of those divergences was a silent bug until the real library refuted it.
