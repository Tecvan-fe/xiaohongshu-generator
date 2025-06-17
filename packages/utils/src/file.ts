import { SUPPORTED_FILE_TYPES } from './constants';

// 类型声明，避免编译错误
declare const FileReader: any;
declare const document: any;
declare const Blob: any;
declare const URL: any;

/**
 * 验证文件类型
 */
export function validateFileType(file: File): boolean {
  return Object.values(SUPPORTED_FILE_TYPES).includes(file.type as any);
}

/**
 * 验证文件大小
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 读取文件内容（仅在浏览器环境中可用）
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // 检查是否在浏览器环境中
    if (typeof FileReader === 'undefined') {
      reject(new Error('FileReader API 在当前环境中不可用'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event: any) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('文件读取失败'));
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取出错'));
    };

    reader.readAsText(file, 'utf-8');
  });
}

/**
 * 下载文件（仅在浏览器环境中可用）
 */
export function downloadFile(
  content: string,
  filename: string,
  contentType: string = 'text/plain'
): void {
  // 检查是否在浏览器环境中
  if (
    typeof document === 'undefined' ||
    typeof Blob === 'undefined' ||
    typeof URL === 'undefined'
  ) {
    throw new Error('文件下载功能仅在浏览器环境中可用');
  }

  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 生成文件名
 */
export function generateFileName(basename: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${basename}-${timestamp}.${extension}`;
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * 检查是否为图片文件
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * 检查是否为文档文件
 */
export function isDocumentFile(file: File): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
  ];
  return documentTypes.includes(file.type);
}
