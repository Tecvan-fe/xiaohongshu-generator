import { apiClient } from './client';
import type { ApiInfoResponse, HealthResponse } from './types';

/**
 * 获取API信息
 * 获取API基础信息和端点列表
 */
export const getApiInfo = async (): Promise<ApiInfoResponse> => {
  return apiClient.get<ApiInfoResponse>('/');
};

/**
 * 健康检查
 * 检查服务健康状态
 */
export const checkHealth = async (): Promise<HealthResponse> => {
  // 注意：健康检查接口不在/api路径下
  const healthClient = apiClient.getInstance();
  const response = await healthClient.get<HealthResponse>('/health');
  return response.data;
};

/**
 * 检查服务是否可用
 * 简单的连接性测试
 */
export const isServiceAvailable = async (): Promise<boolean> => {
  try {
    await checkHealth();
    return true;
  } catch (error) {
    console.warn('服务健康检查失败:', error);
    return false;
  }
};
