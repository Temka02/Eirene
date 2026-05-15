import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetNotificationsQuery } from '../features/notifications/notificationsApi';
import type { RootState } from '../store';

export default function HeaderForAuthorized() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: unreadNotifications } = useGetNotificationsQuery({
    isRead: false,
    limit: 1,
  });

  const hasUnread = unreadNotifications && unreadNotifications.total > 0;
  const getInitials = () => {
    if (!user) return '??';
    const firstLetter = user?.name?.[0]?.toUpperCase() || '?';
    const secondLetter = user?.surname?.[0]?.toUpperCase() || '?';
    return `${firstLetter}${secondLetter}`;
  };

  const getFullName = () => {
    if (!user) return 'Пользователь';
    return `${user?.name || ''}`.trim() || 'Пользователь';
  };

  return (
    <header className="h-16 flex items-center justify-end px-6 md:px-8 pt-4 mb-2">
      <div className="flex items-center gap-4 md:gap-6">
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl hover:bg-[#F0F3ED] transition-colors"
          aria-label="Уведомления"
        >
          <img src="/notifications-header-icon.svg" alt="" className="w-6 h-7" />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        <div className="hidden md:flex items-center">
          <div className="relative">
            <img
              src="/search-icon.svg"
              alt=""
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Поиск.."
              className="w-64 h-11 pl-16 pr-4 bg-white rounded-xl text-sm placeholder-[#5F6F65] focus:outline-none focus:ring-1 focus:ring-[#8CA693] transition"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 py-1">
            <span className="text-[#2F3A34] text-xl font-medium">{getInitials()}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-[#2F3A34]">
            <span className="font-medium text-lg transition">{getFullName()}</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-xl hover:bg-[#F0F3ED] transition-colors"
          aria-label="Настройки"
        >
          <img src="/settings-icon.svg" alt="" className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
