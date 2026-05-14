import type { CreateProjectDto, Project, UpdateProjectDto } from '../../entities/project/model';
import { api } from '../../store/api';
import type { GetTasksParams, TasksResponse } from '../tasks/tasksApi';

export const projectsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createProject: builder.mutation<Project, CreateProjectDto>({
      query: (data) => ({
        url: '/projects',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Project'],
    }),
    getProject: builder.query<Project, string>({
      query: (id) => ({
        url: `/projects/${id}`,
      }),
      providesTags: ['Project'],
    }),
    getProjectTasks: builder.query<TasksResponse, { id: string } & Partial<GetTasksParams>>({
      query: ({ id, ...params }) => ({
        url: `/projects/${id}/tasks`,
        params: {
          priority: params.priority,
          deadlineType: params.deadlineType,
          status: params.status,
          search: params.search,
          sortBy: params.sortBy,
          order: params.order,
          limit: params.limit,
          page: params.page,
        },
      }),
      providesTags: ['Task', 'Project'],
    }),
    getProjects: builder.query<Project[], void>({
      query: () => ({ url: '/projects' }),
      providesTags: ['Project'],
    }),
    updateProject: builder.mutation<Project, { id: string } & UpdateProjectDto>({
      query: ({ id, ...updateData }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        data: updateData,
      }),
      invalidatesTags: ['Project'],
    }),
    deleteProject: builder.mutation<void, { id: string }>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),
  }),
});

export const {
  useGetProjectQuery,
  useCreateProjectMutation,
  useGetProjectTasksQuery,
  useGetProjectsQuery,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
} = projectsApi;
