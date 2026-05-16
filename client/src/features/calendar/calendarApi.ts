import { api } from '../../store/api';
import type { Task } from '../../entities/task/model';

export interface CalendarRequest {
  year: number;
  month: number;
}

export const calendarApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCalendarTasks: builder.query<Task[], CalendarRequest>({
      query: ({ year, month }) => ({
        url: '/calendar',
        params: { year, month },
      }),
      providesTags: ['Task'],
    }),
  }),
});

export const { useGetCalendarTasksQuery } = calendarApi;
