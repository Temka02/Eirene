import * as Sentry from '@sentry/node';
import { Response } from 'express';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/auth';

export const getCalendarData = async (req: AuthRequest, res: Response) => {
  try {
    const { year, month } = req.query;
    const userId = req.user!.userId;

    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' });
    }

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const tasks = await Task.find({
      userId,
      deadline: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ deadline: 1, priority: -1 })
      .lean();

    res.json(tasks);
  } catch (error) {
    Sentry.captureException(error);
    console.error('Calendar error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
