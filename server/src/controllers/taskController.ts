import { Response } from 'express';
import Task from '../models/Task';
import { taskSchema, updateTaskSchema } from '../utils/validation';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const MAX_ACTIVE_TASKS = 5;

/**
 * @openapi
 * /api/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *                 default: todo
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               deadlineType:
 *                 type: string
 *                 enum: [hard, soft, none]
 *                 default: none
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Validation error or active task limit reached
 *       401:
 *         description: Unauthorized
 */
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const data = taskSchema.parse(req.body);
    const userId = req.user!.userId;

    if (data.status === 'in_progress') {
      const count = await Task.countDocuments({ userId, status: 'in_progress' });
      if (count >= MAX_ACTIVE_TASKS) {
        return res.status(400).json({ error: `Limit of ${MAX_ACTIVE_TASKS} active tasks reached` });
      }
    }

    const task = await Task.create({ ...data, userId });
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @openapi
 * /api/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Get all user tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   status:
 *                     type: string
 *                   priority:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await Task.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @openapi
 * /api/tasks/{id}:
 *   put:
 *     tags: [Tasks]
 *     summary: Update a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Task updated
 *       400:
 *         description: Validation error or active task limit
 *       404:
 *         description: Task not found
 */
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const data = updateTaskSchema.parse(req.body);
    const userId = req.user!.userId;
    const { id } = req.params;

    if (data.status === 'in_progress') {
      const count = await Task.countDocuments({ userId, status: 'in_progress', _id: { $ne: id } });
      if (count >= MAX_ACTIVE_TASKS) {
        return res.status(400).json({ error: `Limit of ${MAX_ACTIVE_TASKS} active tasks reached` });
      }
    }

    const task = await Task.findOneAndUpdate({ _id: id, userId }, data, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @openapi
 * /api/tasks/{id}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 */
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, userId: req.user!.userId });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};
