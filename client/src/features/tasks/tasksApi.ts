import { api } from '../../store/api';
import type { CreateTaskDto, Task, UpdateTaskDto } from '../../entities/task/model';

export type GetTasksParams = {
  projectId?: string;
  priority?: 'high' | 'medium' | 'low';
  deadlineType?: 'hard' | 'soft' | 'none';
  status?: 'todo' | 'in_progress' | 'done';
  search?: string;
  sortBy?: 'deadline' | 'priority' | 'createdAt';
  order?: 'asc' | 'desc';
  limit?: number;
  page?: number;
};

export type TasksResponse = {
  data: Task[];
  total: number;
  page: number;
  totalPages: number;
};

export const tasksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createTask: builder.mutation<Task, CreateTaskDto>({
      query: (data) => ({
        url: '/tasks',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Task', 'Dashboard'],
    }),
    getTask: builder.query<Task, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
      }),
      providesTags: ['Task', 'Dashboard'],
    }),
    getTasks: builder.query<TasksResponse, GetTasksParams | undefined>({
      query: (params) => ({
        url: '/tasks',
        params: {
          projectId: params?.projectId,
          priority: params?.priority,
          deadlineType: params?.deadlineType,
          status: params?.status,
          search: params?.search,
          sortBy: params?.sortBy,
          order: params?.order,
          limit: params?.limit,
          page: params?.page,
        },
      }),
      providesTags: ['Task', 'Dashboard'],
    }),
    updateTask: builder.mutation<Task, { id: string } & UpdateTaskDto>({
      query: ({ id, ...updateData }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        data: updateData,
      }),
      invalidatesTags: ['Task', 'Dashboard', 'Notifications'],
    }),
    deleteTask: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task', 'Dashboard'],
    }),
  }),
});

export const {
  useGetTaskQuery,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
