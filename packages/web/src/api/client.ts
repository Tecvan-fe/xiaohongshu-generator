import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { createLogger } from '@xiaohongshu/logger';
import type { ApiError } from './types';

const logger = createLogger({ service: 'api-client' });

/**
 * API客户端配置
 */
export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  enableLogging?: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: ApiClientConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 30000,
  enableLogging: true,
};

/**
 * 处理API错误
 */
const handleApiError = (error: any): ApiError => {
  // 网络错误
  if (!error.response) {
    return {
      code: 'NETWORK_ERROR',
      message: '网络连接失败，请检查网络设置',
      details: { originalError: error.message },
    };
  }

  // HTTP错误
  const { status, data } = error.response;

  // 如果后端返回了标准错误格式
  if (data && typeof data === 'object' && data.error) {
    return {
      code: `HTTP_${status}`,
      message: data.error,
      details: { status, data },
    };
  }

  // 根据状态码返回默认错误信息
  const errorMessages: Record<number, string> = {
    400: '请求参数错误',
    401: '未授权访问',
    403: '权限不足',
    404: '请求的资源不存在',
    413: '文件大小超出限制',
    415: '不支持的文件类型',
    429: '请求过于频繁，请稍后再试',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务暂时不可用',
    504: '请求超时',
  };

  return {
    code: `HTTP_${status}`,
    message: errorMessages[status] || `请求失败 (${status})`,
    details: { status, data },
  };
};

/**
 * 创建axios实例
 */
const createAxiosInstance = (config: ApiClientConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (requestConfig) => {
      if (config.enableLogging) {
        logger.info('API请求发送', {
          method: requestConfig.method?.toUpperCase(),
          url: requestConfig.url,
          params: requestConfig.params,
          data: requestConfig.data instanceof FormData ? '[FormData]' : requestConfig.data,
        });
      }

      // 记录请求开始时间
      requestConfig.metadata = { startTime: Date.now() };

      return requestConfig;
    },
    (error) => {
      logger.error('API请求配置错误', { error });
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const duration = Date.now() - (response.config.metadata?.startTime || 0);

      if (config.enableLogging) {
        logger.info('API响应成功', {
          method: response.config.method?.toUpperCase(),
          url: response.config.url,
          status: response.status,
          duration: `${duration}ms`,
          dataLength: JSON.stringify(response.data).length,
        });
      }

      return response;
    },
    (error) => {
      const duration = Date.now() - (error.config?.metadata?.startTime || 0);

      if (config.enableLogging) {
        logger.error('API响应错误', {
          method: error.config?.method?.toUpperCase(),
          url: error.config?.url,
          status: error.response?.status,
          duration: `${duration}ms`,
          message: error.message,
          responseData: error.response?.data,
        });
      }

      return Promise.reject(handleApiError(error));
    }
  );

  return instance;
};

// 创建默认axios实例
const defaultInstance = createAxiosInstance(DEFAULT_CONFIG);

/**
 * GET请求
 */
export const get = async <T = any>(
  url: string,
  requestConfig?: AxiosRequestConfig & { signal?: AbortSignal }
): Promise<T> => {
  const response = await defaultInstance.get<T>(url, requestConfig);
  return response.data;
};

/**
 * POST请求
 */
export const post = async <T = any>(
  url: string,
  data?: any,
  requestConfig?: AxiosRequestConfig & { signal?: AbortSignal }
): Promise<T> => {
  const response = await defaultInstance.post<T>(url, data, requestConfig);
  return response.data;
};

/**
 * PUT请求
 */
export const put = async <T = any>(
  url: string,
  data?: any,
  requestConfig?: AxiosRequestConfig & { signal?: AbortSignal }
): Promise<T> => {
  const response = await defaultInstance.put<T>(url, data, requestConfig);
  return response.data;
};

/**
 * DELETE请求
 */
export const del = async <T = any>(
  url: string,
  requestConfig?: AxiosRequestConfig & { signal?: AbortSignal }
): Promise<T> => {
  const response = await defaultInstance.delete<T>(url, requestConfig);
  return response.data;
};

/**
 * 上传文件
 */
export const upload = async <T = any>(
  url: string,
  file: File,
  requestConfig?: AxiosRequestConfig & { signal?: AbortSignal }
): Promise<T> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await defaultInstance.post<T>(url, formData, {
    ...requestConfig,
    headers: {
      ...requestConfig?.headers,
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * 获取axios实例（用于特殊需求）
 */
export const getInstance = (): AxiosInstance => defaultInstance;

/**
 * 创建自定义API客户端
 */
export const createApiClient = (config: ApiClientConfig = {}) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const instance = createAxiosInstance(mergedConfig);

  return {
    get: async <T = any>(url: string, requestConfig?: AxiosRequestConfig): Promise<T> => {
      const response = await instance.get<T>(url, requestConfig);
      return response.data;
    },
    post: async <T = any>(
      url: string,
      data?: any,
      requestConfig?: AxiosRequestConfig
    ): Promise<T> => {
      const response = await instance.post<T>(url, data, requestConfig);
      return response.data;
    },
    put: async <T = any>(
      url: string,
      data?: any,
      requestConfig?: AxiosRequestConfig
    ): Promise<T> => {
      const response = await instance.put<T>(url, data, requestConfig);
      return response.data;
    },
    delete: async <T = any>(url: string, requestConfig?: AxiosRequestConfig): Promise<T> => {
      const response = await instance.delete<T>(url, requestConfig);
      return response.data;
    },
    upload: async <T = any>(
      url: string,
      file: File,
      requestConfig?: AxiosRequestConfig
    ): Promise<T> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await instance.post<T>(url, formData, {
        ...requestConfig,
        headers: {
          ...requestConfig?.headers,
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },
    getInstance: () => instance,
  };
};

/**
 * 默认API客户端实例（为了向后兼容）
 */
export const apiClient = {
  get,
  post,
  put,
  delete: del,
  upload,
  getInstance,
};

/**
 * 扩展AxiosRequestConfig以支持metadata
 */
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime?: number;
      [key: string]: any;
    };
  }
}
