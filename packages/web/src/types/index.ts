// 导入API类型定义以保持一致性
import type {
  ProcessedParagraph as ApiProcessedParagraph,
  TitleOptions as ApiTitleOptions,
  StylePreset as ApiStylePreset,
  CardData as ApiCardData,
  ApiResponse,
} from '../api/types';

// 使用API类型作为基础类型
export type ProcessedParagraph = ApiProcessedParagraph;
export type TitleOptions = ApiTitleOptions;
export type StylePreset = ApiStylePreset;
export type CardData = ApiCardData;

// 应用状态类型
export interface AppState {
  // 输入内容
  inputText: string;
  uploadedFile: File | null;

  // 分析结果
  paragraphs: ProcessedParagraph[];
  titles: TitleOptions | null;
  cards: CardData[];

  // UI状态
  isAnalyzing: boolean;
  isGeneratingTitles: boolean;
  isGeneratingCards: boolean;
  currentStep: 'input' | 'analyzing' | 'results' | 'preview';

  // 错误状态
  error: string | null;
}

// 组件props类型
export interface InputSectionProps {
  inputText: string;
  onTextChange: (text: string) => void;
  onFileUpload: (file: File) => void;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

export interface ResultsSectionProps {
  paragraphs: ProcessedParagraph[];
  titles: TitleOptions | null;
  cards: CardData[];
  isLoading: boolean;
}

export interface CardPreviewProps {
  card: CardData;
  index: number;
}

export interface PreviewSectionProps {
  cards: CardData[];
  selectedTitle: string;
  onExport: (format: 'markdown' | 'json' | 'images') => void;
}

// API响应类型（使用通用的ApiResponse类型）
export type AnalyzeResponse = ApiResponse<ProcessedParagraph[]>;
export type TitleResponse = ApiResponse<TitleOptions>;
export type CardResponse = ApiResponse<CardData[]>;
