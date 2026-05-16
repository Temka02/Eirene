import * as Sentry from '@sentry/react';
import { useState, type SyntheticEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetTaskQuery,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from '../../features/tasks/tasksApi';
import {
  useAddSubtaskMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
} from '../../features/tasks/subtasksApi';
import { useGetProjectsQuery } from '../../features/projects/projectsApi';
import type { Task } from '../../entities/task/model';

const projectIconConfig = {
  plant: { src: '/project-plant-icon.svg', iconBg: 'bg-[#F0F1F2]' },
  sun: { src: '/project-sun-icon.svg', iconBg: 'bg-[#FFEFD3]' },
  waves: { src: '/project-waves-icon.svg', iconBg: 'bg-[#E9F0F9]' },
  star: { src: '/project-star-icon.svg', iconBg: 'bg-[#F5F3FF]' },
  mountains: { src: '/project-mountains-icon.svg', iconBg: 'bg-[#EDD7C9]' },
  flower: { src: '/project-flower-icon.svg', iconBg: 'bg-[#FFC9C9]' },
};

export default function TaskDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: task, isLoading, isError } = useGetTaskQuery(id!);
  const { data: projectsData } = useGetProjectsQuery();
  const projects = projectsData || [];

  const [deleteTask] = useDeleteTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [addSubtask] = useAddSubtaskMutation();
  const [updateSubtask] = useUpdateSubtaskMutation();
  const [deleteSubtask] = useDeleteSubtaskMutation();

  const [newSubtask, setNewSubtask] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [error, setError] = useState('');
  const [limitWarning, setLimitWarning] = useState('');

  const getDeadlineInfo = (dateStr?: string) => {
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

  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'Личное';
    const project = projects.find((p: any) => p._id === projectId);
    return project?.title || 'Проект';
  };

  const getPriorityInfo = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return { label: 'Высокий', color: 'text-[#D32F2F]', icon: '/highPriority-icon.svg' };
      case 'medium':
        return { label: 'Средний', color: 'text-[#F59E0B]', icon: '/mediumPriority-icon.svg' };
      case 'low':
        return { label: 'Низкий', color: 'text-[#10B981]', icon: '/lowPriority-icon.svg' };
    }
  };

  const getDeadlineTypeInfo = (type: Task['deadlineType']) => {
    switch (type) {
      case 'hard':
        return { label: 'Жeсткий', color: 'text-[#D32F2F]', icon: '/hardDeadlineType-icon.svg' };
      case 'soft':
        return { label: 'Мягкий', color: 'text-[#10B981]', icon: '/softDeadlineType-icon.svg' };
      case 'none':
        return { label: 'Без срока', color: 'text-[#6F7D75]', icon: '/noDeadline-icon.svg' };
    }
  };

  const getStatusInfo = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return { label: 'Ожидает', color: 'text-[#3B82F6]', dot: 'bg-[#3B82F6]' };
      case 'in_progress':
        return { label: 'В работе', color: 'text-[#FFC65C]', dot: 'bg-[#FFC65C]' };
      case 'done':
        return { label: 'Выполнено', color: 'text-[#8CA693]', dot: 'bg-[#8CA693]' };
    }
  };

  const handleToggleSubtask = async (subtaskId: string, currentCompleted: boolean) => {
    if (!task || task.status !== 'in_progress') return;
    await updateSubtask({ taskId: task._id, subtaskId, isCompleted: !currentCompleted }).unwrap();
  };

  const handleAddSubtask = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!newSubtask.trim() || !task) return;
    if (newSubtask.length > 100) {
      setError('Название подзадачи не должно превышать 100 символов');
      return;
    }
    try {
      await addSubtask({ taskId: task._id, title: newSubtask.trim() }).unwrap();
      setNewSubtask('');
      setIsAddingSubtask(false);
    } catch (error) {
      Sentry.captureException(error);
      setError('Ошибка при добавлении подзадачи');
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!task) return;
    await deleteSubtask({ taskId: task._id, subtaskId }).unwrap();
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    await deleteTask({ id: task._id }).unwrap();
    navigate('/tasks');
  };

  const handleEditTask = () => navigate(`/tasks/${id}/edit`);
  const handleFocusMode = () => navigate(`/focus/${id}`);

  const handleTakeToWork = async () => {
    if (!task || task.status !== 'todo') return;
    setLimitWarning('');
    try {
      await updateTask({
        id: task._id,
        status: 'in_progress',
        priority: task.priority,
        deadlineType: task.deadlineType,
      }).unwrap();
    } catch (err: any) {
      const msg = err.data?.error || '';
      if (typeof msg === 'string' && msg.includes('Limit')) {
        setLimitWarning('В работе уже 5 задач. Завершите одну из них, чтобы взять новую.');
      } else {
        setError('Ошибка при смене статуса');
      }
    }
  };

  const handleCompleteTask = async () => {
    if (!task || task.status === 'done') return;
    setLimitWarning('');
    try {
      await updateTask({
        id: task._id,
        status: 'done',
        priority: task.priority,
        deadlineType: task.deadlineType,
      }).unwrap();

      if (task.checklist && task.checklist.length > 0) {
        const unfinishedSubtasks = task.checklist.filter((sub) => !sub.isCompleted);
        if (unfinishedSubtasks.length > 0) {
          await Promise.all(
            unfinishedSubtasks.map((sub) =>
              updateSubtask({ taskId: task._id, subtaskId: sub.id, isCompleted: true }).unwrap()
            )
          );
        }
      }
      navigate('/tasks');
    } catch {
      setError('Ошибка при завершении задачи');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-[#6F7D75] text-sm">Загрузка задачи...</div>
      </div>
    );
  }
  if (isError || !task) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-[#6F7D75] text-sm">Задача не найдена</div>
        <button
          onClick={() => navigate('/tasks')}
          className="px-8 py-3 bg-[#8CA693] text-white rounded-xl text-sm font-medium hover:bg-[#7A9181] transition-all shadow-[0_6px_20px_0_rgba(140,166,147,0.3)] active:scale-95"
        >
          К задачам
        </button>
      </div>
    );
  }

  const priorityInfo = getPriorityInfo(task.priority);
  const deadlineTypeInfo = getDeadlineTypeInfo(task.deadlineType);
  const statusInfo = getStatusInfo(task.status);
  const deadlineInfo = getDeadlineInfo(task.deadline as string);
  const isCompleted = task.status === 'done';
  const canManageSubtasks = task.status === 'in_progress';

  return (
    <div className="px-5 md:px-8 lg:px-11 pb-4 h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate('/tasks')}
            className="w-10 h-7 bg-white rounded-[0.625rem] shadow-[0_6px_20px_0_rgba(0,0,0,0.05)] flex items-center justify-center hover:bg-[#F0F3ED]/70 transition-colors"
          >
            <img src="/sortArrow-icon.svg" alt="Назад" className="w-3.5 h-3.5 -rotate-90" />
          </button>
          <h2 className="text-lg text-[#6F7D75]">Назад к задачам</h2>
        </div>

        {(error || limitWarning) && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${limitWarning ? 'bg-[#FFF4E5] text-[#B45309]' : 'bg-[#FFEDEE] text-[#D32F2F]'}`}
          >
            {limitWarning || error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 mb-4">
          <div className="lg:col-span-2 space-y-6 min-w-0">
            <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                {task.projectId && typeof task.projectId === 'object' ? (
                  <div
                    className={`w-12 h-12 rounded-xl ${projectIconConfig[task.projectId.icon as keyof typeof projectIconConfig].iconBg} flex items-center justify-center flex-shrink-0`}
                  >
                    <img
                      src={
                        projectIconConfig[task.projectId.icon as keyof typeof projectIconConfig].src
                      }
                      alt=""
                      className="w-7 h-7"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#F0F1F2] flex items-center justify-center flex-shrink-0">
                    <img src="/project-plant-icon.svg" alt="" className="w-7 h-7" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg text-[#5F6F65] break-all leading-snug overflow-hidden">
                    Задача:<span className="ml-1 font-medium text-[#2F3A34]">{task.title}</span>
                  </h2>
                  {task.projectId && typeof task.projectId === 'object' ? (
                    <h2 className="text-sm text-[#5F6F65] mt-1 break-all overflow-hidden">
                      Проект:
                      <span className="ml-1 font-medium text-[#2F3A34]">
                        {task.projectId.title}
                      </span>
                    </h2>
                  ) : (
                    <h3 className="text-sm text-[#5F6F65] mt-1">
                      Проект:<span className="ml-1 font-medium text-[#2F3A34]">Личное</span>
                    </h3>
                  )}
                </div>
              </div>

              {task.description && (
                <h3 className="text-sm text-[#5F6F65] mb-6 leading-relaxed break-all overflow-hidden">
                  Описание:
                  <span className="text-[#2F3A34] font-medium ml-1">{task.description}</span>
                </h3>
              )}

              <div className="flex flex-wrap items-center gap-3">
                {task.status === 'todo' && (
                  <button
                    onClick={handleTakeToWork}
                    disabled={isUpdating}
                    className="px-4 py-1.5 bg-[#4C95E9]/90 text-white rounded-lg text-sm font-medium hover:bg-[#3B82F6]/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <img src="/play-icon.svg" alt="" className="w-3.5 h-3.5" />
                    Взять в работу
                  </button>
                )}
                <button
                  onClick={handleEditTask}
                  className="px-4 py-1.5 bg-[#8CA693] text-white rounded-lg text-sm font-medium hover:bg-[#7A9181] transition-colors flex items-center gap-2"
                >
                  <img src="/edit-icon.svg" alt="" className="w-3.5 h-3.5 -translate-y-[1.5px]" />
                  Редактировать
                </button>
                <button
                  onClick={handleDeleteTask}
                  className="px-4 py-1.5 bg-[#FFC9C9]/70 text-[#D32F2F] rounded-lg text-sm font-medium hover:bg-[#D32F2F]/20 transition-colors flex items-center gap-2"
                >
                  <img src="/delete-icon.svg" alt="" className="w-3.5 h-3.5 -translate-y-[1.5px]" />
                  Удалить задачу
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-medium text-[#2F3A34]">Подзадачи</h2>
                {!canManageSubtasks && task.status !== 'done' && (
                  <span className="text-xs text-[#6F7D75] bg-[#F8FAFC] px-2 py-1 rounded-md">
                    Доступно после взятия в работу
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {task.checklist?.map((subtask) => (
                  <div
                    key={subtask.id}
                    className={`flex justify-between gap-4 items-center p-3 rounded-lg transition-colors ${subtask.isCompleted ? 'bg-[#E4F0E5] border border-[#8CA693]' : 'bg-white border border-[#F0F1F2]'} ${!canManageSubtasks && !subtask.isCompleted ? 'opacity-60' : ''}`}
                  >
                    <div className="flex gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleSubtask(subtask.id, subtask.isCompleted)}
                        disabled={!canManageSubtasks}
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${subtask.isCompleted ? 'bg-[#8CA693]' : 'border-2 border-[#D9D9D9]'} ${!canManageSubtasks ? 'cursor-not-allowed' : ''}`}
                      >
                        {subtask.isCompleted && (
                          <img src="/taskDone-icon.svg" alt="" className="w-5 h-5" />
                        )}
                      </button>
                      <span
                        title={subtask.title}
                        className={`text-sm truncate ${subtask.isCompleted ? 'line-through text-[#6F7D75]' : 'text-[#2F3A34]'}`}
                      >
                        {subtask.title}
                      </span>
                    </div>
                    <button onClick={() => handleDeleteSubtask(subtask.id)}>
                      <img src="/delete-icon.svg" alt="Удалить подзадачу" />
                    </button>
                  </div>
                ))}
              </div>

              {isAddingSubtask ? (
                <form onSubmit={handleAddSubtask} className="flex flex-col sm:flex-row gap-2 mb-4">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Новая подзадача..."
                    className="flex-1 px-4 py-2 border border-[#F0F1F2] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#8CA693]"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#8CA693] text-white rounded-lg text-sm font-medium hover:bg-[#7A9181] transition-colors"
                    >
                      Добавить
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingSubtask(false);
                        setNewSubtask('');
                      }}
                      className="px-4 py-2 bg-[#F0F1F2] text-[#6F7D75] rounded-lg text-sm font-medium hover:bg-[#E2E8F0] transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingSubtask(true)}
                  className="px-4 py-1.5 bg-[#8CA693] text-white rounded-lg text-sm font-medium hover:bg-[#7A9181] transition-colors flex items-center gap-2"
                >
                  <img src="/add-icon.svg" alt="" className="w-3.5 h-3.5 -translate-y-[1.5px]" />
                  Добавить подзадачу
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4 min-w-0">
            <div className="bg-white rounded-2xl py-6 px-7 shadow-sm">
              <h2 className="font-medium text-[#2F3A34] mb-4">О задаче</h2>
              <div>
                <div className="grid grid-cols-2 gap-4 items-center py-2.5 border-b border-[#F0F1F2]">
                  <span className="text-xs text-[#5F6F65] font-medium">Проект:</span>
                  <span className="text-xs text-[#6F7D75] truncate min-w-0">
                    {getProjectName(task.projectId as string)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center py-2.5 border-b border-[#F0F1F2]">
                  <span className="text-xs text-[#5F6F65] font-medium">Статус:</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                    <span className={`text-xs ${statusInfo.color}`}>{statusInfo.label}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center py-2.5 border-b border-[#F0F1F2]">
                  <span className="text-xs text-[#5F6F65] font-medium">Приоритет:</span>
                  <div className="flex items-center gap-2">
                    <img src={priorityInfo.icon} alt="" className="w-4 h-4" />
                    <span className={`text-xs ${priorityInfo.color}`}>{priorityInfo.label}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center py-2.5 border-b border-[#F0F1F2]">
                  <span className="text-xs text-[#5F6F65] font-medium">Тип дедлайна:</span>
                  <div className="flex items-center gap-2">
                    <img src={deadlineTypeInfo.icon} alt="" className="w-4 h-4" />
                    <span className={`text-xs ${deadlineTypeInfo.color}`}>
                      {deadlineTypeInfo.label}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center py-2.5 border-b border-[#F0F1F2]">
                  <span className="text-xs text-[#5F6F65] font-medium pt-0.5">Дедлайн:</span>
                  <div className="flex flex-col items-start gap-0.5">
                    <div className="flex items-center gap-2">
                      <img src="/calendar-icon.svg" alt="" className="w-4 h-4" />
                      <span
                        className={`text-xs ${deadlineInfo.isOverdue && !isCompleted ? 'text-[#D32F2F]' : 'text-[#6F7D75]'} translate-y-[1.5px]`}
                      >
                        {deadlineInfo.text}
                      </span>
                    </div>
                    {deadlineInfo.isOverdue && !isCompleted && (
                      <span className="text-[0.625rem] font-medium text-[#D32F2F] leading-none">
                        Просрочено
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center py-2.5 border-b border-[#F0F1F2]">
                  <span className="text-xs text-[#5F6F65] font-medium">Создано:</span>
                  <div className="flex items-center gap-2">
                    <img src="/calendar-icon.svg" alt="" className="w-4 h-4" />
                    <span className="text-xs text-[#6F7D75] translate-y-[1.5px]">
                      {getDeadlineInfo(task.createdAt as string).text}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4">
                <button
                  onClick={handleFocusMode}
                  className="w-full py-2.5 bg-[#F0F3ED]/75 border border-[#8CA693] text-[#8CA693] rounded-xl text-sm font-medium hover:bg-[#E2E8E0] transition-colors flex items-center justify-center gap-2"
                >
                  <img src="/focus-icon.svg" alt="" className="w-4 h-4 -translate-y-[1.5px]" />
                  Режим фокуса
                </button>
              </div>
            </div>

            <button
              onClick={handleCompleteTask}
              disabled={isCompleted || isUpdating}
              className={`w-full px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                isCompleted || isUpdating
                  ? 'bg-[#E4F0E5] text-[#8CA693] cursor-not-allowed'
                  : 'bg-[#8CA693] text-white hover:bg-[#7A9181]'
              }`}
            >
              <img src="/completeTask-icon.svg" alt="" className="w-3.5 h-3.5" />
              {isCompleted ? 'Задача завершена' : isUpdating ? 'Завершаем...' : 'Завершить задачу'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
