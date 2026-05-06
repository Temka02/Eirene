import { api } from '../../store/api';
import type { Subtask, CreateSubtaskDto, UpdateSubtaskDto } from '../../entities/task/model';

export const subtasksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    addSubtask: builder.mutation<Subtask, { taskId: string } & CreateSubtaskDto>({
      query: ({ taskId, title }) => ({
        url: `/tasks/${taskId}/subtasks`,
        method: 'POST',
        data: { title },
      }),
      invalidatesTags: ['Task'],
    }),
    updateSubtask: builder.mutation<
      Subtask,
      { taskId: string; subtaskId: string } & UpdateSubtaskDto
    >({
      query: ({ taskId, subtaskId, ...updateData }) => ({
        url: `/tasks/${taskId}/subtasks/${subtaskId}`,
        method: 'PATCH',
        data: updateData,
      }),
      invalidatesTags: ['Task'],
    }),
    deleteSubtask: builder.mutation<void, { taskId: string; subtaskId: string }>({
      query: ({ taskId, subtaskId }) => ({
        url: `/tasks/${taskId}/subtasks/${subtaskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const { useAddSubtaskMutation, useDeleteSubtaskMutation, useUpdateSubtaskMutation } =
  subtasksApi;
