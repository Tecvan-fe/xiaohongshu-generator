// 内容相关类型
export interface ParsedContent {
  originalText: string;
  paragraphs: Paragraph[];
  metadata: ContentMetadata;
}

export interface Paragraph {
  id: string;
  content: string;
  order: number;
  type: 'text' | 'heading' | 'list' | 'quote';
}

export interface ContentMetadata {
  wordCount: number;
  paragraphCount: number;
  estimatedReadTime: number;
  language: 'zh' | 'en' | 'auto';
  contentType: 'article' | 'travel' | 'food' | 'fashion' | 'lifestyle' | 'other';
}

// AI分析结果类型
export interface ProcessedParagraph extends Paragraph {
  keyPoints: string[];
  summary: string;
  emoji: string;
  tags: string[];
  stylePreset: StylePreset;
}

export interface KeyPoint {
  text: string;
  importance: 'high' | 'medium' | 'low';
  category: 'fact' | 'opinion' | 'action' | 'emotion';
}

export interface TitleOptions {
  titles: string[];
  selectedIndex: number;
}

// SVG卡片相关类型
export interface CardData {
  id: string;
  title: string;
  summary: string;
  emoji: string;
  tags: string[];
  stylePreset: StylePreset;
  order: number;
}

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

// 应用状态类型
export interface AppState {
  input: {
    originalText: string;
    uploadedFile: File | null;
    isProcessing: boolean;
  };
  analysis: {
    paragraphs: ProcessedParagraph[];
    titleOptions: TitleOptions;
    globalTags: string[];
  };
  preview: {
    selectedTitle: string;
    cards: CardData[];
    viewMode: 'mobile' | 'desktop';
  };
  export: {
    format: 'markdown' | 'json' | 'images';
    isExporting: boolean;
  };
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// 支持的AI提供商
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  GEMINI: 'gemini',
  CLAUDE: 'claude',
} as const;

// 支持的文件类型
export const SUPPORTED_FILE_TYPES = {
  PDF: 'application/pdf',
  TEXT: 'text/plain',
  MARKDOWN: 'text/markdown',
} as const;

// SVG卡片模板
export const CARD_TEMPLATES = {
  MINIMAL: 'minimal',
  COLORFUL: 'colorful',
  ELEGANT: 'elegant',
  PLAYFUL: 'playful',
} as const;

// 语言风格类型
export const LANGUAGE_STYLES = {
  MINIMAL: 'minimal',
  SCIENTIFIC: 'scientific',
  XIAOHONGSHU: 'xiaohongshu',
  PROFESSIONAL: 'professional',
  CASUAL: 'casual',
  LITERARY: 'literary',
} as const;

export type LanguageStyle = (typeof LANGUAGE_STYLES)[keyof typeof LANGUAGE_STYLES];
