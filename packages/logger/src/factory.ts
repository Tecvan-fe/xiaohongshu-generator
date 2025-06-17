import { Logger } from './logger';
import type { LoggerConfig, LogLevel } from './types';

const defaultConfig: LoggerConfig = {
  level: 'info',
  enableConsole: true,
  enableFile: false,
};

export function createLogger(config: Partial<LoggerConfig> = {}): Logger {
  const mergedConfig: LoggerConfig = {
    ...defaultConfig,
    ...config,
  };

  // 从环境变量读取配置
  if (process.env.LOG_LEVEL) {
    mergedConfig.level = process.env.LOG_LEVEL as LogLevel;
  }

  if (process.env.NODE_ENV) {
    mergedConfig.environment = process.env.NODE_ENV;
  }

  return new Logger(mergedConfig);
}

// 创建默认logger实例
export const defaultLogger = createLogger({
  service: 'xiaohongshu-generator',
}); 