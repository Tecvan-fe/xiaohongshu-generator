import { apiClient } from './client';
import type {
  ParseTextRequest,
  ParseTextResponse,
  ParsePdfRequest,
  ParsePdfResponse,
} from './types';

/**
 * 解析文本内容
 * 解析纯文本内容，提取段落结构和元数据
 */
export const parseText = async (
  request: ParseTextRequest,
  signal?: AbortSignal
): Promise<ParseTextResponse> => {
  return apiClient.post<ParseTextResponse>('/content/parse-text', request, { signal });
};

/**
 * 解析PDF文件
 * 解析PDF文件，提取文本内容并分析结构
 */
export const parsePdf = async (
  request: ParsePdfRequest,
  signal?: AbortSignal
): Promise<ParsePdfResponse> => {
  return apiClient.upload<ParsePdfResponse>('/content/parse-pdf', request.file, { signal });
};

/**
 * 解析文件（自动判断类型）
 * 根据文件类型自动选择解析方法
 */
export const parseFile = async (file: File, signal?: AbortSignal): Promise<ParsePdfResponse> => {
  if (file.type === 'application/pdf') {
    return parsePdf({ file }, signal);
  }

  if (file.type === 'text/plain' || file.type === 'text/markdown') {
    const text = await file.text();
    return parseText({ text }, signal);
  }

  throw new Error(`不支持的文件类型: ${file.type}`);
};
