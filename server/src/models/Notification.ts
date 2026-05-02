import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  type: 'achievement' | 'deadline';
  message: string;
  isRead: boolean;
  userId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: { type: String, enum: ['achievement', 'deadline'], default: 'achievement' },
    message: { type: String, required: true },
    isRead: { type: Boolean, required: true, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
