import { Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import { projectSchema, updateProjectSchema } from '../utils/validation';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

/**
 * @openapi
 * /api/projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a new project
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
 *                 maxLength: 50
 *               description:
 *                 type: string
 *                 maxLength: 200
 *               icon:
 *                 type: string
 *                 enum: [plant, sun, waves, star, ribbon]
 *     responses:
 *       201:
 *         description: Project created
 *       400:
 *         description: Validation error
 */
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const data = projectSchema.parse(req.body);
    const userId = req.user!.userId;
    const project = await Project.create({ ...data, userId });
    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get a single project by ID
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
 *         description: Project found
 *       404:
 *         description: Project not found
 */
export const getProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({ _id: id, userId: req.user!.userId });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @openapi
 * /api/projects/{id}/tasks:
 *   get:
 *     tags: [Projects, Tasks]
 *     summary: Get tasks for a specific project with filters and pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [high, medium, low] }
 *       - in: query
 *         name: deadlineType
 *         schema: { type: string, enum: [hard, soft, none] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [todo, in_progress, done] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [deadline, priority, createdAt], default: deadline }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *       - in: query
 *         name: limit
 *         schema: { type: string, default: '5' }
 *       - in: query
 *         name: page
 *         schema: { type: string, default: '1' }
 *     responses:
 *       200:
 *         description: List of project tasks with pagination
 */
export const getProjectTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { id: projectId } = req.params;
    if (typeof projectId !== 'string') {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const projectIdObj = new mongoose.Types.ObjectId(projectId);

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

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) return res.status(404).json({ error: 'Project not found or access denied' });

    const filter: any = { userId, projectId: projectIdObj };

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
    console.error('getProjectTasks error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @openapi
 * /api/projects:
 *   get:
 *     tags: [Projects]
 *     summary: Get all projects with calculated progress
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects with progress
 */
export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const projects = await Project.find({ userId }).sort({ createdAt: -1 });

    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const total = await Task.countDocuments({ userId, projectId: project._id });
        const todo = await Task.countDocuments({ userId, projectId: project._id, status: 'todo' });
        const inProgress = await Task.countDocuments({
          userId,
          projectId: project._id,
          status: 'in_progress',
        });
        const done = await Task.countDocuments({ userId, projectId: project._id, status: 'done' });

        const progress = total > 0 ? Math.round((done / total) * 100) : 0;

        return {
          ...project.toObject(),
          progress,
          totalTasks: total,
          todoTasks: todo,
          inProgressTasks: inProgress,
          completedTasks: done,
        };
      })
    );

    res.json(projectsWithStats);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @openapi
 * /api/projects/{id}:
 *   put:
 *     tags: [Projects]
 *     summary: Update a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated
 *       404:
 *         description: Project not found
 */
export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const data = updateProjectSchema.parse(req.body);
    const { id } = req.params;
    const userId = req.user!.userId;

    const project = await Project.findOneAndUpdate({ _id: id, userId }, data, { new: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    res.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @openapi
 * /api/projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     summary: Delete project and all its tasks (cascade)
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
 *         description: Project and tasks deleted
 *       404:
 *         description: Project not found
 */
export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    await Task.deleteMany({ projectId: id, userId });

    const project = await Project.findOneAndDelete({ _id: id, userId });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    res.json({ message: 'Project and all associated tasks deleted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};
