import type { LogLevel, LoggerConfig, LogEntry } from './types';

// 颜色常量 - 支持浏览器和Node.js
const Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
} as const;

// 日志级别配置
const LogLevels: Record<LogLevel, { priority: number; color: string; label: string }> = {
  error: { priority: 0, color: Colors.red, label: 'ERROR' },
  warn: { priority: 1, color: Colors.yellow, label: 'WARN ' },
  info: { priority: 2, color: Colors.green, label: 'INFO ' },
  debug: { priority: 3, color: Colors.cyan, label: 'DEBUG' },
};

// 环境检测 - 只检测Node.js环境
const isNode = typeof process !== 'undefined' && process.versions?.node;
const isBrowser = !isNode;

export class Logger {
  private config: LoggerConfig;
  private fs: any;
  private path: any;

  constructor(config: LoggerConfig) {
    this.config = {
      enableConsole: true,
      enableFile: false,
      ...config,
      level: config.level || 'info',
    };

    // 动态导入Node.js模块（仅在Node.js环境中）
    if (isNode && this.config.enableFile) {
      try {
        this.fs = require('fs');
        this.path = require('path');
      } catch (error) {
        console.warn('File logging disabled: unable to load fs/path modules');
        this.config.enableFile = false;
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const currentLevelPriority = LogLevels[this.config.level as LogLevel]?.priority ?? 2;
    const messageLevelPriority = LogLevels[level].priority;
    return messageLevelPriority <= currentLevelPriority;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, metadata?: Record<string, any>): string {
    const timestamp = this.formatTimestamp();
    const levelInfo = LogLevels[level];
    const servicePrefix = this.config.service ? `[${this.config.service}] ` : '';
    const metaString =
      metadata && Object.keys(metadata).length > 0 ? ` ${JSON.stringify(metadata)}` : '';

    return `${timestamp} ${levelInfo.label}: ${servicePrefix}${message}${metaString}`;
  }

  private formatConsoleMessage(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>
  ): string {
    const timestamp = this.formatTimestamp();
    const levelInfo = LogLevels[level];
    const servicePrefix = this.config.service ? `[${this.config.service}] ` : '';
    const metaString =
      metadata && Object.keys(metadata).length > 0 ? ` ${JSON.stringify(metadata)}` : '';

    // 在支持颜色的环境中使用颜色
    if (isNode || isBrowser) {
      const coloredLevel = `${levelInfo.color}${levelInfo.label}${Colors.reset}`;
      const coloredService = servicePrefix ? `${Colors.cyan}${servicePrefix}${Colors.reset}` : '';
      return `${Colors.white}${timestamp}${Colors.reset} ${coloredLevel}: ${coloredService}${message}${metaString}`;
    }

    return `${timestamp} ${levelInfo.label}: ${servicePrefix}${message}${metaString}`;
  }

  private logToConsole(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    if (!this.config.enableConsole) return;

    const formattedMessage = this.formatConsoleMessage(level, message, metadata);

    // 根据级别选择console方法
    switch (level) {
      case 'error':
        console.error(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'debug':
        console.debug(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }

  private logToFile(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    if (!this.config.enableFile || !this.config.fileConfig || !isNode || !this.fs) return;

    try {
      const logEntry: LogEntry = {
        timestamp: this.formatTimestamp(),
        level,
        message,
        service: this.config.service,
        environment: this.config.environment,
        ...metadata,
      };

      const logLine = JSON.stringify(logEntry) + '\n';
      const logDir = this.path.dirname(this.config.fileConfig.filename);

      // 确保日志目录存在
      if (!this.fs.existsSync(logDir)) {
        this.fs.mkdirSync(logDir, { recursive: true });
      }

      // 生成文件名（支持日期模式）
      const now = new Date();
      const datePattern = this.config.fileConfig.datePattern || 'YYYY-MM-DD';
      const dateStr = datePattern
        .replace('YYYY', now.getFullYear().toString())
        .replace('MM', (now.getMonth() + 1).toString().padStart(2, '0'))
        .replace('DD', now.getDate().toString().padStart(2, '0'));

      const filename = this.config.fileConfig.filename.replace('%DATE%', dateStr);

      // 异步写入文件
      this.fs.appendFile(filename, logLine, (err: any) => {
        if (err) {
          console.error('Failed to write to log file:', err);
        }
      });
    } catch (error) {
      console.error('File logging error:', error);
    }
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(level)) return;

    this.logToConsole(level, message, metadata);
    this.logToFile(level, message, metadata);
  }

  error(message: string, metadata?: Record<string, any>): void {
    this.log('error', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata);
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata);
  }

  child(metadata: Record<string, any>): Logger {
    const childLogger = new Logger(this.config);
    // 在子logger中预设metadata（简化实现）
    const originalMethods = {
      error: childLogger.error.bind(childLogger),
      warn: childLogger.warn.bind(childLogger),
      info: childLogger.info.bind(childLogger),
      debug: childLogger.debug.bind(childLogger),
    };

    childLogger.error = (message: string, meta?: Record<string, any>) =>
      originalMethods.error(message, { ...metadata, ...meta });
    childLogger.warn = (message: string, meta?: Record<string, any>) =>
      originalMethods.warn(message, { ...metadata, ...meta });
    childLogger.info = (message: string, meta?: Record<string, any>) =>
      originalMethods.info(message, { ...metadata, ...meta });
    childLogger.debug = (message: string, meta?: Record<string, any>) =>
      originalMethods.debug(message, { ...metadata, ...meta });

    return childLogger;
  }
}
