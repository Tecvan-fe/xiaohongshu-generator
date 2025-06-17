import React, { useState } from 'react';
import { Download, Eye, FileText, Image, Code } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CardPreview } from './CardPreview';
import type { PreviewSectionProps } from '../types';

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  cards,
  selectedTitle,
  onExport,
}) => {
  const [activeTab, setActiveTab] = useState('grid');

  if (cards.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          预览与导出
        </CardTitle>
        <CardDescription>预览生成的小红书图文内容，选择导出格式</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 标题预览 */}
        {selectedTitle && (
          <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border">
            <h3 className="font-bold text-lg text-gray-800 mb-2">📝 {selectedTitle}</h3>
            <p className="text-sm text-gray-600">小红书风格标题预览</p>
          </div>
        )}

        {/* 预览选项卡 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">网格预览</TabsTrigger>
            <TabsTrigger value="mobile">手机预览</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-6">
            {/* 网格预览 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card, index) => (
                <CardPreview key={card.id} card={card} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-6">
            {/* 手机预览 */}
            <div className="max-w-sm mx-auto">
              <div className="bg-gray-900 rounded-3xl p-2 shadow-2xl">
                <div className="bg-white rounded-2xl overflow-hidden h-[600px]">
                  {/* 手机状态栏 */}
                  <div className="bg-red-400 h-8 flex items-center justify-center">
                    <div className="text-white text-xs font-medium">小红书风格预览</div>
                  </div>

                  {/* 标题区域 */}
                  {selectedTitle && (
                    <div className="p-4 border-b">
                      <h2 className="font-bold text-base leading-tight">{selectedTitle}</h2>
                    </div>
                  )}

                  {/* 滚动内容区 */}
                  <div className="overflow-y-auto h-[500px] p-4 space-y-4">
                    {cards.map((card, index) => (
                      <div
                        key={card.id}
                        className="aspect-[4/3] rounded-lg overflow-hidden shadow-sm"
                      >
                        <CardPreview card={card} index={index} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* 导出选项 */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">导出选项</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Markdown 导出 */}
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onExport('markdown')}
            >
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h5 className="font-medium mb-1">Markdown</h5>
                <p className="text-xs text-muted-foreground">导出为 MD 格式文本</p>
              </CardContent>
            </Card>

            {/* JSON 导出 */}
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onExport('json')}
            >
              <CardContent className="p-4 text-center">
                <Code className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h5 className="font-medium mb-1">JSON</h5>
                <p className="text-xs text-muted-foreground">导出为 JSON 数据格式</p>
              </CardContent>
            </Card>

            {/* 图片导出 */}
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onExport('images')}
            >
              <CardContent className="p-4 text-center">
                <Image className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h5 className="font-medium mb-1">图片</h5>
                <p className="text-xs text-muted-foreground">导出为 PNG 图片集</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 导出按钮 */}
        <div className="flex gap-3 pt-4">
          <Button onClick={() => onExport('markdown')} variant="outline" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            导出 Markdown
          </Button>
          <Button onClick={() => onExport('images')} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            导出图片
          </Button>
        </div>

        {/* 统计信息 */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-medium text-lg">{cards.length}</div>
              <div className="text-muted-foreground">张卡片</div>
            </div>
            <div>
              <div className="font-medium text-lg">
                {cards.reduce((total, card) => total + card.tags.length, 0)}
              </div>
              <div className="text-muted-foreground">个标签</div>
            </div>
            <div>
              <div className="font-medium text-lg">
                {Math.ceil(cards.reduce((total, card) => total + card.summary.length, 0) / 100)}
              </div>
              <div className="text-muted-foreground">分钟阅读</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
