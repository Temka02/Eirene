import mongoose, { Document, Schema } from 'mongoose';

export type ProjectIconKey = 'plant' | 'sun' | 'waves' | 'star' | 'mountains' | 'flower';

export interface IProject extends Document {
  title: string;
  description?: string;
  icon: ProjectIconKey;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [50, 'Title cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    icon: {
      type: String,
      enum: ['plant', 'sun', 'waves', 'star', 'mountains', 'flower'],
      default: 'plant',
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model<IProject>('Project', ProjectSchema);
