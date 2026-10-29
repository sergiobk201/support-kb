// The problems inside one merged ticket. causes.ts knows two causes and files every report under one
// of them. Reports the desk read as a one-day move (desk-notes.json) are a third problem: the date
// keeps its month and loses a day, which no day/month swap can do. They come out first; the rest go
// by causeOf, as on the ticket's own page.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type ProblemKey = 'parser' | 'hint' | 'one-day' | 'unplaced';

export type Problem = {
  key: ProblemKey;
  reports: Report[];
  tenants: string[];
  forms: string[];
  channels: string[];
  firstSeen: string;
  lastSeen: string;
};

const sorted = (xs: (string | undefined)[]): string[] => [...new Set(xs.filter((x): x is string => !!x))].sort();

export function problemsIn(
  all: Report[],
  ticket: number,
  oneDay: readonly string[],
  tenantOf: (r: Report) => Tenant | undefined,
): Problem[] {
  const byKey = new Map<ProblemKey, Report[]>();
  for (const r of uniqueById(all)) {
    if (r.mergedInto !== ticket) continue;
    const key: ProblemKey = oneDay.includes(r.id) ? 'one-day' : (causeOf(r, tenantOf(r)) ?? 'unplaced');
    byKey.set(key, [...(byKey.get(key) ?? []), r]);
  }
  return [...byKey.entries()]
    .map(([key, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        key,
        reports: rs,
        tenants: sorted(rs.map((r) => r.tenant)),
        forms: sorted(rs.map((r) => tenantOf(r)?.form)),
        channels: sorted(rs.map((r) => r.channel)),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}

// Subject lines under more than one problem, normalized the way decision 0001 matches them
// (lowercase, no punctuation): why a merge on subject took every problem into one ticket.
export function sharedSubjects(problems: Problem[]): { subjects: number; shared: number } {
  const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
  const keysBySubject = new Map<string, Set<ProblemKey>>();
  for (const p of problems) {
    for (const r of p.reports) {
      const s = norm(r.subject);
      keysBySubject.set(s, (keysBySubject.get(s) ?? new Set<ProblemKey>()).add(p.key));
    }
  }
  return { subjects: keysBySubject.size, shared: [...keysBySubject.values()].filter((k) => k.size > 1).length };
}
