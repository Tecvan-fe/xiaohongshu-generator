'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  ImageIcon,
  FileUp,
  Figma,
  MonitorIcon,
  CircleUserRound,
  ArrowUpIcon,
  Paperclip,
  PlusIcon,
  Sparkles,
  FileText,
  Camera,
  Upload,
  X,
} from 'lucide-react';
import { LanguageStyleSelector } from './language-style-selector';
import type { LanguageStyle } from '../../api/types';

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      // Temporarily shrink to get the right scrollHeight
      textarea.style.height = `${minHeight}px`;

      // Calculate new height
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    // Set initial height
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  // Adjust height on window resize
  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

interface XiaohongshuChatProps {
  onSubmit: (text: string) => void;
  onFileUpload: (file: File) => void;
  onStyleChange: (style: LanguageStyle) => void;
  selectedStyle: LanguageStyle;
  isLoading?: boolean;
  placeholder?: string;
}

export function XiaohongshuChat({
  onSubmit,
  onFileUpload,
  onStyleChange,
  selectedStyle,
  isLoading = false,
  placeholder = '描述您想要转换为小红书图文的内容...',
}: XiaohongshuChatProps) {
  const [value, setValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 80,
    maxHeight: 200,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit?.(value.trim());
        setValue('');
        adjustHeight(true);
      }
    }
  };

  const handleSubmit = () => {
    if (value.trim() && !isLoading) {
      onSubmit?.(value.trim());
      setValue('');
      adjustHeight(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload?.(file);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <div className="relative bg-white rounded-full p-3 shadow-lg">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
            小红书内容生成器
          </h1>
        </div>
        <p className="text-lg text-gray-600">将您的想法转换为精美的小红书图文内容</p>
      </div>

      <div className="w-full">
        <div className="mb-6">
          <LanguageStyleSelector selectedStyle={selectedStyle} onStyleChange={onStyleChange} />
        </div>

        <div className="relative bg-white rounded-2xl border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="overflow-y-auto">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className={cn(
                'w-full px-6 py-4',
                'resize-none',
                'bg-transparent',
                'border-none',
                'text-gray-800 text-base',
                'focus:outline-none',
                'focus-visible:ring-0 focus-visible:ring-offset-0',
                'placeholder:text-gray-500 placeholder:text-base',
                'min-h-[80px]',
                'leading-relaxed'
              )}
              style={{
                overflow: 'hidden',
              }}
            />
          </div>

          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleAttachClick}
                disabled={isLoading}
                className="group p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Paperclip className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600 hidden group-hover:inline transition-opacity">
                  上传文件
                </span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-400">
                {value.length > 0 && `${value.length} 字符`}
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!value.trim() || isLoading}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2',
                  value.trim() && !isLoading
                    ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    生成中...
                  </>
                ) : (
                  <>
                    <ArrowUpIcon className="w-4 h-4" />
                    开始生成
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          <ActionButton
            icon={<FileText className="w-4 h-4" />}
            label="旅行日记"
            onClick={() => setValue('分享一次难忘的旅行经历，包括目的地、美食、景点和感受...')}
          />
          <ActionButton
            icon={<Camera className="w-4 h-4" />}
            label="产品推荐"
            onClick={() => setValue('推荐一款好用的产品，详细介绍使用体验和优缺点...')}
          />
          <ActionButton
            icon={<Sparkles className="w-4 h-4" />}
            label="美食分享"
            onClick={() => setValue('记录一次美食体验，包括菜品介绍、口感描述和餐厅环境...')}
          />
          <ActionButton
            icon={<ImageIcon className="w-4 h-4" />}
            label="穿搭心得"
            onClick={() => setValue('展示穿搭搭配技巧，包括单品介绍、搭配理念和场合建议...')}
          />
          <ActionButton
            icon={<MonitorIcon className="w-4 h-4" />}
            label="生活技巧"
            onClick={() => setValue('分享实用的生活小技巧，让日常生活更便利...')}
          />
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 space-y-2">
        <p>💡 支持文本输入或上传 PDF、TXT、Markdown 文件</p>
        <p>⌨️ 使用 Enter 发送，Shift + Enter 换行</p>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-full border-2 border-gray-200 text-gray-700 hover:text-primary hover:border-primary/30 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
