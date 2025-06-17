export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LoggerConfig {
  level: LogLevel;
  service?: string;
  environment?: string;
  enableConsole?: boolean;
  enableFile?: boolean;
  fileConfig?: {
    filename: string;
    maxSize?: string;
    maxFiles?: string;
    datePattern?: string;
  };
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service?: string;
  environment?: string;
  metadata?: Record<string, any>;
} 