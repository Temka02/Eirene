import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({}),
});
