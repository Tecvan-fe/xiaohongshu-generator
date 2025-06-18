import { createLogger } from '@xiaohongshu/logger';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import type { ProcessedParagraph, TitleOptions, CardData } from '@xiaohongshu/utils';

const logger = createLogger({ service: 'ai-service' });

class AIService {
  private checkApiKey() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      logger.error('OpenAI API密钥未配置');
      throw new Error('AI API密钥未配置');
    }
    logger.info('OpenAI API密钥已配置', {
      keyPrefix: apiKey.substring(0, 7) + '...',
    });
    return apiKey;
  }

  async analyzeContent(text: string, style: string = 'xiaohongshu'): Promise<ProcessedParagraph[]> {
    logger.info('开始AI内容分析', {
      textLength: text.length,
      textPreview: text.substring(0, 100) + '...',
      languageStyle: style,
    });

    // 根据语言风格生成不同的prompt指令
    const getStylePrompt = (languageStyle: string) => {
      const stylePrompts: Record<
        string,
        {
          description: string;
          features: string[];
          examples: string[];
          contentRules: string[];
        }
      > = {
        xiaohongshu: {
          description: '你是一个专业的小红书内容创作专家',
          features: [
            '使用"姐妹们"、"宝子们"、"集美们"等亲切称呼',
            '多用感叹号表达情绪',
            '善用数字和具体描述（"3个方法"、"5分钟搞定"）',
            '制造悬念和好奇心（"你绝对想不到"、"真的太绝了"）',
            '使用网络流行语和年轻化表达',
            '强调实用性和干货属性（"超实用"、"必收藏"、"不踩雷"）',
          ],
          examples: ['姐妹们必看！', '宝子们冲！', '真的绝绝子', '超实用干货'],
          contentRules: [
            '每个卡片内容要完全重新创作，不能直接复制原文',
            '要提炼核心观点，用小红书的语言重新表达',
            '增加个人感受和体验描述',
            '使用具体的场景和案例说明',
          ],
        },
        minimal: {
          description: '你是一个简约风格的内容创作专家',
          features: [
            '语言简洁明了，避免冗余表达',
            '突出重点，层次分明',
            '使用简单直接的表述',
            '避免过多的修饰词',
            '注重逻辑性和条理性',
            '用词精准，一针见血',
          ],
          examples: ['重点总结', '简单易懂', '一目了然', '核心要点'],
          contentRules: [
            '提炼最核心的信息点',
            '去除冗余描述，保留关键内容',
            '用最简洁的语言表达完整意思',
            '突出实用性和可操作性',
          ],
        },
        scientific: {
          description: '你是一个严谨科学的内容创作专家',
          features: [
            '使用准确的数据和事实支撑',
            '逻辑严密，论证充分',
            '使用专业术语，但保持可理解性',
            '引用权威资料和研究',
            '避免主观色彩浓厚的表达',
            '注重客观性和可验证性',
          ],
          examples: ['研究表明', '数据显示', '科学分析', '实验证明'],
          contentRules: [
            '基于事实和数据重新组织内容',
            '添加逻辑分析和因果关系',
            '使用准确的专业术语',
            '保持客观中立的表达方式',
          ],
        },
        professional: {
          description: '你是一个商务专业的内容创作专家',
          features: [
            '使用正式的商务语言',
            '强调专业性和权威性',
            '结构化表达，条理清晰',
            '使用商务术语和行业标准',
            '注重效率和实用性',
            '体现专业素养和深度思考',
          ],
          examples: ['专业分析', '深度解读', '战略思考', '行业洞察'],
          contentRules: [
            '从商务角度重新解读内容',
            '突出专业价值和实际应用',
            '使用结构化的表达方式',
            '体现深度思考和专业见解',
          ],
        },
        casual: {
          description: '你是一个轻松日常的内容创作专家',
          features: [
            '使用轻松自然的口语化表达',
            '贴近生活，容易理解',
            '语调亲切友好',
            '避免过于正式的表达',
            '注重情感共鸣',
            '营造轻松愉快的阅读体验',
          ],
          examples: ['分享一下', '简单聊聊', '随便说说', '生活小贴士'],
          contentRules: [
            '用日常生活的语言重新表达',
            '增加个人体验和感受',
            '使用生活化的比喻和例子',
            '营造轻松愉快的阅读氛围',
          ],
        },
        literary: {
          description: '你是一个文艺优雅的内容创作专家',
          features: [
            '使用优美文雅的表达',
            '注重文字的韵律和美感',
            '适当使用修辞手法',
            '营造诗意和意境',
            '用词考究，富有文采',
            '体现深层的思考和感悟',
          ],
          examples: ['细品慢读', '如诗如画', '意境深远', '文采飞扬'],
          contentRules: [
            '用优美的文字重新演绎内容',
            '增加意境和情感色彩',
            '适当使用修辞手法',
            '体现深层次的思考和感悟',
          ],
        },
      };

      return stylePrompts[languageStyle] || stylePrompts.xiaohongshu;
    };

    const styleConfig = getStylePrompt(style);

    const prompt = `
你是${styleConfig.description}。请深度分析以下原始内容，然后创作出适合该风格的小红书图文卡片内容。

⚠️ 重要要求：
1. 不要直接复制原文内容，必须重新创作
2. 要深度理解原文含义，然后用该风格重新表达
3. 每个卡片都要有独立的主题和价值
4. 确保内容有吸引力和传播性

原始内容：
${text}

请按照以下JSON格式严格返回分析结果（只返回JSON，不要其他内容）：
{
  "paragraphs": [
    {
      "id": "card_1",
      "content": "重新创作的卡片内容（50-120字，不要直接复制原文）",
      "order": 1,
      "type": "text",
      "keyPoints": ["从原文提炼的关键点1", "从原文提炼的关键点2"],
      "summary": "有吸引力的标题（8-15字，不要直接使用原文标题）",
      "emoji": "相关emoji",
      "tags": ["标签1", "标签2", "标签3"],
      "stylePreset": {
        "id": "style_1",
        "name": "风格名称",
        "backgroundColor": "#颜色代码",
        "textColor": "#颜色代码", 
        "accentColor": "#颜色代码",
        "fontFamily": "字体",
        "fontSize": 16,
        "borderRadius": 12,
        "padding": 24,
        "template": "minimal或colorful或elegant或playful"
      }
    }
  ]
}

创作规则：

📝 内容重新创作要求：
${styleConfig.contentRules.map((rule: string) => `- ${rule}`).join('\n')}

🎯 ${styleConfig.description.replace('你是一个', '').replace('的内容创作专家', '')}风格特点：
${styleConfig.features.map((feature: string) => `- ${feature}`).join('\n')}

💡 表达方式示例：
${styleConfig.examples.map((example: string) => `- "${example}"`).join('\n')}

🔄 内容转换策略：
1. 深度理解：先理解原文的核心观点和价值
2. 主题提炼：将内容分解为3-6个独立主题
3. 风格转换：用目标风格重新表达每个主题
4. 价值增强：增加该风格用户关心的价值点
5. 吸引力优化：确保标题和内容有点击欲望

🏷️ 标签策略：
- 热门话题标签（当下流行的话题）
- 垂直领域标签（具体领域相关）
- 行为引导标签（收藏、分享、关注等）
- 情感共鸣标签（治愈、励志、惊喜等）

🎨 视觉风格选择：
- minimal: 知识科普、教程攻略类内容
- colorful: 美食旅行、时尚生活类内容
- elegant: 文艺情感、读书分享类内容  
- playful: 搞笑娱乐、日常生活类内容

📐 颜色方案推荐：
- 温暖生活系：#FFF8F0, #8B4513, #FF6B35
- 清新自然系：#F0FDF4, #1F2937, #10B981
- 梦幻时尚系：#FDF2F8, #1F2937, #EC4899
- 专业知识系：#F8FAFC, #1F2937, #3B82F6
- 活力励志系：#FFFBEB, #1F2937, #F59E0B

最终要求：
✅ 每张卡片都是独立有价值的内容
✅ 标题要有点击欲望和传播性
✅ 内容要符合选择的语言风格
✅ 生成3-6张卡片，质量优于数量
✅ 确保没有直接复制原文的情况
`;

    try {
      this.checkApiKey();

      logger.info('准备调用OpenAI API进行内容分析', {
        model: 'gpt-4o-mini',
        temperature: 0.8,
        promptLength: prompt.length,
      });

      const startTime = Date.now();

      const result = await generateText({
        model: openai('gpt-4o-mini'),
        prompt,
        temperature: 0.8,
      });

      const duration = Date.now() - startTime;

      logger.info('OpenAI API调用成功', {
        duration: `${duration}ms`,
        responseLength: result.text.length,
        usage: result.usage || 'N/A',
        finishReason: result.finishReason || 'N/A',
      });

      const content = result.text.trim();
      logger.info('AI响应内容', {
        responseLength: content.length,
        responsePreview: content.substring(0, 200) + '...',
        languageStyle: style,
      });

      // 解析JSON响应
      let parsedResult;
      try {
        // 尝试提取JSON内容
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('未找到有效的JSON响应');
        }

        parsedResult = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        logger.error('JSON解析失败', {
          content: content.substring(0, 500) + '...',
          error: parseError,
        });
        throw new Error('AI响应格式错误，请稍后重试');
      }

      if (!parsedResult.paragraphs || !Array.isArray(parsedResult.paragraphs)) {
        throw new Error('AI响应缺少paragraphs字段');
      }

      // 验证和清理数据
      const processedParagraphs = parsedResult.paragraphs
        .filter((p: any) => p && p.content && p.summary)
        .slice(0, 6) // 最多6个段落
        .map((paragraph: any, index: number) => ({
          id: paragraph.id || `generated_${index + 1}`,
          content: paragraph.content,
          order: paragraph.order || index + 1,
          type: paragraph.type || 'text',
          keyPoints: Array.isArray(paragraph.keyPoints) ? paragraph.keyPoints : [],
          summary: paragraph.summary,
          emoji: paragraph.emoji || '✨',
          tags: Array.isArray(paragraph.tags) ? paragraph.tags : [],
          stylePreset: {
            id: paragraph.stylePreset?.id || `style_${index + 1}`,
            name: paragraph.stylePreset?.name || '默认风格',
            backgroundColor: paragraph.stylePreset?.backgroundColor || '#FFFFFF',
            textColor: paragraph.stylePreset?.textColor || '#1F2937',
            accentColor: paragraph.stylePreset?.accentColor || '#3B82F6',
            fontFamily: paragraph.stylePreset?.fontFamily || 'Inter',
            fontSize: paragraph.stylePreset?.fontSize || 16,
            borderRadius: paragraph.stylePreset?.borderRadius || 12,
            padding: paragraph.stylePreset?.padding || 24,
            template: paragraph.stylePreset?.template || 'minimal',
          },
        }));

      if (processedParagraphs.length === 0) {
        throw new Error('未能生成有效的段落内容');
      }

      logger.info('内容分析完成', {
        paragraphCount: processedParagraphs.length,
        languageStyle: style,
        summaries: processedParagraphs.map((p: any) => p.summary),
      });

      return processedParagraphs;
    } catch (error) {
      logger.error('AI调用失败', { error });

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('内容分析失败，请稍后重试');
    }
  }

  async generateTitles(text: string, style: string = 'xiaohongshu'): Promise<TitleOptions> {
    logger.info('开始AI标题生成', {
      textLength: text.length,
      textPreview: text.substring(0, 100) + '...',
      languageStyle: style,
    });

    // 根据语言风格生成不同的标题策略
    const getStyleTitlePrompt = (languageStyle: string) => {
      const stylePrompts: Record<
        string,
        {
          description: string;
          titleRules: string[];
          examples: string[];
          keywords: string[];
        }
      > = {
        xiaohongshu: {
          description: '小红书爆款标题专家',
          titleRules: [
            '控制在5-12字之间，每个字都有价值',
            '使用数字增加可信度（"3个秘诀"、"5分钟学会"）',
            '制造悬念和好奇心（"你绝对想不到"、"真相竟然是"）',
            '突出实用性（"必收藏"、"不踩雷"、"超实用"）',
            '使用感叹词增加情感（"太绝了！"、"爱了爱了"）',
          ],
          examples: [
            '3个秘诀超实用！',
            '绝绝子必收藏',
            '5分钟学会这招',
            '太香了不踩雷',
            '干货满满冲！',
          ],
          keywords: [
            '绝绝子',
            '爱了',
            '太香了',
            '干货',
            '攻略',
            '秘诀',
            '必看',
            '必收藏',
            '冲冲冲',
            '超级',
            '巨好用',
          ],
        },
        minimal: {
          description: '简约风格标题专家',
          titleRules: [
            '语言简洁明了，去除冗余词汇',
            '突出核心价值和重点',
            '使用精准的动词和名词',
            '避免过多修饰词和感叹号',
            '控制在6-10字，言简意赅',
          ],
          examples: [
            '核心要点总结',
            '简单易懂指南',
            '重点知识梳理',
            '实用方法介绍',
            '关键信息整理',
          ],
          keywords: [
            '要点',
            '总结',
            '指南',
            '方法',
            '技巧',
            '介绍',
            '分析',
            '解读',
            '整理',
            '梳理',
          ],
        },
        scientific: {
          description: '严谨科学标题专家',
          titleRules: [
            '使用准确的专业术语',
            '突出数据和研究支撑',
            '保持客观中立的表达',
            '强调逻辑性和可验证性',
            '控制在8-15字，体现专业性',
          ],
          examples: [
            '数据分析报告',
            '研究结果解读',
            '科学方法验证',
            '实验数据分析',
            '理论依据说明',
          ],
          keywords: [
            '分析',
            '研究',
            '数据',
            '实验',
            '理论',
            '方法',
            '验证',
            '报告',
            '结果',
            '依据',
            '科学',
          ],
        },
        professional: {
          description: '商务专业标题专家',
          titleRules: [
            '使用正式的商务语言',
            '突出专业价值和效率',
            '体现深度思考和洞察',
            '使用行业标准术语',
            '控制在8-12字，显示权威性',
          ],
          examples: [
            '专业分析报告',
            '行业深度解读',
            '战略思考总结',
            '商业洞察分享',
            '专家观点汇总',
          ],
          keywords: [
            '专业',
            '分析',
            '战略',
            '洞察',
            '解读',
            '思考',
            '观点',
            '总结',
            '报告',
            '深度',
            '行业',
          ],
        },
        casual: {
          description: '轻松日常标题专家',
          titleRules: [
            '使用亲切自然的口语表达',
            '贴近生活，容易理解',
            '营造轻松愉快的氛围',
            '避免过于正式的词汇',
            '控制在6-10字，亲切友好',
          ],
          examples: ['生活小贴士', '随便聊聊这个', '简单分享一下', '日常小发现', '轻松学一学'],
          keywords: [
            '分享',
            '聊聊',
            '小贴士',
            '发现',
            '体验',
            '感受',
            '日常',
            '生活',
            '简单',
            '轻松',
            '随便',
          ],
        },
        literary: {
          description: '文艺优雅标题专家',
          titleRules: [
            '使用优美文雅的表达',
            '注重文字的韵律和美感',
            '营造诗意和意境',
            '体现深层思考和感悟',
            '控制在6-12字，富有文采',
          ],
          examples: [
            '细品慢读心得',
            '文字间的思考',
            '静谧时光感悟',
            '书香墨韵品味',
            '优雅生活随笔',
          ],
          keywords: [
            '品味',
            '感悟',
            '思考',
            '细品',
            '静谧',
            '优雅',
            '随笔',
            '心得',
            '韵味',
            '诗意',
            '意境',
          ],
        },
      };

      return stylePrompts[languageStyle] || stylePrompts.xiaohongshu;
    };

    const styleConfig = getStyleTitlePrompt(style);

    const prompt = `
你是${styleConfig.description}！请为以下内容创作3个符合该风格的标题。

内容概要：
${text}

请按照以下JSON格式严格返回结果（只返回JSON，不要其他内容）：
{
  "titles": ["标题1", "标题2", "标题3"],
  "selectedIndex": 0
}

🎯 ${styleConfig.description.replace('专家', '')}标题创作规则：
${styleConfig.titleRules.map((rule: string) => `- ${rule}`).join('\n')}

💡 风格特色词汇：
${styleConfig.keywords.map((keyword: string) => `"${keyword}"`).join('、')}

📝 标题示例参考：
${styleConfig.examples.map((example: string) => `- "${example}"`).join('\n')}

✨ 创作要求：
1. 三个标题要有不同的角度和表达方式
2. 第一个标题设为默认选中(selectedIndex: 0)
3. 每个标题都要体现所选语言风格的特点
4. 标题要与内容相关，避免标题党
5. 确保标题符合该风格用户的阅读习惯

请基于内容特点和所选风格，创作出最适合的标题！
`;

    try {
      this.checkApiKey();

      logger.info('准备调用OpenAI API进行标题生成', {
        model: 'gpt-4o-mini',
        temperature: 0.9,
        promptLength: prompt.length,
        languageStyle: style,
      });

      const startTime = Date.now();

      const result = await generateText({
        model: openai('gpt-4o-mini'),
        prompt,
        temperature: 0.9,
      });

      const duration = Date.now() - startTime;

      logger.info('OpenAI API调用成功', {
        duration: `${duration}ms`,
        responseLength: result.text.length,
        usage: result.usage || 'N/A',
        finishReason: result.finishReason || 'N/A',
      });

      // 解析JSON响应
      let parsedResult;
      try {
        // 尝试提取JSON内容
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('未找到有效的JSON响应');
        }

        parsedResult = JSON.parse(jsonMatch[0]);
        logger.info('JSON解析成功', {
          titleCount: parsedResult.titles?.length || 0,
          selectedIndex: parsedResult.selectedIndex,
          titles: parsedResult.titles,
        });
      } catch (parseError) {
        logger.error('JSON解析失败', {
          error: parseError,
          rawResponse: result.text.substring(0, 500) + '...',
        });
        throw new Error('AI响应格式错误，请稍后重试');
      }

      if (!parsedResult.titles || !Array.isArray(parsedResult.titles)) {
        throw new Error('AI响应缺少titles字段');
      }

      // 验证标题数量和格式
      if (parsedResult.titles.length === 0) {
        throw new Error('未能生成有效的标题');
      }

      logger.info('标题生成完成', {
        titleCount: parsedResult.titles.length,
        titles: parsedResult.titles,
        languageStyle: style,
        totalDuration: `${Date.now() - startTime}ms`,
      });

      return {
        titles: parsedResult.titles,
        selectedIndex: parsedResult.selectedIndex || 0,
      };
    } catch (error) {
      logger.error('标题生成失败', {
        error,
        textLength: text.length,
        languageStyle: style,
      });

      throw error instanceof Error ? error : new Error('标题生成失败，请稍后重试');
    }
  }

  async generateCards(paragraphs: ProcessedParagraph[]): Promise<CardData[]> {
    logger.info('开始生成卡片数据', { paragraphCount: paragraphs.length });

    // 将段落数据转换为卡片数据
    const cards: CardData[] = paragraphs.map((paragraph, index) => {
      logger.debug('处理段落卡片', {
        paragraphId: paragraph.id,
        order: index,
        summary: paragraph.summary,
        emoji: paragraph.emoji,
        tagCount: paragraph.tags.length,
      });

      return {
        id: paragraph.id,
        title: paragraph.summary,
        summary: paragraph.content.slice(0, 100) + '...',
        emoji: paragraph.emoji,
        tags: paragraph.tags,
        stylePreset: paragraph.stylePreset,
        order: index,
      };
    });

    logger.info('卡片数据生成完成', {
      cardCount: cards.length,
      cardIds: cards.map((c) => c.id),
    });

    return cards;
  }
}

export const aiService = new AIService();
