import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetTaskQuery, useUpdateTaskMutation } from '../../features/tasks/tasksApi';
import { useUpdateSubtaskMutation } from '../../features/tasks/subtasksApi';

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
      await updateTask({ id: task._id, status: 'done' }).unwrap();
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
      <div className="flex items-center justify-center h-screen bg-[#F0F1F2]">
        <div className="text-[#6F7D75]">Задача не найдена</div>
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
        <div className="w-full max-w-2xl bg-white/25 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          <div className="absolute top-6 right-6">
            <button
              onClick={() => navigate(`/tasks/${id}`, { replace: true })}
              className="w-10 h-10 rounded-full hover:bg-[#F0F1F2]/80 flex items-center justify-center transition-colors text-[#6F7D75] hover:text-[#2F3A34]"
            >
              <img src="/close-icon.svg" alt="" />
            </button>
          </div>

          <div className="p-8 md:p-12 flex flex-col items-center text-center flex-1 justify-center">
            {/* Заголовок задачи */}
            <h1 className="text-xl md:text-3xl font-medium text-[#2F3A34] mb-4 leading-tight">
              {task.title}
            </h1>

            {/* Дедлайн */}
            {task.deadline && (
              <p className="text-sm text-[#6F7D75] mb-4 flex items-center gap-2">
                Дедлайн:{' '}
                {new Date(task.deadline).toLocaleString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}

            <h2 className="font-medium text-[#2F3A34] text-left mb-2">Прогресс:</h2>
            {subtasks.length > 0 && (
              <div className="w-full flex items-center gap-4 mb-8">
                <div className="w-full h-2 bg-[#F0F1F2] rounded-xl">
                  <div
                    className="h-full bg-[#8CA693] transition-all duration-500 ease-out rounded-xl"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[#6F7D75]">{progressPercent}%</span>
              </div>
            )}

            {/* Подзадачи */}
            {subtasks.length > 0 && (
              <div className="w-full space-y-3 mb-8 text-left">
                <h3 className="text-xs font-medium text-[#6F7D75] uppercase tracking-wider mb-4">
                  Подзадачи
                </h3>
                {subtasks.map((subtask) => (
                  <label
                    key={subtask.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/50 hover:bg-white/80 cursor-pointer transition-all group"
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        subtask.isCompleted
                          ? 'bg-[#8CA693] border-[#8CA693]'
                          : 'border-[#D9D9D9] group-hover:border-[#8CA693]'
                      }`}
                    >
                      {subtask.isCompleted && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span
                      className={`text-sm ${
                        subtask.isCompleted
                          ? 'text-[#6F7D75] line-through'
                          : 'text-[#2F3A34] font-medium'
                      }`}
                    >
                      {subtask.title}
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

            {/* Описание (если есть) */}
            {task.description && (
              <p className="text-sm text-[#6F7D75] leading-relaxed max-w-lg mb-8">
                Описание: {task.description}
              </p>
            )}

            {/* Кнопка завершения */}
            <button
              onClick={handleCompleteTask}
              disabled={isCompleting}
              className={`px-8 py-4 rounded-2xl text-white font-medium text-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                isCompleting
                  ? 'bg-[#6F7D75] cursor-not-allowed'
                  : 'bg-[#8CA693] hover:bg-[#7A9181] hover:shadow-xl'
              }`}
            >
              {isCompleting ? 'Завершаем...' : '✓ Завершить задачу'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
