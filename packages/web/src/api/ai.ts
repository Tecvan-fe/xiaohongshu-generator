import { apiClient } from './client';
import type {
  AnalyzeContentRequest,
  AnalyzeContentResponse,
  GenerateTitlesRequest,
  GenerateTitlesResponse,
  GenerateCardsRequest,
  GenerateCardsResponse,
} from './types';

/**
 * 分析文本内容
 * 使用AI分析文本内容，生成小红书风格的段落和样式
 */
export const analyzeContent = async (
  request: AnalyzeContentRequest,
  signal?: AbortSignal
): Promise<AnalyzeContentResponse> => {
  return apiClient.post<AnalyzeContentResponse>('/ai/analyze', request, { signal });
};

/**
 * 生成标题
 * 根据文本内容生成小红书风格的标题选项
 */
export const generateTitles = async (
  request: GenerateTitlesRequest,
  signal?: AbortSignal
): Promise<GenerateTitlesResponse> => {
  return apiClient.post<GenerateTitlesResponse>('/ai/titles', request, { signal });
};

/**
 * 生成卡片数据
 * 将分析后的段落数据转换为卡片格式
 */
export const generateCards = async (
  request: GenerateCardsRequest,
  signal?: AbortSignal
): Promise<GenerateCardsResponse> => {
  return apiClient.post<GenerateCardsResponse>('/ai/cards', request, { signal });
};

/**
 * 完整的AI分析流程
 * 一次性完成文本分析、标题生成和卡片生成
 */
export const analyzeContentComplete = async (text: string, signal?: AbortSignal) => {
  const [analysisResponse, titlesResponse] = await Promise.all([
    analyzeContent({ text }, signal),
    generateTitles({ text }, signal),
  ]);

  if (!analysisResponse.success || !titlesResponse.success) {
    throw new Error('AI分析失败');
  }

  const cardsResponse = await generateCards({ paragraphs: analysisResponse.data! }, signal);

  return {
    analysis: analysisResponse.data!,
    titles: titlesResponse.data!,
    cards: cardsResponse.success ? cardsResponse.data! : [],
  };
};
