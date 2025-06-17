import { createLogger } from '@xiaohongshu/logger';
import type { CardData } from '@xiaohongshu/utils';

const logger = createLogger({ service: 'export-service' });

class ExportService {
  async toMarkdown(title: string, cards: CardData[]): Promise<string> {
    logger.info('导出为Markdown', { title, cardCount: cards.length });

    let markdown = `# ${title}\n\n`;

    cards.forEach((card, index) => {
      markdown += `## ${card.emoji} ${card.title}\n\n`;
      markdown += `${card.summary}\n\n`;

      if (card.tags && card.tags.length > 0) {
        markdown += `**标签**: ${card.tags.map((tag) => `#${tag}`).join(' ')}\n\n`;
      }

      if (index < cards.length - 1) {
        markdown += '---\n\n';
      }
    });

    logger.info('Markdown导出完成', { length: markdown.length });
    return markdown;
  }

  async toJSON(title: string, cards: CardData[], metadata?: any): Promise<string> {
    logger.info('导出为JSON', { title, cardCount: cards.length });

    const data = {
      title,
      cards,
      metadata: {
        ...metadata,
        exportTime: new Date().toISOString(),
        version: '1.0.0',
      },
    };

    const json = JSON.stringify(data, null, 2);
    logger.info('JSON导出完成', { length: json.length });

    return json;
  }
}

export const exportService = new ExportService();
