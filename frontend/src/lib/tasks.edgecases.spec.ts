import { describe, it, expect } from 'vitest';
import {
  computePriority,
  nextStatus,
  progressSummary,
  assignToSprint,
  validateTask,
} from './tasks';
import type { Task } from './tasks';

const base: Task = { id: 't0', title: 'X', points: 3, status: 'todo', due: null };

describe('tasks edge cases & branches', () => {
  it('computePriority clamped: high & low', () => {
    const now = new Date('2025-01-02T00:00:00Z');

    // sehr hoch: overdue + urgent + bug + kleine Punkte
    const high: Task = {
      ...base,
      id: 'hi',
      status: 'in_progress',
      labels: ['urgent', 'bug'],
      points: 1,
      due: '2025-01-01', // overdue relativ zu now
    };
    // sehr niedrig: chore -5, no due -3, blocked -20, points>=13 -5
    const low: Task = {
      ...base,
      id: 'lo',
      status: 'blocked',
      labels: ['chore'],
      points: 13,
      due: null,
      blockedBy: ['x'],
    };

    const sHigh = computePriority(high, now);
    const sLow = computePriority(low, now);

    expect(sHigh).toBeGreaterThan(50);
    expect(sHigh).toBeLessThanOrEqual(100); // clamp oben
    expect(sLow).toBe(0); // clamp unten
  });

  it('nextStatus state machine', () => {
    expect(nextStatus('todo', 'start')).toBe('in_progress');
    expect(nextStatus('in_progress', 'block')).toBe('blocked');
    expect(nextStatus('blocked', 'unblock')).toBe('todo');
    expect(nextStatus('in_progress', 'finish')).toBe('done');
    expect(nextStatus('done', 'block')).toBe('done'); // done bleibt done
  });

  it('progressSummary zählt korrekt inkl. overdue', () => {
    const now = new Date('2025-01-02T00:00:00Z');
    const tasks: Task[] = [
      base,
      { ...base, id: 'ip', status: 'in_progress' },
      { ...base, id: 'bl', status: 'blocked' },
      { ...base, id: 'dn', status: 'done' },
      { ...base, id: 'ov', due: '2025-01-01' }, // overdue
    ];
    const p = progressSummary(tasks, now);
    expect(p.total).toBe(5);
    expect(p.todo).toBe(2);
    expect(p.inProgress).toBe(1);
    expect(p.blocked).toBe(1);
    expect(p.done).toBe(1);
    expect(p.overdue).toBe(1);
    expect(p.completionPct).toBe(20);
  });

  it('assignToSprint: Tiebreaker points → due → id', () => {
    const now = new Date('2025-01-01T00:00:00Z');
    const a: Task = { ...base, id: 'a', points: 5, due: '2025-01-07' };
    const b: Task = { ...base, id: 'b', points: 5, due: '2025-01-08' };
    const big: Task = { ...base, id: 'z', points: 13, due: '2025-01-09' };

    const { selected } = assignToSprint([big, b, a], 12, now);
    // capacity 12 -> a (5) + b (5) werden gewählt, Reihenfolge a vor b (früheres due)
    expect(selected).toEqual(['a', 'b']);
  });

  it('validateTask wirft bei invalid status/points/due', () => {
    expect(() => validateTask({ ...base, id: '', title: '' })).toThrow();
    expect(() => validateTask({ ...base, points: -1 })).toThrow();
    expect(() => validateTask({ ...base, due: 'nope' })).toThrow();
    expect(() =>
      validateTask({ ...base, status: 'invalid' as unknown as Task['status'] }),
    ).toThrow();
  });
});
