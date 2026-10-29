<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemsIn, sharedSubjects, type Problem, type ProblemKey } from '#lib/kb/problems';

  // One row per problem inside a merged ticket (problems.ts), each with the ticket filed for it.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<ProblemKey, string>> } = $props();

  const problems = $derived(problemsIn(reports as Report[], ticket, notes.oneDayMove, tenantOf));
  const total = $derived(problems.reduce((n, p) => n + p.reports.length, 0));
  const subjects = $derived(sharedSubjects(problems));

  // Name the tenants when there are few, count them when there are many.
  const via = (p: Problem) =>
    [p.tenants.length <= 5 ? p.tenants.join(', ') : `${p.tenants.length} tenants`, p.forms.join(', '), p.channels.join(', ')].join(' · ');
  const issueLabel = (url: string) => url.replace(/^.*\/issues\//, 'issue #');
</script>

<p class="sum">
  <strong>{total}</strong> reports merged into #{ticket} ·
  <strong>{problems.length}</strong>
  {problems.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>comes through</th><th>seen</th><th>ticket</th></tr>
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
      </tr>
    {/each}
  </tbody>
</table>

<p class="note">
  {subjects.subjects} subject lines across these reports; {subjects.shared} of them turn up under more than one problem.
</p>

<style>
  .sum { font-size: 1.1rem; }
  .via { color: var(--muted); font-size: 0.85em; }
  .none { color: var(--warn); font-weight: 600; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
