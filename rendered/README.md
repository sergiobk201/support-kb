# rendered

The kb pages as the desk sees them: rendered from `src/` by the kb's own layout and components, not retyped.

| page | source | as the desk sees it |
| --- | --- | --- |
| #4471 · split by problem | [`src/routes/kb/incidents/4471/problems/+page.svx`](../src/routes/kb/incidents/4471/problems/+page.svx) | [`kb/incidents/4471/problems/index.html`](kb/incidents/4471/problems/index.html) · [screenshot](kb/incidents/4471/problems/index.png) |

How it was rendered: Vite 7.3.7 in SSR mode with `@sveltejs/vite-plugin-svelte` 6.2.4, mdsvex 0.12.8
(layout `runbook` → `src/lib/layouts/runbook.svelte`, `#lib` → `src/lib`) and Svelte 5.57.2 `render()`.
Component CSS is injected into the page, so the HTML file stands alone. Rendered 2026-10-29 on
Node 22.22.3 with full ICU 78.3. The numbers come from `src/lib/data` at render time: render again to refresh them.
