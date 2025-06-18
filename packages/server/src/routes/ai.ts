import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error-handler';
import { aiService } from '../services/ai-service';

const router = Router();

// 分析文本内容
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { text, style = 'xiaohongshu' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: '文本内容不能为空',
      });
    }

    if (text.length > 10000) {
      return res.status(400).json({
        success: false,
        error: '文本内容过长，最多支持10000字符',
      });
    }

    const result = await aiService.analyzeContent(text.trim(), style);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('内容分析失败', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '内容分析失败',
    });
  }
});

// 生成标题
router.post('/titles', async (req: Request, res: Response) => {
  try {
    const { text, style = 'xiaohongshu' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: '文本内容不能为空',
      });
    }

    if (text.length > 10000) {
      return res.status(400).json({
        success: false,
        error: '文本内容过长，最多支持10000字符',
      });
    }

    const result = await aiService.generateTitles(text.trim(), style);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('标题生成失败', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '标题生成失败',
    });
  }
});

// 生成卡片数据
router.post(
  '/cards',
  asyncHandler(async (req: Request, res: Response) => {
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
  })
);

export { router as aiRoutes };
