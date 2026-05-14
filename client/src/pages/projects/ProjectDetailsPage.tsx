import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetProjectQuery,
  useDeleteProjectMutation,
  useGetProjectTasksQuery,
} from '../../features/projects/projectsApi';
import type { Task } from '../../entities/task/model';

const LIMIT = 5;

const projectIconConfig = {
  plant: { src: '/project-plant-icon.svg', iconBg: 'bg-[#F0F1F2]' },
  sun: { src: '/project-sun-icon.svg', iconBg: 'bg-[#FFEFD3]' },
  waves: { src: '/project-waves-icon.svg', iconBg: 'bg-[#E9F0F9]' },
  star: { src: '/project-star-icon.svg', iconBg: 'bg-[#F5F3FF]' },
  mountains: { src: '/project-mountains-icon.svg', iconBg: 'bg-[#EDD7C9]' },
  flower: { src: '/project-flower-icon.svg', iconBg: 'bg-[#FFC9C9]' },
};

export default function ProjectDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    data: project,
    isLoading: loadingProject,
    isError: errorProject,
  } = useGetProjectQuery(id!);
  const [deleteProject] = useDeleteProjectMutation();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | undefined>();
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done' | undefined>();
  const [deadlineType, setDeadlineType] = useState<'hard' | 'soft' | 'none' | undefined>();
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDeadlineTypeOpen, setIsDeadlineTypeOpen] = useState(false);

  const priorityRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const deadlineTypeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, priority, status, deadlineType, order]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node))
        setIsPriorityOpen(false);
      if (statusRef.current && !statusRef.current.contains(event.target as Node))
        setIsStatusOpen(false);
      if (deadlineTypeRef.current && !deadlineTypeRef.current.contains(event.target as Node))
        setIsDeadlineTypeOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const {
    data: tasksResponse,
    isLoading: loadingTasks,
    isFetching: fetchingTasks,
  } = useGetProjectTasksQuery({
    id: id!,
    search: debouncedSearch || undefined,
    priority,
    status,
    deadlineType,
    sortBy: 'deadline',
    order,
    limit: LIMIT,
    page,
  });

  const tasks = tasksResponse?.data || [];
  const totalPages = tasksResponse?.totalPages || 1;
  const totalTasks = tasksResponse?.total || 0;

  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const formatDate = (dateStr?: string) => {
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

  const getPriorityConfig = (p: Task['priority']) => {
    switch (p) {
      case 'high':
        return {
          label: 'Высокий',
          color: 'text-[#D32F2F]',
          icon: '/highPriority-icon.svg',
          bg: 'bg-[#FFEDEE]',
        };
      case 'medium':
        return {
          label: 'Средний',
          color: 'text-[#F59E0B]',
          icon: '/mediumPriority-icon.svg',
          bg: 'bg-[#FFF4E5]',
        };
      case 'low':
        return {
          label: 'Низкий',
          color: 'text-[#10B981]',
          icon: '/lowPriority-icon.svg',
          bg: 'bg-[#E6F9F1]',
        };
    }
  };

  const getDeadlineTypeConfig = (dt: Task['deadlineType']) => {
    switch (dt) {
      case 'hard':
        return {
          label: 'Жёсткий',
          icon: '/hardDeadlineType-icon.svg',
          color: 'text-[#D32F2F]',
          bg: 'bg-[#FFEDEE]',
        };
      case 'soft':
        return {
          label: 'Мягкий',
          icon: '/softDeadlineType-icon.svg',
          color: 'text-[#10B981]',
          bg: 'bg-[#E6F9F1]',
        };
      case 'none':
        return {
          label: 'Без срока',
          icon: '/noDeadline-icon.svg',
          color: 'text-[#6F7D75]',
          bg: 'bg-[#F3F4F6]',
        };
    }
  };

  const getStatusConfig = (s: Task['status']) => {
    switch (s) {
      case 'todo':
        return { label: 'Ожидает', color: 'text-[#3B82F6]' };
      case 'in_progress':
        return { label: 'В работе', color: 'text-[#FFC65C]' };
      case 'done':
        return { label: 'Выполнено', color: 'text-[#8CA693]' };
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить проект и все его задачи?')) {
      await deleteProject({ id: id! }).unwrap();
      navigate('/projects');
    }
  };

  const handleAddTask = () => {
    navigate('/tasks/create', { state: { projectId: id } });
  };

  if (loadingProject) return <div className="flex justify-center p-10">Загрузка...</div>;
  if (errorProject || !project)
    return <div className="flex justify-center p-10 text-[#D32F2F]">Проект не найден</div>;

  const iconData = projectIconConfig[project.icon] || projectIconConfig.plant;

  return (
    <div className="px-5 md:px-8 lg:px-11 h-[calc(100vh-8rem)] overflow-y-auto eirene-scrollbar">
      <div className="w-full max-w-[1280px] mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate('/projects')}
            className="w-10 h-7 bg-white rounded-[0.625rem] shadow-[0_6px_20px_0_rgba(0,0,0,0.05)] flex items-center justify-center hover:bg-[#F8FAFC] transition-colors"
          >
            <img src="/sortArrow-icon.svg" alt="Назад" className="w-3.5 h-3.5 -rotate-90" />
          </button>
          <h2 className="text-lg text-[#6F7D75]">Назад к проектам</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_0.75fr] gap-14 mb-4">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1px_1fr] lg:gap-9 gap-1 items-stretch mb-6">
                <div className="flex flex-col items-start">
                  <div className="flex items-start gap-4 flex-1 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${iconData.iconBg} flex items-center justify-center flex-shrink-0`}
                    >
                      <img src={iconData.src} alt="" className="w-7 h-7" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg text-[#5F6F65] break-all leading-snug overflow-hidden">
                        Проект:
                        <span className="ml-1 font-medium text-[#2F3A34]">{project.title}</span>
                      </h2>
                      {project.updatedAt && (
                        <p className="text-xs text-[#6F7D75] mt-1">
                          Последнее обновление: {formatDate(project.updatedAt).text}
                        </p>
                      )}
                    </div>
                  </div>
                  {project.description && (
                    <h3 className="text-sm text-[#5F6F65] leading-relaxed break-all overflow-hidden">
                      Описание:
                      <span className="text-[#2F3A34] font-medium ml-1">{project.description}</span>
                    </h3>
                  )}
                </div>

                <div className="lg:w-[1px] lg:block hidden w-0 self-stretch bg-[#F0F1F2]"></div>

                <div className="mt-2 flex-1 text-left">
                  <h3 className="text-sm font-medium text-[#2F3A34] mb-3">Прогресс проекта</h3>
                  <p className="text-xs text-[#6F7D75] mb-3">
                    {completedTasks} из {totalTasks} задач
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-[#F0F1F2] rounded-full overflow-hidden max-w-[18rem]">
                      <div
                        className="h-full bg-[#8CA693] rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-[#6F7D75]">{progressPercent}%</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate(`/projects/${id}/edit`)}
                  className="px-4 py-1.5 bg-[#8CA693] text-white rounded-lg text-sm font-medium hover:bg-[#7A9181] transition-colors flex items-center gap-2"
                >
                  <img src="/edit-icon.svg" alt="" className="w-3.5 h-3.5 -translate-y-[1.5px]" />
                  Редактировать
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-1.5 bg-[#FFC9C9]/70 text-[#D32F2F] rounded-lg text-sm font-medium hover:bg-[#D32F2F]/20 transition-colors flex items-center gap-2"
                >
                  <img src="/delete-icon.svg" alt="" className="w-4 h-4" />
                  Удалить проект
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-base font-medium text-[#2F3A34]">Задачи</h2>
                <div className="relative w-full sm:w-64">
                  <img
                    src="/search2-icon.svg"
                    alt=""
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F7D75]"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск по задачам..."
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#F0F1F2] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <div ref={priorityRef} className="relative">
                  <button
                    onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                    className="px-3.5 py-2 text-[#6F7D75] bg-white border shadow-[0_6px_20px_0_rgba(0,0,0,0.05)] flex items-center gap-1.5 rounded-lg text-xs hover:bg-[#F8FAFC] transition-colors"
                  >
                    <span>
                      {priority
                        ? priority === 'high'
                          ? 'Высокий'
                          : priority === 'medium'
                            ? 'Средний'
                            : 'Низкий'
                        : 'Приоритет'}
                    </span>
                    <img
                      src="/asideArrow-icon.svg"
                      alt=""
                      className={`w-2 h-2 transition-transform ${isPriorityOpen ? '-rotate-180' : '-rotate-90'}`}
                    />
                  </button>
                  {isPriorityOpen && (
                    <div className="absolute top-full left-0 mt-1 w-32 bg-white border shadow-lg rounded-lg py-1 z-50 text-[#6F7D75]">
                      {(['high', 'medium', 'low'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => {
                            setPriority(p);
                            setIsPriorityOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#F0F3ED]"
                        >
                          {p === 'high' ? 'Высокий' : p === 'medium' ? 'Средний' : 'Низкий'}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setPriority(undefined);
                          setIsPriorityOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                          !priority
                            ? 'bg-[#F0F3ED] text-[#2F3A34] font-medium'
                            : 'text-[#6F7D75] hover:bg-[#F0F3ED]/70'
                        }`}
                      >
                        Все
                      </button>
                    </div>
                  )}
                </div>

                <div ref={deadlineTypeRef} className="relative">
                  <button
                    onClick={() => setIsDeadlineTypeOpen(!isDeadlineTypeOpen)}
                    className="px-3.5 py-2 text-[#6F7D75] bg-white border shadow-[0_6px_20px_0_rgba(0,0,0,0.05)] flex items-center gap-1.5 rounded-lg text-xs hover:bg-[#F8FAFC] transition-colors"
                  >
                    <span>
                      {deadlineType
                        ? deadlineType === 'hard'
                          ? 'Жёсткий'
                          : deadlineType === 'soft'
                            ? 'Мягкий'
                            : 'Без срока'
                        : 'Тип дедлайна'}
                    </span>
                    <img
                      src="/asideArrow-icon.svg"
                      alt=""
                      className={`w-2 h-2 transition-transform ${isDeadlineTypeOpen ? '-rotate-180' : '-rotate-90'}`}
                    />
                  </button>
                  {isDeadlineTypeOpen && (
                    <div className="absolute top-full left-0 mt-1 w-32 bg-white border shadow-lg rounded-lg py-1 z-50 text-[#6F7D75]">
                      {(['hard', 'soft', 'none'] as const).map((dt) => (
                        <button
                          key={dt}
                          onClick={() => {
                            setDeadlineType(dt);
                            setIsDeadlineTypeOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#F0F3ED] ${
                            deadlineType === dt
                              ? 'bg-[#F0F3ED] text-[#2F3A34] font-medium'
                              : 'text-[#6F7D75] hover:bg-[#F0F3ED]/70'
                          }`}
                        >
                          {dt === 'hard' ? 'Жёсткий' : dt === 'soft' ? 'Мягкий' : 'Без срока'}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setDeadlineType(undefined);
                          setIsDeadlineTypeOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                          !deadlineType
                            ? 'bg-[#F0F3ED] text-[#2F3A34] font-medium'
                            : 'text-[#6F7D75] hover:bg-[#F0F3ED]/70'
                        }`}
                      >
                        Все
                      </button>
                    </div>
                  )}
                </div>

                <div ref={statusRef} className="relative">
                  <button
                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                    className="px-3.5 py-2 text-[#6F7D75] bg-white border shadow-[0_6px_20px_0_rgba(0,0,0,0.05)] flex items-center gap-1.5 rounded-lg text-xs hover:bg-[#F8FAFC] transition-colors"
                  >
                    <span>
                      {status
                        ? status === 'todo'
                          ? 'Ожидает'
                          : status === 'in_progress'
                            ? 'В работе'
                            : 'Выполнено'
                        : 'Статус'}
                    </span>
                    <img
                      src="/asideArrow-icon.svg"
                      alt=""
                      className={`w-2 h-2 transition-transform ${isStatusOpen ? '-rotate-180' : '-rotate-90'}`}
                    />
                  </button>
                  {isStatusOpen && (
                    <div className="absolute top-full left-0 mt-1 w-32 bg-white border shadow-lg rounded-lg py-1 z-50 text-[#6F7D75]">
                      {(['todo', 'in_progress', 'done'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setStatus(s);
                            setIsStatusOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                            status === s
                              ? 'bg-[#F0F3ED] text-[#2F3A34] font-medium'
                              : 'text-[#6F7D75] hover:bg-[#F0F3ED]/70'
                          }`}
                        >
                          {s === 'todo'
                            ? 'Ожидает'
                            : s === 'in_progress'
                              ? 'В работе'
                              : 'Выполнено'}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setStatus(undefined);
                          setIsStatusOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                          !status
                            ? 'bg-[#F0F3ED] text-[#2F3A34] font-medium'
                            : 'text-[#6F7D75] hover:bg-[#F0F3ED]/70'
                        }`}
                      >
                        Все
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                  className="px-3.5 py-2 text-[#6F7D75] bg-white border shadow-[0_6px_20px_0_rgba(0,0,0,0.05)] flex items-center gap-1.5 rounded-lg text-xs hover:bg-[#F8FAFC] transition-colors"
                >
                  <span>Дедлайн</span>
                  <img
                    src="/sortArrow-icon.svg"
                    alt=""
                    className={`w-2 h-2 ${order === 'asc' ? 'rotate-0' : 'rotate-180'} `}
                  />
                </button>
              </div>
              <div className="bg-[#F0F3ED] rounded-[0.625rem] overflow-hidden border">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center gap-4 px-4 py-2 bg-[#F0F3ED] rounded-t-lg text-xs font-medium text-[#6F7D75]">
                  <div>Наименование задачи</div>
                  <div className="text-center">Приоритет</div>
                  <div className="text-center">Тип дедлайна</div>
                  <div className="text-center">Статус</div>
                  <div className="text-center">Дедлайн</div>
                </div>
                <div>
                  {loadingTasks || fetchingTasks ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin w-5 h-5 border-2 border-[#8CA693] border-t-transparent rounded-full"></div>
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-8 text-sm text-[#6F7D75]">Нет задач</div>
                  ) : (
                    tasks.map((task) => {
                      const p = getPriorityConfig(task.priority);
                      const dt = getDeadlineTypeConfig(task.deadlineType);
                      const st = getStatusConfig(task.status);
                      const d = formatDate(task.deadline);
                      const isCompleted = task.status === 'done';

                      return (
                        <div
                          key={task._id}
                          onClick={() => navigate(`/tasks/${task._id}`)}
                          className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 items-center border border-[#D9D9D9] rounded-lg hover:bg-[#FAFBFC] cursor-pointer transition-colors ${task.status === 'done' ? 'bg-[#E4F0E5]' : 'bg-white'}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {task.status === 'done' && (
                              <img src="/taskDone-icon.svg" className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span
                              className={`text-xs truncate ${task.status === 'done' ? 'line-through text-[#6F7D75]' : 'text-[#2F3A34] font-medium'} ${d.isOverdue && !isCompleted ? 'text-[#D32F2F]' : ''}`}
                            >
                              {task.title}
                            </span>
                          </div>
                          <div className="flex justify-center">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded ${p.color} ${p.bg}`}
                            >
                              <img src={`${p.icon}`} alt="" className="-translate-y-0.5 w-3 h-3" />
                              {p.label}
                            </span>
                          </div>
                          <div className="flex justify-center">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded ${dt.color} ${dt.bg}`}
                            >
                              <img src={`${dt.icon}`} alt="" className="-translate-y-0.5 w-3 h-3" />
                              {dt.label}
                            </span>
                          </div>
                          <div className="flex justify-center">
                            <span className={`text-xs font-medium text-[#6F7D75]`}>{st.label}</span>
                          </div>
                          <div className="text-center">
                            {task.deadline ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span
                                  className={`text-xs font-medium ${d.isOverdue && !isCompleted ? 'text-[#D32F2F]' : 'text-[#6F7D75]'}`}
                                >
                                  {d.text}
                                </span>
                                {d.isOverdue && !isCompleted && (
                                  <span className="text-[0.625rem] font-medium text-[#D32F2F] leading-none">
                                    Просрочено
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-[#6F7D75]">-</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {!loadingTasks && totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F0F1F2]">
                    <span className="text-xs text-[#6F7D75]">
                      Страница {page} из {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-3 py-1 bg-white border rounded-lg text-xs disabled:opacity-50 hover:bg-[#F8FAFC]"
                      >
                        Назад
                      </button>
                      <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1 bg-white border rounded-lg text-xs disabled:opacity-50 hover:bg-[#F8FAFC]"
                      >
                        Вперёд
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <button
                  onClick={handleAddTask}
                  className="px-4 py-1.5 bg-[#8CA693] text-white rounded-lg text-sm font-medium hover:bg-[#7A9181] transition-colors flex items-center gap-2"
                >
                  <img src="/add-icon.svg" alt="" className="w-3.5 h-3.5 -translate-y-[1.5px]" />
                  Добавить задачу
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl py-6 px-7 shadow-sm">
              <h2 className="text-base font-medium text-[#2F3A34] mb-4">О проекте</h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-4 p-3 shadow-[0_6px_20px_0_rgba(0,0,0,0.075)] rounded-[0.625rem]">
                  <div className="w-10 h-10 rounded-full bg-[#F0F3ED] flex items-center justify-center shadow-sm">
                    <img src="/allTasks-icon.svg" className="w-5 h-5 text-[#8CA693]" />
                  </div>
                  <div className="flex flex-1 flex-col text-center">
                    <p className="text-lg font-medium text-[#2F3A34]">{totalTasks}</p>
                    <p className="text-xs text-[#6F7D75]">Всего задач</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 shadow-[0_6px_20px_0_rgba(0,0,0,0.075)] rounded-[0.625rem]">
                  <div className="w-10 h-10 rounded-full bg-[#F0F3ED] flex items-center justify-center shadow-sm">
                    <img src="/tasksInProgress-icon.svg" className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <div className="flex flex-1 flex-col text-center">
                    <p className="text-lg font-medium text-[#2F3A34]">{inProgressTasks}</p>
                    <p className="text-xs text-[#6F7D75]">В работе</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 shadow-[0_6px_20px_0_rgba(0,0,0,0.075)] rounded-[0.625rem]">
                  <div className="w-10 h-10 rounded-full bg-[#F0F3ED] flex items-center justify-center shadow-sm">
                    <img src="/tasksTodo-icon.svg" className="w-5 h-5 text-[#6F7D75]" />
                  </div>
                  <div className="flex flex-1 flex-col text-center">
                    <p className="text-lg font-medium text-[#2F3A34]">{todoTasks}</p>
                    <p className="text-xs text-[#6F7D75]">Ожидают</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 shadow-[0_6px_20px_0_rgba(0,0,0,0.075)] rounded-[0.625rem]">
                  <div className="w-10 h-10 rounded-full bg-[#F0F3ED] flex items-center justify-center shadow-sm">
                    <img src="/tasksDone-icon.svg" className="w-5 h-5 text-[#8CA693]" />
                  </div>
                  <div className="flex flex-1 flex-col text-center">
                    <p className="text-lg font-medium text-[#2F3A34]">{completedTasks}</p>
                    <p className="text-xs text-[#6F7D75]">Выполнено</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
