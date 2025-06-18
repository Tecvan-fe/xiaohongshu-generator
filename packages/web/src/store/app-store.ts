import { create } from 'zustand';
import { createBrowserLogger } from '../lib/browser-logger';
import type { AppState, AnalyzeResponse, TitleResponse, CardResponse } from '../types';
import { analyzeContent, generateTitles, generateCards, parseText, parsePdf } from '../api';
import type { CardData, ProcessedParagraph, LanguageStyle } from '../api/types';

const logger = createBrowserLogger({ service: 'web-store' });

interface AppStore extends AppState {
  // 新增语言风格状态
  languageStyle: LanguageStyle;

  // Actions
  setInputText: (text: string) => void;
  setUploadedFile: (file: File | null) => void;
  setCurrentStep: (step: AppState['currentStep']) => void;
  setError: (error: string | null) => void;
  setLanguageStyle: (style: LanguageStyle) => void;

  // API calls
  analyzeContentFlow: () => Promise<void>;
  generateTitlesFlow: () => Promise<void>;
  generateCardsFlow: () => Promise<void>;

  // Cancel functionality
  cancelOperation: () => void;
  abortController: AbortController | null;

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

/**
 * 优化卡片数量，确保在3-6张之间
 */
const optimizeCardCount = (cards: CardData[], paragraphs: ProcessedParagraph[]): CardData[] => {
  const minCards = 3;
  const maxCards = 6;

  logger.info('开始优化卡片数量', {
    originalCount: cards.length,
    target: `${minCards}-${maxCards}`,
  });

  // 如果数量已经合适，直接返回
  if (cards.length >= minCards && cards.length <= maxCards) {
    return cards;
  }

  // 如果卡片太少，尝试分割长内容
  if (cards.length < minCards) {
    const expandedCards = expandCards(cards, paragraphs, minCards);
    logger.info('扩展卡片数量', { newCount: expandedCards.length });
    return expandedCards;
  }

  // 如果卡片太多，智能合并或筛选
  if (cards.length > maxCards) {
    const reducedCards = reduceCards(cards, maxCards);
    logger.info('减少卡片数量', { newCount: reducedCards.length });
    return reducedCards;
  }

  return cards;
};

/**
 * 扩展卡片数量 - 分割长内容
 */
const expandCards = (
  cards: CardData[],
  paragraphs: ProcessedParagraph[],
  targetMin: number
): CardData[] => {
  const expandedCards = [...cards];

  // 找到最长的卡片进行分割
  while (expandedCards.length < targetMin) {
    const longestCardIndex = expandedCards.reduce((maxIndex, card, index) => {
      return card.summary.length > expandedCards[maxIndex].summary.length ? index : maxIndex;
    }, 0);

    const longestCard = expandedCards[longestCardIndex];

    // 如果最长的卡片内容足够长，进行分割
    if (longestCard.summary.length > 100) {
      const splitCards = splitLongCard(longestCard, expandedCards.length);
      expandedCards.splice(longestCardIndex, 1, ...splitCards);
    } else {
      // 如果没有足够长的内容可以分割，从段落中创建新卡片
      const unusedParagraph = findUnusedParagraph(paragraphs, expandedCards);
      if (unusedParagraph) {
        const newCard = createCardFromParagraph(unusedParagraph, expandedCards.length);
        expandedCards.push(newCard);
      } else {
        // 如果无法继续扩展，跳出循环
        break;
      }
    }
  }

  return expandedCards;
};

/**
 * 分割长卡片
 */
const splitLongCard = (card: CardData, startIndex: number): CardData[] => {
  const sentences = card.summary.split(/[。！？.!?]+/).filter((s) => s.trim());

  if (sentences.length < 2) {
    return [card]; // 无法分割
  }

  const midPoint = Math.ceil(sentences.length / 2);
  const firstPart = sentences.slice(0, midPoint).join('。') + '。';
  const secondPart = sentences.slice(midPoint).join('。') + '。';

  return [
    {
      ...card,
      id: `${card.id}-1`,
      title: `${card.title} (上)`,
      summary: firstPart,
      order: startIndex,
    },
    {
      ...card,
      id: `${card.id}-2`,
      title: `${card.title} (下)`,
      summary: secondPart,
      order: startIndex + 1,
    },
  ];
};

/**
 * 找到未使用的段落
 */
const findUnusedParagraph = (
  paragraphs: ProcessedParagraph[],
  cards: CardData[]
): ProcessedParagraph | null => {
  const usedParagraphIds = new Set(cards.map((card) => card.id.split('-')[0]));
  return paragraphs.find((p) => !usedParagraphIds.has(p.id)) || null;
};

/**
 * 从段落创建卡片
 */
const createCardFromParagraph = (paragraph: ProcessedParagraph, order: number): CardData => {
  return {
    id: `${paragraph.id}-extra`,
    title: paragraph.keyPoints?.[0] || paragraph.summary.substring(0, 20) + '...',
    summary: paragraph.summary || paragraph.content.substring(0, 100) + '...',
    emoji: '📝',
    tags: paragraph.tags?.slice(0, 3) || [],
    stylePreset: {
      id: 'minimal',
      name: '简约',
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      accentColor: '#3b82f6',
      fontFamily: 'Inter, sans-serif',
      fontSize: 16,
      borderRadius: 12,
      padding: 24,
      template: 'minimal',
    },
    order,
  };
};

/**
 * 减少卡片数量 - 合并相似内容或选择最重要的
 */
const reduceCards = (cards: CardData[], targetMax: number): CardData[] => {
  // 按重要性排序（根据标签数量、内容长度等）
  const sortedCards = cards.sort((a, b) => {
    const scoreA = calculateCardImportance(a);
    const scoreB = calculateCardImportance(b);
    return scoreB - scoreA;
  });

  // 选择最重要的卡片
  const selectedCards = sortedCards.slice(0, targetMax);

  // 重新分配order
  return selectedCards.map((card, index) => ({
    ...card,
    order: index,
  }));
};

/**
 * 计算卡片重要性分数
 */
const calculateCardImportance = (card: CardData): number => {
  let score = 0;

  // 标签数量越多越重要
  score += card.tags.length * 10;

  // 内容长度适中的更重要
  const summaryLength = card.summary.length;
  if (summaryLength >= 50 && summaryLength <= 150) {
    score += 20;
  }

  // 有emoji的更重要
  if (card.emoji && card.emoji !== '📝') {
    score += 5;
  }

  // 标题长度适中的更重要
  if (card.title.length >= 5 && card.title.length <= 30) {
    score += 10;
  }

  return score;
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,
  abortController: null,
  languageStyle: 'xiaohongshu', // 默认为小红书风格

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

  setLanguageStyle: (style: LanguageStyle) => {
    set({ languageStyle: style });
    logger.info('语言风格已更改', { style });
  },

  // Cancel functionality
  cancelOperation: () => {
    const { abortController } = get();

    if (abortController) {
      abortController.abort();
      logger.info('用户取消了操作');
    }

    // 重置所有加载状态
    set({
      isAnalyzing: false,
      isGeneratingTitles: false,
      isGeneratingCards: false,
      currentStep: 'input',
      abortController: null,
      error: null,
    });
  },

  // API calls
  analyzeContentFlow: async () => {
    const { inputText, uploadedFile, languageStyle } = get();

    if (!inputText.trim() && !uploadedFile) {
      set({ error: '请输入文本内容或上传文件' });
      return;
    }

    // 创建新的AbortController
    const abortController = new AbortController();

    set({
      isAnalyzing: true,
      error: null,
      currentStep: 'analyzing',
      abortController,
    });

    try {
      logger.info('开始分析内容', {
        textLength: inputText.length,
        hasFile: !!uploadedFile,
        languageStyle,
      });

      let contentToAnalyze = inputText;

      // 检查是否被取消
      if (abortController.signal.aborted) {
        throw new Error('操作已取消');
      }

      // 如果有文件，先解析文件
      if (uploadedFile) {
        if (uploadedFile.type === 'application/pdf') {
          const parseResponse = await parsePdf({ file: uploadedFile });
          if (!parseResponse.success || !parseResponse.data) {
            throw new Error(parseResponse.error || 'PDF解析失败');
          }
          contentToAnalyze = parseResponse.data.originalText;
        } else if (uploadedFile.type === 'text/plain' || uploadedFile.type === 'text/markdown') {
          const text = await uploadedFile.text();
          const parseResponse = await parseText({ text });
          if (!parseResponse.success || !parseResponse.data) {
            throw new Error(parseResponse.error || '文本解析失败');
          }
          contentToAnalyze = parseResponse.data.originalText;
        }
      }

      // 再次检查是否被取消
      if (abortController.signal.aborted) {
        throw new Error('操作已取消');
      }

      // 分析内容 - 传递语言风格
      const analyzeResponse = await analyzeContent({
        text: contentToAnalyze,
        style: languageStyle,
      });

      if (!analyzeResponse.success || !analyzeResponse.data) {
        throw new Error(analyzeResponse.error || '内容分析失败');
      }

      // 检查是否被取消
      if (abortController.signal.aborted) {
        throw new Error('操作已取消');
      }

      set({
        paragraphs: analyzeResponse.data,
        currentStep: 'results',
        isAnalyzing: false,
      });

      // 自动生成标题和卡片
      await get().generateTitlesFlow();

      // 检查是否被取消
      if (abortController.signal.aborted) {
        throw new Error('操作已取消');
      }

      await get().generateCardsFlow();

      logger.info('内容分析完成', {
        paragraphCount: analyzeResponse.data.length,
        languageStyle,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '分析失败';

      // 如果是取消操作，不显示错误
      if (errorMessage !== '操作已取消') {
        set({
          error: errorMessage,
          isAnalyzing: false,
          currentStep: 'input',
          abortController: null,
        });
        logger.error('内容分析失败', { error: errorMessage });
      }
    }
  },

  generateTitlesFlow: async () => {
    const { inputText, abortController, languageStyle } = get();

    if (!inputText.trim()) {
      return;
    }

    // 检查是否被取消
    if (abortController?.signal.aborted) {
      throw new Error('操作已取消');
    }

    set({ isGeneratingTitles: true });

    try {
      const response = await generateTitles({
        text: inputText,
        style: languageStyle,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || '标题生成失败');
      }

      // 检查是否被取消
      if (abortController?.signal.aborted) {
        throw new Error('操作已取消');
      }

      set({
        titles: response.data,
        isGeneratingTitles: false,
      });

      logger.info('标题生成完成', {
        titleCount: response.data.titles.length,
        languageStyle,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '标题生成失败';

      if (errorMessage !== '操作已取消') {
        set({ isGeneratingTitles: false });
        logger.error('标题生成失败', { error: errorMessage });
      } else {
        throw error; // 重新抛出取消错误
      }
    }
  },

  generateCardsFlow: async () => {
    const { paragraphs, abortController } = get();

    if (paragraphs.length === 0) {
      return;
    }

    // 检查是否被取消
    if (abortController?.signal.aborted) {
      throw new Error('操作已取消');
    }

    set({ isGeneratingCards: true });

    try {
      const response = await generateCards({ paragraphs });

      if (!response.success || !response.data) {
        throw new Error(response.error || '卡片生成失败');
      }

      // 检查是否被取消
      if (abortController?.signal.aborted) {
        throw new Error('操作已取消');
      }

      // 优化卡片数量
      const optimizedCards = optimizeCardCount(response.data, paragraphs);

      set({
        cards: optimizedCards,
        isGeneratingCards: false,
        currentStep: 'preview',
        abortController: null, // 完成后清除AbortController
      });

      logger.info('卡片生成完成', {
        originalCount: response.data.length,
        optimizedCount: optimizedCards.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '卡片生成失败';

      if (errorMessage !== '操作已取消') {
        set({ isGeneratingCards: false });
        logger.error('卡片生成失败', { error: errorMessage });
      } else {
        throw error; // 重新抛出取消错误
      }
    }
  },

  reset: () => {
    const { abortController } = get();

    // 如果有正在进行的操作，先取消
    if (abortController) {
      abortController.abort();
    }

    set({ ...initialState, abortController: null });
    logger.info('应用状态已重置');
  },
}));
