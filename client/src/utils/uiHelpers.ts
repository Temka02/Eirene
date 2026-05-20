import type { Task } from '../entities/task/model';

export const getStatusColorClass = (status: Task['status']): string => {
  switch (status) {
    case 'done':
      return 'text-[#8CA693]';
    case 'in_progress':
      return 'text-[#FFC65C]';
    default:
      return 'text-[#4C95E9]';
  }
};

export const getDayCellClass = (isCurrentDay: boolean, isSelected: boolean): string => {
  if (isCurrentDay) {
    return 'border-[#8CA693] bg-[#F0F3ED]';
  }
  if (isSelected) {
    return 'border-[#8CA693] bg-white';
  }
  return 'hover:border-[#8CA693]/50 hover:bg-[#FAFBFC]';
};

export const getDayNumberClass = (isCurrentDay: boolean, isSelected: boolean): string => {
  let base = 'text-xs md:text-sm font-medium ';
  if (isCurrentDay) {
    base += 'text-[#8CA693]';
  } else {
    base += 'text-[#2F3A34]';
  }
  if (isSelected && !isCurrentDay) {
    base +=
      ' bg-[#8CA693] text-white w-5 h-5 md:w-auto md:h-auto md:bg-transparent md:text-[#2F3A34] rounded-full flex items-center justify-center';
  }
  return base;
};
