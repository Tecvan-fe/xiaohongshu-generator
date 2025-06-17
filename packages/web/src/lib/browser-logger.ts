// 浏览器环境专用的简化logger
interface LoggerConfig {
  service: string;
  level?: 'debug' | 'info' | 'warn' | 'error';
}

interface Logger {
  debug: (message: string, meta?: any) => void;
  info: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  error: (message: string, meta?: any) => void;
}

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export function createBrowserLogger(config: LoggerConfig): Logger {
  const { service, level = 'info' } = config;
  const currentLevel = LOG_LEVELS[level];

  const formatMessage = (level: string, message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${service}] [${level.toUpperCase()}]`;

    if (meta) {
      return `${prefix} ${message}`;
    }
    return `${prefix} ${message}`;
  };

  const shouldLog = (logLevel: string) => {
    return LOG_LEVELS[logLevel as keyof typeof LOG_LEVELS] >= currentLevel;
  };

  return {
    debug: (message: string, meta?: any) => {
      if (shouldLog('debug')) {
        console.debug(formatMessage('debug', message, meta), meta || '');
      }
    },
    info: (message: string, meta?: any) => {
      if (shouldLog('info')) {
        console.info(formatMessage('info', message, meta), meta || '');
      }
    },
    warn: (message: string, meta?: any) => {
      if (shouldLog('warn')) {
        console.warn(formatMessage('warn', message, meta), meta || '');
      }
    },
    error: (message: string, meta?: any) => {
      if (shouldLog('error')) {
        console.error(formatMessage('error', message, meta), meta || '');
      }
    },
  };
}
