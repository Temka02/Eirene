import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetTaskQuery, useUpdateTaskMutation } from '../../features/tasks/tasksApi';
import { useUpdateSubtaskMutation } from '../../features/tasks/subtasksApi';
import { formatDeadlineFull } from '../../utils/taskDisplay';

export default function FocusModePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: task, isLoading } = useGetTaskQuery(id!);
  const [updateTask] = useUpdateTaskMutation();
  const [updateSubtask] = useUpdateSubtaskMutation();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleToggleSubtask = async (subtaskId: string, currentCompleted: boolean) => {
    if (!task) return;
    await updateSubtask({
      taskId: task._id,
      subtaskId,
      isCompleted: !currentCompleted,
    }).unwrap();
  };

  const handleCompleteTask = async () => {
    if (!task) return;
    setIsCompleting(true);
    try {
      await updateTask({
        id: task._id,
        status: 'done',
        priority: task.priority,
        deadlineType: task.deadlineType,
      }).unwrap();
      setTimeout(() => {
        navigate('/tasks', { replace: true });
      }, 800);
    } catch {
      setIsCompleting(false);
    }
  };

  const subtasks = task?.checklist || [];
  const completedSubtasks = subtasks.filter((s) => s.isCompleted).length;
  const progressPercent = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F0F1F2]">
        <div className="text-[#6F7D75]">Загрузка...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center h-screen bg-[#F0F1F2]">
        <div className="text-[#6F7D75]">Задача не найдена</div>
        <button
          onClick={() => navigate('/tasks')}
          className="px-8 py-3 bg-[#8CA693] text-white rounded-xl text-sm font-medium hover:bg-[#7A9181] transition-all shadow-[0_6px_20px_0_rgba(140,166,147,0.3)] hover:shadow-[0_8px_25px_0_rgba(140,166,147,0.4)] active:scale-95 focus:outline-none"
        >
          К задачам
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F0F1F2]">
      <img
        src="/focus-background.webp"
        alt="Focus Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-white/25 backdrop-blur-sm" />

      <div className="relative z-10 flex items-center justify-center h-full p-4 md:p-8">
        <div className="w-full max-w-2xl bg-white/25 backdrop-blur-md rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col relative">
          <div className="absolute top-6 right-6">
            <button
              onClick={() => navigate(`/tasks/${id}`, { replace: true })}
              className="w-10 h-10 rounded-full hover:bg-[#F0F1F2]/80 flex items-center justify-center transition-colors text-[#6F7D75] hover:text-[#2F3A34]"
            >
              <img src="/close-icon.svg" alt="" />
            </button>
          </div>

          <div className="p-8 md:p-12 flex flex-col items-center text-center flex-1">
            <h1 className="text-xl md:text-3xl font-medium text-[#2F3A34] mb-4 leading-tight break-words w-full px-4">
              {task.title}
            </h1>

            {task.deadline && (
              <p className="text-sm text-[#6F7D75] mb-4 flex items-center gap-2">
                Дедлайн: {formatDeadlineFull(task.deadline).text}
              </p>
            )}

            {subtasks.length > 0 && (
              <>
                <h2 className="font-medium text-[#2F3A34] text-left mb-2 w-full px-4">Прогресс:</h2>
                <div className="w-full flex items-center gap-4 mb-8 px-4">
                  <div className="w-full h-2 bg-[#D9D9D9] rounded-xl">
                    <div
                      className="h-full bg-[#8CA693] transition-all duration-500 ease-out rounded-xl"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[#6F7D75] flex-shrink-0">{progressPercent}%</span>
                </div>
              </>
            )}

            {subtasks.length > 0 && (
              <div className="w-full space-y-3 mb-8 text-left px-4">
                <h3 className="ml-2 font-medium text-[#6F7D75] mb-4">Подзадачи</h3>
                {subtasks.map((subtask) => (
                  <label
                    key={subtask.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/50 hover:bg-white/80 cursor-pointer transition-all group min-w-0"
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        subtask.isCompleted
                          ? 'bg-[#8CA693] border-[#8CA693]'
                          : 'border-[#D9D9D9] group-hover:border-[#8CA693]'
                      }`}
                    >
                      {subtask.isCompleted && <img src="/taskDone-icon.svg" className="w-6 h-6" />}
                    </div>
                    <span className="text-sm flex-1 min-w-0 truncate" title={subtask.title}>
                      <span
                        className={
                          subtask.isCompleted
                            ? 'line-through text-[#6F7D75]'
                            : 'text-[#2F3A34] font-medium'
                        }
                      >
                        {subtask.title}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={subtask.isCompleted}
                      onChange={() => handleToggleSubtask(subtask.id, subtask.isCompleted)}
                    />
                  </label>
                ))}
              </div>
            )}

            {task.description && (
              <p className="text-sm text-[#6F7D75] leading-relaxed max-w-lg mb-8 break-words min-w-0">
                Описание: {task.description}
              </p>
            )}

            <button
              onClick={handleCompleteTask}
              disabled={isCompleting || task.status === 'done'}
              className={`px-8 py-4 rounded-2xl text-white font-medium text-lg shadow-lg transition-all transform hover:scale-[1.025] active:scale-95 ${
                isCompleting || task.status === 'done'
                  ? 'bg-[#8CA693]/65 cursor-not-allowed'
                  : 'bg-[#8CA693]/85 hover:bg-[#7A9181] hover:shadow-xl'
              }`}
            >
              {isCompleting ? (
                'Завершаем...'
              ) : task.status === 'done' ? (
                <span>Задача завершена</span>
              ) : (
                <div className="flex gap-2">
                  <img src="/completeTask-icon.svg" alt="" className="-translate-y-[0.25px]" />
                  <span>Завершить задачу</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
