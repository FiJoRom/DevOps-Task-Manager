import { describe, it, expect } from 'vitest';
import { computePriority, progressSummary, assignToSprint, idFromTitle, validateTask } from './tasks';
import type { Task } from './tasks';

const base: Task = {
  id: 't_1',
  title: 'Test',
  points: 3,
  status: 'todo',
  due: null,
};

describe('tasks utils', () => {
  it('computePriority: urgent/bug erhöhen Score, done = 0', () => {
    expect(computePriority({ ...base, labels: ['urgent','bug'] })).toBeGreaterThan(10);
    expect(computePriority({ ...base, status: 'done' })).toBe(0);
  });

  it('progressSummary zählt Stati korrekt', () => {
    const tasks: Task[] = [
      base,
      { ...base, id: 't_2', status: 'in_progress' },
      { ...base, id: 't_3', status: 'blocked' },
      { ...base, id: 't_4', status: 'done' },
    ];
    const p = progressSummary(tasks);
    expect(p.total).toBe(4);
    expect(p.done).toBe(1);
    expect(p.inProgress).toBe(1);
    expect(p.blocked).toBe(1);
    expect(p.todo).toBe(1);
  });

  it('assignToSprint respektiert Kapazität', () => {
    const tasks: Task[] = [
      { ...base, id: 'a', points: 8 },
      { ...base, id: 'b', points: 5 },
      { ...base, id: 'c', points: 3 },
    ];
    const { selected } = assignToSprint(tasks, 10);
    // z.B. 8er passt rein, 5er nicht mehr
    expect(selected.reduce((s, id) => s + tasks.find(t => t.id === id)!.points, 0)).toBeLessThanOrEqual(10);
  });

  it('idFromTitle ist deterministisch', () => {
    expect(idFromTitle('Hello')).toBe(idFromTitle('Hello'));
  });

  it('validateTask wirft bei invalid points', () => {
    expect(() => validateTask({ ...base, points: -1 })).toThrow();
  });
});
