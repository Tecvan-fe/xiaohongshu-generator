import React from 'react';
import { Hash, Tag } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import type { CardPreviewProps } from '../types';

export const CardPreview: React.FC<CardPreviewProps> = ({ card, index }) => {
  const { title, summary, emoji, tags, stylePreset } = card;

  // 生成 SVG 卡片
  const generateSVG = () => {
    const { backgroundColor, textColor, accentColor, fontFamily, fontSize, borderRadius, padding } =
      stylePreset;

    return (
      <svg
        width="400"
        height="300"
        viewBox="0 0 400 300"
        className="w-full h-full rounded-lg shadow-sm border"
        style={{ backgroundColor }}
      >
        {/* 背景装饰 */}
        <defs>
          <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={backgroundColor} />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <rect width="400" height="300" fill={`url(#gradient-${index})`} rx={borderRadius} />

        {/* 装饰圆点 */}
        <circle cx="350" cy="50" r="20" fill={accentColor} opacity="0.2" />
        <circle cx="50" cy="250" r="15" fill={accentColor} opacity="0.3" />

        {/* Emoji */}
        <text x="40" y="80" fontSize="32" fill={textColor}>
          {emoji}
        </text>

        {/* 标题 */}
        <text
          x="40"
          y="130"
          fontSize={fontSize + 4}
          fontFamily={fontFamily}
          fontWeight="bold"
          fill={textColor}
          className="font-bold"
        >
          {title.length > 20 ? title.substring(0, 20) + '...' : title}
        </text>

        {/* 内容摘要 */}
        <foreignObject x="40" y="150" width="320" height="80">
          <div
            style={{
              fontFamily,
              fontSize: fontSize - 2,
              color: textColor,
              lineHeight: '1.5',
              opacity: 0.8,
            }}
          >
            {summary.length > 60 ? summary.substring(0, 60) + '...' : summary}
          </div>
        </foreignObject>

        {/* 标签 */}
        <g>
          {tags.slice(0, 3).map((tag, tagIndex) => (
            <g key={tag}>
              <rect
                x={40 + tagIndex * 80}
                y={250}
                width={tag.length * 8 + 16}
                height={24}
                fill={accentColor}
                opacity="0.2"
                rx="12"
              />
              <text
                x={48 + tagIndex * 80}
                y={266}
                fontSize={fontSize - 4}
                fontFamily={fontFamily}
                fill={accentColor}
                fontWeight="500"
              >
                #{tag}
              </text>
            </g>
          ))}
        </g>
      </svg>
    );
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* 卡片序号 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">卡片 {index + 1}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Hash className="h-3 w-3" />
              {stylePreset.name}
            </div>
          </div>

          {/* SVG 卡片预览 */}
          <div className="aspect-[4/3] bg-muted/30 rounded-lg overflow-hidden">{generateSVG()}</div>

          {/* 卡片信息 */}
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                {emoji} {title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">{summary}</p>
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: stylePreset.accentColor + '20',
                    color: stylePreset.accentColor,
                  }}
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>

            {/* 样式信息 */}
            <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>字体:</span>
                <span>{stylePreset.fontFamily.split(',')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span>模板:</span>
                <span>{stylePreset.template}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
