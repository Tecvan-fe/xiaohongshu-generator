// 支持的AI提供商
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  GEMINI: 'gemini',
  CLAUDE: 'claude',
} as const;

// 支持的模型
export const AI_MODELS = {
  OPENAI: {
    GPT4O: 'gpt-4o',
    GPT4_TURBO: 'gpt-4-turbo-preview',
    GPT35_TURBO: 'gpt-3.5-turbo',
  },
  GEMINI: {
    PRO: 'gemini-pro',
    PRO_VISION: 'gemini-pro-vision',
  },
  CLAUDE: {
    SONNET: 'claude-3-sonnet-20240229',
    OPUS: 'claude-3-opus-20240229',
    HAIKU: 'claude-3-haiku-20240307',
  },
} as const;

// 内容类型
export const CONTENT_TYPES = {
  ARTICLE: 'article',
  TRAVEL: 'travel', 
  FOOD: 'food',
  FASHION: 'fashion',
  LIFESTYLE: 'lifestyle',
  OTHER: 'other',
} as const;

// SVG卡片模板
export const CARD_TEMPLATES = {
  MINIMAL: 'minimal',
  COLORFUL: 'colorful',
  ELEGANT: 'elegant',
  PLAYFUL: 'playful',
} as const;

// 预设样式
export const STYLE_PRESETS = [
  {
    id: 'minimal-blue',
    name: '简约蓝',
    backgroundColor: '#F0F8FF',
    textColor: '#1F2937',
    accentColor: '#3B82F6',
    fontFamily: 'Inter, sans-serif',
    fontSize: 16,
    borderRadius: 12,
    padding: 24,
    template: 'minimal' as const,
  },
  {
    id: 'colorful-pink',
    name: '活力粉',
    backgroundColor: '#FDF2F8',
    textColor: '#BE185D',
    accentColor: '#EC4899',
    fontFamily: 'Inter, sans-serif',
    fontSize: 16,
    borderRadius: 16,
    padding: 20,
    template: 'colorful' as const,
  },
  {
    id: 'elegant-purple',
    name: '优雅紫',
    backgroundColor: '#F5F3FF',
    textColor: '#581C87',
    accentColor: '#8B5CF6',
    fontFamily: 'Georgia, serif',
    fontSize: 15,
    borderRadius: 8,
    padding: 28,
    template: 'elegant' as const,
  },
  {
    id: 'playful-orange',
    name: '俏皮橙',
    backgroundColor: '#FFF7ED',
    textColor: '#9A3412',
    accentColor: '#EA580C',
    fontFamily: 'Comic Sans MS, cursive',
    fontSize: 17,
    borderRadius: 20,
    padding: 16,
    template: 'playful' as const,
  },
];

// 默认配置
export const DEFAULT_CONFIG = {
  MAX_PARAGRAPHS: 8,
  MAX_TAGS_PER_PARAGRAPH: 5,
  MAX_TITLE_OPTIONS: 3,
  MIN_PARAGRAPH_LENGTH: 20,
  MAX_PARAGRAPH_LENGTH: 500,
  ESTIMATED_READING_SPEED: 200, // 每分钟字数
} as const;

// API端点
export const API_ENDPOINTS = {
  ANALYZE_CONTENT: '/api/analyze',
  GENERATE_TITLES: '/api/titles',
  GENERATE_CARDS: '/api/cards',
  EXPORT_CONTENT: '/api/export',
} as const;

// 文件类型
export const SUPPORTED_FILE_TYPES = {
  PDF: 'application/pdf',
  TXT: 'text/plain',
  MD: 'text/markdown',
} as const;

// 导出格式
export const EXPORT_FORMATS = {
  MARKDOWN: 'markdown',
  JSON: 'json',
  IMAGES: 'images',
} as const; 