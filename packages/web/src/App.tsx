import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useAppStore } from './store/app-store';
import { XiaohongshuChat } from './components/ui/v0-ai-chat';
import { ChatResponse } from './components/ui/chat-response';
import { Card, CardContent } from './components/ui/card';

function App() {
  const {
    // 状态
    inputText,
    uploadedFile,
    paragraphs,
    titles,
    cards,
    isAnalyzing,
    isGeneratingTitles,
    isGeneratingCards,
    currentStep,
    error,

    // Actions
    setInputText,
    setUploadedFile,
    setError,
    analyzeContent,
    reset,
  } = useAppStore();

  // 处理文件上传
  const handleFileUpload = (file: File) => {
    setUploadedFile(file);

    // 如果是文本文件，自动读取内容
    if (file.type === 'text/plain' || file.type === 'text/markdown') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInputText(content);
      };
      reader.readAsText(file);
    }
  };

  // 处理导出
  const handleExport = async (format: 'markdown' | 'json' | 'images') => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          cards,
          title: titles?.titles[0],
        }),
      });

      if (!response.ok) {
        throw new Error('导出失败');
      }

      // 处理文件下载
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xiaohongshu-content.${format === 'images' ? 'zip' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('导出失败:', error);
      setError('导出失败，请稍后重试');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* 错误提示 */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">{error}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 主要内容区域 */}
        <main className="space-y-8">
          {/* 聊天输入界面 - 始终显示在顶部 */}
          {(currentStep === 'input' || paragraphs.length === 0) && (
            <div className="animate-fade-in">
              <XiaohongshuChat
                onSubmit={(text) => {
                  setInputText(text);
                  analyzeContent();
                }}
                onFileUpload={handleFileUpload}
                isLoading={isAnalyzing}
                placeholder="描述您想要转换为小红书图文的内容...

例如：
• 分享一次旅行经历
• 推荐一款好用的产品  
• 记录一次美食体验
• 展示穿搭心得
• 其他任何想法..."
              />
            </div>
          )}

          {/* AI 响应和结果展示 */}
          {(isAnalyzing ||
            isGeneratingTitles ||
            isGeneratingCards ||
            paragraphs.length > 0 ||
            titles ||
            cards.length > 0) && (
            <div className="animate-slide-up">
              <ChatResponse
                isAnalyzing={isAnalyzing}
                isGeneratingTitles={isGeneratingTitles}
                isGeneratingCards={isGeneratingCards}
                paragraphs={paragraphs}
                titles={titles}
                cards={cards}
                onExport={handleExport}
                onReset={reset}
              />
            </div>
          )}
        </main>

        {/* 页脚 */}
        <footer className="mt-16 text-center text-sm text-gray-500">
          <div className="space-y-2">
            <p>✨ 由 AI 驱动的小红书内容创作工具</p>
            <p>支持文本分析 • 自动生成卡片 • 多格式导出</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
