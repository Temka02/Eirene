import cron from 'node-cron';
import Task from '../models/Task';
import Notification from '../models/Notification';
import logger from './logger';
import User from '../models/User';
import { sendDeadlineEmail } from './email';

export const startDeadlineScheduler = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      logger.info('Scheduler: Checking upcoming deadlines...');

      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const upcomingTasks = await Task.find({
        deadline: { $gte: now, $lte: tomorrow },
        status: { $ne: 'done' },
        deadlineType: { $ne: 'none' },
      });

      if (!upcomingTasks.length) {
        logger.info('No upcoming deadlines. Exiting.');
        return;
      }

      const notifiedIds = await Notification.distinct('taskId', {
        type: 'deadline',
        createdAt: { $gte: startOfToday },
      });

      const tasksToNotify = upcomingTasks.filter(
        (t) => !notifiedIds.some((id) => id.toString() === t._id.toString())
      );

      if (!tasksToNotify.length) {
        logger.info('All upcoming deadlines already notified.');
        return;
      }

      await Notification.insertMany(
        tasksToNotify.map((task) => ({
          userId: task.userId,
          taskId: task._id,
          type: 'deadline',
          message: `Напоминание: дедлайн задачи "${task.title}" близко`,
          isRead: false,
          deadlineType: task.deadlineType,
          deadline: task.deadline,
        }))
      );

      for (const task of tasksToNotify) {
        const user = await User.findById(task.userId).select('email emailNotifications');

        if (user && user.emailNotifications) {
          await sendDeadlineEmail(user.email, task.title, task.deadline!);
        }
      }

      logger.info(`Created ${tasksToNotify.length} deadline alerts`);
    } catch (error) {
      logger.error('Deadline scheduler failed:', error);
    }
  });

  logger.info('Deadline scheduler registered (runs every 15 min)');
};
