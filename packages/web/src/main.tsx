import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserLogger } from './lib/browser-logger';
import App from './App';
import './index.css';

// 创建logger实例
const logger = createBrowserLogger({
  service: 'xiaohongshu-web',
  level: 'info',
});

// 初始化应用
logger.info('小红书内容生成器前端应用启动');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
