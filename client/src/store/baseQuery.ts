import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';
import apiClient from '../api/apiClient';

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
};

export const axiosBaseQuery: BaseQueryFn<AxiosBaseQueryArgs, unknown, unknown> = async ({
  url,
  method = 'get',
  data,
}) => {
  try {
    const result = await apiClient({ url, method, data });
    return { data: result.data };
  } catch (axiosError) {
    const err = axiosError as AxiosError;
    return {
      error: {
        status: err.response?.status,
        data: err.response?.data || err.message,
      },
    };
  }
};
