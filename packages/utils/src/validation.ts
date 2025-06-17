import { DEFAULT_CONFIG } from './constants';

/**
 * 验证文本内容
 */
export function validateTextContent(text: string): { isValid: boolean; error?: string } {
  if (!text || typeof text !== 'string') {
    return { isValid: false, error: '文本内容不能为空' };
  }

  const trimmedText = text.trim();
  if (trimmedText.length === 0) {
    return { isValid: false, error: '文本内容不能为空' };
  }

  if (trimmedText.length < DEFAULT_CONFIG.MIN_PARAGRAPH_LENGTH) {
    return { isValid: false, error: `文本内容至少需要${DEFAULT_CONFIG.MIN_PARAGRAPH_LENGTH}个字符` };
  }

  if (trimmedText.length > DEFAULT_CONFIG.MAX_PARAGRAPH_LENGTH * DEFAULT_CONFIG.MAX_PARAGRAPHS) {
    return { isValid: false, error: `文本内容过长，请控制在${DEFAULT_CONFIG.MAX_PARAGRAPH_LENGTH * DEFAULT_CONFIG.MAX_PARAGRAPHS}个字符以内` };
  }

  return { isValid: true };
}

/**
 * 验证文件
 */
export function validateFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: '请选择文件' };
  }

  // 检查文件类型
  const supportedTypes = ['application/pdf', 'text/plain', 'text/markdown'];
  if (!supportedTypes.includes(file.type)) {
    return { isValid: false, error: '只支持PDF、TXT、MD格式的文件' };
  }

  // 检查文件大小（10MB限制）
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: '文件大小不能超过10MB' };
  }

  return { isValid: true };
}

/**
 * 验证API密钥格式
 */
export function validateApiKey(provider: string, apiKey: string): { isValid: boolean; error?: string } {
  if (!apiKey || typeof apiKey !== 'string') {
    return { isValid: false, error: 'API密钥不能为空' };
  }

  const trimmedKey = apiKey.trim();
  if (trimmedKey.length === 0) {
    return { isValid: false, error: 'API密钥不能为空' };
  }

  // 根据不同提供商验证格式
  switch (provider.toLowerCase()) {
    case 'openai':
      if (!trimmedKey.startsWith('sk-')) {
        return { isValid: false, error: 'OpenAI API密钥格式错误，应以sk-开头' };
      }
      if (trimmedKey.length < 20) {
        return { isValid: false, error: 'OpenAI API密钥长度不足' };
      }
      break;
    
    case 'gemini':
      if (trimmedKey.length < 20) {
        return { isValid: false, error: 'Gemini API密钥长度不足' };
      }
      break;
    
    case 'claude':
      if (!trimmedKey.startsWith('sk-ant-')) {
        return { isValid: false, error: 'Claude API密钥格式错误，应以sk-ant-开头' };
      }
      if (trimmedKey.length < 20) {
        return { isValid: false, error: 'Claude API密钥长度不足' };
      }
      break;
    
    default:
      return { isValid: false, error: '不支持的AI提供商' };
  }

  return { isValid: true };
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: '邮箱地址不能为空' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: '邮箱地址格式不正确' };
  }

  return { isValid: true };
}

/**
 * 验证URL格式
 */
export function validateUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL不能为空' };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'URL格式不正确' };
  }
}

/**
 * 验证端口号
 */
export function validatePort(port: number): { isValid: boolean; error?: string } {
  if (!Number.isInteger(port)) {
    return { isValid: false, error: '端口号必须是整数' };
  }

  if (port < 1 || port > 65535) {
    return { isValid: false, error: '端口号必须在1-65535之间' };
  }

  return { isValid: true };
}

/**
 * 验证环境变量
 */
export function validateEnvironment(env: Record<string, any>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 必需的环境变量
  const required = ['AI_PROVIDER'];
  for (const key of required) {
    if (!env[key]) {
      errors.push(`缺少必需的环境变量: ${key}`);
    }
  }

  // AI提供商特定验证
  if (env.AI_PROVIDER) {
    switch (env.AI_PROVIDER.toLowerCase()) {
      case 'openai':
        if (!env.OPENAI_API_KEY) {
          errors.push('使用OpenAI时需要设置OPENAI_API_KEY');
        }
        break;
      case 'gemini':
        if (!env.GEMINI_API_KEY) {
          errors.push('使用Gemini时需要设置GEMINI_API_KEY');
        }
        break;
      case 'claude':
        if (!env.CLAUDE_API_KEY) {
          errors.push('使用Claude时需要设置CLAUDE_API_KEY');
        }
        break;
      default:
        errors.push('不支持的AI_PROVIDER值');
    }
  }

  // 端口验证
  if (env.PORT) {
    const portNum = parseInt(env.PORT, 10);
    const portValidation = validatePort(portNum);
    if (!portValidation.isValid) {
      errors.push(`PORT ${portValidation.error}`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * 数据类型检查工具
 */
export const is = {
  string: (value: any): value is string => typeof value === 'string',
  number: (value: any): value is number => typeof value === 'number' && !isNaN(value),
  boolean: (value: any): value is boolean => typeof value === 'boolean',
  array: (value: any): value is any[] => Array.isArray(value),
  object: (value: any): value is object => typeof value === 'object' && value !== null && !Array.isArray(value),
  function: (value: any): value is Function => typeof value === 'function',
  undefined: (value: any): value is undefined => typeof value === 'undefined',
  null: (value: any): value is null => value === null,
  empty: (value: any): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },
}; 