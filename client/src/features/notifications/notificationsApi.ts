import { api } from '../../store/api';

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], void>({
      query: () => ({ url: '/notifications' }),
      providesTags: ['Notifications'],
    }),
    markAllRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
    deleteNotification: builder.mutation<void, { id: string }>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkAllReadMutation, useDeleteNotificationMutation } =
  notificationsApi;
