import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error-handler';
import { exportService } from '../services/export-service';

const router = Router();

// 导出为Markdown
router.post(
  '/markdown',
  asyncHandler(async (req: Request, res: Response) => {
    const { title, cards } = req.body;

    if (!title || !cards) {
      return res.status(400).json({
        success: false,
        error: '标题和卡片数据不能为空',
      });
    }

    const markdown = await exportService.toMarkdown(title, cards);

    res.json({
      success: true,
      data: {
        content: markdown,
        filename: `${title}.md`,
      },
    });
  })
);

// 导出为JSON
router.post(
  '/json',
  asyncHandler(async (req: Request, res: Response) => {
    const { title, cards, metadata } = req.body;

    if (!title || !cards) {
      return res.status(400).json({
        success: false,
        error: '标题和卡片数据不能为空',
      });
    }

    const json = await exportService.toJSON(title, cards, metadata);

    res.json({
      success: true,
      data: {
        content: json,
        filename: `${title}.json`,
      },
    });
  })
);

export { router as exportRoutes };
