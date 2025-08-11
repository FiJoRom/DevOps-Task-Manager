export type Status = 'todo' | 'in_progress' | 'blocked' | 'done';

export interface Task {
  id: string;
  title: string;
  points: number;         // 1–13
  due?: string | null;    // ISO-Date
  status: Status;
  labels?: string[];      // z.B. ['bug','urgent']
  blockedBy?: string[];   // Task-IDs
}

function isIsoDate(s: string) {
  return /^\d{4}-\d{2}-\d{2}/.test(s);
}

export function validateTask(t: Task): void {
  if (!t || typeof t !== 'object') throw new Error('Task missing');
  if (!t.id || !t.title) throw new Error('id/title missing');
  if (!Number.isFinite(t.points) || t.points < 0) throw new Error('invalid points');
  if (t.due != null && typeof t.due === 'string' && !isIsoDate(t.due)) {
    throw new Error('invalid due');
  }
  const valid: Status[] = ['todo', 'in_progress', 'blocked', 'done'];
  if (!valid.includes(t.status)) throw new Error('invalid status');
}

/**
 * priority 0..100:
 *  - overdue boost
 *  - due soon boost
 *  - urgent/bug labels
 *  - blocked penalty
 *  - done -> 0
 *  - normalize by points (kleiner = schneller = etwas höher)
 */
export function computePriority(task: Task, now = new Date()): number {
  validateTask(task);

  if (task.status === 'done') return 0;

  let score = 10;

  // Labels
  const labels = new Set((task.labels ?? []).map((l) => l.toLowerCase()));
  if (labels.has('urgent')) score += 25;
  if (labels.has('bug')) score += 15;
  if (labels.has('chore')) score -= 5;

  // Due-Date Logik
  if (task.due) {
    const due = new Date(task.due);
    const diffDays = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) score += 30;               // overdue
    else if (diffDays <= 2) score += 20;         // sehr bald
    else if (diffDays <= 7) score += 10;         // bald
    else score += 0;                              // später
  } else {
    score -= 3; // ohne due leicht weniger dringend
  }

  // Blocked?
  if ((task.blockedBy?.length ?? 0) > 0 || task.status === 'blocked') {
    score -= 20;
  }

  // Punkte (kleine Tasks etwas bevorzugen)
  if (task.points <= 2) score += 8;
  else if (task.points <= 5) score += 4;
  else if (task.points >= 13) score -= 5;

  // Clamp
  if (score < 0) return 0;
  if (score > 100) return 100;
  return Math.round(score);
}

/** einfacher Statusautomat */
export function nextStatus(current: Status, action: 'start' | 'block' | 'unblock' | 'finish'): Status {
  switch (action) {
    case 'start':
      return current === 'done' ? 'done' : 'in_progress';
    case 'block':
      return current === 'done' ? 'done' : 'blocked';
    case 'unblock':
      return current === 'done' ? 'done' : 'todo';
    case 'finish':
      return 'done';
    default:
      // exhaustive check
      throw new Error('unknown action');
  }
}

export interface Progress {
  total: number;
  done: number;
  inProgress: number;
  blocked: number;
  todo: number;
  overdue: number;
  completionPct: number; // 0..100
}

export function progressSummary(tasks: Task[], now = new Date()): Progress {
  let done = 0, inProgress = 0, blocked = 0, todo = 0, overdue = 0;
  for (const t of tasks) {
    validateTask(t);
    if (t.status === 'done') done++;
    else if (t.status === 'in_progress') inProgress++;
    else if (t.status === 'blocked') blocked++;
    else todo++;

    if (t.due && new Date(t.due).getTime() < now.getTime() && t.status !== 'done') overdue++;
  }
  const total = tasks.length;
  const completionPct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, inProgress, blocked, todo, overdue, completionPct };
}

/**
 * Greedy Sprint-Zuteilung: sortiere nach Priority, lege bis Kapazität (Summe points) voll.
 * Gibt [selectedIDs, remainingIDs] zurück.
 */
export function assignToSprint(tasks: Task[], capacity: number, now = new Date()): { selected: string[]; remaining: string[] } {
  if (!Number.isFinite(capacity) || capacity < 0) throw new Error('invalid capacity');
  const validTasks = tasks.filter((t) => {
    try { validateTask(t); return t.status !== 'done'; } catch { return false; }
  });

  // sort by priority DESC, tie-breaker: geringere points, dann due früher, dann id
  const sorted = [...validTasks].sort((a, b) => {
    const pa = computePriority(a, now);
    const pb = computePriority(b, now);
    if (pb !== pa) return pb - pa;
    if (a.points !== b.points) return a.points - b.points;
    const ad = a.due ? new Date(a.due).getTime() : Infinity;
    const bd = b.due ? new Date(b.due).getTime() : Infinity;
    if (ad !== bd) return ad - bd;
    return a.id.localeCompare(b.id);
  });

  const selected: string[] = [];
  let used = 0;
  for (const t of sorted) {
    if (used + t.points <= capacity) {
      selected.push(t.id);
      used += t.points;
    }
  }
  const selectedSet = new Set(selected);
  const remaining = validTasks.map(t => t.id).filter(id => !selectedSet.has(id));
  return { selected, remaining };
}

// kleiner deterministischer Hash für IDs aus Titel (für Spielzwecke/Coverage)
export function idFromTitle(title: string): string {
  if (!title) return 't_0';
  let h = 17;
  for (let i = 0; i < title.length; i++) {
    h = (h * 31 + title.charCodeAt(i)) >>> 0;
    if (h % 11 === 0) h ^= 0x5a5a; // Dummy-Branch
  }
  return 't_' + (h % 100000);
}
