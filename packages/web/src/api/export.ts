/**
 * 图片导出功能模块
 *
 * 支持的功能：
 * - 导出Markdown格式文档
 * - 导出JSON格式数据
 * - 生成小红书风格图片卡片
 *
 * 图片规格：
 * - 尺寸：960 × 1280 像素
 * - 比例：3:4 (适合移动端显示)
 * - 格式：PNG
 *
 * 导出方式：
 * - 单张图片：PNG格式
 * - 批量图片：ZIP打包
 */

import { apiClient } from './client';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import type {
  ExportMarkdownRequest,
  ExportMarkdownResponse,
  ExportJsonRequest,
  ExportJsonResponse,
  CardData,
} from './types';

/**
 * 导出为Markdown格式
 * 将卡片数据导出为Markdown格式的文档
 */
export const exportMarkdown = async (
  request: ExportMarkdownRequest
): Promise<ExportMarkdownResponse> => {
  return apiClient.post<ExportMarkdownResponse>('/export/markdown', request);
};

/**
 * 导出为JSON格式
 * 将卡片数据导出为JSON格式的文档
 */
export const exportJson = async (request: ExportJsonRequest): Promise<ExportJsonResponse> => {
  return apiClient.post<ExportJsonResponse>('/export/json', request);
};

/**
 * 下载文件
 * 根据导出结果下载文件到本地
 */
export const downloadFile = (
  content: string,
  filename: string,
  mimeType: string = 'text/plain'
): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 清理URL对象
  URL.revokeObjectURL(url);
};

/**
 * 下载Blob文件
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 清理URL对象
  URL.revokeObjectURL(url);
};

/**
 * 创建SVG卡片图片
 */
export const createCardSVG = (card: CardData, index: number): string => {
  const { title, summary, emoji, tags, stylePreset } = card;
  const { backgroundColor, textColor, accentColor, fontFamily, fontSize, borderRadius } =
    stylePreset;

  // 确保字体是Web安全字体
  const safeFontFamily = fontFamily.includes('sans-serif')
    ? fontFamily
    : `${fontFamily}, sans-serif`;

  // 处理特殊字符
  const safeTitle = title.replace(/[<>&"']/g, (char) => {
    const entities: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[char] || char;
  });

  const safeSummary = summary.replace(/[<>&"']/g, (char) => {
    const entities: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[char] || char;
  });

  // 小红书推荐尺寸 960 × 1280
  const width = 960;
  const height = 1280;

  // 创建SVG字符串
  const svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gradient-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${backgroundColor}" />
        <stop offset="100%" stop-color="${accentColor}" stop-opacity="0.1" />
      </linearGradient>
      <style type="text/css">
        <![CDATA[
          .title { 
            font-family: ${safeFontFamily}; 
            font-size: ${Math.round(fontSize * 3.5)}px; 
            font-weight: bold; 
            fill: ${textColor}; 
          }
          .summary { 
            font-family: ${safeFontFamily}; 
            font-size: ${Math.round(fontSize * 2.2)}px; 
            fill: ${textColor}; 
            opacity: 0.85; 
          }
          .tag { 
            font-family: ${safeFontFamily}; 
            font-size: ${Math.round(fontSize * 1.8)}px; 
            fill: ${accentColor}; 
            font-weight: 500; 
          }
          .emoji { 
            font-size: ${Math.round(fontSize * 5)}px; 
            fill: ${textColor}; 
          }
        ]]>
      </style>
    </defs>

    <!-- 背景 -->
    <rect width="${width}" height="${height}" fill="url(#gradient-${index})" rx="${borderRadius * 3}" />

    <!-- 装饰圆点 -->
    <circle cx="${width - 120}" cy="150" r="50" fill="${accentColor}" opacity="0.15" />
    <circle cx="120" cy="${height - 250}" r="35" fill="${accentColor}" opacity="0.2" />
    <circle cx="${width - 150}" cy="${height - 150}" r="25" fill="${accentColor}" opacity="0.1" />

    <!-- Emoji -->
    <text x="100" y="250" class="emoji">${emoji}</text>

    <!-- 标题 -->
    <text x="100" y="380" class="title">
      ${safeTitle.length > 20 ? safeTitle.substring(0, 20) + '...' : safeTitle}
    </text>

    <!-- 内容摘要 -->
    <foreignObject x="100" y="420" width="${width - 200}" height="500">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: ${safeFontFamily}; font-size: ${Math.round(fontSize * 2.2)}px; color: ${textColor}; line-height: 1.6; opacity: 0.85; word-wrap: break-word; padding: 20px 0;">
        ${safeSummary.length > 120 ? safeSummary.substring(0, 120) + '...' : safeSummary}
      </div>
    </foreignObject>

    <!-- 标签区域 -->
    <g transform="translate(100, ${height - 200})">
      ${tags
        .slice(0, 4)
        .map((tag, tagIndex) => {
          const safeTag = tag.replace(/[<>&"']/g, (char) => {
            const entities: { [key: string]: string } = {
              '<': '&lt;',
              '>': '&gt;',
              '&': '&amp;',
              '"': '&quot;',
              "'": '&#39;',
            };
            return entities[char] || char;
          });
          const tagWidth = Math.min(safeTag.length * 20 + 40, 200);
          const x = (tagIndex % 2) * 250;
          const y = Math.floor(tagIndex / 2) * 80;
          return `
          <rect x="${x}" y="${y}" width="${tagWidth}" height="50" fill="${accentColor}" opacity="0.2" rx="25" />
          <text x="${x + 20}" y="${y + 35}" class="tag">#${safeTag.length > 10 ? safeTag.substring(0, 10) : safeTag}</text>
        `;
        })
        .join('')}
    </g>
  </svg>`;

  return svgContent.trim();
};

/**
 * SVG转换为图片
 */
export const svgToImage = async (
  svgContent: string,
  width: number = 960,
  height: number = 1280
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('无法创建canvas上下文'));
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const img = new Image();

    // 设置CORS属性以避免污染Canvas
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('无法生成图片'));
            }
          },
          'image/png',
          1.0
        );
      } catch (error) {
        reject(new Error('Canvas渲染失败: ' + (error as Error).message));
      }
    };

    img.onerror = () => reject(new Error('SVG加载失败'));

    // 使用data URI而不是ObjectURL以避免跨域问题
    const svgDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
    img.src = svgDataUri;
  });
};

/**
 * Canvas圆角矩形polyfill
 */
const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  if (typeof (ctx as any).roundRect === 'function') {
    // 如果浏览器支持roundRect，直接使用
    (ctx as any).roundRect(x, y, width, height, radius);
  } else {
    // 手动绘制圆角矩形
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
};

/**
 * 直接在Canvas上绘制卡片（后备方案）
 */
export const drawCardOnCanvas = (
  card: CardData,
  index: number,
  canvas: HTMLCanvasElement
): void => {
  const { title, summary, emoji, tags, stylePreset } = card;
  const { backgroundColor, textColor, accentColor, fontFamily, fontSize } = stylePreset;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 960;
  const height = 1280;

  // 清除画布
  ctx.clearRect(0, 0, width, height);

  // 绘制背景
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, backgroundColor);
  gradient.addColorStop(1, accentColor + '1A'); // 添加透明度
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 绘制装饰圆点
  ctx.fillStyle = accentColor + '26'; // 15% 透明度
  ctx.beginPath();
  ctx.arc(width - 120, 150, 50, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = accentColor + '33'; // 20% 透明度
  ctx.beginPath();
  ctx.arc(120, height - 250, 35, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = accentColor + '1A'; // 10% 透明度
  ctx.beginPath();
  ctx.arc(width - 150, height - 150, 25, 0, 2 * Math.PI);
  ctx.fill();

  // 绘制emoji
  ctx.font = `${Math.round(fontSize * 5)}px Arial, sans-serif`;
  ctx.fillStyle = textColor;
  ctx.fillText(emoji, 100, 250);

  // 绘制标题
  ctx.font = `bold ${Math.round(fontSize * 3.5)}px ${fontFamily}, sans-serif`;
  ctx.fillStyle = textColor;
  const displayTitle = title.length > 20 ? title.substring(0, 20) + '...' : title;
  ctx.fillText(displayTitle, 100, 380);

  // 绘制摘要
  ctx.font = `${Math.round(fontSize * 2.2)}px ${fontFamily}, sans-serif`;
  ctx.fillStyle = textColor + 'D9'; // 85% 透明度
  const displaySummary = summary.length > 120 ? summary.substring(0, 120) + '...' : summary;

  // 分行显示摘要
  const words = displaySummary.split(' ');
  let line = '';
  let y = 470;
  const lineHeight = Math.round(fontSize * 2.2 * 1.6);
  const maxWidth = width - 200;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, 100, y);
      line = words[n] + ' ';
      y += lineHeight;
      if (y > height - 400) break; // 限制高度
    } else {
      line = testLine;
    }
  }
  if (line.trim() && y <= height - 400) {
    ctx.fillText(line, 100, y);
  }

  // 绘制标签
  ctx.font = `${Math.round(fontSize * 1.8)}px ${fontFamily}, sans-serif`;
  const tagY = height - 200;

  tags.slice(0, 4).forEach((tag, tagIndex) => {
    const tagWidth = Math.min(tag.length * 20 + 40, 200);
    const x = 100 + (tagIndex % 2) * 250;
    const y = tagY + Math.floor(tagIndex / 2) * 80;

    // 绘制标签背景
    ctx.fillStyle = accentColor + '33'; // 20% 透明度
    drawRoundRect(ctx, x, y, tagWidth, 50, 25);
    ctx.fill();

    // 绘制标签文字
    ctx.fillStyle = accentColor;
    const displayTag = tag.length > 10 ? tag.substring(0, 10) : tag;
    ctx.fillText(`#${displayTag}`, x + 20, y + 35);
  });
};

/**
 * Canvas导出为图片（后备方案）
 */
export const canvasToImage = async (card: CardData, index: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 1280;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('无法创建canvas上下文'));
      return;
    }

    try {
      drawCardOnCanvas(card, index, canvas);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('无法生成图片'));
          }
        },
        'image/png',
        1.0
      );
    } catch (error) {
      reject(new Error('Canvas绘制失败: ' + (error as Error).message));
    }
  });
};

/**
 * 导出单张卡片为图片（带后备方案）
 */
export const exportCardAsImage = async (card: CardData, index: number): Promise<Blob> => {
  try {
    // 首先尝试SVG方式
    const svgContent = createCardSVG(card, index);
    return await svgToImage(svgContent);
  } catch (error) {
    console.warn('SVG导出失败，使用Canvas后备方案:', error);
    // 使用Canvas后备方案
    return await canvasToImage(card, index);
  }
};

/**
 * 导出所有卡片为ZIP文件
 */
export const exportCardsAsZip = async (cards: CardData[], title: string): Promise<Blob> => {
  const zip = new JSZip();
  const imageFolder = zip.folder('xiaohongshu-cards');

  if (!imageFolder) {
    throw new Error('无法创建ZIP文件夹');
  }

  // 生成所有卡片图片
  const imagePromises = cards.map(async (card, index) => {
    const imageBlob = await exportCardAsImage(card, index);
    const fileName = `card-${index + 1}-${card.title.replace(/[^\w\s-]/g, '').substring(0, 20)}.png`;
    imageFolder.file(fileName, imageBlob);
    return fileName;
  });

  await Promise.all(imagePromises);

  // 添加元数据文件
  const metadata = {
    title,
    exportTime: new Date().toISOString(),
    totalCards: cards.length,
    cards: cards.map((card, index) => ({
      index: index + 1,
      title: card.title,
      summary: card.summary,
      tags: card.tags,
      emoji: card.emoji,
    })),
  };

  imageFolder.file('metadata.json', JSON.stringify(metadata, null, 2));

  // 生成ZIP文件
  return zip.generateAsync({ type: 'blob' });
};

/**
 * 导出并下载Markdown文件
 */
export const downloadMarkdown = async (request: ExportMarkdownRequest): Promise<void> => {
  const response = await exportMarkdown(request);
  if (response.success && response.data) {
    downloadFile(response.data.content, response.data.filename, 'text/markdown');
  }
};

/**
 * 导出并下载JSON文件
 */
export const downloadJson = async (request: ExportJsonRequest): Promise<void> => {
  const response = await exportJson(request);
  if (response.success && response.data) {
    downloadFile(response.data.content, response.data.filename, 'application/json');
  }
};

/**
 * 导出并下载单张卡片图片
 */
export const downloadCardImage = async (card: CardData, index: number): Promise<void> => {
  const imageBlob = await exportCardAsImage(card, index);
  const fileName = `xiaohongshu-card-${index + 1}.png`;
  downloadBlob(imageBlob, fileName);
};

/**
 * 导出并下载所有卡片图片（ZIP格式）
 */
export const downloadCardsAsImages = async (cards: CardData[], title: string): Promise<void> => {
  const zipBlob = await exportCardsAsZip(cards, title);
  const fileName = `xiaohongshu-cards-${title.replace(/[^\w\s-]/g, '').substring(0, 20)}.zip`;
  downloadBlob(zipBlob, fileName);
};
