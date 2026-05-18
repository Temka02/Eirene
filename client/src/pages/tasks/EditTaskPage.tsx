import * as Sentry from '@sentry/react';
import { useEffect, useRef, useState } from 'react';
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
import { localDateTimeToUTC } from '../../utils/dateHelper';

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

  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const projectRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectRef.current && !projectRef.current.contains(event.target as Node)) {
        setIsProjectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        Sentry.captureException(err, { extra: { context: 'Failed to delete subtask' } });
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
      let deadlineToSend = data.deadlineType !== 'none' ? data.deadline : undefined;
      if (deadlineToSend) {
        deadlineToSend = localDateTimeToUTC(deadlineToSend);
      }

      await updateTask({
        id: id!,
        title: data.title,
        description: data.description,
        projectId: data.projectId || undefined,
        priority: data.priority,
        deadlineType: data.deadlineType,
        deadline: deadlineToSend,
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
      Sentry.captureException(err, { extra: { context: 'Failed to update task' } });
    }
  };

  if (isLoadingTask || !task) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-[#6F7D75] text-xs sm:text-sm">Загрузка данных...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-5 md:px-8 pb-4 h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="w-full mx-auto">
        <div className="flex items-center gap-3 sm:gap-4 mb-3">
          <button
            onClick={() => navigate('/tasks')}
            className="w-10 h-8 sm:w-12 sm:h-9 bg-white rounded-[0.625rem] shadow-[0_6px_20px_0_rgba(0,0,0,0.05)] flex items-center justify-center hover:bg-[#F0F3ED]/70 transition-colors"
          >
            <img
              src="/sortArrow-icon.svg"
              alt="Назад"
              className="w-3 h-3 sm:w-4 sm:h-4 -rotate-90"
            />
          </button>
          <h1 className="text-xl sm:text-2xl text-[#2F3A34]">Редактировать задачу</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl px-4 sm:px-5 md:px-8 py-6 sm:py-8 shadow-sm mb-4">
            <h2 className="text-sm sm:text-base font-medium text-[#2F3A34] mb-3 sm:mb-4 flex items-center justify-start gap-3">
              <div className="flex justify-center items-center rounded-full bg-[#F0F3ED] text-[#5F6F65] w-5 h-5 sm:w-6 sm:h-6 text-xs sm:text-sm">
                1
              </div>
              Информация о задаче
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 sm:gap-12 md:gap-16 pl-2 sm:pl-10">
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-xs sm:text-sm font-medium text-[#2F3A34] mb-1.5"
                  >
                    Название задачи
                  </label>
                  <div className="relative ml-1">
                    <img
                      src="/projects-icon.svg"
                      alt=""
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#6F7D75]"
                    />
                    <input
                      id="title"
                      type="text"
                      placeholder="Введите название задачи"
                      className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 bg-white border-2 border-[#F0F1F2] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all"
                      {...register('title')}
                    />
                  </div>
                  {errors.title && (
                    <p className="text-[0.7rem] sm:text-xs text-[#D32F2F] mt-1 ml-2">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-xs sm:text-sm font-medium text-[#2F3A34] mb-1.5"
                  >
                    Описание
                  </label>
                  <div className="relative">
                    <img
                      src="/projects-icon.svg"
                      alt=""
                      className="absolute left-4 top-4 w-4 h-4 sm:w-5 sm:h-5 text-[#6F7D75]"
                    />
                    <textarea
                      id="description"
                      placeholder="Кратко напишите, о чем ваша задача"
                      rows={2}
                      maxLength={500}
                      className="w-full pl-10 sm:pl-12 pr-11 py-2 sm:py-3 bg-white border-2 border-[#F0F1F2] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all resize-none"
                      {...register('description')}
                    />
                    <span className="absolute bottom-2 right-3 text-[0.6rem] sm:text-xs text-[#A0AEC0]">
                      {watch('description')?.length || 0}/500
                    </span>
                  </div>
                  {errors.description && (
                    <p className="text-[0.7rem] sm:text-xs text-[#D32F2F] mt-1 ml-2">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#2F3A34] mb-1.5">
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
                        className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl transition-all border-2 ${
                          watch('priority') === p.val
                            ? p.active
                            : 'border-[#F0F1F2] bg-white text-[#6F7D75] hover:bg-[#F0F3ED]/70'
                        }`}
                      >
                        <img src={p.icon} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-[0.65rem] sm:text-xs font-medium">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#2F3A34] mb-1.5">
                    Тип дедлайна
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        val: 'hard',
                        label: 'Жесткий',
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
                        className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl transition-all border-2 ${
                          watch('deadlineType') === dt.val
                            ? dt.active
                            : 'border-[#F0F1F2] bg-white text-[#6F7D75] hover:bg-[#F0F3ED]/70'
                        }`}
                      >
                        <img
                          src={dt.icon}
                          alt=""
                          className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1"
                        />
                        <span className="text-[0.65rem] sm:text-xs font-medium">{dt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#2F3A34] mb-1.5">
                    Проект
                  </label>
                  <div ref={projectRef} className="relative">
                    <img
                      src="/projects-icon.svg"
                      alt=""
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#6F7D75] z-10"
                    />
                    <button
                      type="button"
                      onClick={() => setIsProjectOpen(!isProjectOpen)}
                      className="w-full pl-10 sm:pl-12 pr-10 py-2 sm:py-3 bg-white border-2 border-[#F0F1F2] rounded-xl text-xs sm:text-sm text-left focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all flex items-center justify-between"
                    >
                      <span className="truncate">
                        {watch('projectId')
                          ? projects.find((p: any) => p._id === watch('projectId'))?.title ||
                            'Выберите проект'
                          : 'Выберите проект'}
                      </span>
                      <img
                        src="/asideArrow-icon.svg"
                        alt=""
                        className={`w-3 h-3 transition-transform ${isProjectOpen ? '-rotate-180' : '-rotate-90'}`}
                      />
                    </button>
                    {isProjectOpen && (
                      <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        <div
                          onClick={() => {
                            setValue('projectId', '');
                            setIsProjectOpen(false);
                          }}
                          className={`px-3 sm:px-4 py-2 sm:py-2.5 text-[0.7rem] sm:text-sm cursor-pointer hover:bg-[#F0F3ED] ${!watch('projectId') ? 'bg-[#F0F3ED] text-[#2F3A34] font-medium' : 'text-[#6F7D75]'}`}
                        >
                          <span>Личное (без проекта)</span>
                        </div>
                        {projects.map((project: any) => (
                          <div
                            key={project._id}
                            onClick={() => {
                              setValue('projectId', project._id);
                              setIsProjectOpen(false);
                            }}
                            className={`px-3 sm:px-4 py-2 sm:py-2.5 text-[0.7rem] sm:text-sm cursor-pointer hover:bg-[#F0F3ED] ${
                              watch('projectId') === project._id
                                ? 'bg-[#F0F3ED] text-[#2F3A34] font-medium'
                                : 'text-[#6F7D75]'
                            }`}
                          >
                            {project.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 ml-2 text-[0.55rem] sm:text-[0.625rem] text-[#767676]">
                    Если не выбрать, задача будет помечена как "Личное"
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="deadline"
                    className="block text-xs sm:text-sm font-medium text-[#2F3A34] mb-1.5"
                  >
                    Дедлайн
                  </label>
                  <div className="relative">
                    <img
                      src="/calendar-icon.svg"
                      alt=""
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#6F7D75]"
                    />
                    <input
                      id="deadline"
                      type="datetime-local"
                      disabled={deadlineType === 'none'}
                      className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 bg-white border-2 border-[#F0F1F2] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      {...register('deadline')}
                    />
                  </div>
                  {errors.deadline && (
                    <p className="text-[0.7rem] sm:text-xs text-[#D32F2F] mt-1 ml-2">
                      {errors.deadline.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <h2 className="text-sm sm:text-base font-medium text-[#2F3A34] mt-6 sm:mt-8 mb-3 sm:mb-4 flex items-center justify-start gap-3">
              <div className="flex justify-center items-center rounded-full bg-[#F0F3ED] text-[#5F6F65] w-5 h-5 sm:w-6 sm:h-6 text-xs sm:text-sm">
                2
              </div>
              Подзадачи
            </h2>

            <div className="space-y-3 pl-2 sm:pl-10">
              {localSubtasks.map((subtask, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#8CA693] text-white text-[0.6rem] sm:text-xs font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="relative flex-1">
                    <img
                      src="/subtask-icon.svg"
                      alt=""
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#6F7D75]"
                    />
                    <input
                      type="text"
                      value={subtask.title}
                      onChange={(e) => handleSubtaskChange(index, e.target.value)}
                      placeholder={`Подзадача ${index + 1}`}
                      className="w-full pl-10 sm:pl-12 pr-10 py-2 sm:py-3 bg-white border-2 border-[#F0F1F2] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all"
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
                          className="w-3 h-3 sm:w-4 sm:h-4 opacity-50 hover:opacity-100"
                        />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddSubtask}
                className="flex items-center gap-2 text-[#8CA693] font-medium text-xs sm:text-sm hover:text-[#7A9181] transition-colors ml-9 mt-2"
              >
                <img src="/add-icon.svg" alt="" className="w-3 h-3 sm:w-4 sm:h-4" />
                Добавить подзадачу
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mb-2">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="w-full sm:w-[13.5rem] text-center py-2 sm:py-3 bg-white text-[#8CA693] rounded-xl text-xs sm:text-sm font-medium hover:bg-[#F0F3ED]/70 transition-colors"
            >
              Отменить
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full sm:w-[13.5rem] text-center py-2 sm:py-3 bg-[#8CA693] text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-[#7A9181] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_6px_20px_0_rgba(140,166,147,0.4)] transition-all"
            >
              {isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
