import PDFParse from 'pdf-parse';
import { createLogger } from '@xiaohongshu/logger';
import {
  splitParagraphs,
  cleanText,
  generateId,
  detectLanguage,
  countWords,
  calculateReadingTime,
  getParagraphType,
} from '@xiaohongshu/utils';
import type { ParsedContent, Paragraph } from '@xiaohongshu/utils';

const logger = createLogger({ service: 'content-service' });

class ContentService {
  async parseText(text: string): Promise<ParsedContent> {
    logger.info('解析文本内容', { textLength: text.length });

    const cleanedText = cleanText(text);
    const paragraphTexts = splitParagraphs(cleanedText);

    const paragraphs: Paragraph[] = paragraphTexts.map((content, index) => ({
      id: generateId('para'),
      content,
      order: index,
      type: getParagraphType(content),
    }));

    const metadata = {
      wordCount: countWords(cleanedText),
      paragraphCount: paragraphs.length,
      estimatedReadTime: calculateReadingTime(cleanedText),
      language: detectLanguage(cleanedText),
      contentType: this.detectContentType(cleanedText) as any,
    };

    logger.info('文本解析完成', metadata);

    return {
      originalText: cleanedText,
      paragraphs,
      metadata,
    };
  }

  async parsePDF(buffer: Buffer): Promise<ParsedContent> {
    logger.info('解析PDF文件', { size: buffer.length });

    try {
      const data = await PDFParse(buffer);
      const text = data.text;

      if (!text || text.trim().length === 0) {
        throw new Error('PDF文件中未找到文本内容');
      }

      logger.info('PDF解析成功', {
        pages: data.numpages,
        textLength: text.length,
      });

      return this.parseText(text);
    } catch (error) {
      logger.error('PDF解析失败', { error });
      throw new Error('PDF文件解析失败，请确认文件格式正确');
    }
  }

  private detectContentType(text: string): string {
    const keywords = {
      travel: ['旅行', '旅游', '景点', '酒店', '机票', '行程'],
      food: ['美食', '餐厅', '菜品', '味道', '食材', '烹饪'],
      fashion: ['穿搭', '时尚', '服装', '搭配', '风格', '品牌'],
      lifestyle: ['生活', '日常', '分享', '体验', '推荐', '种草'],
    };

    for (const [type, words] of Object.entries(keywords)) {
      if (words.some((word) => text.includes(word))) {
        return type;
      }
    }

    return 'article';
  }
}

export const contentService = new ContentService();
