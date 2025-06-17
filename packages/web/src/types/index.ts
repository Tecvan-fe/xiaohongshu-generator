// 基础类型定义
export interface ProcessedParagraph {
  id: string;
  content: string;
  summary: string;
  keywords: string[];
  order: number;
}

export interface TitleOptions {
  titles: string[];
  selectedIndex?: number;
}

export interface StylePreset {
  name: string;
  template: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  borderRadius: number;
  padding: number;
}

export interface CardData {
  id: string;
  title: string;
  summary: string;
  emoji: string;
  tags: string[];
  stylePreset: StylePreset;
  paragraphId: string;
}

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

// API响应类型
export interface AnalyzeResponse {
  success: boolean;
  data?: {
    paragraphs: ProcessedParagraph[];
  };
  error?: string;
}

export interface TitleResponse {
  success: boolean;
  data?: TitleOptions;
  error?: string;
}

export interface CardResponse {
  success: boolean;
  data?: CardData[];
  error?: string;
}
