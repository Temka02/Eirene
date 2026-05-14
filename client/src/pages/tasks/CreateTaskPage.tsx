import { useEffect, useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateTaskMutation } from '../../features/tasks/tasksApi';
import { useGetProjectsQuery } from '../../features/projects/projectsApi';
import type { Task } from '../../entities/task/model';
import { useAddSubtaskMutation } from '../../features/tasks/subtasksApi';

export default function CreateTaskPage() {
  const navigate = useNavigate();
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [addSubtask] = useAddSubtaskMutation();
  const { data: projectsData } = useGetProjectsQuery();
  const projects = projectsData || [];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [deadlineType, setDeadlineType] = useState<Task['deadlineType']>('none');
  const [deadline, setDeadline] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>(['']);
  const [error, setError] = useState('');

  useEffect(() => {
    if (deadlineType === 'none') {
      setDeadline('');
    }
  }, [deadlineType]);

  const handleAddSubtaskInput = () => {
    setSubtasks([...subtasks, '']);
  };

  const handleRemoveSubtask = (index: number) => {
    const newSubtasks = [...subtasks];
    newSubtasks.splice(index, 1);
    setSubtasks(newSubtasks);
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = value;
    setSubtasks(newSubtasks);
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Название задачи обязательно');
      return;
    }

    if (title.length > 100) {
      setError('Название задачи не должно превышать 100 символов');
      return;
    }

    if (description.length > 500) {
      setError('Описание не должно превышать 500 символов');
      return;
    }

    if (deadlineType !== 'none' && !deadline) {
      setError('Укажите дату дедлайна');
      return;
    }

    const validSubtasks = subtasks.filter((s) => s.trim() !== '');
    if (validSubtasks.length > 20) {
      setError('Максимум 20 подзадач');
      return;
    }

    try {
      const createdTask = await createTask({
        title,
        description,
        projectId: projectId || undefined,
        priority,
        deadlineType,
        deadline: deadlineType !== 'none' ? deadline : undefined,
      }).unwrap();

      if (createdTask._id && validSubtasks.length > 0) {
        for (const subtaskTitle of validSubtasks) {
          await addSubtask({
            taskId: createdTask._id,
            title: subtaskTitle,
          }).unwrap();
        }
      }

      navigate('/tasks');
    } catch (err: any) {
      setError(err.data?.error || 'Ошибка при создании задачи');
    }
  };

  return (
    <div className="px-5 md:px-8 h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="w-full mx-auto">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={() => navigate('/tasks')}
            className="w-12 h-9 bg-white rounded-[0.625rem] shadow-[0_6px_20px_0_rgba(0,0,0,0.05)] flex items-center justify-center hover:bg-[#F8FAFC] transition-colors"
          >
            <img src="/sortArrow-icon.svg" alt="Назад" className="w-4 h-4 -rotate-90" />
          </button>
          <h1 className="text-2xl text-[#2F3A34]">Добавить задачу</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#FFEDEE] text-[#D32F2F] text-sm rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
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
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Введите название задачи"
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#F0F1F2] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all"
                    />
                  </div>
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
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Кратко напишите, о чем ваша задача"
                      rows={2}
                      maxLength={500}
                      className="w-full pl-12 pr-11 py-3 bg-white border-2 border-[#F0F1F2] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all resize-none"
                    />
                    <span className="absolute bottom-3 right-3 text-xs text-[#A0AEC0]">
                      {description.length}/500
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2F3A34] mb-1.5">
                    Приоритет
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPriority('high')}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border-2 ${
                        priority === 'high'
                          ? 'border-[#D9636B] bg-[#FFEDEE] text-[#D32F2F]'
                          : 'border-[#F0F1F2] bg-white text-[#6F7D75] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <img src="/highPriority-icon.svg" alt="" className="w-5 h-5" />
                      <span className="text-xs font-medium">Высокий</span>
                      <span className="text-[0.625rem] opacity-75 text-[#6F7D75]">
                        Важная задача
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPriority('medium')}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border-2 ${
                        priority === 'medium'
                          ? 'border-[#FFC65C] bg-[#FFF4E5] text-[#FFC65C]'
                          : 'border-[#F0F1F2] bg-white text-[#6F7D75] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <img src="/mediumPriority-icon.svg" alt="" className="w-5 h-5" />
                      <span className="text-xs font-medium ">Средний</span>
                      <span className="text-[0.625rem] opacity-75 text-[#6F7D75]">
                        Стандартный приоритет
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPriority('low')}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border-2 ${
                        priority === 'low'
                          ? 'border-[#8CA693] bg-[#E6F9F1] text-[#10B981]'
                          : 'border-[#F0F1F2] bg-white text-[#6F7D75] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <img src="/lowPriority-icon.svg" alt="" className="w-5 h-5" />
                      <span className="text-xs font-medium">Низкий</span>
                      <span className="text-[0.625rem] opacity-75 text-[#6F7D75]">
                        Выполняй в спокойном темпе
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2F3A34] mb-1.5">
                    Тип дедлайна
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeadlineType('hard')}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border-2 ${
                        deadlineType === 'hard'
                          ? 'border-[#D9636B] bg-[#FFEDEE] text-[#D32F2F]'
                          : 'border-[#F0F1F2] bg-white text-[#6F7D75] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <img src="/hardDeadlineType-icon.svg" alt="" className="w-5 h-5 mb-1" />
                      <span className="text-xs font-medium">Жёсткий</span>
                      <span className="text-[0.625rem] opacity-75">Лучше выполнить в срок</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeadlineType('soft')}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border-2 ${
                        deadlineType === 'soft'
                          ? 'border-[#8CA693] bg-[#E6F9F1] text-[#10B981]'
                          : 'border-[#F0F1F2] bg-white text-[#6F7D75] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <img src="/softDeadlineType-icon.svg" alt="" className="w-5 h-5 mb-1" />
                      <span className="text-xs font-medium">Мягкий</span>
                      <span className="text-[0.625rem] opacity-75">Можно отложить</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeadlineType('none')}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border-2 ${
                        deadlineType === 'none'
                          ? 'border-[#a1b0a8] bg-[#F3F4F6] text-[#6F7D75]'
                          : 'border-[#F0F1F2] bg-white text-[#6F7D75] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <img src="/noDeadline-icon.svg" alt="" className="w-5 h-5 mb-1" />
                      <span className="text-xs font-medium">Без срока</span>
                    </button>
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
                      value={projectId || ''}
                      onChange={(e) => setProjectId(e.target.value || undefined)}
                      className="w-full pl-12 pr-10 py-3 bg-white border-2 border-[#F0F1F2] text-[#767676] rounded-xl text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all cursor-pointer"
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
                  <label htmlFor="date" className="block text-sm font-medium text-[#2F3A34] mb-1.5">
                    Дедлайн
                  </label>
                  <div className="relative">
                    <img
                      src="/calendar-icon.svg"
                      alt=""
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6F7D75]"
                    />
                    <input
                      id="date"
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      disabled={deadlineType === 'none'}
                      className={`w-full pl-12 pr-4 py-3 bg-white border-2 border-[#F0F1F2] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                  </div>
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
              <p className="text-sm text-[#6F7D75] ml-1 mb-2">Внесите подзадачи</p>

              {subtasks.map((subtask, index) => (
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
                      value={subtask}
                      onChange={(e) => handleSubtaskChange(index, e.target.value)}
                      placeholder={`Подзадача ${index + 1}`}
                      className="w-full pl-12 pr-10 py-3 bg-white border-2 border-[#F0F1F2] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all"
                    />
                    {subtasks.length > 1 && (
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
                onClick={handleAddSubtaskInput}
                className="flex items-center gap-2 text-[#8CA693] font-medium text-sm hover:text-[#7A9181] transition-colors ml-9 mt-2"
              >
                <img src="/add-icon.svg" alt="" className="w-4 h-4" />
                Добавить подзадачу
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="w-[13.5rem] text-center py-3 bg-white text-[#8CA693] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
            >
              Отменить
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="w-[13.5rem] text-center py-3 bg-[#8CA693] text-white rounded-xl text-sm font-medium hover:bg-[#7A9181] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_6px_20px_0_rgba(140,166,147,0.4)] transition-all"
            >
              {isCreating ? 'Создание...' : 'Добавить задачу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
