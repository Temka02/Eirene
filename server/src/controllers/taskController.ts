import { Response } from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import Notification from '../models/Notification';
import { taskSchema, updateTaskSchema } from '../utils/validation';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';
import { addSubtaskSchema, updateSubtaskSchema } from '../utils/validation';

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

    if (data.projectId) {
      const project = await Project.findOne({ _id: data.projectId, userId });
      if (!project) {
        return res.status(404).json({ error: 'Project not found or access denied' });
      }
    }

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
 * /api/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get a single task by ID
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
 *         description: Task found
 *       404:
 *         description: Task not found
 */
export const getTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, userId: req.user!.userId });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch {
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
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const {
      priority,
      deadlineType,
      status,
      search,
      sortBy = 'deadline',
      order = 'asc',
      limit = '5',
      page = '1',
    } = req.query;

    const filter: any = { userId };

    if (priority && ['high', 'medium', 'low'].includes(priority as string))
      filter.priority = priority;
    if (deadlineType && ['hard', 'soft', 'none'].includes(deadlineType as string))
      filter.deadlineType = deadlineType;
    if (status && ['todo', 'in_progress', 'done'].includes(status as string))
      filter.status = status;
    if (search && typeof search === 'string') filter.title = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const pipeline: any[] = [{ $match: filter }];

    if (sortBy === 'deadline') {
      pipeline.push(
        {
          $addFields: {
            _sortDeadline: {
              $ifNull: [
                '$deadline',
                order === 'asc' ? new Date('9999-12-31') : new Date('1970-01-01'),
              ],
            },
          },
        },
        { $sort: { _sortDeadline: order === 'asc' ? 1 : -1 } },
        { $project: { _sortDeadline: 0 } }
      );
    } else if (sortBy === 'priority') {
      pipeline.push({ $sort: { priority: order === 'asc' ? 1 : -1 } });
    } else {
      pipeline.push({ $sort: { createdAt: order === 'asc' ? 1 : -1 } });
    }

    pipeline.push(
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'projectInfo',
        },
      },
      { $unwind: { path: '$projectInfo', preserveNullAndEmptyArrays: true } },
      { $project: { projectInfo: 0 } }
    );

    const [data, total] = await Promise.all([
      Task.aggregate(pipeline),
      Task.countDocuments(filter),
    ]);

    res.json({
      data,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error('getTasks error:', err);
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
    if (data.status === 'done') {
      await Notification.create({
        userId: req.user!.userId,
        taskId: new mongoose.Types.ObjectId(id as string),
        type: 'achievement',
        message: `Отлично! Задача "${task.title}" завершена.`,
        isRead: false,
      });
    }

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

/**
 * @openapi
 * /api/tasks/{taskId}/subtasks:
 *   post:
 *     tags: [Tasks, Subtasks]
 *     summary: Add a subtask to a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the parent task
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
 *     responses:
 *       200:
 *         description: Subtask added successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task not found
 */
export const addSubtask = async (req: AuthRequest, res: Response) => {
  try {
    const { title } = addSubtaskSchema.parse(req.body);
    const { taskId } = req.params;
    const userId = req.user!.userId;

    const subtaskId = new mongoose.Types.ObjectId().toString();

    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { $push: { checklist: { id: subtaskId, title, isCompleted: false } } },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @openapi
 * /api/tasks/{taskId}/subtasks/{subtaskId}:
 *   patch:
 *     tags: [Tasks, Subtasks]
 *     summary: Update a subtask
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: subtaskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               isCompleted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Subtask updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task or subtask not found
 */
export const updateSubtask = async (req: AuthRequest, res: Response) => {
  try {
    const data = updateSubtaskSchema.parse(req.body);
    const { taskId, subtaskId } = req.params;
    const userId = req.user!.userId;

    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const subtaskIndex = task.checklist?.findIndex((s) => s.id === subtaskId);
    if (subtaskIndex === -1 || subtaskIndex === undefined) {
      return res.status(404).json({ error: 'Subtask not found' });
    }

    if (data.title !== undefined) task.checklist![subtaskIndex].title = data.title;
    if (data.isCompleted !== undefined)
      task.checklist![subtaskIndex].isCompleted = data.isCompleted;

    await task.save();
    res.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @openapi
 * /api/tasks/{taskId}/subtasks/{subtaskId}:
 *   delete:
 *     tags: [Tasks, Subtasks]
 *     summary: Delete a subtask
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: subtaskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subtask deleted
 *       404:
 *         description: Task not found
 */
export const deleteSubtask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, subtaskId } = req.params;
    const userId = req.user!.userId;

    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { $pull: { checklist: { id: subtaskId } } },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};
