import { createLogger } from '@xiaohongshu/logger';
import type { ProcessedParagraph, TitleOptions, CardData } from '@xiaohongshu/utils';

const logger = createLogger({ service: 'ai-service' });

class AIService {
  private checkApiKey() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('AI API密钥未配置');
    }
    return apiKey;
  }

  async analyzeContent(text: string): Promise<ProcessedParagraph[]> {
    logger.info('开始分析内容', { textLength: text.length });

    const prompt = `
请分析以下文本内容，将其分割成适合小红书的段落，并为每个段落提取关键信息：

文本内容：
${text}

请按以下JSON格式返回分析结果：
{
  "paragraphs": [
    {
      "id": "段落唯一ID",
      "content": "段落原文",
      "order": 段落序号,
      "type": "段落类型(text/heading/list/quote)",
      "keyPoints": ["关键点1", "关键点2"],
      "summary": "段落摘要(适合小红书的简短描述)",
      "emoji": "相关emoji",
      "tags": ["标签1", "标签2"],
      "stylePreset": {
        "id": "风格ID",
        "name": "风格名称",
        "backgroundColor": "#颜色代码",
        "textColor": "#颜色代码",
        "accentColor": "#颜色代码",
        "fontFamily": "字体",
        "fontSize": 16,
        "borderRadius": 12,
        "padding": 24,
        "template": "minimal"
      }
    }
  ]
}

要求：
1. 每个段落摘要要生动有趣，符合小红书风格
2. emoji要贴切，增加趣味性
3. 标签要热门且相关
4. 最多分割8个段落
`;

    try {
      this.checkApiKey();

      // 模拟AI分析结果 - 在第二阶段会实现真正的AI调用
      const mockResult = this.createMockAnalysis(text);
      logger.info('内容分析完成', { paragraphCount: mockResult.length });

      return mockResult;
    } catch (error) {
      logger.error('内容分析失败', { error });
      throw new Error('AI分析失败，请稍后重试');
    }
  }

  async generateTitles(text: string): Promise<TitleOptions> {
    logger.info('生成标题', { textLength: text.length });

    const prompt = `
请为以下内容生成3个吸引人的小红书标题：

内容：
${text}

请按以下JSON格式返回：
{
  "titles": ["标题1", "标题2", "标题3"],
  "selectedIndex": 0
}

要求：
1. 标题要吸引眼球，符合小红书风格
2. 可以使用emoji增加趣味性
3. 长度控制在25字以内
4. 要有号召性或悬念
`;

    try {
      this.checkApiKey();

      // 模拟标题生成 - 在第二阶段会实现真正的AI调用
      const mockTitles = this.createMockTitles(text);
      logger.info('标题生成完成', { titleCount: mockTitles.titles.length });

      return mockTitles;
    } catch (error) {
      logger.error('标题生成失败', { error });
      throw new Error('标题生成失败，请稍后重试');
    }
  }

  async generateCards(paragraphs: ProcessedParagraph[]): Promise<CardData[]> {
    logger.info('生成卡片数据', { paragraphCount: paragraphs.length });

    // 将段落数据转换为卡片数据
    const cards: CardData[] = paragraphs.map((paragraph, index) => ({
      id: paragraph.id,
      title: paragraph.summary,
      summary: paragraph.content.slice(0, 100) + '...',
      emoji: paragraph.emoji,
      tags: paragraph.tags,
      stylePreset: paragraph.stylePreset,
      order: index,
    }));

    logger.info('卡片数据生成完成', { cardCount: cards.length });
    return cards;
  }

  private createMockAnalysis(text: string): ProcessedParagraph[] {
    const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 0);

    return paragraphs.slice(0, 6).map((content, index) => ({
      id: `para-${index + 1}`,
      content: content.trim(),
      order: index,
      type: 'text' as const,
      keyPoints: ['重点1', '重点2'],
      summary: `精彩内容第${index + 1}部分 ✨`,
      emoji: ['📝', '💡', '🎯', '✨', '🌟', '💫'][index] || '📝',
      tags: ['小红书', '分享', '推荐'],
      stylePreset: {
        id: 'minimal-blue',
        name: '简约蓝',
        backgroundColor: '#F0F8FF',
        textColor: '#1F2937',
        accentColor: '#3B82F6',
        fontFamily: 'Inter, sans-serif',
        fontSize: 16,
        borderRadius: 12,
        padding: 24,
        template: 'minimal' as const,
      },
    }));
  }

  private createMockTitles(text: string): TitleOptions {
    const baseTitle = text.slice(0, 20).trim();

    return {
      titles: [
        `🔥 ${baseTitle}... 超详细攻略！`,
        `✨ 必看！${baseTitle}的完整指南`,
        `💯 ${baseTitle} | 收藏不亏的干货分享`,
      ],
      selectedIndex: 0,
    };
  }
}

export const aiService = new AIService();
