// src/components/TaskBoard.spec.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import TaskBoard from './TaskBoard';

vi.mock('../lib/tasks', async () => {
  const actual = await vi.importActual<object>('../lib/tasks');
  const tasks = [
    { id: 't1', title: 'A', points: 3, status: 'todo', due: null, labels: [] },
    { id: 't2', title: 'B', points: 2, status: 'in_progress', due: null, labels: [] },
  ];
  return {
    ...actual,
    apiListTasks: vi.fn(async () => tasks),
    apiUpdateStatus: vi.fn(async (id: string) => {
      const idx = tasks.findIndex(t => t.id === id);
      tasks[idx] = { ...tasks[idx], status: 'done' };
      return tasks[idx];
    }),
    apiCreateTask: vi.fn(async (t: any) => ({ id: 't_new', ...t })),
    apiAssignSprint: vi.fn(async () => ({ selected: ['t1'], remaining: ['t2'] })),
  };
});

describe('TaskBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rendert Spalten und Tasks', async () => {
    render(<TaskBoard />);

    // Warten bis Spalten da sind (h3-Headings mit Zahl in Klammern)
    await screen.findByRole('heading', { level: 3, name: /Todo\s*\(\d+\)/i });
    await screen.findByRole('heading', { level: 3, name: /In Progress\s*\(\d+\)/i });
    await screen.findByRole('heading', { level: 3, name: /Blocked\s*\(\d+\)/i });
    await screen.findByRole('heading', { level: 3, name: /Done\s*\(\d+\)/i });

    // Tasks sichtbar
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('führt Status-Aktion aus (finish)', async () => {
    render(<TaskBoard />);

    await screen.findByText('A');

    fireEvent.click(screen.getAllByText('finish')[0]);

    // Genau ein Done-Heading mit "(1)"
    const doneHeading = await screen.findByRole('heading', {
      level: 3,
      name: /^Done\s*\(1\)$/i,
    });
    expect(doneHeading).toBeInTheDocument();

    // Und Task A befindet sich in dieser Spalte
    const doneCol = doneHeading.closest('div')!;
    expect(within(doneCol).getByText('A')).toBeInTheDocument();
  });
});
