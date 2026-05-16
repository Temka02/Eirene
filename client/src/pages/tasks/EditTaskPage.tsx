import * as Sentry from '@sentry/react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateTaskMutation, useGetTaskQuery } from '../../features/tasks/tasksApi';
import { useGetProjectsQuery } from '../../features/projects/projectsApi';
import {
  useAddSubtaskMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
} from '../../features/tasks/subtasksApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskFormData } from '../../entities/validation';
interface LocalSubtask {
  id?: string;
  title: string;
}

export default function EditTaskPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: task, isLoading: isLoadingTask } = useGetTaskQuery(id!);
  const { data: projectsData } = useGetProjectsQuery();
  const projects = projectsData || [];

  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [addSubtask] = useAddSubtaskMutation();
  const [updateSubtask] = useUpdateSubtaskMutation();
  const [deleteSubtask] = useDeleteSubtaskMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
      deadlineType: 'none',
    },
  });

  const deadlineType = watch('deadlineType');

  const [localSubtasks, setLocalSubtasks] = useState<LocalSubtask[]>([]);

  useEffect(() => {
    if (task) {
      const rawProjectId = task.projectId;
      const formattedProjectId =
        typeof rawProjectId === 'string' ? rawProjectId : (rawProjectId as any)?._id || '';

      let formattedDeadline = '';
      if (task.deadline) {
        const date = new Date(task.deadline);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        formattedDeadline = localDate.toISOString().slice(0, 16);
      }

      reset({
        title: task.title,
        description: task.description || '',
        projectId: formattedProjectId,
        priority: task.priority || 'medium',
        deadlineType: task.deadlineType || 'none',
        deadline: formattedDeadline,
      });

      if (task.checklist && task.checklist.length > 0) {
        setLocalSubtasks(task.checklist.map((s) => ({ id: s.id, title: s.title })));
      } else {
        setLocalSubtasks([{ title: '' }]);
      }
    }
  }, [task, reset]);

  const handleAddSubtask = () => setLocalSubtasks([...localSubtasks, { title: '' }]);

  const handleRemoveSubtask = async (index: number) => {
    const subtaskToRemove = localSubtasks[index];
    const newSubtasks = [...localSubtasks];
    newSubtasks.splice(index, 1);
    setLocalSubtasks(newSubtasks);

    if (subtaskToRemove.id) {
      try {
        await deleteSubtask({ taskId: id!, subtaskId: subtaskToRemove.id }).unwrap();
      } catch (err) {
        Sentry.captureException('Failed to delete subtask', err);
      }
    }
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const newSubtasks = [...localSubtasks];
    newSubtasks[index].title = value;
    setLocalSubtasks(newSubtasks);
  };

  const onSubmit = async (data: TaskFormData) => {
    try {
      await updateTask({
        id: id!,
        title: data.title,
        description: data.description,
        projectId: data.projectId || undefined,
        priority: data.priority,
        deadlineType: data.deadlineType,
        deadline: data.deadlineType !== 'none' ? data.deadline : undefined,
        status: task?.status,
      }).unwrap();

      const validSubtasks = localSubtasks.filter((s) => s.title.trim() !== '');

      for (const sub of validSubtasks) {
        if (sub.id) {
          await updateSubtask({
            taskId: id!,
            subtaskId: sub.id,
            title: sub.title,
          }).unwrap();
        } else {
          await addSubtask({
            taskId: id!,
            title: sub.title,
          }).unwrap();
        }
      }

      navigate('/tasks');
    } catch (err: any) {
      Sentry.captureException(err);
    }
  };

  if (isLoadingTask || !task) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-[#6F7D75] text-sm">Загрузка данных...</div>
      </div>
    );
  }

  return (
    <div className="px-5 md:px-8 pb-4 h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="w-full mx-auto">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={() => navigate('/tasks')}
            className="w-12 h-9 bg-white rounded-[0.625rem] shadow-[0_6px_20px_0_rgba(0,0,0,0.05)] flex items-center justify-center hover:bg-[#F0F3ED]/70 transition-colors"
          >
            <img src="/sortArrow-icon.svg" alt="Назад" className="w-4 h-4 -rotate-90" />
          </button>
          <h1 className="text-2xl text-[#2F3A34]">Редактировать задачу</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl p-8 shadow-sm mb-4">
            <h2 className="text-base font-medium text-[#2F3A34] mb-4 flex items-center justify-start gap-3">
              <div className="flex justify-center items-center rounded-full bg-[#F0F3ED] text-[#5F6F65] w-6 h-6">
                1
              </div>
              Информация о задаче
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-16 pl-10">
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-[#2F3A34] mb-1.5"
                  >
                    Название задачи
                  </label>
                  <div className="relative ml-1">
                    <img
                      src="/projects-icon.svg"
                      alt=""
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6F7D75]"
                    />
                    <input
                      id="title"
                      type="text"
                      placeholder="Введите название задачи"
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#F0F1F2] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all"
                      {...register('title')}
                    />
                  </div>
                  {errors.title && (
                    <p className="text-xs text-[#D32F2F] mt-1 ml-2">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-[#2F3A34] mb-1.5"
                  >
                    Описание
                  </label>
                  <div className="relative">
                    <img
                      src="/projects-icon.svg"
                      alt=""
                      className="absolute left-4 top-4 w-5 h-5 text-[#6F7D75]"
                    />
                    <textarea
                      id="description"
                      placeholder="Кратко напишите, о чем ваша задача"
                      rows={2}
                      maxLength={500}
                      className="w-full pl-12 pr-11 py-3 bg-white border-2 border-[#F0F1F2] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all resize-none"
                      {...register('description')}
                    />
                    <span className="absolute bottom-3 right-3 text-xs text-[#A0AEC0]">
                      {watch('description')?.length || 0}/500
                    </span>
                  </div>
                  {errors.description && (
                    <p className="text-xs text-[#D32F2F] mt-1 ml-2">{errors.description.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2F3A34] mb-1.5">
                    Приоритет
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        val: 'high',
                        label: 'Высокий',
                        icon: '/highPriority-icon.svg',
                        active: 'border-[#D9636B] bg-[#FFEDEE] text-[#D32F2F]',
                      },
                      {
                        val: 'medium',
                        label: 'Средний',
                        icon: '/mediumPriority-icon.svg',
                        active: 'border-[#FFC65C] bg-[#FFF4E5] text-[#FFC65C]',
                      },
                      {
                        val: 'low',
                        label: 'Низкий',
                        icon: '/lowPriority-icon.svg',
                        active: 'border-[#8CA693] bg-[#E6F9F1] text-[#10B981]',
                      },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setValue('priority', p.val as any)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border-2 ${
                          watch('priority') === p.val
                            ? p.active
                            : 'border-[#F0F1F2] bg-white text-[#6F7D75] hover:bg-[#F0F3ED]/70'
                        }`}
                      >
                        <img src={p.icon} alt="" className="w-5 h-5" />
                        <span className="text-xs font-medium">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2F3A34] mb-1.5">
                    Тип дедлайна
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        val: 'hard',
                        label: 'Жёсткий',
                        icon: '/hardDeadlineType-icon.svg',
                        active: 'border-[#D9636B] bg-[#FFEDEE] text-[#D32F2F]',
                      },
                      {
                        val: 'soft',
                        label: 'Мягкий',
                        icon: '/softDeadlineType-icon.svg',
                        active: 'border-[#8CA693] bg-[#E6F9F1] text-[#10B981]',
                      },
                      {
                        val: 'none',
                        label: 'Без срока',
                        icon: '/noDeadline-icon.svg',
                        active: 'border-[#a1b0a8] bg-[#F3F4F6] text-[#6F7D75]',
                      },
                    ].map((dt) => (
                      <button
                        key={dt.val}
                        type="button"
                        onClick={() => setValue('deadlineType', dt.val as any)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border-2 ${
                          watch('deadlineType') === dt.val
                            ? dt.active
                            : 'border-[#F0F1F2] bg-white text-[#6F7D75] hover:bg-[#F0F3ED]/70'
                        }`}
                      >
                        <img src={dt.icon} alt="" className="w-5 h-5 mb-1" />
                        <span className="text-xs font-medium">{dt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#2F3A34] mb-1.5">Проект</label>
                  <div className="relative">
                    <img
                      src="/projects-icon.svg"
                      alt=""
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6F7D75]"
                    />
                    <select
                      className="w-full pl-12 pr-10 py-3 bg-white border-2 border-[#F0F1F2] text-[#767676] rounded-xl text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all cursor-pointer"
                      {...register('projectId')}
                    >
                      <option value="">Выберите проект</option>
                      {projects.map((project: any) => (
                        <option key={project._id} value={project._id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                    <img
                      src="/asideArrow-icon.svg"
                      alt=""
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none -rotate-90"
                    />
                  </div>
                  <p className="mt-1 ml-2 text-[0.625rem] text-[#767676]">
                    Если не выбрать, задача будет помечена как "Личное"
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="deadline"
                    className="block text-sm font-medium text-[#2F3A34] mb-1.5"
                  >
                    Дедлайн
                  </label>
                  <div className="relative">
                    <img
                      src="/calendar-icon.svg"
                      alt=""
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6F7D75]"
                    />
                    <input
                      id="deadline"
                      type="datetime-local"
                      disabled={deadlineType === 'none'}
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#F0F1F2] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      {...register('deadline')}
                    />
                  </div>
                  {errors.deadline && (
                    <p className="text-xs text-[#D32F2F] mt-1 ml-2">{errors.deadline.message}</p>
                  )}
                </div>
              </div>
            </div>

            <h2 className="text-base font-medium text-[#2F3A34] mt-8 mb-4 flex items-center justify-start gap-3">
              <div className="flex justify-center items-center rounded-full bg-[#F0F3ED] text-[#5F6F65] w-6 h-6">
                2
              </div>
              Подзадачи
            </h2>

            <div className="space-y-3 pl-10">
              {localSubtasks.map((subtask, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#8CA693] text-white text-xs font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="relative flex-1">
                    <img
                      src="/subtask-icon.svg"
                      alt=""
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6F7D75]"
                    />
                    <input
                      type="text"
                      value={subtask.title}
                      onChange={(e) => handleSubtaskChange(index, e.target.value)}
                      placeholder={`Подзадача ${index + 1}`}
                      className="w-full pl-12 pr-10 py-3 bg-white border-2 border-[#F0F1F2] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all"
                    />
                    {localSubtasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(index)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#F0F1F2] rounded-full transition-colors"
                      >
                        <img
                          src="/delete-icon.svg"
                          alt="Удалить"
                          className="w-4 h-4 opacity-50 hover:opacity-100"
                        />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddSubtask}
                className="flex items-center gap-2 text-[#8CA693] font-medium text-sm hover:text-[#7A9181] transition-colors ml-9 mt-2"
              >
                <img src="/add-icon.svg" alt="" className="w-4 h-4" />
                Добавить подзадачу
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-4 mb-2">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="w-[13.5rem] text-center py-3 bg-white text-[#8CA693] rounded-xl text-sm font-medium hover:bg-[#F0F3ED]/70 transition-colors"
            >
              Отменить
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="w-[13.5rem] text-center py-3 bg-[#8CA693] text-white rounded-xl text-sm font-medium hover:bg-[#7A9181] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_6px_20px_0_rgba(140,166,147,0.4)] transition-all"
            >
              {isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
