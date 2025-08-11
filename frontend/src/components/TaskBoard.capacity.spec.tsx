// src/components/TaskBoard.capacity.spec.tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Task } from '../lib/tasks';

let calledWith = -1;

// Top-level Mock (wird vor Imports ausgeführt)
vi.mock('../lib/tasks', async () => {
  const actual = await vi.importActual<typeof import('../lib/tasks')>('../lib/tasks');
  const tasks: Task[] = [
    { id: 't1', title: 'Seed', points: 3, status: 'todo', due: null, labels: [] },
  ];
  return {
    ...actual,
    apiListTasks: vi.fn(async () => tasks),
    apiAssignSprint: vi.fn(async (cap: number) => {
      calledWith = cap;
      return { selected: ['t1'], remaining: [] };
    }),
    apiUpdateStatus: vi.fn(),
    apiCreateTask: vi.fn(),
  };
});

// Wichtig: nach dem vi.mock importieren
import TaskBoard from './TaskBoard';

describe('TaskBoard capacity & assign', () => {
  beforeEach(() => {
    calledWith = -1;
    vi.clearAllMocks();
  });

  it('ändert Kapazität und ruft assign mit neuem Wert', async () => {
    const { findByRole, getByRole, getByText } = render(<TaskBoard />);

    await findByRole('heading', { level: 3, name: /Todo\s*\(\d+\)/i });

    const input = getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '21' } });

    fireEvent.click(getByText('assign sprint'));

    await waitFor(() => expect(calledWith).toBe(21));
  });
});
