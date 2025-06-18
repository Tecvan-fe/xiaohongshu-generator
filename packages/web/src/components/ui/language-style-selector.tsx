import React from 'react';
import { Badge } from './badge';
import { Card, CardContent } from './card';
import type { LanguageStyle } from '../../api/types';

interface LanguageStyleOption {
  id: LanguageStyle;
  name: string;
  description: string;
  emoji: string;
  examples: string[];
}

const LANGUAGE_STYLE_OPTIONS: LanguageStyleOption[] = [
  {
    id: 'xiaohongshu',
    name: '小红书风格',
    description: '活泼亲切，适合种草分享',
    emoji: '🌸',
    examples: ['姐妹们必看！', '宝子们冲！', '真的绝绝子'],
  },
  {
    id: 'minimal',
    name: '简约风格',
    description: '简洁明了，突出重点',
    emoji: '✨',
    examples: ['重点总结', '简单易懂', '一目了然'],
  },
  {
    id: 'scientific',
    name: '严谨科学',
    description: '逻辑清晰，数据支撑',
    emoji: '🔬',
    examples: ['研究表明', '数据显示', '科学分析'],
  },
  {
    id: 'professional',
    name: '商务专业',
    description: '正式严谨，适合职场',
    emoji: '💼',
    examples: ['专业分析', '深度解读', '战略思考'],
  },
  {
    id: 'casual',
    name: '轻松日常',
    description: '自然随性，贴近生活',
    emoji: '☕',
    examples: ['分享一下', '简单聊聊', '随便说说'],
  },
  {
    id: 'literary',
    name: '文艺优雅',
    description: '优美文雅，富有诗意',
    emoji: '📚',
    examples: ['细品慢读', '如诗如画', '意境深远'],
  },
];

interface LanguageStyleSelectorProps {
  selectedStyle: LanguageStyle;
  onStyleChange: (style: LanguageStyle) => void;
  className?: string;
}

export const LanguageStyleSelector: React.FC<LanguageStyleSelectorProps> = ({
  selectedStyle,
  onStyleChange,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-gray-700">语言风格</h3>
        <Badge variant="secondary" className="text-xs">
          选择内容创作风格
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {LANGUAGE_STYLE_OPTIONS.map((option) => (
          <Card
            key={option.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedStyle === option.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-gray-50'
            }`}
            onClick={() => onStyleChange(option.id)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{option.emoji}</span>
                  <h4 className="font-medium text-sm">{option.name}</h4>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">{option.description}</p>

                <div className="flex flex-wrap gap-1">
                  {option.examples.slice(0, 2).map((example, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedStyle && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">
              {LANGUAGE_STYLE_OPTIONS.find((opt) => opt.id === selectedStyle)?.emoji}
            </span>
            <span className="text-sm font-medium text-blue-800">
              已选择：{LANGUAGE_STYLE_OPTIONS.find((opt) => opt.id === selectedStyle)?.name}
            </span>
          </div>
          <p className="text-xs text-blue-600">
            {LANGUAGE_STYLE_OPTIONS.find((opt) => opt.id === selectedStyle)?.description}
          </p>
        </div>
      )}
    </div>
  );
};
