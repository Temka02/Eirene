import { Response } from 'express';
import Task from '../models/Task';
import { taskSchema, updateTaskSchema } from '../utils/validation';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const MAX_ACTIVE_TASKS = 5;

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

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await Task.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

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
