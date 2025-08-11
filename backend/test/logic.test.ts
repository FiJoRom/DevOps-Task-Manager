import { computePriority, nextStatus, progressSummary, assignToSprint, idFromTitle, type Task } from '../src/services/logic';

const now = new Date('2025-08-10'); // fixer "now" für stabile Tests

function t(partial: Partial<Task>): Task {
  return {
    id: partial.id ?? 'X',
    title: partial.title ?? 'Demo',
    points: partial.points ?? 3,
    status: partial.status ?? 'todo',
    due: partial.due ?? null,
    labels: partial.labels ?? [],
    blockedBy: partial.blockedBy ?? [],
  };
}

describe('computePriority', () => {
  it('done -> 0', () => {
    expect(computePriority(t({ status: 'done' }), now)).toBe(0);
  });

  it('urgent/bug boost, blocked penalty, due branches', () => {
    const overdue = t({ labels: ['urgent','bug'], due: '2025-08-01', blockedBy: ['a'] });
    const soon = t({ due: '2025-08-11' });
    const later = t({ due: '2025-08-25', labels: ['chore'], points: 8 });

    const a = computePriority(overdue, now);
    const b = computePriority(soon, now);
    const c = computePriority(later, now);

    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(c);
  });

  it('small tasks get slight boost; clamped 0..100', () => {
    const small = t({ points: 1, labels: ['urgent'], due: '2025-08-11' });
    const bigBlocked = t({ points: 13, status: 'blocked', labels: [], due: null });
    const p1 = computePriority(small, now);
    const p2 = computePriority(bigBlocked, now);
    expect(p1).toBeGreaterThan(p2);
    expect(p1).toBeGreaterThanOrEqual(0);
    expect(p1).toBeLessThanOrEqual(100);
  });

  it('validates input', () => {
    expect(() => computePriority({} as any, now)).toThrow();
    expect(() => computePriority(t({ points: -1 }), now)).toThrow();
    expect(() => computePriority(t({ due: 'invalid-date' }), now)).toThrow();
  });
});

describe('nextStatus', () => {
  it('transitions', () => {
    expect(nextStatus('todo', 'start')).toBe('in_progress');
    expect(nextStatus('in_progress', 'block')).toBe('blocked');
    expect(nextStatus('blocked', 'unblock')).toBe('todo');
    expect(nextStatus('todo', 'finish')).toBe('done');
    expect(nextStatus('done', 'block')).toBe('done');
  });
});

describe('progressSummary', () => {
  it('counts correctly incl. overdue', () => {
    const tasks: Task[] = [
      t({ id: '1', status: 'done', due: '2025-08-05' }),
      t({ id: '2', status: 'todo', due: '2025-08-09' }), // overdue
      t({ id: '3', status: 'in_progress', due: '2025-08-12' }),
      t({ id: '4', status: 'blocked' }),
    ];
    const p = progressSummary(tasks, now);
    expect(p.total).toBe(4);
    expect(p.done).toBe(1);
    expect(p.inProgress).toBe(1);
    expect(p.blocked).toBe(1);
    expect(p.todo).toBe(1);
    expect(p.overdue).toBe(1);
    expect(p.completionPct).toBe(25);
  });
});

describe('assignToSprint', () => {
  it('selects by priority until capacity', () => {
    const tasks: Task[] = [
      t({ id: 'A', labels: ['urgent'], points: 3, due: '2025-08-11' }),
      t({ id: 'B', points: 8, due: '2025-08-25' }),
      t({ id: 'C', points: 2, due: '2025-08-12' }),
      t({ id: 'D', status: 'done', points: 5 }),
    ];
    const { selected, remaining } = assignToSprint(tasks, 5, now);
    expect(selected).toContain('A'); // urgent + soon
    // 5 Punkte Kapazität -> A(3) + C(2) wahrscheinlich
    expect(selected.length).toBeLessThanOrEqual(3);
    expect(remaining).toContain('B');
    expect(remaining).not.toContain('D'); // done wird ignoriert
  });

  it('validates capacity', () => {
    expect(() => assignToSprint([], -1, now)).toThrow();
  });
});

describe('idFromTitle', () => {
  it('deterministic small hash', () => {
    const a = idFromTitle('Implement Login');
    const b = idFromTitle('Implement Login');
    const c = idFromTitle('Other');
    expect(a).toBe(b);
    expect(a).toMatch(/^t_\d+$/);
    expect(a).not.toBe(c);
  });
});
