import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkAsReadMutation,
} from '../../features/notifications/notificationsApi';
import type { Notification as NotificationItem } from '../../entities/notification/model';

type TabType = 'all' | 'unread';
type NotificationType = 'all' | 'deadline' | 'achievement';

const ITEMS_PER_PAGE = 4;

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedType, setSelectedType] = useState<NotificationType>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    const deletedItem = allNotifications.find((n) => n._id === id);
    setAllNotifications((prev) => prev.filter((n) => n._id !== id));

    try {
      await deleteNotification({ id }).unwrap();
    } catch (error) {
      if (deletedItem) {
        setAllNotifications((prev) =>
          [...prev, deletedItem].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      }
      console.error(error);
    }
  };

  const { data, isLoading, isFetching, isSuccess } = useGetNotificationsQuery({
    type: selectedType === 'all' ? undefined : selectedType,
    isRead: activeTab === 'unread' ? false : undefined,
    limit: ITEMS_PER_PAGE,
    skip: (page - 1) * ITEMS_PER_PAGE,
  });

  useEffect(() => {
    setPage(1);
    setAllNotifications([]);
    setHasMore(true);
  }, [selectedType, activeTab]);

  useEffect(() => {
    if (isSuccess && data) {
      const notifications = data.data || [];
      const total = data.total || 0;

      setAllNotifications((prev) => {
        const merged = page === 1 ? notifications : [...prev, ...notifications];
        const unique = Array.from(new Map(merged.map((item) => [item._id, item])).values());

        return unique.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      setHasMore(page * ITEMS_PER_PAGE < total);
    }
  }, [data, isSuccess, page]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead({ id });
  };

  const groupByDate = (items: NotificationItem[]) => {
    const groups: Record<string, NotificationItem[]> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    items.forEach((item) => {
      const itemDate = new Date(item.createdAt);
      itemDate.setHours(0, 0, 0, 0);
      let label = '';

      if (itemDate.getTime() === today.getTime()) label = 'Сегодня';
      else if (itemDate.getTime() === yesterday.getTime()) label = 'Вчера';
      else label = itemDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'Сегодня') return -1;
      if (b === 'Сегодня') return 1;
      if (a === 'Вчера') return -1;
      if (b === 'Вчера') return 1;
      return 0;
    });

    return sortedKeys.map((key) => ({ date: key, items: groups[key] }));
  };

  const groupedItems = useMemo(() => groupByDate(allNotifications), [allNotifications]);

  const unreadCount = useMemo(() => {
    if (activeTab === 'unread') return allNotifications.length;
    return allNotifications.filter((n) => !n.isRead).length;
  }, [allNotifications, activeTab]);

  const loadMore = () => setPage((p) => p + 1);

  const getIconSrc = (type: NotificationItem['type']) => {
    switch (type) {
      case 'deadline':
        return '/notification-deadline-icon.svg';
      case 'achievement':
        return '/notification-success-icon.svg';
      default:
        return '/notification-deadline-icon.svg';
    }
  };

  const getIconBg = (type: NotificationItem['type']) => {
    switch (type) {
      case 'deadline':
        return 'bg-[#FFEFD3]';
      case 'achievement':
        return 'bg-[#E4F0E5]';
      default:
        return 'bg-[#E9F0F9]';
    }
  };

  return (
    <div className="px-5 md:px-8 h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="w-full">
        <h1 className="text-2xl text-[#2F3A34] mb-3">Уведомления</h1>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex bg-white p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-[#F0F3ED] text-[#2F3A34]'
                  : 'text-[#6F7D75] hover:bg-[#F0F3ED]/50'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'unread'
                  ? 'bg-[#F0F3ED] text-[#2F3A34]'
                  : 'text-[#6F7D75] hover:bg-[#F0F3ED]/50'
              }`}
            >
              Непрочитанные
            </button>
          </div>

          <div ref={dropdownRef} className="relative flex gap-2">
            <button
              onClick={handleMarkAllRead}
              disabled={isMarkingAll || unreadCount === 0}
              className="bg-[#8CA693] shadow-[0_6px_20px_0_rgba(0,0,0,0.05)] rounded-lg px-6 py-2 text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMarkingAll ? 'Обновление...' : unreadCount > 0 ? `Прочитать все` : 'Все прочитано'}
            </button>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-44 items-center justify-center gap-2 bg-white px-5 py-2.5 rounded-xl shadow-sm text-[#6F7D75] hover:bg-[#F0F3ED]/50 transition-colors"
            >
              <span className="text-sm font-medium">
                {selectedType === 'all'
                  ? 'Все'
                  : selectedType === 'deadline'
                    ? 'Напоминания'
                    : selectedType === 'achievement'
                      ? 'Завершенные'
                      : 'Системные'}
              </span>
              <img
                src="/asideArrow-icon.svg"
                alt=""
                className={`w-3 h-3 transition-transform ${isDropdownOpen ? '-rotate-180' : '-rotate-90'}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                {(['all', 'deadline', 'achievement'] as NotificationType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      selectedType === type
                        ? 'bg-[#F0F3ED] text-[#2F3A34] font-medium'
                        : 'text-[#6F7D75] hover:bg-[#F0F3ED]/70'
                    }`}
                  >
                    {type === 'all'
                      ? 'Все'
                      : type === 'deadline'
                        ? 'Напоминания'
                        : type === 'achievement'
                          ? 'Завершенные'
                          : 'Системные'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isLoading && page === 1 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm animate-pulse h-24"></div>
            ))}
          </div>
        ) : groupedItems.length === 0 && !isFetching ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#6F7D75]">
            <img src="/empty-notifications-icon.svg" alt="" className="w-24 h-24 mb-4 opacity-75" />
            <p className="text-lg font-medium">Уведомлений нет</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedItems.map((group) => (
              <div key={group.date}>
                <h2 className="font-medium text-[#2F3A34] mb-1 ml-6">{group.date}</h2>
                <div>
                  {group.items.map((notification) => (
                    <div
                      key={notification._id}
                      className={`bg-white p-2.5 rounded-2xl flex items-center gap-4 transition-all border-2 border-[#F0F1F2] shadow-[0_6px_20px_0_rgba(0,0,0,0.1)]`}
                    >
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(notification.type)}`}
                      >
                        <img src={getIconSrc(notification.type)} alt="" className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0 text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          {!notification.isRead && (
                            <div
                              className={`w-2 h-2 ${notification.type === 'achievement' ? 'bg-[#8CA693]' : 'bg-[#FFC65C]'} rounded-full flex-shrink-0`}
                            />
                          )}
                          <p className="text-[#2F3A34] font-medium leading-snug truncate">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex flex-col items-start gap-1 text-[#5F6F65]">
                          {notification.deadlineType && notification.deadlineType !== 'none' && (
                            <>
                              {notification.deadlineType === 'hard' ? (
                                <>
                                  <div className="flex items-center gap-1">
                                    <img
                                      src="/hardDeadlineType-icon.svg"
                                      alt=""
                                      className="w-4 h-4"
                                    />
                                    <span>
                                      Жёсткий{' '}
                                      <span className="text-[#8CA693] ml-2">
                                        Лучше выполнить в срок
                                      </span>
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <img src="/calendar-icon.svg" alt="" className="w-3 h-3" />
                                    <span>
                                      Дедлайн:{' '}
                                      {new Date(notification.deadline!).toLocaleString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1">
                                    <img
                                      src="/softDeadlineType-icon.svg"
                                      alt=""
                                      className="w-4 h-4"
                                    />
                                    <span>
                                      Мягкий{' '}
                                      <span className="text-[#8CA693] ml-2">
                                        Можно перенести, если нужно
                                      </span>
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <img src="/calendar-icon.svg" alt="" className="w-3 h-3" />
                                    <span>
                                      Дедлайн:{' '}
                                      {new Date(notification.deadline!).toLocaleString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                          {notification.taskId && notification.type === 'achievement' && (
                            <span>Отличная работа! Продолжай в том же духе</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {notification.taskId && notification.type !== 'achievement' && (
                          <button
                            onClick={() => navigate(`/tasks/${notification.taskId}`)}
                            className="flex-shrink-0 px-4 py-2 text-sm text-[#8CA693] bg-white border border-[#D9D9D9] rounded-lg hover:bg-[#F0F3ED] transition-colors"
                          >
                            Перейти
                          </button>
                        )}

                        {!notification.taskId && notification.projectId && (
                          <button
                            onClick={() => navigate(`/project/${notification.projectId}`)}
                            className="flex-shrink-0 px-5 py-2 text-sm text-[#8CA693] bg-white border border-[#D9D9D9] rounded-lg hover:bg-[#F0F3ED] transition-colors"
                          >
                            Перейти
                          </button>
                        )}

                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="flex-shrink-0 p-2 text-[#8CA693] hover:bg-[#F0F3ED] rounded-lg transition-colors"
                            title="Отметить как прочитанное"
                          >
                            <img src="/readNotification-icon.svg" alt="" className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(notification._id)}
                          className={`flex-shrink-0 p-2 hover:bg-[#E25760]/15 rounded-lg transition-colors ${
                            isDeleting ? 'opacity-50 cursor-not-allowed' : 'opacity-85'
                          }`}
                          title="Удалить уведомление"
                          disabled={isDeleting}
                        >
                          <img src="/delete-icon.svg" alt="" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={isFetching}
                  className="px-6 py-2 bg-white border border-[#D9D9D9] rounded-lg text-[#8CA693] font-medium hover:bg-[#F0F3ED] transition disabled:opacity-50"
                >
                  {isFetching ? 'Загрузка...' : 'Показать ещё'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
