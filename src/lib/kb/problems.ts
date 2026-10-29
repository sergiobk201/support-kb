// The problems inside one merged ticket, counted the desk's way: every report where the ticket's
// cause table files it (groupByCause, causes.ts). Reports the desk read as a one-day move
// (desk-notes.json) are a problem of their own: the date keeps its month and loses a day, which no
// day/month swap can do. The desk still files them under their tenant's cause, so they count there too.
import { causeOf, groupByCause, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type ProblemKey = 'parser' | 'hint' | 'unplaced' | 'one-day';

export type Problem = {
  key: ProblemKey;
  reports: Report[];
  // One-day only: the causes its reports are filed (and counted) under.
  filedUnder: string[];
  tenants: string[];
  forms: string[];
  channels: string[];
  firstSeen: string;
  lastSeen: string;
};

type TenantOf = (r: Report) => Tenant | undefined;

const sorted = (xs: (string | undefined)[]): string[] => [...new Set(xs.filter((x): x is string => !!x))].sort();

function describe(key: ProblemKey, rs: Report[], tenantOf: TenantOf, filedUnder: string[] = []): Problem {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    key,
    reports: rs,
    filedUnder,
    tenants: sorted(rs.map((r) => r.tenant)),
    forms: sorted(rs.map((r) => tenantOf(r)?.form)),
    channels: sorted(rs.map((r) => r.channel)),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

// One report per id, as the ticket's own page keeps them.
export function mergedInto(all: Report[], ticket: number): Report[] {
  return uniqueById(all).filter((r) => r.mergedInto === ticket);
}

export function problemsIn(merged: Report[], oneDay: readonly string[], tenantOf: TenantOf): Problem[] {
  const rows = groupByCause(merged, tenantOf).map((g) => describe(g.cause, g.reports, tenantOf));
  const moved = merged.filter((r) => oneDay.includes(r.id));
  if (moved.length > 0) {
    rows.push(describe('one-day', moved, tenantOf, sorted(moved.map((r) => causeOf(r, tenantOf(r)) ?? 'unplaced'))));
  }
  return rows;
}

// Subject lines under more than one problem, normalized the way decision 0001 matches them
// (lowercase, no punctuation): why a merge on subject took every problem into one ticket.
// Each report counts once here: one-day first, every other report by its cause.
export function sharedSubjects(merged: Report[], oneDay: readonly string[], tenantOf: TenantOf): { subjects: number; shared: number } {
  const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
  const keysBySubject = new Map<string, Set<string>>();
  for (const r of merged) {
    const key = oneDay.includes(r.id) ? 'one-day' : (causeOf(r, tenantOf(r)) ?? 'unplaced');
    const s = norm(r.subject);
    keysBySubject.set(s, (keysBySubject.get(s) ?? new Set<string>()).add(key));
  }
  return { subjects: keysBySubject.size, shared: [...keysBySubject.values()].filter((k) => k.size > 1).length };
}
