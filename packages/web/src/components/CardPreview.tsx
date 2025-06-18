import React, { useState } from 'react';
import { Hash, Tag, Download, Loader2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { downloadCardImage } from '../api';
import type { CardPreviewProps } from '../types';

export const CardPreview: React.FC<CardPreviewProps> = ({ card, index }) => {
  const { title, summary, emoji, tags, stylePreset } = card;
  const [isExporting, setIsExporting] = useState(false);

  // 处理单张图片导出
  const handleExportImage = async () => {
    try {
      setIsExporting(true);
      await downloadCardImage(card, index);
    } catch (error) {
      console.error('图片导出失败:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // 生成 SVG 卡片
  const generateSVG = () => {
    const { backgroundColor, textColor, accentColor, fontFamily, fontSize, borderRadius, padding } =
      stylePreset;

    // 预览版本使用较小的尺寸，但保持相同的比例 (960:1280 = 3:4)
    const previewWidth = 240;
    const previewHeight = 320;

    return (
      <svg
        width={previewWidth}
        height={previewHeight}
        viewBox={`0 0 ${previewWidth} ${previewHeight}`}
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

        <rect
          width={previewWidth}
          height={previewHeight}
          fill={`url(#gradient-${index})`}
          rx={borderRadius}
        />

        {/* 装饰圆点 - 调整位置以匹配实际输出 */}
        <circle cx={previewWidth - 30} cy="38" r="12" fill={accentColor} opacity="0.15" />
        <circle cx="30" cy={previewHeight - 63} r="9" fill={accentColor} opacity="0.2" />
        <circle
          cx={previewWidth - 38}
          cy={previewHeight - 38}
          r="6"
          fill={accentColor}
          opacity="0.1"
        />

        {/* Emoji - 调整位置 */}
        <text x="25" y="63" fontSize="20" fill={textColor}>
          {emoji}
        </text>

        {/* 标题 - 调整位置 */}
        <text
          x="25"
          y="95"
          fontSize={fontSize + 1}
          fontFamily={fontFamily}
          fontWeight="bold"
          fill={textColor}
          className="font-bold"
        >
          {title.length > 15 ? title.substring(0, 15) + '...' : title}
        </text>

        {/* 内容摘要 - 调整位置和大小 */}
        <foreignObject x="25" y="105" width={previewWidth - 50} height="125">
          <div
            style={{
              fontFamily,
              fontSize: fontSize - 2,
              color: textColor,
              lineHeight: '1.4',
              opacity: 0.85,
            }}
          >
            {summary.length > 60 ? summary.substring(0, 60) + '...' : summary}
          </div>
        </foreignObject>

        {/* 标签 - 调整位置 */}
        <g transform={`translate(25, ${previewHeight - 50})`}>
          {tags.slice(0, 3).map((tag, tagIndex) => (
            <g key={tag}>
              <rect
                x={tagIndex * 60}
                y={0}
                width={Math.min(tag.length * 5 + 10, 55)}
                height="16"
                fill={accentColor}
                opacity="0.2"
                rx="8"
              />
              <text
                x={tagIndex * 60 + 5}
                y={11}
                fontSize={fontSize - 4}
                fontFamily={fontFamily}
                fill={accentColor}
                fontWeight="500"
              >
                #{tag.length > 6 ? tag.substring(0, 6) : tag}
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
          {/* 卡片序号和导出按钮 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">卡片 {index + 1}</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Hash className="h-3 w-3" />
                {stylePreset.name}
              </div>
              <Button
                onClick={handleExportImage}
                variant="ghost"
                size="sm"
                disabled={isExporting}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 disabled:opacity-50"
                title="导出此卡片为图片"
              >
                {isExporting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Download className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* SVG 卡片预览 */}
          <div
            className="bg-muted/30 rounded-lg overflow-hidden"
            style={{ aspectRatio: '960/1280' }}
          >
            {generateSVG()}
          </div>

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
