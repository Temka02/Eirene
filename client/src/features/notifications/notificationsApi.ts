import type { Notification } from '../../entities/notification/model';
import { api } from '../../store/api';

type GetNotificationsParams = {
  type?: 'achievement' | 'deadline' | 'system';
  isRead?: boolean;
  limit?: number;
  skip?: number;
};

export type NotificationsResponse = {
  data: Notification[];
  total: number;
};

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, GetNotificationsParams | undefined>({
      query: (params) => ({
        url: '/notifications',
        params: {
          type: params?.type,
          isRead: params?.isRead,
          limit: params?.limit,
          skip: params?.skip,
        },
      }),
      providesTags: ['Notifications'],
    }),
    markAsRead: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/notifications/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
    markAllRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
    deleteNotification: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi;
