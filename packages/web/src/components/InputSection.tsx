import React, { useCallback } from 'react';
import { Upload, FileText, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import type { InputSectionProps } from '../types';

export const InputSection: React.FC<InputSectionProps> = ({
  inputText,
  onTextChange,
  onFileUpload,
  isAnalyzing,
  onAnalyze,
}) => {
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // 验证文件类型
        const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
          alert('请上传 TXT、Markdown 或 PDF 文件');
          return;
        }

        // 验证文件大小 (10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert('文件大小不能超过 10MB');
          return;
        }

        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file) {
        // 验证文件类型和大小
        const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
          alert('请上传 TXT、Markdown 或 PDF 文件');
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          alert('文件大小不能超过 10MB');
          return;
        }

        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const canAnalyze = inputText.trim().length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          原文输入区
        </CardTitle>
        <CardDescription>输入您的文章内容，或上传 PDF、TXT、Markdown 文件</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 文本输入区 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">文章内容</label>
          <Textarea
            placeholder="请输入您的文章内容，比如游记、种草、穿搭心得等..."
            value={inputText}
            onChange={(e) => onTextChange(e.target.value)}
            className="min-h-[200px] resize-none"
            disabled={isAnalyzing}
          />
          <p className="text-xs text-muted-foreground">{inputText.length} 字符</p>
        </div>

        {/* 分隔线 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">或者</span>
          </div>
        </div>

        {/* 文件上传区 */}
        <div
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">拖拽文件到此处，或者</p>
          <Input
            type="file"
            accept=".txt,.md,.pdf"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={isAnalyzing}
          />
          <label htmlFor="file-upload">
            <Button variant="outline" size="sm" asChild>
              <span>选择文件</span>
            </Button>
          </label>
          <p className="text-xs text-muted-foreground mt-2">
            支持 TXT、Markdown、PDF 格式，最大 10MB
          </p>
        </div>

        {/* 分析按钮 */}
        <Button
          onClick={onAnalyze}
          disabled={!canAnalyze || isAnalyzing}
          className="w-full"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              AI 正在分析中...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              开始 AI 分析
            </>
          )}
        </Button>

        {/* 提示信息 */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• AI 将自动分析您的内容并生成小红书风格的图文</p>
          <p>• 支持自动段落划分、关键点提取、标题生成</p>
          <p>• 生成的卡片可以自定义样式和导出</p>
        </div>
      </CardContent>
    </Card>
  );
};
