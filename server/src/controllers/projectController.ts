import { Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import { projectSchema, updateProjectSchema } from '../utils/validation';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';

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
    await Notification.create({
      userId,
      type: 'system',
      message: `Проект "${project.title}" создан! Вперёд к целям!`,
      isRead: false,
      projectId: project._id,
    });
    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues });
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

    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const total = await Task.countDocuments({ userId, projectId: project._id });
        const done = await Task.countDocuments({ userId, projectId: project._id, status: 'done' });
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;

        return {
          ...project.toObject(),
          progress,
          totalTasks: total,
          completedTasks: done,
        };
      })
    );

    res.json(projectsWithProgress);
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
