import mongoose, { Document, Schema } from 'mongoose';

export interface ISubtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  deadlineType: 'hard' | 'soft' | 'none';
  deadline?: Date;
  checklist?: ISubtask[];
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const SubtaskSchema = new Schema<ISubtask>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    isCompleted: { type: Boolean, default: false },
  },
  { _id: false }
);

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    deadlineType: { type: String, enum: ['hard', 'soft', 'none'], default: 'none' },
    deadline: { type: Date },
    checklist: { type: [SubtaskSchema], default: [] },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', default: null },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', TaskSchema);
