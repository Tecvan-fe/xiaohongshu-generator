import React from 'react';
import { Sparkles, Brain, Wand2, Image, Download, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CardPreview } from './CardPreview';
import type { ProcessedParagraph, TitleOptions, CardData } from '../types';

interface ChatResponseSectionProps {
  isAnalyzing: boolean;
  isGeneratingTitles: boolean;
  isGeneratingCards: boolean;
  paragraphs: ProcessedParagraph[];
  titles: TitleOptions | null;
  cards: CardData[];
  currentStep: string;
  onExport: (format: 'markdown' | 'json' | 'images') => void;
}

export const ChatResponseSection: React.FC<ChatResponseSectionProps> = ({
  isAnalyzing,
  isGeneratingTitles,
  isGeneratingCards,
  paragraphs,
  titles,
  cards,
  currentStep,
  onExport,
}) => {
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

  // 如果没有任何活动，显示欢迎界面
  if (!isAnalyzing && !paragraphs.length && !titles && !cards.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-gradient-to-br from-primary/10 to-pink-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">开始创作小红书内容</h2>
          <p className="text-gray-600 mb-6">
            在左侧输入您的文章内容或上传文件，AI 将帮您转换为精美的小红书图文
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <Brain className="h-4 w-4" />
              <span>智能内容分析</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Wand2 className="h-4 w-4" />
              <span>自动生成标题</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Image className="h-4 w-4" />
              <span>创建图文卡片</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 顶部进度栏 */}
      {(isAnalyzing || paragraphs.length > 0 || titles || cards.length > 0) && (
        <div className="border-b border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-primary to-pink-500 rounded-full p-1">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium text-gray-800">AI 内容生成进度</span>
            <span className="text-sm text-gray-500">({progress}%)</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* 分析步骤 */}
        {(isAnalyzing || paragraphs.length > 0) && (
          <Card className="border border-blue-200 bg-blue-50/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {isAnalyzing ? (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                <h3 className="font-semibold text-gray-800">
                  {isAnalyzing ? '正在分析内容结构...' : '内容分析完成'}
                </h3>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>

              {paragraphs.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-3">
                    已识别 {paragraphs.length} 个内容段落
                  </p>
                  {paragraphs.map((paragraph: ProcessedParagraph, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                          段落 {index + 1}
                        </span>
                        <span className="text-xs text-gray-500">
                          {paragraph.content.length} 字符
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">{paragraph.content}</p>
                      {paragraph.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {paragraph.tags.slice(0, 3).map((tag: string, i: number) => (
                            <span
                              key={i}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              #{tag}
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
          <Card className="border border-purple-200 bg-purple-50/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {isGeneratingTitles ? (
                  <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                <h3 className="font-semibold text-gray-800">
                  {isGeneratingTitles ? '正在生成爆款标题...' : '标题生成完成'}
                </h3>
              </div>

              {titles && (
                <div className="space-y-2">
                  {titles.titles.map((title: string, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-purple-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded">
                          标题 {index + 1}
                        </span>
                        {index === 0 && (
                          <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded">
                            推荐
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-800">{title}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 卡片生成步骤 */}
        {(isGeneratingCards || cards.length > 0) && (
          <Card className="border border-green-200 bg-green-50/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {isGeneratingCards ? (
                  <Loader2 className="h-5 w-5 text-green-600 animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                <h3 className="font-semibold text-gray-800">
                  {isGeneratingCards ? '正在生成图文卡片...' : '卡片生成完成'}
                </h3>
              </div>

              {cards.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">已生成 {cards.length} 张图文卡片</p>

                  {/* 卡片预览区域 */}
                  <Tabs defaultValue="grid" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="grid">网格预览</TabsTrigger>
                      <TabsTrigger value="mobile">手机预览</TabsTrigger>
                    </TabsList>

                    <TabsContent value="grid" className="mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        {cards.map((card, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 border">
                            <CardPreview card={card} index={index} />
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="mobile" className="mt-4">
                      <div className="max-w-sm mx-auto bg-gray-900 rounded-3xl p-2">
                        <div className="bg-white rounded-2xl overflow-hidden">
                          <div className="space-y-4 p-4 max-h-96 overflow-y-auto">
                            {cards.map((card, index) => (
                              <CardPreview key={index} card={card} index={index} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* 导出按钮 */}
                  <div className="flex gap-2 pt-4 border-t border-green-100">
                    <Button
                      onClick={() => onExport('markdown')}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      导出 Markdown
                    </Button>
                    <Button
                      onClick={() => onExport('json')}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      导出 JSON
                    </Button>
                    <Button
                      onClick={() => onExport('images')}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      导出图片
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
