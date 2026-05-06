export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  deadlineType: 'hard' | 'soft' | 'none';
  deadline?: string;
  checklist?: Subtask[];
  userId: string;
  projectId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  _id: string;
  title: string;
  isCompleted: boolean;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  deadlineType?: 'hard' | 'soft' | 'none';
  deadline?: string;
  projectId?: string | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  deadlineType?: 'hard' | 'soft' | 'none';
  deadline?: string;
  checklist?: Subtask[];
  projectId?: string | null;
}

export interface CreateSubtaskDto {
  title: string;
}

export interface UpdateSubtaskDto {
  title?: string;
  isCompleted?: boolean;
}
