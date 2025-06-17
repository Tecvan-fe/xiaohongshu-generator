import { Router } from 'express';
import { contentRoutes } from './content';
import { aiRoutes } from './ai';
import { exportRoutes } from './export';

const router = Router();

// 内容处理路由
router.use('/content', contentRoutes);

// AI分析路由
router.use('/ai', aiRoutes);

// 导出功能路由
router.use('/export', exportRoutes);

// API信息
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: '小红书内容生成器 API',
    version: '1.0.0',
    endpoints: {
      content: '/api/content',
      ai: '/api/ai',
      export: '/api/export',
    },
  });
});

export { router as apiRoutes }; 