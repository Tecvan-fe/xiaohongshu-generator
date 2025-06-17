import React from 'react';
import {
  Sparkles,
  Brain,
  Wand2,
  Image,
  Download,
  Clock,
  CheckCircle,
  Loader2,
  Copy,
  Share2,
} from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Progress } from './progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { CardPreview } from '../CardPreview';
import type { ProcessedParagraph, TitleOptions, CardData } from '../../types';

interface ChatResponseProps {
  isAnalyzing: boolean;
  isGeneratingTitles: boolean;
  isGeneratingCards: boolean;
  paragraphs: ProcessedParagraph[];
  titles: TitleOptions | null;
  cards: CardData[];
  onExport: (format: 'markdown' | 'json' | 'images') => void;
  onReset?: () => void;
}

export function ChatResponse({
  isAnalyzing,
  isGeneratingTitles,
  isGeneratingCards,
  paragraphs,
  titles,
  cards,
  onExport,
  onReset,
}: ChatResponseProps) {
  // 计算总体进度
  const getOverallProgress = () => {
    if (cards.length > 0) return 100;
    if (isGeneratingCards) return 85;
    if (titles) return 70;
    if (isGeneratingTitles) return 55;
    if (paragraphs.length > 0) return 40;
    if (isAnalyzing) return 20;
    return 0;
  };

  const progress = getOverallProgress();
  const isComplete = cards.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 进度指示器 */}
      {(isAnalyzing || paragraphs.length > 0 || titles || cards.length > 0) && (
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-primary to-pink-500 rounded-full p-2">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">AI 内容生成进度</h3>
                <p className="text-sm text-gray-600">{progress}% 完成</p>
              </div>
              {isComplete && onReset && (
                <Button onClick={onReset} variant="outline" size="sm">
                  重新开始
                </Button>
              )}
            </div>
            <Progress value={progress} className="h-3 bg-gray-200" />
          </CardContent>
        </Card>
      )}

      {/* 分析步骤 */}
      {(isAnalyzing || paragraphs.length > 0) && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              {isAnalyzing ? (
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">
                  {isAnalyzing ? '正在分析内容结构...' : '✅ 内容分析完成'}
                </h3>
                {!isAnalyzing && (
                  <p className="text-sm text-gray-600">
                    已识别 {paragraphs.length} 个内容段落，提取关键信息
                  </p>
                )}
              </div>
            </div>

            {paragraphs.length > 0 && (
              <div className="space-y-3">
                {paragraphs.map((paragraph, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                        段落 {index + 1}
                      </span>
                      <span className="text-xs text-gray-500">{paragraph.content.length} 字符</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                      {paragraph.content.length > 150
                        ? paragraph.content.substring(0, 150) + '...'
                        : paragraph.content}
                    </p>
                    {paragraph.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {paragraph.keywords.slice(0, 5).map((keyword, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md"
                          >
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 标题生成步骤 */}
      {(isGeneratingTitles || titles) && (
        <Card className="border-l-4 border-l-purple-500 bg-purple-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              {isGeneratingTitles ? (
                <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">
                  {isGeneratingTitles ? '正在生成爆款标题...' : '✅ 标题生成完成'}
                </h3>
                {!isGeneratingTitles && titles && (
                  <p className="text-sm text-gray-600">
                    生成了 {titles.titles.length} 个吸引人的标题选项
                  </p>
                )}
              </div>
            </div>

            {titles && (
              <div className="space-y-3">
                {titles.titles.map((title, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm group hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
                            标题 {index + 1}
                          </span>
                          {index === 0 && (
                            <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium">
                              ⭐ 推荐
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-gray-800 text-base leading-relaxed">
                          {title}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 卡片生成步骤 */}
      {(isGeneratingCards || cards.length > 0) && (
        <Card className="border-l-4 border-l-green-500 bg-green-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              {isGeneratingCards ? (
                <Loader2 className="h-6 w-6 text-green-600 animate-spin" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">
                  {isGeneratingCards ? '正在生成图文卡片...' : '✅ 卡片生成完成'}
                </h3>
                {!isGeneratingCards && cards.length > 0 && (
                  <p className="text-sm text-gray-600">
                    成功生成 {cards.length} 张精美的小红书图文卡片
                  </p>
                )}
              </div>
            </div>

            {cards.length > 0 && (
              <div className="space-y-6">
                {/* 卡片预览区域 */}
                <Tabs defaultValue="grid" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="grid" className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      网格预览
                    </TabsTrigger>
                    <TabsTrigger value="mobile" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      手机预览
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="grid" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {cards.map((card, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-xl p-4 border-2 border-gray-100 shadow-sm hover:shadow-lg transition-shadow"
                        >
                          <CardPreview card={card} index={index} />
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="mobile" className="mt-4">
                    <div className="max-w-sm mx-auto bg-gray-900 rounded-3xl p-3 shadow-2xl">
                      <div className="bg-white rounded-2xl overflow-hidden">
                        <div className="space-y-4 p-4 max-h-96 overflow-y-auto">
                          {cards.map((card, index) => (
                            <div key={index} className="rounded-lg overflow-hidden shadow-sm">
                              <CardPreview card={card} index={index} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* 导出按钮 */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-green-100">
                  <Button
                    onClick={() => onExport('markdown')}
                    variant="outline"
                    className="flex-1 min-w-[120px] border-green-200 hover:bg-green-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    导出 Markdown
                  </Button>
                  <Button
                    onClick={() => onExport('json')}
                    variant="outline"
                    className="flex-1 min-w-[120px] border-green-200 hover:bg-green-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    导出 JSON
                  </Button>
                  <Button
                    onClick={() => onExport('images')}
                    className="flex-1 min-w-[120px] bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    导出图片
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 min-w-[120px] border-green-200 hover:bg-green-50"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    分享
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
