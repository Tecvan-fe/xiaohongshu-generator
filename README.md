# 小红书内容生成器

将长文自动转换为小红书风格图文内容的AI工具。

## ✨ 功能特性

- 📝 **智能分析**: 自动分割段落，提取关键信息
- 🎨 **SVG卡片**: 动态生成可视化卡片，无需AI图像生成
- 📱 **多端预览**: 支持移动端和桌面端预览
- 🚀 **实时编辑**: 所见即所得的编辑体验
- 📤 **多格式导出**: 支持Markdown、JSON、图片格式

## 🏗️ 项目架构

```
├── packages/
│   ├── web/          # React前端应用
│   ├── server/       # Node.js后端API
│   ├── utils/        # 共享工具函数
│   └── logger/       # 公共日志模块
├── docs/             # 项目文档
└── README.md
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 确保使用pnpm
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 2. 环境配置

```bash
# 复制环境变量模板
cp env.example .env

# 编辑环境变量，设置AI API密钥
vim .env
```

### 3. 启动开发环境

```bash
# 同时启动前后端
pnpm dev

# 或者分别启动
pnpm dev:server  # 后端: http://localhost:3001
pnpm dev:web     # 前端: http://localhost:5173
```

## 📋 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `AI_PROVIDER` | AI提供商 | `openai` |
| `OPENAI_API_KEY` | OpenAI API密钥 | `sk-xxx` |
| `PORT` | 服务器端口 | `3001` |
| `CORS_ORIGIN` | 允许的跨域来源 | `http://localhost:5173` |

## 🛠️ 开发命令

```bash
# 构建所有包
pnpm build

# 运行类型检查
pnpm type-check

# 代码检查和修复
pnpm lint
pnpm lint:fix

# 清理构建文件
pnpm clean
```

## 📖 使用流程

1. **输入内容**: 粘贴文章或上传PDF文件
2. **AI分析**: 自动分割段落，提取关键信息
3. **生成卡片**: 基于分析结果生成SVG卡片
4. **实时编辑**: 调整标题、内容、样式
5. **预览导出**: 选择格式导出最终内容

## 🔧 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS + Zustand
- **后端**: Node.js + Express + Vercel AI SDK
- **工具**: Vite + pnpm workspace + ESLint + Prettier

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目！ 