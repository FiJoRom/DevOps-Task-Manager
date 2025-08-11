import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  computePriority,
  progressSummary,
  assignToSprint,
  nextStatus,
  idFromTitle,
  type Task,
  type Status,
} from '../services/logic';

// Zod-Schemas für Validierung
const StatusZ = z.enum(['todo', 'in_progress', 'blocked', 'done']);
const TaskZ: z.ZodType<Task> = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  points: z.number().int().nonnegative(),
  due: z.string().regex(/^\d{4}-\d{2}-\d{2}/).nullable().optional(),
  status: StatusZ,
  labels: z.array(z.string()).optional(),
  blockedBy: z.array(z.string()).optional(),
});

export async function logicRoutes(app: FastifyInstance) {
  // Priority für einzelnen Task
  app.post('/api/task/priority', async (req, reply) => {
    const parsed = TaskZ.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Bad body' });
    const priority = computePriority(parsed.data);
    return { priority };
  });

  // Status-Automat
  app.post('/api/task/next-status', async (req, reply) => {
    const schema = z.object({
      current: StatusZ,
      action: z.enum(['start', 'block', 'unblock', 'finish']),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Bad body' });
    const next = nextStatus(parsed.data.current as Status, parsed.data.action);
    return { next };
  });

  // Übersicht/Progress über mehrere Tasks
  app.post('/api/tasks/summary', async (req, reply) => {
    const schema = z.array(TaskZ);
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Bad body' });
    return progressSummary(parsed.data);
  });

  // Sprint-Zuteilung (Greedy) nach Priority
  app.post('/api/sprint/assign', async (req, reply) => {
    const schema = z.object({
      capacity: z.number().int().nonnegative(),
      tasks: z.array(TaskZ),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Bad body' });
    const { selected, remaining } = assignToSprint(parsed.data.tasks, parsed.data.capacity);
    return { selected, remaining };
  });

  // ID aus Titel ableiten (kleiner Hash)
  app.get('/api/task/id-from-title', async (req, reply) => {
    const schema = z.object({ title: z.string().min(1) });
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) return reply.code(400).send({ error: 'Bad query' });
    return { id: idFromTitle(parsed.data.title) };
  });
}
