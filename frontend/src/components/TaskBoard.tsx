// src/components/TaskBoard.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  apiListTasks,
  apiUpdateStatus,
  apiCreateTask,
  computePriority,
  progressSummary,
  apiAssignSprint,
} from '../lib/tasks';
import type { Task } from '../lib/tasks';
import type { ChangeEvent } from 'react';

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(13);

  useEffect(() => {
    apiListTasks()
      .then(setTasks)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  const prog = useMemo(() => progressSummary(tasks), [tasks]);

  const onAction = async (
    id: string,
    action: 'start' | 'block' | 'unblock' | 'finish',
  ) => {
    try {
      const updated = await apiUpdateStatus(id, action);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const onQuickAdd = async () => {
    try {
      const title = prompt('Titel des Tasks?') || 'New Task';
      const points = 3;
      const t: Omit<Task, 'id'> = {
        title,
        points,
        status: 'todo',
        due: null,
        labels: [],
      };
      const created = await apiCreateTask(t);
      setTasks((prev) => [created, ...prev]);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const onAssign = async () => {
    try {
      const res = await apiAssignSprint(capacity);
      alert(
        `Sprint-Auswahl (cap=${capacity}):\nselected: ${res.selected.join(', ')}\nremaining: ${res.remaining.join(', ')}`,
      );
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const onCapacityChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const next = Number.parseInt(ev.target.value || '0', 10);
    setCapacity(Number.isFinite(next) ? next : 0);
  };

  if (loading) return <div>Tasks laden…</div>;
  if (err) return <div style={{ color: 'crimson' }}>Fehler: {err}</div>;

  const group = (s: Task['status']) => tasks.filter((t) => t.status === s);

  const Column = ({ title, items }: { title: string; items: Task[] }) => (
    <div
      style={{
        flex: 1,
        minWidth: 240,
        padding: 12,
        border: '1px solid #eee',
        borderRadius: 12,
      }}
    >
      <h3 style={{ marginTop: 0 }}>
        {title} ({items.length})
      </h3>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gap: 8,
        }}
      >
        {items.map((t) => (
          <li
            key={t.id}
            style={{ padding: 12, border: '1px solid #ddd', borderRadius: 10 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <strong title={t.id}>{t.title}</strong>
              <span>pts: {t.points}</span>
            </div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              due: {t.due ?? '—'} • priority: {computePriority(t)}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {(t.labels ?? []).map((l) => (
                <span
                  key={l}
                  style={{
                    border: '1px solid #ccc',
                    borderRadius: 6,
                    padding: '2px 6px',
                    fontSize: 12,
                  }}
                >
                  #{l}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <button onClick={() => onAction(t.id, 'start')}>start</button>
              <button onClick={() => onAction(t.id, 'block')}>block</button>
              <button onClick={() => onAction(t.id, 'unblock')}>unblock</button>
              <button onClick={() => onAction(t.id, 'finish')}>finish</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={onQuickAdd}>+ Quick Add</button>
        <div>
          <label style={{ marginRight: 8 }}>Sprint Kapazität:</label>
          <input
            type="number"
            value={capacity}
            onChange={onCapacityChange}
            style={{ width: 80 }}
          />
          <button onClick={onAssign} style={{ marginLeft: 8 }}>
            assign sprint
          </button>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <strong>Progress:</strong> {prog.done}/{prog.total} done • {prog.completionPct}% • overdue:{' '}
          {prog.overdue}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 12, overflowX: 'auto' }}>
        <Column title="Todo" items={group('todo')} />
        <Column title="In Progress" items={group('in_progress')} />
        <Column title="Blocked" items={group('blocked')} />
        <Column title="Done" items={group('done')} />
      </div>
    </div>
  );
}
