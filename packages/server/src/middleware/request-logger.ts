import { Request, Response, NextFunction } from 'express';
import { Logger } from '@xiaohongshu/logger';

export function requestLogger(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // 记录请求开始
    const requestId = Math.random().toString(36).substring(2);
    
    // 添加请求ID到response headers
    res.setHeader('X-Request-ID', requestId);
    
    // 创建带有请求ID的子logger
    const childLogger = logger.child({ requestId });
    
    // 将logger添加到request对象，方便在后续中间件中使用
    (req as any).logger = childLogger;
    
    childLogger.info('请求开始', {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      referer: req.get('Referer'),
    });
    
    // 监听response finish事件
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      
      // 根据状态码选择日志级别
      const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
      
      childLogger[logLevel]('请求完成', {
        method: req.method,
        url: req.url,
        statusCode,
        duration: `${duration}ms`,
        contentLength: res.get('Content-Length'),
      });
    });
    
    next();
  };
} 