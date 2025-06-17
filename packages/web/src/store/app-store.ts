import { create } from 'zustand';
import { createBrowserLogger } from '../lib/browser-logger';
import type { AppState, AnalyzeResponse, TitleResponse, CardResponse } from '../types';

const logger = createBrowserLogger({ service: 'web-store' });

interface AppStore extends AppState {
  // Actions
  setInputText: (text: string) => void;
  setUploadedFile: (file: File | null) => void;
  setCurrentStep: (step: AppState['currentStep']) => void;
  setError: (error: string | null) => void;

  // API calls
  analyzeContent: () => Promise<void>;
  generateTitles: () => Promise<void>;
  generateCards: () => Promise<void>;

  // Reset
  reset: () => void;
}

const initialState: AppState = {
  inputText: '',
  uploadedFile: null,
  paragraphs: [],
  titles: null,
  cards: [],
  isAnalyzing: false,
  isGeneratingTitles: false,
  isGeneratingCards: false,
  currentStep: 'input',
  error: null,
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  // Actions
  setInputText: (text: string) => {
    set({ inputText: text, error: null });
  },

  setUploadedFile: (file: File | null) => {
    set({ uploadedFile: file, error: null });
  },

  setCurrentStep: (step: AppState['currentStep']) => {
    set({ currentStep: step });
  },

  setError: (error: string | null) => {
    set({ error });
    if (error) {
      logger.error('应用错误', { error });
    }
  },

  // API calls
  analyzeContent: async () => {
    const { inputText, uploadedFile } = get();

    if (!inputText.trim() && !uploadedFile) {
      set({ error: '请输入文本内容或上传文件' });
      return;
    }

    set({
      isAnalyzing: true,
      error: null,
      currentStep: 'analyzing',
    });

    try {
      logger.info('开始分析内容', {
        textLength: inputText.length,
        hasFile: !!uploadedFile,
      });

      const formData = new FormData();
      if (inputText.trim()) {
        formData.append('text', inputText);
      }
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      }

      const response = await fetch('/api/content/analyze', {
        method: 'POST',
        body: formData,
      });

      const result: AnalyzeResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || '分析失败');
      }

      set({
        paragraphs: result.data.paragraphs,
        currentStep: 'results',
        isAnalyzing: false,
      });

      // 自动生成标题和卡片
      await get().generateTitles();
      await get().generateCards();

      logger.info('内容分析完成', {
        paragraphCount: result.data.paragraphs.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '分析失败';
      set({
        error: errorMessage,
        isAnalyzing: false,
        currentStep: 'input',
      });
      logger.error('内容分析失败', { error: errorMessage });
    }
  },

  generateTitles: async () => {
    const { inputText } = get();

    if (!inputText.trim()) {
      return;
    }

    set({ isGeneratingTitles: true });

    try {
      const response = await fetch('/api/ai/titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      const result: TitleResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || '标题生成失败');
      }

      set({
        titles: result.data,
        isGeneratingTitles: false,
      });

      logger.info('标题生成完成', {
        titleCount: result.data.titles.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '标题生成失败';
      set({ isGeneratingTitles: false });
      logger.error('标题生成失败', { error: errorMessage });
    }
  },

  generateCards: async () => {
    const { paragraphs } = get();

    if (paragraphs.length === 0) {
      return;
    }

    set({ isGeneratingCards: true });

    try {
      const response = await fetch('/api/ai/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paragraphs }),
      });

      const result: CardResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || '卡片生成失败');
      }

      set({
        cards: result.data,
        isGeneratingCards: false,
        currentStep: 'preview',
      });

      logger.info('卡片生成完成', {
        cardCount: result.data.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '卡片生成失败';
      set({ isGeneratingCards: false });
      logger.error('卡片生成失败', { error: errorMessage });
    }
  },

  reset: () => {
    set(initialState);
    logger.info('应用状态已重置');
  },
}));
