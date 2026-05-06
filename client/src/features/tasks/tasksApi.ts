import { api } from '../../store/api';
import type { CreateTaskDto, Task, UpdateTaskDto } from '../../entities/task/model';

export const tasksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createTask: builder.mutation<Task, CreateTaskDto>({
      query: (data) => ({
        url: '/tasks',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Task'],
    }),
    getTasks: builder.query<Task[], void>({
      query: () => ({ url: '/tasks' }),
      providesTags: ['Task'],
    }),
    updateTask: builder.mutation<Task, { id: string } & UpdateTaskDto>({
      query: ({ id, ...updateData }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        data: updateData,
      }),
      invalidatesTags: ['Task'],
    }),
    deleteTask: builder.mutation<void, { id: string }>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
