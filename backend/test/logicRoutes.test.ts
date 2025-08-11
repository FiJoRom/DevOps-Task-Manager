import app from '../src/server';

describe('task-manager routes', () => {
  afterAll(async () => {
    await app.close();
  });

  it('POST /api/task/priority', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/task/priority',
      payload: {
        id: 'A',
        title: 'Fix bug',
        points: 3,
        status: 'todo',
        labels: ['bug', 'urgent'],
        due: '2025-08-12'
      }
    });
    expect(res.statusCode).toBe(200);
    expect(typeof res.json().priority).toBe('number');
  });

  it('POST /api/task/next-status', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/task/next-status',
      payload: { current: 'todo', action: 'start' }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().next).toBe('in_progress');
  });

  it('POST /api/tasks/summary', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/tasks/summary',
      payload: [
        { id: '1', title: 'A', points: 1, status: 'done', due: '2025-08-05' },
        { id: '2', title: 'B', points: 3, status: 'todo', due: '2025-08-01' }
      ]
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.total).toBe(2);
    expect(body.done).toBe(1);
    expect(body.overdue).toBe(1);
  });

  it('POST /api/sprint/assign', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/sprint/assign',
      payload: {
        capacity: 5,
        tasks: [
          { id: 'A', title: 'Urgent', points: 3, status: 'todo', labels: ['urgent'], due: '2025-08-11' },
          { id: 'B', title: 'Later', points: 8, status: 'todo', due: '2025-08-25' },
          { id: 'C', title: 'Small', points: 2, status: 'todo', due: '2025-08-12' }
        ]
      }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body.selected)).toBe(true);
    expect(Array.isArray(body.remaining)).toBe(true);
  });

  it('GET /api/task/id-from-title', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/task/id-from-title?title=Implement%20Login'
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().id).toMatch(/^t_\d+$/);
  });

  it('validates bad body', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/task/priority',
      payload: { title: '', points: -1, status: 'todo' }
    });
    expect(res.statusCode).toBe(400);
  });
});
