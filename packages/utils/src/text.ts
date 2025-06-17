import { DEFAULT_CONFIG } from './constants';

/**
 * 生成唯一ID
 */
export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * 计算阅读时间（分钟）
 */
export function calculateReadingTime(text: string): number {
  const wordCount = countWords(text);
  return Math.ceil(wordCount / DEFAULT_CONFIG.ESTIMATED_READING_SPEED);
}

/**
 * 统计字符数（中英文）
 */
export function countWords(text: string): number {
  // 中文字符按字计算，英文按单词计算
  const chineseWords = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  return chineseWords + englishWords;
}

/**
 * 检测文本语言
 */
export function detectLanguage(text: string): 'zh' | 'en' | 'auto' {
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  const totalChars = chineseChars + englishChars;
  
  if (totalChars === 0) return 'auto';
  
  const chineseRatio = chineseChars / totalChars;
  if (chineseRatio > 0.5) return 'zh';
  if (chineseRatio < 0.2) return 'en';
  return 'auto';
}

/**
 * 分割段落
 */
export function splitParagraphs(text: string): string[] {
  // 按双换行符分割
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  // 进一步处理过长的段落
  const result: string[] = [];
  for (const paragraph of paragraphs) {
    if (paragraph.length <= DEFAULT_CONFIG.MAX_PARAGRAPH_LENGTH) {
      result.push(paragraph);
    } else {
      // 按句号分割长段落
      const sentences = paragraph.split(/[。！？.!?]/).filter(s => s.trim());
      let currentParagraph = '';
      
      for (const sentence of sentences) {
        if (currentParagraph.length + sentence.length < DEFAULT_CONFIG.MAX_PARAGRAPH_LENGTH) {
          currentParagraph += sentence + '。';
        } else {
          if (currentParagraph) {
            result.push(currentParagraph.trim());
          }
          currentParagraph = sentence + '。';
        }
      }
      
      if (currentParagraph) {
        result.push(currentParagraph.trim());
      }
    }
  }
  
  return result.filter(p => p.length >= DEFAULT_CONFIG.MIN_PARAGRAPH_LENGTH);
}

/**
 * 清理文本格式
 */
export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // 统一换行符
    .replace(/\s+/g, ' ') // 合并多余空格
    .replace(/\n\s*\n\s*\n/g, '\n\n') // 合并多余换行
    .trim();
}

/**
 * 提取markdown标题
 */
export function extractMarkdownHeadings(text: string): Array<{ level: number; text: string }> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ level: number; text: string }> = [];
  let match;
  
  while ((match = headingRegex.exec(text)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
    });
  }
  
  return headings;
}

/**
 * 判断段落类型
 */
export function getParagraphType(text: string): 'text' | 'heading' | 'list' | 'quote' {
  const trimmed = text.trim();
  
  // 标题判断（Markdown格式或较短且像标题的文本）
  if (trimmed.match(/^#{1,6}\s+/) || (trimmed.length < 50 && !trimmed.includes('。'))) {
    return 'heading';
  }
  
  // 列表判断
  if (trimmed.match(/^[•\-*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
    return 'list';
  }
  
  // 引用判断
  if (trimmed.startsWith('>') || trimmed.startsWith('「') || trimmed.startsWith('"')) {
    return 'quote';
  }
  
  return 'text';
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 转义HTML特殊字符
 */
export function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };
  
  return text.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
} 