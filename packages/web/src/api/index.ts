// ==================== API函数导出 ====================

// HTTP客户端函数
export {
  get,
  post,
  put,
  del as delete,
  upload,
  getInstance,
  createApiClient,
  apiClient,
} from './client';

// 内容处理函数
export { parseText, parsePdf, parseFile } from './content';

// AI分析函数
export { analyzeContent, generateTitles, generateCards, analyzeContentComplete } from './ai';

// 导出功能函数
export {
  exportMarkdown,
  exportJson,
  downloadFile,
  downloadMarkdown,
  downloadJson,
  exportCardAsImage,
  downloadCardImage,
  downloadCardsAsImages,
  createCardSVG,
  svgToImage,
} from './export';

// 基础信息函数
export { getApiInfo, checkHealth, isServiceAvailable } from './base';

// ==================== 类型定义导出 ====================

// 通用类型
export type { ApiResponse, ApiError } from './types';

// 内容处理模块类型
export type {
  ParseTextRequest,
  ParseTextResponse,
  ParsePdfRequest,
  ParsePdfResponse,
  Paragraph,
  ContentMetadata,
  ParsedContent,
} from './types';

// AI分析模块类型
export type {
  AnalyzeContentRequest,
  AnalyzeContentResponse,
  GenerateTitlesRequest,
  GenerateTitlesResponse,
  GenerateCardsRequest,
  GenerateCardsResponse,
  StylePreset,
  ProcessedParagraph,
  TitleOptions,
  CardData,
} from './types';

// 导出模块类型
export type {
  ExportMarkdownRequest,
  ExportMarkdownResponse,
  ExportJsonRequest,
  ExportJsonResponse,
  ExportResult,
} from './types';

// 基础信息模块类型
export type { ApiInfo, ApiInfoResponse, HealthStatus, HealthResponse } from './types';

// ==================== 导入依赖 ====================

import * as baseApi from './base';
import * as contentApi from './content';
import * as aiApi from './ai';
import * as exportApi from './export';
import type { ApiResponse, CardData } from './types';

// ==================== 统一API服务对象 ====================

/**
 * 统一的API服务对象
 * 包含所有模块的API调用方法
 */
export const api = {
  // 基础信息
  base: baseApi,

  // 内容处理
  content: contentApi,

  // AI分析
  ai: aiApi,

  // 导出功能
  export: exportApi,
} as const;

// ==================== 工具函数 ====================

/**
 * 检查API响应是否成功
 */
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { data: T } {
  return response.success && response.data !== undefined;
}

/**
 * 提取API响应数据
 * 如果响应成功则返回数据，否则抛出错误
 */
export function extractApiData<T>(response: ApiResponse<T>): T {
  if (isApiSuccess(response)) {
    return response.data;
  }
  throw new Error(response.error || 'API调用失败');
}

/**
 * 安全地提取API响应数据
 * 如果响应成功则返回数据，否则返回null
 */
export function safeExtractApiData<T>(response: ApiResponse<T>): T | null {
  try {
    return extractApiData(response);
  } catch {
    return null;
  }
}

// ==================== 常用操作的快捷方法 ====================

/**
 * 完整的内容处理工作流
 */
export const workflows = {
  /**
   * 处理文本内容的完整流程
   * 1. 解析文本 -> 2. AI分析 -> 3. 生成标题
   */
  async processText(text: string) {
    // 1. 解析文本
    const parseResponse = await api.content.parseText({ text });
    if (!isApiSuccess(parseResponse)) {
      throw new Error(parseResponse.error || '文本解析失败');
    }

    // 2. AI分析
    const analyzeResponse = await api.ai.analyzeContent({ text });
    if (!isApiSuccess(analyzeResponse)) {
      throw new Error(analyzeResponse.error || 'AI分析失败');
    }

    // 3. 生成标题
    const titlesResponse = await api.ai.generateTitles({ text });
    if (!isApiSuccess(titlesResponse)) {
      throw new Error(titlesResponse.error || '标题生成失败');
    }

    return {
      parsed: parseResponse.data,
      analyzed: analyzeResponse.data,
      titles: titlesResponse.data,
    };
  },

  /**
   * 处理PDF文件的完整流程
   */
  async processPdf(file: File) {
    // 1. 解析PDF
    const parseResponse = await api.content.parsePdf({ file });
    if (!isApiSuccess(parseResponse)) {
      throw new Error(parseResponse.error || 'PDF解析失败');
    }

    // 2. 继续使用文本处理流程
    return this.processText(parseResponse.data.originalText);
  },

  /**
   * 生成并下载导出文件
   */
  async exportAndDownload(
    title: string,
    cards: CardData[],
    format: 'markdown' | 'json' = 'markdown',
    metadata?: any
  ) {
    if (format === 'markdown') {
      await api.export.downloadMarkdown({ title, cards });
    } else {
      await api.export.downloadJson({ title, cards, metadata });
    }
  },
};
