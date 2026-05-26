---
'@useplume/core': minor
'@useplume/react': minor
'@useplume/vue': minor
---

Improve embedding and dependency hygiene:

- **tiptap is now a peer dependency.** `@tiptap/core` and `@tiptap/pm` moved from `dependencies` to `peerDependencies` across all packages, so your app and Plume share a single tiptap instance — no duplicate copies, no bundle bloat, and no v2/v3 conflicts. Most package managers install peers automatically.
- **Vue: `v-model:content` support.** The `content` prop is now reactive (covers async/late-loaded data without remounting), and `<PlumeEditor>` emits `update:content`. A new `output` prop (`'html'` | `'json'`, default `'html'`) selects the emitted format. Emissions are debounced by `updateDelay`.
- **`fluid` prop + `--plume-content-padding`.** Pass `fluid` (React & Vue) — or add the `plume--fluid` class — for an edge-to-edge editor that fills its container instead of the centered article column (form/admin layouts). Padding is now driven by the new `--plume-content-padding` variable.
