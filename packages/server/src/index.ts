import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { createLogger } from '@xiaohongshu/logger';
import { validateEnvironment } from '@xiaohongshu/utils';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { apiRoutes } from './routes';

// 环境变量验证
const envValidation = validateEnvironment(process.env);
if (!envValidation.isValid) {
  console.error('环境变量验证失败:');
  envValidation.errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

// 创建logger
const logger = createLogger({
  service: 'xiaohongshu-server',
  level: (process.env.LOG_LEVEL as any) || 'info',
  enableFile: true,
  fileConfig: {
    filename: 'logs/server-%DATE%.log',
  },
});

// 创建Express应用
const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

// 安全中间件
app.use(helmet());

// CORS配置
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// 速率限制
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // 限制每个IP
  message: {
    error: '请求过于频繁，请稍后再试',
  },
});
app.use('/api', limiter);

// 请求解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志
app.use(requestLogger(logger));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'xiaohongshu-server',
    version: '1.0.0',
  });
});

// API路由
app.use('/api', apiRoutes);

// 静态文件服务
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// SPA路由支持 - 对于非API请求，返回index.html
app.get('*', (req, res) => {
  // 跳过API路由
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: '接口不存在',
      path: req.originalUrl,
    });
  }

  const indexPath = path.join(publicPath, 'index.html');

  // 检查index.html是否存在
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      success: false,
      error: '前端资源未找到，请先运行构建脚本',
      path: req.originalUrl,
    });
  }
});

// 错误处理
app.use(errorHandler(logger));

// 启动服务器
app.listen(port, () => {
  logger.info(`服务器启动成功`, {
    port,
    environment: process.env.NODE_ENV || 'development',
    aiProvider: process.env.AI_PROVIDER,
  });
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，开始优雅关闭...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到SIGINT信号，开始优雅关闭...');
  process.exit(0);
});
