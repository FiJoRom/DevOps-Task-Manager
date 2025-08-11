import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('dummy API in tasks.ts', () => {
  it('apiCreateTask + apiListTasks', async () => {
    const { apiCreateTask, apiListTasks, idFromTitle } = await import('./tasks');

    const pCreated = apiCreateTask({
      title: 'New Task',
      points: 2,
      status: 'todo',
      due: null,
      labels: [],
    });
    await vi.advanceTimersByTimeAsync(300);
    const created = await pCreated;

    expect(created.id).toBe(idFromTitle('New Task'));

    const pList = apiListTasks();
    await vi.advanceTimersByTimeAsync(300);
    const list = await pList;

    expect(list[0].id).toBe(created.id); // neueste oben
  });

  it('apiUpdateStatus führt State-Maschine aus', async () => {
    const { apiCreateTask, apiUpdateStatus } = await import('./tasks');

    const pCreated = apiCreateTask({ title: 'Flow', points: 1, status: 'todo', due: null, labels: [] });
    await vi.advanceTimersByTimeAsync(300);
    const t = await pCreated;

    const pStart = apiUpdateStatus(t.id, 'start');
    await vi.advanceTimersByTimeAsync(200);
    const started = await pStart;
    expect(started.status).toBe('in_progress');

    const pFinish = apiUpdateStatus(t.id, 'finish');
    await vi.advanceTimersByTimeAsync(200);
    const done = await pFinish;
    expect(done.status).toBe('done');
  });

  it('apiAssignSprint respektiert Kapazität', async () => {
    const { apiCreateTask, apiAssignSprint } = await import('./tasks');

    // drei Tasks anlegen
    for (const [title, pts] of [['A', 5], ['B', 3], ['C', 8]] as const) {
      const p = apiCreateTask({ title, points: pts, status: 'todo', due: null, labels: [] });
      await vi.advanceTimersByTimeAsync(300);
      await p;
    }

    const pRes = apiAssignSprint(8);
    await vi.advanceTimersByTimeAsync(300);
    const res = await pRes;

    // Summe der ausgewählten Punkte ≤ 8
    const { apiListTasks } = await import('./tasks');
    const pList = apiListTasks();
    await vi.advanceTimersByTimeAsync(300);
    const list = await pList;

    const sum = res.selected
      .map(id => list.find(t => t.id === id)!)
      .reduce((s, t) => s + t.points, 0);

    expect(sum).toBeLessThanOrEqual(8);
  });
});
