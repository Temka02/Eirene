import type { Task } from '../entities/task/model';

export type Priority = 'high' | 'medium' | 'low';
export type DeadlineType = 'hard' | 'soft' | 'none';
export type Status = 'todo' | 'in_progress' | 'done';

export interface PriorityConfig {
  label: string;
  color: string;
  icon: string;
  bg: string;
}

export const PRIORITY_CONFIGS: Record<Priority, PriorityConfig> = {
  high: {
    label: 'Высокий',
    color: 'text-[#D32F2F]',
    icon: '/highPriority-icon.svg',
    bg: 'bg-[#FFEDEE]',
  },
  medium: {
    label: 'Средний',
    color: 'text-[#F59E0B]',
    icon: '/mediumPriority-icon.svg',
    bg: 'bg-[#FFF4E5]',
  },
  low: {
    label: 'Низкий',
    color: 'text-[#10B981]',
    icon: '/lowPriority-icon.svg',
    bg: 'bg-[#E6F9F1]',
  },
};

export interface DeadlineTypeConfig {
  label: string;
  color: string;
  icon: string;
  bg: string;
}

export const DEADLINE_TYPE_CONFIGS: Record<DeadlineType, DeadlineTypeConfig> = {
  hard: {
    label: 'Жесткий',
    color: 'text-[#D32F2F]',
    icon: '/hardDeadlineType-icon.svg',
    bg: 'bg-[#FFEDEE]',
  },
  soft: {
    label: 'Мягкий',
    color: 'text-[#10B981]',
    icon: '/softDeadlineType-icon.svg',
    bg: 'bg-[#E6F9F1]',
  },
  none: {
    label: 'Без срока',
    color: 'text-[#6F7D75]',
    icon: '/noDeadline-icon.svg',
    bg: 'bg-[#F3F4F6]',
  },
};

export interface StatusConfig {
  label: string;
  color: string;
  dot: string;
}

export const STATUS_CONFIGS: Record<Status, StatusConfig> = {
  todo: {
    label: 'Ожидает',
    color: 'text-[#3B82F6]',
    dot: 'bg-[#3B82F6]',
  },
  in_progress: {
    label: 'В работе',
    color: 'text-[#FFC65C]',
    dot: 'bg-[#FFC65C]',
  },
  done: {
    label: 'Выполнено',
    color: 'text-[#8CA693]',
    dot: 'bg-[#8CA693]',
  },
};

export const PRIORITY_BUTTON_OPTIONS = [
  {
    val: 'high' as const,
    label: 'Высокий',
    icon: '/highPriority-icon.svg',
    active: 'border-[#D9636B] bg-[#FFEDEE] text-[#D32F2F]',
  },
  {
    val: 'medium' as const,
    label: 'Средний',
    icon: '/mediumPriority-icon.svg',
    active: 'border-[#FFC65C] bg-[#FFF4E5] text-[#FFC65C]',
  },
  {
    val: 'low' as const,
    label: 'Низкий',
    icon: '/lowPriority-icon.svg',
    active: 'border-[#8CA693] bg-[#E6F9F1] text-[#10B981]',
  },
] as const;

export const DEADLINE_TYPE_BUTTON_OPTIONS = [
  {
    val: 'hard' as const,
    label: 'Жесткий',
    icon: '/hardDeadlineType-icon.svg',
    active: 'border-[#D9636B] bg-[#FFEDEE] text-[#D32F2F]',
  },
  {
    val: 'soft' as const,
    label: 'Мягкий',
    icon: '/softDeadlineType-icon.svg',
    active: 'border-[#8CA693] bg-[#E6F9F1] text-[#10B981]',
  },
  {
    val: 'none' as const,
    label: 'Без срока',
    icon: '/noDeadline-icon.svg',
    active: 'border-[#a1b0a8] bg-[#F3F4F6] text-[#6F7D75]',
  },
] as const;

export const getPriorityConfig = (priority: Task['priority']): PriorityConfig => {
  return PRIORITY_CONFIGS[priority as Priority] || PRIORITY_CONFIGS.medium;
};

export const getDeadlineTypeConfig = (deadlineType: Task['deadlineType']): DeadlineTypeConfig => {
  return DEADLINE_TYPE_CONFIGS[deadlineType as DeadlineType] || DEADLINE_TYPE_CONFIGS.none;
};

export const getStatusConfig = (status: Task['status']): StatusConfig => {
  return STATUS_CONFIGS[status as Status] || STATUS_CONFIGS.todo;
};

export interface FormattedDeadline {
  text: string;
  isOverdue: boolean;
}

export const formatDeadline = (dateStr?: string): FormattedDeadline => {
  if (!dateStr) return { text: '—', isOverdue: false };
  const date = new Date(dateStr);
  const now = new Date();
  const isOverdue = date < now;
  return {
    text: date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
    isOverdue,
  };
};

export const formatDeadlineFull = (dateStr?: string): FormattedDeadline => {
  if (!dateStr) return { text: '—', isOverdue: false };
  const date = new Date(dateStr);
  const now = new Date();
  const isOverdue = date < now;
  return {
    text: date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }),
    isOverdue,
  };
};
