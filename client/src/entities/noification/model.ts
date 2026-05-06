export interface Notification {
  _id: string;
  type: 'achievement' | 'deadline';
  message: string;
  isRead: boolean;
  userId: string;
  taskId?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationDto {
  type: 'achievement' | 'deadline';
  message: string;
  taskId?: string;
  projectId?: string;
}
