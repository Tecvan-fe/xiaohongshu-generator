import React from 'react';
import { Brain, FileText, Palette, Sparkles, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';

interface AnalysisStep {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
}

interface AnalysisProgressProps {
  isAnalyzing: boolean;
  isGeneratingTitles: boolean;
  isGeneratingCards: boolean;
  paragraphs: any[];
  titles: any;
  cards: any[];
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  isAnalyzing,
  isGeneratingTitles,
  isGeneratingCards,
  paragraphs,
  titles,
  cards,
}) => {
  const steps: AnalysisStep[] = [
    {
      key: 'analyze',
      title: '内容分析',
      description: '智能转换为小红书风格，提取关键信息',
      icon: <Brain className="h-5 w-5" />,
      completed: paragraphs.length > 0,
      active: isAnalyzing,
    },
    {
      key: 'titles',
      title: '标题生成',
      description: '创作5-12字爆款小红书标题',
      icon: <Sparkles className="h-5 w-5" />,
      completed: !!titles,
      active: isGeneratingTitles,
    },
    {
      key: 'cards',
      title: '卡片制作',
      description: '生成精美的小红书图文卡片',
      icon: <Palette className="h-5 w-5" />,
      completed: cards.length > 0,
      active: isGeneratingCards,
    },
  ];

  const completedSteps = steps.filter((step) => step.completed).length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  if (!isAnalyzing && !isGeneratingTitles && !isGeneratingCards && completedSteps === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          AI 分析进度
        </CardTitle>
        <CardDescription>正在为您的内容生成小红书风格的图文</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 总体进度条 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">整体进度</span>
            <span className="text-muted-foreground">
              {completedSteps}/{totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {progress === 100 ? '全部完成！' : `已完成 ${Math.round(progress)}%`}
          </p>
        </div>

        {/* 步骤详情 */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                step.active
                  ? 'bg-primary/10 border border-primary/20'
                  : step.completed
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-muted/50'
              }`}
            >
              <div
                className={`flex-shrink-0 p-2 rounded-full ${
                  step.completed
                    ? 'bg-green-100 text-green-600'
                    : step.active
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.completed ? <CheckCircle className="h-5 w-5" /> : step.icon}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4
                    className={`font-medium ${
                      step.active
                        ? 'text-primary'
                        : step.completed
                          ? 'text-green-700'
                          : 'text-foreground'
                    }`}
                  >
                    {step.title}
                  </h4>
                  {step.active && <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />}
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>

                {/* 显示结果统计 */}
                {step.completed && (
                  <div className="text-xs text-green-600 font-medium">
                    {step.key === 'analyze' && `已分析 ${paragraphs.length} 个段落`}
                    {step.key === 'titles' &&
                      titles &&
                      `已生成 ${titles.titles?.length || 0} 个标题选项`}
                    {step.key === 'cards' && `已生成 ${cards.length} 张卡片`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 完成状态 */}
        {progress === 100 && (
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-green-800 mb-1">分析完成！</h3>
            <p className="text-sm text-green-600">
              您的小红书风格图文内容已经准备就绪，可以进行预览和导出
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
