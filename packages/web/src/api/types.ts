// ==================== 通用类型定义 ====================

/**
 * API响应基础结构
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * API错误类型
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// ==================== 内容处理模块类型 ====================

/**
 * 文本解析请求参数
 */
export interface ParseTextRequest {
  text: string;
}

/**
 * PDF解析请求参数（FormData）
 */
export interface ParsePdfRequest {
  file: File;
}

/**
 * 段落数据结构
 */
export interface Paragraph {
  id: string;
  content: string;
  order: number;
  type: 'text' | 'heading' | 'list' | 'quote';
}

/**
 * 内容元数据
 */
export interface ContentMetadata {
  wordCount: number;
  paragraphCount: number;
  estimatedReadTime: number;
  language: 'zh' | 'en' | 'auto';
  contentType: 'article' | 'travel' | 'food' | 'fashion' | 'lifestyle' | 'other';
}

/**
 * 解析内容响应数据
 */
export interface ParsedContent {
  originalText: string;
  paragraphs: Paragraph[];
  metadata: ContentMetadata;
}

// ==================== AI分析模块类型 ====================

/**
 * 语言风格类型
 */
export type LanguageStyle =
  | 'minimal'
  | 'scientific'
  | 'xiaohongshu'
  | 'professional'
  | 'casual'
  | 'literary';

/**
 * AI分析请求参数
 */
export interface AnalyzeContentRequest {
  text: string;
  style?: LanguageStyle;
}

/**
 * 生成标题请求参数
 */
export interface GenerateTitlesRequest {
  text: string;
  style?: LanguageStyle;
}

/**
 * 生成卡片请求参数
 */
export interface GenerateCardsRequest {
  paragraphs: ProcessedParagraph[];
}

/**
 * 样式预设
 */
export interface StylePreset {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  borderRadius: number;
  padding: number;
  template: 'minimal' | 'colorful' | 'elegant' | 'playful';
}

/**
 * 处理后的段落数据
 */
export interface ProcessedParagraph extends Paragraph {
  keyPoints: string[];
  summary: string;
  emoji: string;
  tags: string[];
  stylePreset: StylePreset;
}

/**
 * 标题选项
 */
export interface TitleOptions {
  titles: string[];
  selectedIndex: number;
}

/**
 * 卡片数据
 */
export interface CardData {
  id: string;
  title: string;
  summary: string;
  emoji: string;
  tags: string[];
  stylePreset: StylePreset;
  order: number;
}

// ==================== 导出模块类型 ====================

/**
 * 导出Markdown请求参数
 */
export interface ExportMarkdownRequest {
  title: string;
  cards: CardData[];
}

/**
 * 导出JSON请求参数
 */
export interface ExportJsonRequest {
  title: string;
  cards: CardData[];
  metadata?: {
    createdAt?: string;
    author?: string;
    version?: string;
    [key: string]: any;
  };
}

/**
 * 导出响应数据
 */
export interface ExportResult {
  content: string;
  filename: string;
}

// ==================== 基础信息模块类型 ====================

/**
 * API信息响应
 */
export interface ApiInfo {
  success: boolean;
  message: string;
  version: string;
  endpoints: {
    content: string;
    ai: string;
    export: string;
  };
}

/**
 * 健康检查响应
 */
export interface HealthStatus {
  status: string;
  timestamp: string;
}

// ==================== API响应类型汇总 ====================

/**
 * 内容处理API响应类型
 */
export type ParseTextResponse = ApiResponse<ParsedContent>;
export type ParsePdfResponse = ApiResponse<ParsedContent>;

/**
 * AI分析API响应类型
 */
export type AnalyzeContentResponse = ApiResponse<ProcessedParagraph[]>;
export type GenerateTitlesResponse = ApiResponse<TitleOptions>;
export type GenerateCardsResponse = ApiResponse<CardData[]>;

/**
 * 导出API响应类型
 */
export type ExportMarkdownResponse = ApiResponse<ExportResult>;
export type ExportJsonResponse = ApiResponse<ExportResult>;

/**
 * 基础信息API响应类型
 */
export type ApiInfoResponse = ApiInfo;
export type HealthResponse = HealthStatus;
