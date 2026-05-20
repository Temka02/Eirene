import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCalendarTasksQuery } from '../../features/calendar/calendarApi';
import type { Task } from '../../entities/task/model';
import { getPriorityConfig, getDeadlineTypeConfig, getStatusConfig } from '../../utils/taskDisplay';
import { getDayCellClass, getDayNumberClass, getStatusColorClass } from '../../utils/uiHelpers';

const monthNames = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function CalendarPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: tasks = [], isLoading } = useGetCalendarTasksQuery({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  });

  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach((task) => {
    if (task.deadline) {
      const dateStr = task.deadline.split('T')[0];
      if (!tasksByDate[dateStr]) tasksByDate[dateStr] = [];
      tasksByDate[dateStr].push(task);
    }
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
  const totalDays = lastDayOfMonth.getDate();

  const sortTasks = (tasks: Task[]) => {
    const statusWeight: Record<Task['status'], number> = { in_progress: 1, todo: 2, done: 3 };
    const typeWeight: Record<Task['deadlineType'], number> = { hard: 1, soft: 2, none: 3 };
    const priorityWeight: Record<Task['priority'], number> = { high: 1, medium: 2, low: 3 };

    return [...tasks].sort((a, b) => {
      const statusDiff = (statusWeight[a.status] || 4) - (statusWeight[b.status] || 4);
      if (statusDiff !== 0) return statusDiff;

      const typeDiff = (typeWeight[a.deadlineType] || 3) - (typeWeight[b.deadlineType] || 3);
      if (typeDiff !== 0) return typeDiff;

      const timeA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const timeB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      const timeDiff = timeA - timeB;
      if (timeDiff !== 0) return timeDiff;

      return (priorityWeight[a.priority] || 3) - (priorityWeight[b.priority] || 3);
    });
  };

  const getTasksForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return sortTasks(tasksByDate[dateStr] || []);
  };

  const isToday = (day: number) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const getSelectedDateTasks = () => {
    if (!selectedDate) return [];
    return getTasksForDate(parseInt(selectedDate));
  };

  const getStatusStyle = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-[#E9F0F9] border-[#4C95E9]/25';
      case 'in_progress':
        return 'bg-[#FFEFD3] border-[#FFC65C]/25';
      case 'done':
        return 'bg-[#E4F0E5] border-[#8CA693]/25';
      default:
        return 'bg-[#F8FAFC] border-[#D9D9D9]/25';
    }
  };

  const TaskMiniCard = ({ task }: { task: Task }) => {
    const p = getPriorityConfig(task.priority);
    const dt = getDeadlineTypeConfig(task.deadlineType);
    const isCompleted = task.status === 'done';

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/tasks/${task._id}`);
        }}
        className={`flex items-center min-w-0 gap-1.5 p-1.5 rounded-[0.625rem] border border-[#D9D9D9]/20 cursor-pointer hover:shadow-sm transition-all ${
          isCompleted ? 'opacity-60' : ''
        } ${getStatusStyle(task.status)}`}
        title={task.title}
      >
        <img src={p.icon} alt="" className={`w-3 h-3 flex-shrink-0 ${p.color}`} />
        <span
          className={`text-[0.625rem] font-medium truncate ${isCompleted ? 'line-through' : 'text-[#2F3A34]'}`}
        >
          {task.title}
        </span>
        {task.deadlineType !== 'none' && (
          <img src={dt.icon} alt="" className={`w-3 h-3 flex-shrink-0 ${dt.color}`} />
        )}
      </div>
    );
  };

  return (
    <div className="px-4 md:px-6 lg:px-8 pb-4 h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl md:text-2xl text-[#2F3A34] mb-4 md:mb-2">Календарь</h1>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          <div className="flex-1 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-[#F0F1F2]">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 md:gap-4">
                <button
                  onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                  className="w-8 h-8 rounded-lg hover:bg-[#F0F3ED] flex items-center justify-center transition-colors"
                >
                  <img src="/sortArrow-icon.svg" alt="" className="w-4 h-4 -rotate-90" />
                </button>
                <h2 className="text-lg md:text-xl font-medium text-[#5F6F65] text-center min-w-[120px]">
                  {monthNames[month]} {year}
                </h2>
                <button
                  onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                  className="w-8 h-8 rounded-lg hover:bg-[#F0F3ED] flex items-center justify-center transition-colors"
                >
                  <img src="/sortArrow-icon.svg" alt="" className="w-4 h-4 rotate-90" />
                </button>
              </div>
              <button
                onClick={() => {
                  setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
                  setSelectedDate(String(today.getDate()));
                }}
                className="px-4 py-1.5 md:py-1 text-sm font-medium text-[#6F7D75] bg-[#F0F3ED] border border-[#D9D9D9] rounded-xl hover:bg-[#E0E5DD] transition-colors"
              >
                Сегодня
              </button>
            </div>

            <div className="grid grid-cols-7 mb-2 bg-[#F0F3ED] border border-[#D9D9D9] rounded-lg">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-[0.65rem] md:text-xs font-medium text-[#6F7D75] py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {Array.from({ length: startDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-12 md:h-32 lg:h-40" />
              ))}

              {Array.from({ length: totalDays }).map((_, i) => {
                const day = i + 1;
                const dayTasks = getTasksForDate(day);
                const isCurrentDay = isToday(day);
                const isSelected = selectedDate === String(day);

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : String(day))}
                    className={`min-h-[3rem] md:min-h-[120px] lg:min-h-[140px] rounded-lg md:rounded-xl border md:border-2 p-1 md:p-2 cursor-pointer transition-all flex flex-col gap-1 ${getDayCellClass(isCurrentDay, isSelected)}`}
                  >
                    <div className="flex justify-center md:justify-between items-center">
                      <span className={getDayNumberClass(isCurrentDay, isSelected)}>{day}</span>

                      {dayTasks.length > 0 && (
                        <span className="hidden md:block text-[0.625rem] text-[#6F7D75] bg-[#F0F3ED] px-1.5 rounded-full">
                          {dayTasks.length}
                        </span>
                      )}
                    </div>

                    {dayTasks.length > 0 && (
                      <div className="flex md:hidden justify-center items-center h-full pb-1">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${isCurrentDay ? 'bg-[#8CA693]' : 'bg-[#5F6F65]'}`}
                        ></div>
                      </div>
                    )}

                    <div className="hidden md:flex flex-1 overflow-hidden flex-col gap-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <TaskMiniCard key={task._id} task={task} />
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-[0.625rem] text-[#6F7D75] pl-1">
                          +{dayTasks.length - 3} ещe
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full lg:w-[12rem] xl:w-[16rem] bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-[#F0F1F2] h-fit sticky top-0">
            <h3 className="font-medium text-[#2F3A34] mb-4">
              {selectedDate
                ? `${selectedDate} ${monthNames[month]}`
                : `Сегодня, ${today.getDate()} ${monthNames[today.getMonth()]}`}
            </h3>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-[#F8FAFC] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : getSelectedDateTasks().length > 0 ? (
              <div className="space-y-3">
                {getSelectedDateTasks().map((task) => {
                  const p = getPriorityConfig(task.priority);
                  const dt = getDeadlineTypeConfig(task.deadlineType);
                  const isCompleted = task.status === 'done';

                  return (
                    <div
                      key={task._id}
                      onClick={() => navigate(`/tasks/${task._id}`)}
                      className={`p-3 rounded-[0.625rem] border border-[#D9D9D9] bg-white cursor-pointer hover:bg-[#FAFBFC] transition-colors ${
                        isCompleted ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <img src={p.icon} alt="" className={`w-4 h-4 mt-0.5 ${p.color}`} />
                        <h4
                          className={`text-sm font-medium text-[#2F3A34] truncate flex-1 ${isCompleted ? 'line-through' : ''}`}
                        >
                          {task.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 text-xs min-w-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${dt.bg} ${dt.color}`}
                        >
                          <img src={dt.icon} alt="" className="w-3 h-3" />
                          {dt.label}
                        </span>
                        <span
                          className={`text-xs font-medium truncate ${getStatusColorClass(task.status)}`}
                        >
                          {getStatusConfig(task.status).label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-[#6F7D75]">
                <img
                  src="/allTasks-icon.svg"
                  alt=""
                  className="w-12 h-12 mx-auto mb-3 opacity-50"
                />
                <p className="text-sm">Нет задач на этот день</p>
              </div>
            )}

            <button
              onClick={() =>
                navigate('/tasks/create', {
                  state: {
                    deadline: selectedDate
                      ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
                      : undefined,
                  },
                })
              }
              className="w-full mt-6 px-3 sm:px-6 py-2.5 text-xs sm:text-sm bg-[#8CA693] rounded-[0.625rem] text-white transition-colors flex items-center justify-center gap-2 hover:bg-[#7A9181]"
            >
              <img src="/add-icon.svg" alt="" className="w-3.5 h-3.5" />
              Добавить задачу
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
