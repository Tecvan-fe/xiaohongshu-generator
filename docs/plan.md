# 小红书卡片与文案生成系统 - 项目执行计划

## 项目概述

基于 React + Express + AI 的小红书卡片与文案生成系统，支持用户输入产品描述后自动生成符合小红书风格的文案和精美卡片图。

**技术栈**：

- 前端：React 18 + TypeScript + Vite + Tailwind CSS
- 后端：Express + TypeScript + Vercel AI SDK
- AI 服务：OpenAI GPT-4o / Claude 3
- 部署：Vercel (前端) + Railway/Render (后端)

---

## 第一阶段：项目初始化与环境配置

### 1.1 项目基础设置

- [ ] 初始化项目结构（packages/server, packages/web）
- [ ] 配置 TypeScript 和 ESLint 规范
- [ ] 设置 pnpm workspace 配置
- [ ] 配置 Git hooks (husky + lint-staged)
- [ ] 创建环境变量模板文件

### 1.2 开发环境配置

- [ ] 配置后端开发环境（Express + TypeScript）
- [ ] 配置前端开发环境（Vite + React）
- [ ] 设置跨域和代理配置
- [ ] 配置开发脚本和启动命令

---

## 第二阶段：后端核心开发

### 2.1 基础架构搭建

- [ ] 初始化 Express 应用和中间件配置
- [ ] 设置 CORS、helmet、compression 等安全中间件
- [ ] 配置请求限流 (rate-limit)
- [ ] 实现统一的错误处理中间件
- [ ] 设计统一的 API 响应格式

### 2.2 AI 服务集成

- [ ] 安装 Vercel AI SDK 相关依赖
- [ ] 配置 OpenAI 和 Claude API 客户端
- [ ] 实现 AIService 类，支持多引擎切换
- [ ] 实现自动降级策略（OpenAI 失败切换到 Claude）
- [ ] 实现流式生成支持
- [ ] 添加 AI 调用的错误处理和重试机制

### 2.3 文案生成核心功能

- [ ] 设计并实现 Prompt 模板系统
  - [ ] 种草文案模板
  - [ ] 测评文案模板
  - [ ] 生活记录模板
  - [ ] 对比文案模板
- [ ] 实现文案生成服务
- [ ] 实现流式文案生成接口
- [ ] 添加内容安全过滤
- [ ] 实现文案长度控制逻辑

### 2.4 API 接口开发

- [ ] 实现 POST /api/v1/generate 接口
- [ ] 实现 POST /api/v1/generate-stream 流式接口
- [ ] 实现 POST /api/v1/upload 文件上传接口
- [ ] 实现输入参数验证中间件
- [ ] 添加 API 接口单元测试

### 2.5 SVG 卡片生成

- [ ] 设计卡片主题配置系统
- [ ] 实现动态 SVG 生成逻辑
- [ ] 支持多种卡片尺寸（海报版/方形版/横版）
- [ ] 实现文本自动换行和字体适配
- [ ] 添加图标和装饰元素支持

### 2.6 后端测试与文档

- [ ] 编写 API 接口测试用例
- [ ] 配置 Swagger/OpenAPI 文档生成
- [ ] 性能测试和压力测试
- [ ] 完善错误处理和日志记录

---

## 第三阶段：前端核心开发

### 3.1 前端基础架构

- [ ] 初始化 React + Vite + TypeScript 项目
- [ ] 配置 Tailwind CSS 和组件库
- [ ] 设置路由系统（React Router）
- [ ] 配置状态管理（Zustand）
- [ ] 集成 TanStack Query 用于服务端状态

### 3.2 UI 组件库建设

- [ ] 创建基础组件库
  - [ ] Button、Input、Select 等表单组件
  - [ ] Modal、Toast 等反馈组件
  - [ ] Loading、Progress 等状态组件
- [ ] 实现主题系统和暗黑模式支持
- [ ] 创建响应式布局组件

### 3.3 核心功能页面

- [ ] 实现主页面布局和导航
- [ ] 开发用户输入表单组件
  - [ ] 产品描述输入框
  - [ ] 内容类型选择器
  - [ ] 文案长度选择器
  - [ ] 卡片风格选择器
  - [ ] 文件上传组件
- [ ] 实现表单验证（React Hook Form + Zod）

### 3.4 AI 集成与实时生成

- [ ] 集成 Vercel AI SDK React Hooks
- [ ] 实现 useAIGeneration 自定义 Hook
- [ ] 开发实时文案生成组件
- [ ] 实现流式内容显示
- [ ] 添加生成控制（开始/停止/重新生成）

### 3.5 卡片预览与编辑

- [ ] 实现 SVG 卡片实时预览组件
- [ ] 开发卡片编辑器（标题、副标题、样式调整）
- [ ] 实现多种卡片模板切换
- [ ] 添加卡片缩放和适配功能

### 3.6 导出与分享功能

- [ ] 实现卡片 SVG/PNG 导出功能
- [ ] 开发文案复制功能
- [ ] 实现小红书草稿格式导出
- [ ] 添加本地存储历史记录功能

---

## 第四阶段：集成测试与优化

### 4.1 前后端集成

- [ ] 完成前后端 API 对接
- [ ] 实现错误处理和用户反馈
- [ ] 测试流式生成的完整流程
- [ ] 验证文件上传和图片处理功能

### 4.2 用户体验优化

- [ ] 实现加载状态和骨架屏
- [ ] 添加操作提示和引导
- [ ] 优化移动端响应式适配
- [ ] 实现键盘快捷键支持

### 4.3 性能优化

- [ ] 前端代码分割和懒加载
- [ ] 图片压缩和 WebP 格式支持
- [ ] API 响应缓存优化
- [ ] 实现防抖和节流

### 4.4 测试与质量保证

- [ ] 端到端测试（Playwright/Cypress）
- [ ] 跨浏览器兼容性测试
- [ ] 移动端测试
- [ ] 性能和可访问性测试

---

## 第五阶段：部署与上线

### 5.1 部署准备

- [ ] 配置生产环境变量
- [ ] 设置 Docker 容器化（可选）
- [ ] 配置 CI/CD 流水线
- [ ] 准备域名和 SSL 证书

### 5.2 部署实施

- [ ] 后端部署到 Railway/Render
- [ ] 前端部署到 Vercel
- [ ] 配置环境变量和 API 连接
- [ ] 验证生产环境功能

### 5.3 监控与维护

- [ ] 配置错误监控（Sentry）
- [ ] 设置性能监控
- [ ] 实现日志收集和分析
- [ ] 准备运维文档

### 5.4 文档与交付

- [ ] 完善 API 文档
- [ ] 编写用户使用指南
- [ ] 创建开发者文档
- [ ] 准备项目演示和介绍

---

## 第六阶段：后续迭代与扩展

### 6.1 功能增强

- [ ] 支持更多 AI 模型（如通义千问、文心一言）
- [ ] 添加批量生成功能
- [ ] 实现用户账户系统
- [ ] 支持团队协作功能

### 6.2 内容优化

- [ ] 扩展更多卡片主题和模板
- [ ] 优化 Prompt 工程，提升生成质量
- [ ] 添加行业特定的文案模板
- [ ] 实现个性化推荐

### 6.3 技术升级

- [ ] 引入数据库存储用户数据
- [ ] 实现服务端渲染（SSR）
- [ ] 添加 PWA 支持
- [ ] 集成更多第三方服务

---

## 里程碑时间节点

- **第一阶段**：项目初始化（1-2天）
- **第二阶段**：后端开发（5-7天）
- **第三阶段**：前端开发（5-7天）
- **第四阶段**：集成测试（2-3天）
- **第五阶段**：部署上线（1-2天）
- **第六阶段**：迭代优化（持续）

**总预计开发周期**：2-3周

---

## 注意事项

1. **API Key 安全**：确保 OpenAI 和 Claude 的 API Key 安全存储
2. **费用控制**：设置 AI 调用的费用限制和监控
3. **内容合规**：实现内容安全过滤，避免生成不当内容
4. **性能监控**：关注 AI 调用的响应时间和成功率
5. **用户反馈**：收集用户使用反馈，持续优化产品体验

---
