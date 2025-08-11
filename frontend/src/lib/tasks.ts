// src/lib/tasks.ts
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

/** priority 0..100 */
export function computePriority(task: Task, now = new Date()): number {
  validateTask(task);
  if (task.status === 'done') return 0;

  let score = 10;

  // Labels
  const labels = new Set((task.labels ?? []).map((l) => l.toLowerCase()));
  if (labels.has('urgent')) score += 25;
  if (labels.has('bug')) score += 15;
  if (labels.has('chore')) score -= 5;

  // Due
  if (task.due) {
    const due = new Date(task.due);
    const diffDays = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) score += 30;
    else if (diffDays <= 2) score += 20;
    else if (diffDays <= 7) score += 10;
  } else {
    score -= 3;
  }

  // Blocked?
  if ((task.blockedBy?.length ?? 0) > 0 || task.status === 'blocked') {
    score -= 20;
  }

  // Punkte
  if (task.points <= 2) score += 8;
  else if (task.points <= 5) score += 4;
  else if (task.points >= 13) score -= 5;

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

/** Greedy Sprint-Zuteilung */
export function assignToSprint(tasks: Task[], capacity: number, now = new Date()): { selected: string[]; remaining: string[] } {
  if (!Number.isFinite(capacity) || capacity < 0) throw new Error('invalid capacity');
  const validTasks = tasks.filter((t) => {
    try { validateTask(t); return t.status !== 'done'; } catch { return false; }
  });

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

// deterministischer Hash
export function idFromTitle(title: string): string {
  if (!title) return 't_0';
  let h = 17;
  for (let i = 0; i < title.length; i++) {
    h = (h * 31 + title.charCodeAt(i)) >>> 0;
    if (h % 11 === 0) h ^= 0x5a5a;
  }
  return 't_' + (h % 100000);
}

/* ----------------------- Dummy-Daten + Fake-API ----------------------- */

const LS_KEY = 'dummy_tasks_v1';

function seed(): Task[] {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const plus = (days: number) => {
    const dd = new Date(today);
    dd.setDate(dd.getDate() + days);
    return iso(dd);
  };

  const tasks: Task[] = [
    { id: idFromTitle('Login Bug'), title: 'Login Bug', points: 3, due: plus(1), status: 'in_progress', labels: ['bug','urgent'] },
    { id: idFromTitle('Dokumentation Update'), title: 'Dokumentation Update', points: 2, due: null, status: 'todo', labels: ['chore'] },
    { id: idFromTitle('CI Fix'), title: 'CI Fix', points: 5, due: plus(-1), status: 'blocked', labels: ['bug'], blockedBy: ['t_99999'] },
    { id: idFromTitle('Feature: Boards'), title: 'Feature: Boards', points: 8, due: plus(6), status: 'todo' },
    { id: idFromTitle('Refactor Utils'), title: 'Refactor Utils', points: 1, due: plus(14), status: 'done' },
  ];
  return tasks;
}

function load(): Task[] {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return seed();
  try {
    const arr = JSON.parse(raw) as Task[];
    arr.forEach(validateTask);
    return arr;
  } catch {
    return seed();
  }
}
function save(arr: Task[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}

let db: Task[] = load();

function delay<T>(val: T, ms = 300): Promise<T> {
  return new Promise(res => setTimeout(() => res(val), ms));
}

export async function apiListTasks(): Promise<Task[]> {
  return delay([...db]);
}

export async function apiCreateTask(input: Omit<Task, 'id'> & { id?: string }): Promise<Task> {
  const t: Task = { ...input, id: input.id ?? idFromTitle(input.title) };
  validateTask(t);
  db = [t, ...db];
  save(db);
  return delay(t, 250);
}

export async function apiUpdateStatus(id: string, action: 'start' | 'block' | 'unblock' | 'finish'): Promise<Task> {
  const idx = db.findIndex(t => t.id === id);
  if (idx < 0) throw new Error('not found');
  const next = { ...db[idx], status: nextStatus(db[idx].status, action) };
  validateTask(next);
  db = [...db.slice(0, idx), next, ...db.slice(idx + 1)];
  save(db);
  return delay(next, 200);
}

export async function apiAssignSprint(capacity: number): Promise<{ selected: string[]; remaining: string[] }> {
  const res = assignToSprint(db, capacity);
  return delay(res, 300);
}
