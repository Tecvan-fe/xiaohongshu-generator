import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error-handler';
import { aiService } from '../services/ai-service';

const router = Router();

// 分析文本内容
router.post('/analyze', asyncHandler(async (req: Request, res: Response) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({
      success: false,
      error: '文本内容不能为空',
    });
  }

  const result = await aiService.analyzeContent(text);
  
  res.json({
    success: true,
    data: result,
  });
}));

// 生成标题
router.post('/titles', asyncHandler(async (req: Request, res: Response) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({
      success: false,
      error: '文本内容不能为空',
    });
  }

  const titles = await aiService.generateTitles(text);
  
  res.json({
    success: true,
    data: titles,
  });
}));

// 生成卡片数据
router.post('/cards', asyncHandler(async (req: Request, res: Response) => {
  const { paragraphs } = req.body;
  
  if (!paragraphs || !Array.isArray(paragraphs)) {
    return res.status(400).json({
      success: false,
      error: '段落数据格式错误',
    });
  }

  const cards = await aiService.generateCards(paragraphs);
  
  res.json({
    success: true,
    data: cards,
  });
}));

export { router as aiRoutes }; 