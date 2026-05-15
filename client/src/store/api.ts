import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Task', 'Project', 'Dashboard', 'Notifications', 'User'],
  endpoints: () => ({}),
});
