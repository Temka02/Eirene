import type { Task } from '../task/model';

export interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  completedThisWeek: number;
  projectCount: number;
}

export interface ProjectWithProgress {
  _id: string;
  title: string;
  description?: string;
  icon: 'plant' | 'sun' | 'waves' | 'star' | 'ribbon';
  userId: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
}

export interface DashboardResponse {
  stats: Stats;
  top3Tasks: Task[];
  activeTasks: Task[];
  projects: ProjectWithProgress[];
}
