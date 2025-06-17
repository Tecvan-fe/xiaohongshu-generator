import { Router, Request, Response } from 'express';
import multer from 'multer';
import { asyncHandler } from '../middleware/error-handler';
import { contentService } from '../services/content-service';

const router = Router();

// 配置文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  },
});

// 解析文本内容
router.post(
  '/parse-text',
  asyncHandler(async (req: Request, res: Response) => {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: '文本内容不能为空',
      });
    }

    const result = await contentService.parseText(text);

    res.json({
      success: true,
      data: result,
    });
  })
);

// 解析PDF文件
router.post(
  '/parse-pdf',
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '请上传PDF文件',
      });
    }

    const result = await contentService.parsePDF(req.file.buffer);

    res.json({
      success: true,
      data: result,
    });
  })
);

export { router as contentRoutes };
