import { useNavigate } from 'react-router-dom';
import { useGetDashboardQuery } from '../../features/dashboard/dashboardApi';
import { useSelector } from 'react-redux';
import type { Task } from '../../entities/task/model';
import type { User } from '../../entities/user/model';
import type { RootState } from '../../store';

const projectIconConfig: Record<string, { src: string; iconBg: string }> = {
  plant: { src: '/project-plant-icon.svg', iconBg: 'bg-[#F0F3ED]' },
  sun: { src: '/project-sun-icon.svg', iconBg: 'bg-[#FFF4E5]' },
  waves: { src: '/project-waves-icon.svg', iconBg: 'bg-[#E9F0F9]' },
  star: { src: '/project-star-icon.svg', iconBg: 'bg-[#F5F3FF]' },
  mountains: { src: '/project-mountains-icon.svg', iconBg: 'bg-[#EDD7C9]' },
  flower: { src: '/project-flower-icon.svg', iconBg: 'bg-[#FFC9C9]' },
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return 'Доброе утро';
  if (hour < 17) return 'Добрый день';
  return 'Добрый вечер';
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return { text: '—', isOverdue: false };
  const date = new Date(dateStr);
  const now = new Date();
  const isOverdue = date < now;
  return {
    text: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
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
    default:
      return { label: '', color: '', icon: '', bg: '' };
  }
};

const getDeadlineTypeConfig = (dt: Task['deadlineType']) => {
  switch (dt) {
    case 'hard':
      return {
        label: 'Жeсткий',
        color: 'text-[#D32F2F]',
        icon: '/hardDeadlineType-icon.svg',
        bg: 'bg-[#FFEDEE]',
      };
    case 'soft':
      return {
        label: 'Мягкий',
        color: 'text-[#10B981]',
        icon: '/softDeadlineType-icon.svg',
        bg: 'bg-[#E6F9F1]',
      };
    case 'none':
      return {
        label: 'Без срока',
        color: 'text-[#6F7D75]',
        icon: '/noDeadline-icon.svg',
        bg: 'bg-[#F3F4F6]',
      };
    default:
      return { label: '', color: '', icon: '', bg: '' };
  }
};

const TaskRow = ({ task }: { task: Task }) => {
  const navigate = useNavigate();
  const p = getPriorityConfig(task.priority);
  const dt = getDeadlineTypeConfig(task.deadlineType);
  const d = formatDate(task.deadline);

  return (
    <div
      onClick={() => navigate(`/tasks/${task._id}`)}
      className="grid grid-cols-[2.7fr_1.1fr_1.1fr_1.1fr] gap-4 px-6 py-3 items-center border border-[#D9D9D9] hover:bg-[#FAFBFC] cursor-pointer transition-colors text-[#6F7D75] bg-white"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-medium text-[#2F3A34] truncate" title={task.title}>
          {task.title}
        </span>
      </div>

      <div className="flex justify-center">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${p.bg} ${p.color}`}
        >
          <img src={p.icon} alt="" className="w-3.5 h-3.5" />
          {p.label}
        </span>
      </div>

      <div className="flex justify-center">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${dt.bg} ${dt.color}`}
        >
          <img src={dt.icon} alt="" className="w-3.5 h-3.5" />
          {dt.label}
        </span>
      </div>

      <div className="text-center min-w-0">
        {task.deadline ? (
          <div className="flex flex-col items-center gap-0.5">
            <span
              className={`text-xs font-medium ${d.isOverdue ? 'text-[#D32F2F]' : 'text-[#6F7D75]'}`}
            >
              {d.text}
            </span>
            {d.isOverdue && (
              <span className="text-[0.625rem] font-medium text-[#D32F2F] leading-none">
                Просрочено
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-[#6F7D75]">—</span>
        )}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { data, isLoading } = useGetDashboardQuery();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const name = (user as User | null)?.name || 'друг';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="w-8 h-8 border-4 border-[#8CA693] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { stats, top3Tasks, activeTasks, projects } = data;

  return (
    <div className="px-5 md:px-8 lg:px-11 h-[calc(100vh-8rem)] overflow-y-auto pb-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="min-w-0">
            <h1
              className="text-3xl font-medium text-[#2F3A34] truncate max-w-2xl"
              title={`Привет, ${name}`}
            >
              {getGreeting()}, {name}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#F0F1F2] flex gap-6 overflow-hidden">
            <div className="rounded-full bg-[#FFEFD3] w-14 h-14 flex items-center justify-center flex-shrink-0">
              <img src="/dashboard-tasksInProgress-icon.svg" alt="" className="w-7 h-7" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <p className="text-xl font-medium text-[#FFC65C] mb-1 truncate">В работе</p>
              <div className="flex items-baseline gap-2 ml-1">
                <span className="text-[1.25rem] font-medium text-[#FFC65C]">
                  {stats.inProgress}
                </span>
                <span className="text-xs text-[#6F7D75] whitespace-nowrap">/ 5 макс.</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#F0F1F2] flex gap-6 overflow-hidden">
            <div className="rounded-full bg-[#E9F0F9] w-16 h-16 flex items-center justify-center flex-shrink-0">
              <img src="/dashboard-tasksTodo-icon.svg" alt="" className="w-7 h-7" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <p className="text-xl font-medium text-[#4C95E9] mb-1 truncate">Ожидают</p>
              <span className="ml-1 text-[1.25rem] font-medium text-[#4C95E9]">
                {stats.pending}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#F0F1F2] flex gap-6 overflow-hidden">
            <div className="rounded-full bg-[#F0F3ED] w-16 h-16 flex items-center justify-center flex-shrink-0">
              <img src="/dashboard-tasksCompleted-icon.svg" alt="" className="w-7 h-7" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <p className="text-xl font-medium text-[#8CA693] mb-1 truncate">Завершено</p>
              <div className="flex items-baseline gap-2 ml-1">
                <span className="text-[1.25rem] font-medium text-[#8CA693]">
                  {stats.completedThisWeek}
                </span>
                <span className="text-xs text-[#6F7D75] whitespace-nowrap">за неделю</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#F0F1F2] flex gap-6 overflow-hidden">
            <div className="rounded-full bg-[#F1EBF4] w-16 h-16 flex items-center justify-center flex-shrink-0">
              <img src="/dashboard-projects-icon.svg" alt="" className="w-7 h-7" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <p className="text-xl font-medium text-[#954BA8] mb-1 truncate">Мои проекты</p>
              <span className="ml-1 text-[1.25rem] font-medium text-[#954BA8]">
                {stats.projectCount}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-[#F0F3ED]/80 px-5 pt-3.5 pb-6 rounded-2xl shadow-sm border border-[#D9D9D9]/50 overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <h2 className="ml-2 text-lg font-medium text-[#2F3A34]">
                  Сосредоточься на главном
                </h2>
                <button
                  onClick={() => navigate('/tasks')}
                  className="flex items-center gap-1.5 text-xs text-[#5F6F65] hover:underline"
                >
                  Все задачи <img src="/linkArrow-icon.svg" alt="" className="w-2.5 h-2" />
                </button>
              </div>

              <div className="bg-[#8CA693] rounded-[0.625rem] overflow-hidden shadow-sm border border-[#D9D9D9]">
                {top3Tasks.length > 0 ? (
                  <>
                    <div className="grid grid-cols-[2.7fr_1.1fr_1.1fr_1.1fr] gap-4 px-6 py-2.5 text-sm text-white items-center">
                      <div className="text-left">Наименование</div>
                      <div className="text-center">Приоритет</div>
                      <div className="text-center">Тип дедлайна</div>
                      <div className="text-center">Дедлайн</div>
                    </div>
                    {top3Tasks.map((task) => (
                      <TaskRow key={task._id} task={task} />
                    ))}
                  </>
                ) : (
                  <div className="p-10 text-center text-[#6F7D75] bg-[#F8FAFC]">
                    <p>Нет срочных задач</p>
                    <p>Отличное время для отдыха или планирования</p>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white/80 px-5 pt-3.5 pb-6 rounded-2xl shadow-sm border border-[#D9D9D9]/50 overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <h2 className="ml-2 text-lg font-medium text-[#2F3A34]">Задачи в работе</h2>
                <button
                  onClick={() => navigate('/tasks')}
                  className="flex items-center gap-1.5 text-xs text-[#5F6F65] hover:underline"
                >
                  Все задачи <img src="/linkArrow-icon.svg" alt="" className="w-2.5 h-2" />
                </button>
              </div>

              <div className="bg-[#F0F3ED] rounded-[0.625rem] overflow-hidden shadow-sm border border-[#D9D9D9]">
                {activeTasks.length > 0 ? (
                  <>
                    <div className="grid grid-cols-[2.7fr_1.1fr_1.1fr_1.1fr] gap-4 px-6 py-2.5 text-sm text-[#5F6F65] items-center">
                      <div className="text-left">Наименование</div>
                      <div className="text-center">Приоритет</div>
                      <div className="text-center">Тип дедлайна</div>
                      <div className="text-center">Дедлайн</div>
                    </div>
                    {activeTasks.map((task) => (
                      <TaskRow key={task._id} task={task} />
                    ))}
                  </>
                ) : (
                  <div className="p-10 text-center text-[#6F7D75] bg-[#F8FAFC]">
                    <p>Нет активных задач</p>
                    <p>Добавь новую задачу или выбери из списка</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate('/tasks/create')}
                className="mt-4 rounded-xl text-sm font-medium text-[#5F6F65] bg-transparent hover:text-[#2F3A34] transition-colors flex items-center justify-center gap-2"
              >
                <img
                  src="/dashboard-add-icon.svg"
                  alt=""
                  className="w-3.5 h-3.5 -translate-y-[1px]"
                />
                Добавить задачу
              </button>
            </section>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F0F1F2] h-full overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-medium text-[#2F3A34]">Мои проекты</h2>
                <button
                  onClick={() => navigate('/projects')}
                  className="flex items-center gap-1 text-xs text-[#8CA693] hover:underline"
                >
                  Все <img src="/linkArrow-icon.svg" alt="" className="w-2.5 h-2" />
                </button>
              </div>

              <div className="space-y-3">
                {projects.slice(0, 4).map((project) => {
                  const iconData = projectIconConfig[project.icon] || projectIconConfig.plant;
                  return (
                    <div
                      key={project._id}
                      onClick={() => navigate(`/projects/${project._id}`)}
                      className="group cursor-pointer border border-[#D9D9D9] p-4 rounded-[0.625rem] hover:border-[#8CA693]/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg ${iconData.iconBg} flex items-center justify-center flex-shrink-0`}
                        >
                          <img src={iconData.src} alt="" className="w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                          <h3
                            className="text-sm font-medium text-[#2F3A34] group-hover:text-[#8CA693] transition-colors truncate"
                            title={project.title}
                          >
                            {project.title}
                          </h3>
                          <div className="w-full flex gap-8 items-center text-xs text-[#6F7D75]">
                            <span className="whitespace-nowrap flex-shrink-0">
                              {project.completedTasks || 0} из {project.totalTasks || 0}
                            </span>
                            <div className="flex flex-1 items-center gap-2 min-w-0">
                              <div className="min-w-0 w-full h-1.5 bg-[#F0F1F2] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#8CA693] rounded-full transition-all duration-500"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <span className="flex-shrink-0">{project.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => navigate('/projects/create')}
                  className="mt-2 rounded-xl text-sm font-medium text-[#5F6F65] bg-transparent hover:text-[#2F3A34] transition-colors flex items-center justify-center gap-2 py-2"
                >
                  <img
                    src="/dashboard-add-icon.svg"
                    alt=""
                    className="w-3.5 h-3.5 -translate-y-[1px]"
                  />
                  Создать проект
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
