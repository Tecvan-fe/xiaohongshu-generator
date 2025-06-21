# 小红书卡片与文案生成系统 - 技术实现方案

## 一、系统架构设计

### 1.1 整体架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用       │    │   后端服务       │    │   外部服务       │
│  (React SPA)    │◄──►│ (Express Server)│◄──►│   (AI APIs)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   本地存储       │    │   内存会话       │
│  (LocalStorage)  │    │   (Session)     │
└─────────────────┘    └─────────────────┘
```

### 1.2 核心架构

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS
- **后端**：Express + TypeScript，无状态 RESTful API
- **AI 服务**：OpenAI GPT-4o 或 Claude 3
- **存储**：前端本地存储，后端内存会话（可选数据库）

---

## 二、核心功能模块

### 2.1 用户输入模块

**功能清单**

- 产品描述输入（必填，200字内）
- 内容类型选择：种草、测评、生活记录、对比
- 文案长度选择：短/中/长
- 卡片风格选择：清新、科技感、手账风、商务、萌趣
- 可选配置：场景描述、关键词、图片上传

**技术实现**

- React Hook Form + Zod 验证
- 文件上传组件（支持拖拽）
- 实时表单验证和错误提示

### 2.2 AI 文案生成

**Prompt 工程策略**

```javascript
const promptTemplates = {
  grass: `作为小红书种草博主，根据：${description}，生成${length}文案，要求真实感强、口语化、有标签`,
  review: `作为测评博主，客观分析${description}的优缺点...`,
  lifestyle: `分享${description}的生活体验...`,
  comparison: `对比分析${description}与同类产品...`,
};
```

**AI 服务集成**

- 支持 OpenAI GPT-4o 和 Claude 3 双引擎
- 自动重试机制，失败降级处理
- 内容安全过滤

### 2.3 SVG 卡片渲染

**布局系统**

- 海报版：750×1334 (9:16)
- 方形版：750×750 (1:1)
- 横版：1080×608 (16:9)

**风格主题**

```javascript
const themes = {
  fresh: { colors: ['#E8F5E8', '#4CAF50'], font: 'PingFang SC' },
  tech: { colors: ['#1A1A2E', '#0F3460'], font: 'SF Pro Display' },
  handbook: { colors: ['#FFF8E1', '#F57C00'], font: 'Comic Sans' },
  business: { colors: ['#FAFAFA', '#424242'], font: 'Roboto' },
  cute: { colors: ['#FFF0F5', '#FF69B4'], font: 'Comic Sans' },
};
```

**动态组件**

- 参数化标题、副标题渲染
- 背景图案和装饰元素
- 图标库集成（可选上传图片）

### 2.4 预览与导出

**实时预览**

- 文案和卡片同步预览
- 响应式布局适配
- 编辑状态管理

**导出功能**

- SVG 格式直接下载
- PNG 高清图片转换
- 文案文本复制
- 小红书草稿格式（JSON）

---

## 三、技术栈详细说明

### 3.1 前端技术栈

**核心框架**

- React 18.2+ with Concurrent Features
- TypeScript 5.0+ 严格类型检查
- Vite 5.0+ 开发构建工具

**UI 组件库**

- Tailwind CSS 3.4+ 样式框架
- Headless UI / Radix UI 无障碍组件
- Framer Motion 动画库

**状态管理**

- Zustand 轻量级状态管理
- TanStack Query 服务端状态
- React Hook Form 表单处理

**AI 集成**

- Vercel AI SDK React Hooks
- 支持流式内容显示
- 实时生成状态管理

### 3.2 后端技术栈

**核心框架**

- Express.js 4.18+ Web 框架
- TypeScript 5.0+ 类型安全
- Vercel AI SDK 统一AI模型调用

**中间件栈**

```javascript
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(helmet()); // 安全头部
app.use(compression()); // 响应压缩
app.use(rateLimit({ max: 100 })); // 请求限流
```

**API 设计**

- RESTful 规范：`/api/v1/generate`
- 统一响应格式：`{ code, message, data }`
- Swagger 文档自动生成

### 3.3 AI 服务集成

**Vercel AI SDK**

- 统一的 AI 模型调用接口
- 支持流式响应和实时生成
- 内置类型安全和错误处理
- 简化的提供商切换

**依赖安装**

```bash
npm install ai @ai-sdk/openai @ai-sdk/anthropic
```

**配置管理**

```javascript
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText, streamText } from 'ai';

const aiConfig = {
  providers: {
    openai: openai({
      apiKey: process.env.OPENAI_API_KEY,
    }),
    claude: anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    }),
  },
  models: {
    openai: 'gpt-4o',
    claude: 'claude-3-5-sonnet-20241022',
  },
  settings: {
    maxTokens: 1000,
    temperature: 0.7,
  },
};
```

**统一生成服务**

```javascript
export class AIService {
  async generateCopywriting(prompt: string, provider: 'openai' | 'claude' = 'openai') {
    try {
      const result = await generateText({
        model: aiConfig.providers[provider](aiConfig.models[provider]),
        prompt,
        maxTokens: aiConfig.settings.maxTokens,
        temperature: aiConfig.settings.temperature,
      });

      return result.text;
    } catch (error) {
      // 自动降级到备用模型
      if (provider === 'openai') {
        console.warn('OpenAI 调用失败，切换到 Claude:', error);
        return this.generateCopywriting(prompt, 'claude');
      }
      throw new Error('AI 生成失败，请稍后重试');
    }
  }

  // 流式生成支持实时反馈
  async streamGeneration(prompt: string, provider: 'openai' | 'claude' = 'openai') {
    const result = await streamText({
      model: aiConfig.providers[provider](aiConfig.models[provider]),
      prompt,
      maxTokens: aiConfig.settings.maxTokens,
    });

    return result.toAIStreamResponse();
  }
}
```

**Express 路由集成**

```javascript
// routes/generate.ts
import { AIService } from '../services/ai';

export async function generateHandler(req: Request, res: Response) {
  const { prompt, stream = false } = req.body;
  const aiService = new AIService();

  try {
    if (stream) {
      // 流式响应 - 实时生成反馈
      const streamResponse = await aiService.streamGeneration(prompt);
      res.setHeader('Content-Type', 'text/event-stream');
      return streamResponse.pipe(res);
    } else {
      // 常规响应
      const result = await aiService.generateCopywriting(prompt);
      res.json({
        code: 200,
        message: '生成成功',
        data: { text: result }
      });
    }
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message
    });
  }
}
```

**降级策略**

- 主引擎失败自动切换备用引擎
- 错误重试最多 3 次
- 超时保护（30 秒）
- 流式生成支持实时反馈

---

## 四、API 接口设计

### 4.1 核心接口

**生成接口**

```javascript
POST /api/v1/generate
{
  "input": {
    "description": "新款面膜产品",
    "contentType": "grass",
    "length": "medium",
    "cardStyle": "fresh",
    "keywords": ["补水", "保湿"]
  },
  "options": {
    "generateCopywriting": true,
    "generateCard": true,
    "stream": false  // 是否启用流式响应
  }
}

Response: {
  "code": 200,
  "message": "生成成功",
  "data": {
    "copywriting": "生成的文案内容...",
    "card": "SVG卡片内容...",
    "metadata": { "duration": 2500, "provider": "openai" }
  }
}
```

**流式生成接口**

```javascript
POST /api/v1/generate-stream
{
  "prompt": "小红书种草文案生成...",
  "provider": "openai"  // 可选，默认openai
}

// 流式响应 (Server-Sent Events)
data: {"type":"text","content":"今天给大家"}
data: {"type":"text","content":"安利一款"}
data: {"type":"text","content":"超好用的面膜"}
data: {"type":"done","usage":{"tokens":150}}
```

**文件上传**

```javascript
POST /api/v1/upload
Content-Type: multipart/form-data

Response: {
  "code": 200,
  "data": {
    "url": "https://cdn.example.com/image.jpg",
    "size": 1024000
  }
}
```

### 4.2 错误处理

**统一错误格式**

```javascript
{
  "code": 400,
  "message": "请求参数错误",
  "errors": [{ "field": "description", "message": "不能为空" }],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**状态码规范**

- 200：成功
- 400：参数错误
- 429：请求过频
- 500：服务器错误

---

## 五、部署方案

### 5.1 前端部署（Vercel）

**构建配置**

```json
{
  "builds": [{ "src": "package.json", "use": "@vercel/static-build" }],
  "routes": [{ "src": "/(.*)", "dest": "/index.html" }]
}
```

**环境变量**

```bash
VITE_API_BASE_URL=https://api.example.com
VITE_APP_NAME=小红书卡片生成器
```

### 5.2 后端部署（Railway/Render）

**Docker 配置**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**环境变量**

```bash
NODE_ENV=production
PORT=3000

# AI 服务配置
OPENAI_API_KEY=sk-...
CLAUDE_API_KEY=...
AI_DEFAULT_PROVIDER=openai

# 应用配置
CORS_ORIGIN=https://your-frontend.vercel.app
MAX_TOKENS=1000
TEMPERATURE=0.7
```

### 5.3 性能优化

**前端优化**

- 代码分割和懒加载
- 图片压缩和 WebP 格式
- CDN 静态资源加速

**后端优化**

- API 响应缓存（Redis 可选）
- 请求限流和防抖
- 压缩响应数据

**前端 AI 集成示例**

```typescript
// hooks/useAIGeneration.ts
import { useCompletion } from 'ai/react';

export function useAIGeneration() {
  const {
    completion,
    complete,
    isLoading,
    error,
    stop,
  } = useCompletion({
    api: '/api/v1/generate-stream',
    onFinish: (completion) => {
      console.log('生成完成:', completion);
    },
    onError: (error) => {
      console.error('生成失败:', error);
    },
  });

  const generateCopywriting = async (prompt: string) => {
    await complete(prompt);
  };

  return {
    content: completion,
    generate: generateCopywriting,
    isGenerating: isLoading,
    error,
    stop,
  };
}

// components/GenerationForm.tsx
export function GenerationForm() {
  const { content, generate, isGenerating, stop } = useAIGeneration();

  return (
    <div>
      {isGenerating && (
        <div className="flex items-center gap-2">
          <span>正在生成中...</span>
          <button onClick={stop}>停止</button>
        </div>
      )}

      <div className="whitespace-pre-wrap">{content}</div>
    </div>
  );
}
```

---

## 六、开发规范

### 6.1 代码质量

**工具配置**

- ESLint + Prettier 代码格式化
- Husky + lint-staged Git hooks
- TypeScript 严格模式

**测试策略**

- Vitest 单元测试
- React Testing Library 组件测试
- Jest + Supertest API 测试

### 6.2 文档规范

**API 文档**

- Swagger/OpenAPI 3.0 自动生成
- 接口示例和错误码说明
- 前后端协作文档

**代码注释**

- 函数和类的 JSDoc 注释
- 复杂逻辑的行内注释
- README 使用说明
