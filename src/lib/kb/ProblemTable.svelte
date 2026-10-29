<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { mergedInto, problemsIn, sharedSubjects, type Problem, type ProblemKey } from '#lib/kb/problems';

  // One row per problem inside a merged ticket, counted the desk's way (problems.ts), with the
  // ticket filed for it and how that ticket ended.
  let {
    ticket,
    tickets = {},
    outcome = {},
  }: {
    ticket: number;
    tickets?: Partial<Record<ProblemKey, string>>;
    outcome?: Partial<Record<ProblemKey, string>>;
  } = $props();

  const merged = $derived(mergedInto(reports as Report[], ticket));
  const problems = $derived(problemsIn(merged, notes.oneDayMove, tenantOf));
  const subjects = $derived(sharedSubjects(merged, notes.oneDayMove, tenantOf));

  // Name the tenants when there are few, count them when there are many.
  const via = (p: Problem) =>
    [p.tenants.length <= 5 ? p.tenants.join(', ') : `${p.tenants.length} tenants`, p.forms.join(', '), p.channels.join(', ')].join(' · ');
  const issueLabel = (url: string) => url.replace(/^.*\/issues\//, 'issue #');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{problems.length}</strong>
  {problems.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>comes through</th><th>seen</th><th>ticket</th><th>outcome</th></tr>
  </thead>
  <tbody>
    {#each problems as p (p.key)}
      {@const url = tickets[p.key]}
      <tr>
        <td><code>{p.key}</code></td>
        <td>{p.reports.length}</td>
        <td class="via">{via(p)}</td>
        <td>{p.firstSeen} → {p.lastSeen}</td>
        <td>
          {#if url}
            <a href={url}>{issueLabel(url)}</a>
          {:else}
            <span class="none">no ticket yet</span>
          {/if}
        </td>
        <td>{outcome[p.key] ?? 'open'}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each problems as p (p.key)}
  {#if p.filedUnder.length}
    <p class="note">
      The desk files the {p.reports.length} <code>{p.key}</code> reports under <code>{p.filedUnder.join(', ')}</code>
      by tenant, so they count there too. Each report counts once in the {merged.length} above.
    </p>
  {/if}
{/each}

<p class="note">
  {subjects.subjects} subject lines across these reports; {subjects.shared} of them turn up under more than one problem.
</p>

<style>
  .sum { font-size: 1.1rem; }
  .via { color: var(--muted); font-size: 0.85em; }
  .none { color: var(--warn); font-weight: 600; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
