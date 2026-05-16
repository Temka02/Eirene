import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTasksQuery } from '../../features/tasks/tasksApi';
import type { Task } from '../../entities/task/model';

const LIMIT = 5;

export default function TasksPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | undefined>();
  const [deadlineType, setDeadlineType] = useState<'hard' | 'soft' | 'none' | undefined>();
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done' | undefined>();
  const [sortBy] = useState<'deadline' | 'priority' | 'createdAt'>('deadline');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isDeadlineTypeOpen, setIsDeadlineTypeOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const priorityRef = useRef<HTMLDivElement>(null);
  const deadlineTypeRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, priority, deadlineType, status, order, view]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node)) {
        setIsPriorityOpen(false);
      }
      if (deadlineTypeRef.current && !deadlineTypeRef.current.contains(event.target as Node)) {
        setIsDeadlineTypeOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const {
    data: tasksResponse,
    isLoading,
    isFetching,
  } = useGetTasksQuery({
    search: debouncedSearch || undefined,
    priority,
    deadlineType,
    status,
    sortBy,
    order,
    limit: view === 'kanban' ? 999 : LIMIT,
    page: view === 'kanban' ? 1 : page,
  });

  const tasks = tasksResponse?.data || [];
  const totalPages = tasksResponse?.totalPages || 1;

  const getPriorityConfig = (p: Task['priority']) => {
    switch (p) {
      case 'high':
        return { label: 'Высокий', color: 'text-[#D32F2F]', bg: 'bg-[#FFEDEE]' };
      case 'medium':
        return { label: 'Средний', color: 'text-[#F59E0B]', bg: 'bg-[#FFF4E5]' };
      case 'low':
        return { label: 'Низкий', color: 'text-[#10B981]', bg: 'bg-[#E6F9F1]' };
    }
  };

  const getDeadlineConfig = (dt: Task['deadlineType']) => {
    switch (dt) {
      case 'hard':
        return { label: 'Жeсткий', color: 'text-[#D32F2F]', bg: 'bg-[#FFEDEE]' };
      case 'soft':
        return { label: 'Мягкий', color: 'text-[#10B981]', bg: 'bg-[#E6F9F1]' };
      case 'none':
        return { label: 'Без срока', color: 'text-[#6F7D75]', bg: 'bg-[#F3F4F6]' };
    }
  };

  const getStatusConfig = (s: Task['status']) => {
    switch (s) {
      case 'todo':
        return { label: 'Ожидает' };
      case 'in_progress':
        return { label: 'В работе' };
      case 'done':
        return { label: 'Выполнено' };
    }
  };

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

  const getDeadlineProgress = (deadline?: string) => {
    if (!deadline) return null;

    const now = new Date();
    const end = new Date(deadline);
    const diffMs = end.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours <= 0) return { percent: 100, color: '#D32F2F' };

    if (diffHours < 24) {
      const percent = Math.min(100, 75 + (24 - diffHours) * 1.04);
      return { percent, color: '#D32F2F' };
    }

    if (diffHours < 168) {
      const percent = 25 + ((diffHours - 24) / 144) * 50;
      return { percent, color: '#F59E0B' };
    }

    const percent = Math.max(0, 25 - (diffHours - 168) * 0.5);
    return { percent, color: '#10B981' };
  };

  return (
    <div className="px-5 md:px-8 pb-4 h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="w-full">
        <h1 className="text-2xl text-[#2F3A34] mb-3">Мои задачи</h1>

        <div className="mb-4">
          <div className="flex flex-col md:flex-row gap-24">
            <div className="flex-1 relative">
              <img
                src="/search2-icon.svg"
                alt=""
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск задач"
                className="w-full pl-14 pr-4 py-3 bg-white rounded-[0.625rem] border-2 border-[#F0F1F2] text-sm placeholder-[#767676] focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition-all"
              />
            </div>
            <button
              onClick={() => navigate('/tasks/create')}
              className="px-8 py-2.5 bg-[#8CA693] shadow-[0_6px_20px_0_rgba(0,0,0,0.1)] text-white rounded-xl text-sm font-medium hover:bg-[#7A9181] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <img src="/add-icon.svg" alt="" className="w-3.5 h-3.5" />
              Добавить задачу
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center gap-1 max-w-64 w-full bg-white p-1 rounded-[0.625rem] shadow-sm text-[#6F7D75]">
            <button
              onClick={() => {
                setView('list');
                setPriority(undefined);
                setDeadlineType(undefined);
                setStatus(undefined);
                setOrder('asc');
              }}
              className={`px-4 py-2 w-1/2 rounded-[0.625rem] text-xs font-medium transition-all flex justify-center items-center gap-2 ${
                view === 'list' ? 'bg-[#F0F3ED]' : 'hover:bg-[#F0F3ED]/90'
              }`}
            >
              <img src="/tasksList-icon.svg" alt="" className="w-3 h-3" />
              Список
            </button>
            <button
              onClick={() => {
                setView('kanban');
                setPriority(undefined);
                setDeadlineType(undefined);
                setStatus(undefined);
                setOrder('asc');
              }}
              className={`px-4 py-2 w-1/2 rounded-[0.625rem] text-xs font-medium transition-all flex justify-center items-center gap-2 ${
                view === 'kanban' ? 'bg-[#F0F3ED]' : 'hover:bg-[#F0F3ED]/90'
              }`}
            >
              <img src="/tasksKanban-icon.svg" alt="" className="w-3 h-3" />
              Канбан
            </button>
          </div>

          <div className="flex flex-wrap gap-2 text-[#6F7D75]">
            <div ref={priorityRef} className="relative">
              <button
                onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                className="w-44 px-5 py-3 bg-white rounded-[0.625rem] shadow-[0_6px_20px_0_rgba(0,0,0,0.05)] text-xs flex items-center justify-between hover:bg-[#F0F3ED]/70 transition-colors"
              >
                <span>
                  {priority
                    ? priority === 'high'
                      ? 'Высокий'
                      : priority === 'medium'
                        ? 'Средний'
                        : 'Низкий'
                    : 'Приоритет: Все'}
                </span>
                <img
                  src="/asideArrow-icon.svg"
                  alt=""
                  className={`w-3 h-3 transition-transform ${isPriorityOpen ? '-rotate-180' : '-rotate-90'}`}
                />
              </button>
              {isPriorityOpen && (
                <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-xl shadow-[0_6px_20px_0_rgba(0,0,0,0.05)] border border-gray-100 py-1 z-50">
                  {(['high', 'medium', 'low'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPriority(p);
                        setIsPriorityOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                        priority === p
                          ? 'bg-[#F0F3ED] text-[#2F3A34] font-medium'
                          : 'text-[#6F7D75] hover:bg-[#F0F3ED]/70'
                      }`}
                    >
                      {p === 'high' ? 'Высокий' : p === 'medium' ? 'Средний' : 'Низкий'}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setPriority(undefined);
                      setIsPriorityOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
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
                className="w-44 px-5 py-3 bg-white rounded-[0.625rem] shadow-[0_6px_20px_0_rgba(0,0,0,0.05)] text-xs flex items-center justify-between hover:bg-[#F0F3ED]/70 transition-colors"
              >
                <span>
                  {deadlineType
                    ? deadlineType === 'hard'
                      ? 'Жeсткий'
                      : deadlineType === 'soft'
                        ? 'Мягкий'
                        : 'Без срока'
                    : 'Тип дедлайна: Все'}
                </span>
                <img
                  src="/asideArrow-icon.svg"
                  alt=""
                  className={`w-3 h-3 transition-transform ${isDeadlineTypeOpen ? '-rotate-180' : '-rotate-90'}`}
                />
              </button>
              {isDeadlineTypeOpen && (
                <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-xl shadow-[0_6px_20px_0_rgba(0,0,0,0.05)] border border-gray-100 py-1 z-50">
                  {(['hard', 'soft', 'none'] as const).map((dt) => (
                    <button
                      key={dt}
                      onClick={() => {
                        setDeadlineType(dt);
                        setIsDeadlineTypeOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                        deadlineType === dt
                          ? 'bg-[#F0F3ED] text-[#2F3A34] font-medium'
                          : 'text-[#6F7D75] hover:bg-[#F0F3ED]/70'
                      }`}
                    >
                      {dt === 'hard' ? 'Жeсткий' : dt === 'soft' ? 'Мягкий' : 'Без срока'}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setDeadlineType(undefined);
                      setIsDeadlineTypeOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
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

            {view === 'list' && (
              <div ref={statusRef} className="relative">
                <button
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className="w-44 px-5 py-3 bg-white rounded-[0.625rem] shadow-[0_6px_20px_0_rgba(0,0,0,0.05)] text-xs flex items-center justify-between hover:bg-[#F0F3ED]/70 transition-colors"
                >
                  <span>
                    {status
                      ? status === 'todo'
                        ? 'Ожидает'
                        : status === 'in_progress'
                          ? 'В работе'
                          : 'Выполнено'
                      : 'Статус: Все'}
                  </span>
                  <img
                    src="/asideArrow-icon.svg"
                    alt=""
                    className={`w-3 h-3 transition-transform ${isStatusOpen ? '-rotate-180' : '-rotate-90'}`}
                  />
                </button>
                {isStatusOpen && (
                  <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-xl shadow-[0_6px_20px_0_rgba(0,0,0,0.05)] border border-gray-100 py-1 z-50">
                    {(['todo', 'in_progress', 'done'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setStatus(s);
                          setIsStatusOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                          status === s
                            ? 'bg-[#F0F3ED] text-[#2F3A34] font-medium'
                            : 'text-[#6F7D75] hover:bg-[#F0F3ED]/70'
                        }`}
                      >
                        {s === 'todo' ? 'Ожидает' : s === 'in_progress' ? 'В работе' : 'Выполнено'}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setStatus(undefined);
                        setIsStatusOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
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
            )}

            <button
              onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
              className="w-44 px-5 py-3 bg-white rounded-[0.625rem] shadow-[0_6px_20px_0_rgba(0,0,0,0.05)] text-xs flex items-center justify-between hover:bg-[#F0F3ED]/70 transition-colors"
            >
              <span>Дедлайн:</span>
              <img
                src="/sortArrow-icon.svg"
                alt=""
                className={`w-3 h-3 ${order === 'asc' ? 'rotate-0' : 'rotate-180'} `}
              />
            </button>
          </div>
        </div>

        {view === 'list' && (
          <div className="px-7 py-3 bg-white rounded-xl">
            <h2 className="text-[#2F3A34] font-medium mb-3">Задачи</h2>
            <div className="bg-[#F0F3ED] rounded-[0.625rem] overflow-hidden border">
              <div className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-2.5 bg-[#F0F3ED] text-sm font-medium text-[#6F7D75]">
                <div className="text-left">Наименование задачи</div>
                <div className="text-center">Приоритет</div>
                <div className="text-center">Тип дедлайна</div>
                <div className="text-center">Статус</div>
                <div className="text-center">Проект</div>
                <div className="text-center">Дедлайн</div>
              </div>

              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-[#F8FAFC] rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-[#6F7D75]">
                  <img src="/allTasks-icon.svg" alt="" className="w-16 h-16 mb-3 opacity-70" />
                  <p className="text-lg font-medium">Задач не найдено</p>
                </div>
              ) : (
                <div>
                  {tasks.map((task) => {
                    const p = getPriorityConfig(task.priority);
                    const dt = getDeadlineConfig(task.deadlineType);
                    const st = getStatusConfig(task.status);
                    const d = formatDate(task.deadline);
                    const isCompleted = task.status === 'done';

                    return (
                      <div
                        key={task._id}
                        className={`grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3 items-center border border-[#D9D9D9] rounded-[0.625rem] hover:bg-[#FAFBFC] transition-colors cursor-pointer text-[#2F3A34] ${
                          isCompleted ? 'bg-[#E4F0E5]' : 'bg-white'
                        } ${d.isOverdue && !isCompleted ? 'text-[#D32F2F] font-medium' : 'text-[#6F7D75]'}`}
                        onClick={() => navigate(`/tasks/${task._id}`)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isCompleted && (
                            <img
                              src="/taskDone-icon.svg"
                              alt=""
                              className="w-4 h-4 flex-shrink-0"
                            />
                          )}
                          <span
                            className={`font-medium text-xs truncate ${isCompleted && 'line-through'}`}
                          >
                            {task.title}
                          </span>
                        </div>

                        <div className="flex justify-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${p.bg} ${p.color}`}
                          >
                            {task.priority === 'high' && (
                              <img src="/highPriority-icon.svg" alt="" className="w-3.5 h-3.5" />
                            )}
                            {task.priority === 'medium' && (
                              <img src="/mediumPriority-icon.svg" alt="" className="w-3.5 h-3.5" />
                            )}
                            {task.priority === 'low' && (
                              <img src="/lowPriority-icon.svg" alt="" className="w-3.5 h-3.5" />
                            )}
                            {p.label}
                          </span>
                        </div>

                        <div className="flex justify-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${dt.bg} ${dt.color}`}
                          >
                            {task.deadlineType === 'hard' && (
                              <img
                                src="/hardDeadlineType-icon.svg"
                                alt=""
                                className="w-3.5 h-3.5"
                              />
                            )}
                            {task.deadlineType === 'soft' && (
                              <img
                                src="/softDeadlineType-icon.svg"
                                alt=""
                                className="w-3.5 h-3.5"
                              />
                            )}
                            {task.deadlineType === 'none' && (
                              <img src="/noDeadline-icon.svg" alt="" className="w-3.5 h-3.5" />
                            )}
                            {dt.label}
                          </span>
                        </div>

                        <div className="flex justify-center">
                          <span className="text-xs font-medium">{st.label}</span>
                        </div>

                        <div className="text-center">
                          <span className="text-xs font-medium">
                            {task.projectId ? 'Проект' : 'Личное'}
                          </span>
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
                  })}
                </div>
              )}

              {!isLoading && tasks.length > 0 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-[#F0F1F2]">
                  <span className="text-xs text-[#6F7D75]">
                    Страница {page} из {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1 || isFetching}
                      onClick={() => setPage((p) => p - 1)}
                      className="text-[#6F7D75] px-3 py-1.5 text-xs bg-white border border-[#D9D9D9] rounded-lg hover:bg-[#F0F3ED]/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Назад
                    </button>
                    <button
                      disabled={page === totalPages || isFetching}
                      onClick={() => setPage((p) => p + 1)}
                      className="text-[#6F7D75] px-3 py-1.5 text-xs bg-white border border-[#D9D9D9] rounded-lg hover:bg-[#F0F3ED]/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Вперeд
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'kanban' && (
          <div className="h-full overflow-x-auto">
            <div className="flex max-w-full gap-4 h-full pb-4">
              <div className="w-[32%] rounded-xl flex flex-col bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#4C95E9]"></div>
                    <h3 className="text-sm font-medium text-[#2F3A34]">Ожидает</h3>
                  </div>
                  <span className="text-xs text-[#6F7D75] bg-[#F0F3ED] px-2 py-1 rounded-md">
                    {tasks.filter((t) => t.status === 'todo').length}
                  </span>
                </div>
                <div className="flex-1">
                  {tasks.filter((t) => t.status === 'todo').length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-[#6F7D75]">
                      <img src="/allTasks-icon.svg" alt="" className="w-8 h-8 mb-3 opacity-70" />
                      <p className="font-medium text-center">Нет задач</p>
                    </div>
                  ) : (
                    tasks
                      .filter((task) => task.status === 'todo')
                      .map((task) => {
                        const p = getPriorityConfig(task.priority);
                        const dt = getDeadlineConfig(task.deadlineType);
                        const d = formatDate(task.deadline);
                        const isCompleted = task.status === 'done';
                        const progress = task.deadline ? getDeadlineProgress(task.deadline) : null;

                        return (
                          <div
                            key={task._id}
                            onClick={() => navigate(`/tasks/${task._id}`)}
                            className="bg-white rounded-[0.625rem] p-3 grid grid-cols-[1.5fr_1fr_1fr] gap-3 border border-[#D9D9D9] cursor-pointer hover:shadow-lg transition-shadow mb-3"
                          >
                            <div className="flex flex-col justify-between min-w-0">
                              <div className="flex items-center gap-1 mb-2 min-w-0">
                                <div className="w-2 h-2 bg-[#4C95E9] rounded-full flex-shrink-0" />
                                <h4
                                  className="text-xs font-medium text-[#2F3A34] truncate w-full"
                                  title={task.title}
                                >
                                  {task.title}
                                </h4>
                              </div>

                              <div className="flex flex-col items-start gap-1 text-xs text-[#6F7D75] min-w-0">
                                <div className="flex gap-1 items-center min-w-0">
                                  <img
                                    src="/projects-icon.svg"
                                    alt=""
                                    className="w-2.5 h-2.5 flex-shrink-0"
                                  />
                                  <span className="truncate">
                                    {task.projectId ? 'Проект' : 'Личное'}
                                  </span>
                                </div>
                                {task.deadline ? (
                                  <div className="flex flex-col items-start min-w-0">
                                    <div className="flex gap-1 items-center min-w-0">
                                      <img
                                        src="/calendar-icon.svg"
                                        alt=""
                                        className="w-2.5 h-2.5 flex-shrink-0"
                                      />
                                      <span
                                        className={`text-xs font-medium truncate ${d.isOverdue ? 'text-[#D32F2F]' : 'text-[#6F7D75]'}`}
                                      >
                                        {d.text}
                                      </span>
                                    </div>
                                    {d.isOverdue && (
                                      <span className="text-[0.625rem] font-medium text-[#D32F2F] leading-none">
                                        Просрочено
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex gap-1 items-center min-w-0">
                                    <img
                                      src="/calendar-icon.svg"
                                      alt=""
                                      className="w-2.5 h-2.5 flex-shrink-0"
                                    />
                                    <span className="text-xs text-[#6F7D75]">-</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col justify-center items-center">
                              {task.deadline && !isCompleted && progress && (
                                <div className="relative w-10 h-10">
                                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <circle
                                      cx="18"
                                      cy="18"
                                      r="15.915"
                                      pathLength="100"
                                      fill="none"
                                      stroke="#F0F1F2"
                                      strokeWidth="3"
                                    />
                                    <circle
                                      cx="18"
                                      cy="18"
                                      r="15.915"
                                      pathLength="100"
                                      fill="none"
                                      stroke={progress.color}
                                      strokeWidth="3"
                                      strokeDasharray="100"
                                      strokeDashoffset={100 - progress.percent}
                                      strokeLinecap="round"
                                      className="transition-all duration-300"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${p.bg} ${p.color}`}
                              >
                                {task.priority === 'high' && (
                                  <img
                                    src="/highPriority-icon.svg"
                                    alt=""
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                  />
                                )}
                                {task.priority === 'medium' && (
                                  <img
                                    src="/mediumPriority-icon.svg"
                                    alt=""
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                  />
                                )}
                                {task.priority === 'low' && (
                                  <img
                                    src="/lowPriority-icon.svg"
                                    alt=""
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                  />
                                )}
                                <span className="truncate">{p.label}</span>
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${dt.bg} ${dt.color}`}
                              >
                                {task.deadlineType === 'hard' && (
                                  <img
                                    src="/hardDeadlineType-icon.svg"
                                    alt=""
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                  />
                                )}
                                {task.deadlineType === 'soft' && (
                                  <img
                                    src="/softDeadlineType-icon.svg"
                                    alt=""
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                  />
                                )}
                                {task.deadlineType === 'none' && (
                                  <img
                                    src="/noDeadline-icon.svg"
                                    alt=""
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                  />
                                )}
                                <span className="truncate">{dt.label}</span>
                              </span>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              <div className="w-[32%] rounded-xl flex flex-col bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#FFC65C]"></div>
                    <h3 className="text-sm font-medium text-[#2F3A34]">В работе</h3>
                  </div>
                  <span className="text-xs text-[#6F7D75] bg-[#F0F3ED] px-2 py-1 rounded-md">
                    {tasks.filter((t) => t.status === 'in_progress').length}
                  </span>
                </div>
                <div className="flex-1">
                  {tasks.filter((t) => t.status === 'in_progress').length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-[#6F7D75]">
                      <img src="/allTasks-icon.svg" alt="" className="w-8 h-8 mb-3 opacity-70" />
                      <p className="font-medium text-center">Нет задач</p>
                    </div>
                  ) : (
                    tasks
                      .filter((task) => task.status === 'in_progress')
                      .map((task) => {
                        const p = getPriorityConfig(task.priority);
                        const dt = getDeadlineConfig(task.deadlineType);
                        const d = formatDate(task.deadline);
                        const isCompleted = task.status === 'done';
                        const progress = task.deadline ? getDeadlineProgress(task.deadline) : null;

                        return (
                          <div
                            key={task._id}
                            onClick={() => navigate(`/tasks/${task._id}`)}
                            className="bg-white rounded-[0.625rem] p-3 grid grid-cols-[1.5fr_1fr_1fr] gap-3 border border-[#D9D9D9] cursor-pointer hover:shadow-lg transition-shadow mb-3"
                          >
                            <div className="flex flex-col justify-between min-w-0">
                              <div className="flex items-center gap-1 mb-2 min-w-0">
                                <div className="w-2 h-2 bg-[#FFC65C] rounded-full flex-shrink-0" />
                                <h4
                                  className="text-xs font-medium text-[#2F3A34] truncate w-full"
                                  title={task.title}
                                >
                                  {task.title}
                                </h4>
                              </div>
                              <div className="flex flex-col items-start gap-1 text-xs text-[#6F7D75] min-w-0">
                                <div className="flex gap-1 items-center min-w-0">
                                  <img
                                    src="/projects-icon.svg"
                                    alt=""
                                    className="w-2.5 h-2.5 flex-shrink-0"
                                  />
                                  <span className="truncate">
                                    {task.projectId ? 'Проект' : 'Личное'}
                                  </span>
                                </div>
                                {task.deadline ? (
                                  <div className="flex flex-col items-start min-w-0">
                                    <div className="flex gap-1 items-center min-w-0">
                                      <img
                                        src="/calendar-icon.svg"
                                        alt=""
                                        className="w-2.5 h-2.5 flex-shrink-0"
                                      />
                                      <span
                                        className={`text-xs font-medium truncate ${d.isOverdue ? 'text-[#D32F2F]' : 'text-[#6F7D75]'}`}
                                      >
                                        {d.text}
                                      </span>
                                    </div>
                                    {d.isOverdue && (
                                      <span className="text-[0.625rem] font-medium text-[#D32F2F] leading-none">
                                        Просрочено
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex gap-1 items-center min-w-0">
                                    <img
                                      src="/calendar-icon.svg"
                                      alt=""
                                      className="w-2.5 h-2.5 flex-shrink-0"
                                    />
                                    <span className="text-xs text-[#6F7D75]">-</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col justify-center items-center">
                              {task.deadline && !isCompleted && progress && (
                                <div className="relative w-10 h-10">
                                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <circle
                                      cx="18"
                                      cy="18"
                                      r="15.915"
                                      pathLength="100"
                                      fill="none"
                                      stroke="#F0F1F2"
                                      strokeWidth="3"
                                    />
                                    <circle
                                      cx="18"
                                      cy="18"
                                      r="15.915"
                                      pathLength="100"
                                      fill="none"
                                      stroke={progress.color}
                                      strokeWidth="3"
                                      strokeDasharray="100"
                                      strokeDashoffset={100 - progress.percent}
                                      strokeLinecap="round"
                                      className="transition-all duration-300"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${p.bg} ${p.color}`}
                              >
                                {task.priority === 'high' && (
                                  <img
                                    src="/highPriority-icon.svg"
                                    alt=""
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                  />
                                )}
                                {task.priority === 'medium' && (
                                  <img
                                    src="/mediumPriority-icon.svg"
                                    alt=""
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                  />
                                )}
                                {task.priority === 'low' && (
                                  <img
                                    src="/lowPriority-icon.svg"
                                    alt=""
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                  />
                                )}
                                <span className="truncate">{p.label}</span>
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${dt.bg} ${dt.color}`}
                              >
                                {task.deadlineType === 'hard' && (
                                  <img
                                    src="/hardDeadlineType-icon.svg"
                                    alt=""
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                  />
                                )}
                                {task.deadlineType === 'soft' && (
                                  <img
                                    src="/softDeadlineType-icon.svg"
                                    alt=""
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                  />
                                )}
                                {task.deadlineType === 'none' && (
                                  <img
                                    src="/noDeadline-icon.svg"
                                    alt=""
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                  />
                                )}
                                <span className="truncate">{dt.label}</span>
                              </span>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              <div className="w-[32%] rounded-xl flex flex-col bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#8CA693]"></div>
                    <h3 className="text-sm font-medium text-[#2F3A34]">Завершено</h3>
                  </div>
                  <span className="text-xs text-[#6F7D75] bg-[#F0F3ED] px-2 py-1 rounded-md">
                    {tasks.filter((t) => t.status === 'done').length}
                  </span>
                </div>
                <div className="flex-1">
                  {tasks.filter((t) => t.status === 'done').length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-[#6F7D75]">
                      <img src="/allTasks-icon.svg" alt="" className="w-8 h-8 mb-3 opacity-70" />
                      <p className="font-medium text-center">Нет задач</p>
                    </div>
                  ) : (
                    tasks
                      .filter((task) => task.status === 'done')
                      .map((task) => {
                        const p = getPriorityConfig(task.priority);
                        const dt = getDeadlineConfig(task.deadlineType);
                        const d = formatDate(task.deadline);

                        return (
                          <div
                            key={task._id}
                            onClick={() => navigate(`/tasks/${task._id}`)}
                            className="bg-[#E4F0E5] rounded-[0.625rem] p-3 grid grid-cols-[1.5fr_1fr_1fr] gap-3 border border-[#D9D9D9] cursor-pointer hover:shadow-lg transition-shadow mb-3"
                          >
                            <div className="flex flex-col justify-between min-w-0">
                              <div className="flex items-center gap-1 mb-2 min-w-0">
                                <img
                                  src="/taskDone-icon.svg"
                                  className="w-3.5 h-3.5 flex-shrink-0"
                                />
                                <h4
                                  className="text-xs font-medium text-[#2F3A34] truncate w-full"
                                  title={task.title}
                                >
                                  {task.title}
                                </h4>
                              </div>
                              <div className="flex flex-col items-start gap-1 text-xs text-[#6F7D75] min-w-0">
                                <div className="flex gap-1 items-center min-w-0">
                                  <img
                                    src="/projects-icon.svg"
                                    alt=""
                                    className="w-2.5 h-2.5 flex-shrink-0"
                                  />
                                  <span className="truncate">
                                    {task.projectId ? 'Проект' : 'Личное'}
                                  </span>
                                </div>
                                {task.deadline ? (
                                  <div className="flex flex-col items-start min-w-0">
                                    <div className="flex gap-1 items-center min-w-0">
                                      <img
                                        src="/calendar-icon.svg"
                                        alt=""
                                        className="w-2.5 h-2.5 flex-shrink-0"
                                      />
                                      <span className="text-xs font-medium truncate text-[#6F7D75]">
                                        {d.text}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex gap-1 items-center min-w-0">
                                    <img
                                      src="/calendar-icon.svg"
                                      alt=""
                                      className="w-2.5 h-2.5 flex-shrink-0"
                                    />
                                    <span className="text-xs text-[#6F7D75]">-</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col justify-center items-center">
                              <div className="relative w-10 h-10"></div>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${p.bg} ${p.color} opacity-75`}
                              >
                                {task.priority === 'high' && (
                                  <img
                                    src="/highPriority-icon.svg"
                                    alt=""
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                  />
                                )}
                                {task.priority === 'medium' && (
                                  <img
                                    src="/mediumPriority-icon.svg"
                                    alt=""
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                  />
                                )}
                                {task.priority === 'low' && (
                                  <img
                                    src="/lowPriority-icon.svg"
                                    alt=""
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                  />
                                )}
                                <span className="truncate">{p.label}</span>
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${dt.bg} ${dt.color} opacity-75`}
                              >
                                {task.deadlineType === 'hard' && (
                                  <img
                                    src="/hardDeadlineType-icon.svg"
                                    alt=""
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                  />
                                )}
                                {task.deadlineType === 'soft' && (
                                  <img
                                    src="/softDeadlineType-icon.svg"
                                    alt=""
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                  />
                                )}
                                {task.deadlineType === 'none' && (
                                  <img
                                    src="/noDeadline-icon.svg"
                                    alt=""
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                  />
                                )}
                                <span className="truncate">{dt.label}</span>
                              </span>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
