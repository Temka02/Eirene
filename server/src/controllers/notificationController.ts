import { Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get all user notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [achievement, deadline]
 *         description: Filter by notification type
 *         required: false
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [achievement, deadline]
 *                   message:
 *                     type: string
 *                   isRead:
 *                     type: boolean
 *                   deadlineType:
 *                     type: string
 *                     enum: [hard, soft, none]
 *                   deadline:
 *                     type: string
 *                     format: date-time
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Internal server error
 */
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { type, isRead, limit = '10', skip = '0' } = req.query;

    const filter: any = { userId };
    if (type && typeof type === 'string') {
      const validTypes = ['achievement', 'deadline'];
      if (validTypes.includes(type)) filter.type = type;
    }
    if (isRead === 'true') filter.isRead = true;
    if (isRead === 'false') filter.isRead = false;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean(),
      Notification.countDocuments(filter),
    ]);

    res.json({ data: notifications, total });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @openapi
 * /api/notifications/{id}:
 * patch:
 *   tags: [Notifications]
 *   summary: Mark a single notification as read
 *   security:
 *     - bearerAuth: []
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *   responses:
 *     200:
 *       description: Notification marked as read
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               notification:
 *                 type: object
 *     404:
 *       description: Notification not found
 *     500:
 *       description: Internal server error
 */
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification marked as read', notification });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @openapi
 * /api/notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All marked as read
 */
export const markAllRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
    res.json({ message: 'All notifications marked as read' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @openapi
 * /api/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete a notification
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
 *         description: Notification deleted
 *       404:
 *         description: Not found
 */
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const notification = await Notification.findOneAndDelete({ _id: id, userId });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};
