import * as Sentry from '@sentry/node';
import mongoose from 'mongoose';
import { Response } from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import { AuthRequest } from '../middleware/auth';

/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get full dashboard data (stats, top3, active tasks, projects)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard payload
 *       401:
 *         description: Unauthorized
 */
export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [totalTasks, pendingTasks, inProgressTasks, completedThisWeek, totalProjects] =
      await Promise.all([
        Task.countDocuments({ userId }),
        Task.countDocuments({ userId, status: 'todo' }),
        Task.countDocuments({ userId, status: 'in_progress' }),
        Task.countDocuments({ userId, status: 'done', updatedAt: { $gte: weekAgo } }),
        Project.countDocuments({ userId }),
      ]);

    const stats = {
      total: totalTasks,
      pending: pendingTasks,
      inProgress: inProgressTasks,
      completedThisWeek,
      projectCount: totalProjects,
    };

    const top3Tasks = await Task.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: 'todo',
        },
      },
      {
        $addFields: {
          deadlineWeight: {
            $switch: {
              branches: [
                { case: { $eq: ['$deadlineType', 'hard'] }, then: 3 },
                { case: { $eq: ['$deadlineType', 'soft'] }, then: 2 },
              ],
              default: 1,
            },
          },
          priorityWeight: {
            $switch: {
              branches: [
                { case: { $eq: ['$priority', 'high'] }, then: 3 },
                { case: { $eq: ['$priority', 'medium'] }, then: 2 },
              ],
              default: 1,
            },
          },
        },
      },
      {
        $sort: {
          deadlineWeight: -1,
          deadline: 1,
          priorityWeight: -1,
          createdAt: 1,
        },
      },
      { $limit: 3 },
    ]);

    const activeTasks = await Task.find({ userId, status: 'in_progress' })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    const projects = await Project.find({ userId }).sort({ createdAt: -1 }).lean();
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const [total, done] = await Promise.all([
          Task.countDocuments({ userId, projectId: project._id }),
          Task.countDocuments({ userId, projectId: project._id, status: 'done' }),
        ]);
        return {
          ...project,
          progress: total > 0 ? Math.round((done / total) * 100) : 0,
          totalTasks: total,
          completedTasks: done,
        };
      })
    );

    res.json({
      stats,
      top3Tasks,
      activeTasks,
      projects: projectsWithProgress,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    Sentry.captureException(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
