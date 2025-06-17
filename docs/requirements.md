## 小红书内容生成器需求文档（草稿）

### 1. 简介：

这个项目的目标很明确：给一篇文章，它就能自动拆解出小红书风格的图文内容。

换句话说，我想做个“你写长文，我帮你变成爆款小红书图文”的自动工具。

理想使用体验：

- 你输入一段文章（比如游记、种草、穿搭心得）或上传 PDF
- 系统自动：划分段落 → 提取重点 → 每段生成可视卡片（SVG）→ 自动生成标题/emoji/标签
- 最后把这些内容排成小红书那种图文风格，预览一套完整内容草稿

用例场景：自媒体博主、品牌编辑、AI 玩具爱好者

---

### 2. 功能：

#### 💬 主交互界面（Chat-style）

样式参考 ChatGPT：左侧为输入栏 + 历史记录，右侧为响应内容渲染区域

用户在对话框中输入长文、笔记或上传 PDF

系统以对话流形式逐步回应并展示结果

渲染 SVG 卡片过程中逐段展示（流式生成）

用户可手动插入/修改提示内容，引导 AI 输出特定风格

#### 📝 原文输入区

- 输入文章，可以是 markdown / 纯文本 / 带结构内容 / 上传 PDF
- 支持直接粘贴 + 拖拽文件上传

#### 📖 内容分析器

- 自动划分段落（按逻辑，不只是按换行）
- 提取每段关键句（提炼核心信息）

#### 🖼️ 可视卡片渲染器（SVG）

- 每段内容生成一张带文字的卡片
- 使用 SVG 渲染，不依赖大模型图像生成
- 卡片内容包括背景图形、文字、emoji、段落摘要等
- 可参考：

  - [https://mp.weixin.qq.com/s/vHN4MeX85wGHBzxYOgqygQ](https://mp.weixin.qq.com/s/vHN4MeX85wGHBzxYOgqygQ)
  - [https://mp.weixin.qq.com/s/OKjy1U9nSpRVN1Jg0YyQjw](https://mp.weixin.qq.com/s/OKjy1U9nSpRVN1Jg0YyQjw)

#### 🎯 标题 & emoji 生成器

- 根据整篇内容生成 2\~3 个爆款风格标题
- 自动插入相关 emoji、tag、号召语（如“收藏不亏✅”）

#### 🖼️ 图文合成预览区

- 卡片式图 + 文字结构，模仿小红书的图文流
- 可切换预览模式：手机框展示 / 网页模式

#### 📦 导出功能

- 保存为 markdown / JSON 草稿
- SVG 可导出为图片（png/jpg）或保留原始 XML

#### 🎲 灵感骰子（增强项）

- 提供“图文风格灵感”，激发写作思路

---

### 3. 架构形态（新增）

系统分为两大部分：

#### 🌐 Web 前端（用户交互层）

- 技术栈：React + TypeScript + Tailwind
- 功能：文章输入、PDF 上传、状态控制、预览界面渲染
- 与后端交互：通过 API 调用发送原始文本 / 文件，接收 SVG 数据

#### 🔧 Web 后端（任务处理层）

- 技术栈：Node.js + Express / Vercel API Routes
- 功能：

  - 解析用户上传内容（PDF → 文本）
  - 调用 OpenAI GPT 进行段落分析、摘要提取、标题生成等
  - 生成 SVG 描述结构（或模板渲染结果）
  - 返回给前端渲染展示

---

### 4. 约束（技术 + 实现层）

#### 工程约定：

- 使用 `pnpm` 作为包管理器，统一依赖版本与 workspace 管理
- 支持多模型后端切换：可使用 OpenAI、Gemini、Claude，通过 `.env` 配置 `AI_PROVIDER`
- 所有模型调用统一封装为 `vercel/ai` SDK 的 `ask` 接口形式，方便模型切换与 prompt 调试

#### 技术栈：

- 前端：TypeScript + React + Tailwind + Zustand
- 可视化：Framer Motion（动效）+ SVG 动态渲染 + HTML2Canvas（导出）
- 后端：Node.js 服务端 + OpenAI GPT 接口
- AI 接口：只使用 OpenAI 文本模型（gpt-4o），**不再使用图像生成模型**

#### 规范建议：

- 全项目 TypeScript，严格类型提示
- 状态逻辑集中用 Zustand 管理，不要组件乱搞 useState
- Prompt 模板要写成可复用结构，单独管理

---

### 5. 其他细节（可选）

#### SVG 卡片渲染：

- 每段卡片包括：主标题、emoji、段落摘要、背景色块或纹理
- 支持模糊图形/抽象插图/符号图标组合
- 图像采用组合式设计，灵感来源如 Notion Cover 生成器、小红书海报组件

#### 文本 → 卡片结构的规则：

- 每段生成结构：

  ```ts
  {
    title: string, // 段标题（可选）
    summary: string, // 提炼内容
    emoji: string, // 与内容情绪相符的 emoji
    tags: string[],
    stylePreset: string // 可视风格模板名
  }
  ```

#### 多语言支持（可选）

- 输入可以是中文，但卡片内容支持中英混排
- 标题可启用“简体/繁体/EN”等切换方案

---

就这样，先把骨架搭起来，边写边调 vibe。
