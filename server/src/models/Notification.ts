import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  type: 'achievement' | 'deadline' | 'system';
  message: string;
  isRead: boolean;
  userId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  deadlineType?: 'hard' | 'soft' | 'none';
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: { type: String, enum: ['achievement', 'deadline', 'system'], default: 'achievement' },
    message: { type: String, required: true },
    isRead: { type: Boolean, required: true, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    deadlineType: { type: String, enum: ['hard', 'soft', 'none'] },
    deadline: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
