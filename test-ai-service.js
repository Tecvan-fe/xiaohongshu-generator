const { config } = require('dotenv');
config();

// 测试内容
const testContent = `
人工智能正在改变我们的生活方式。从智能手机到自动驾驶汽车，AI技术无处不在。

机器学习算法能够分析大量数据，找出人类无法发现的模式。深度学习网络模仿人脑的神经元结构。

在医疗领域，AI可以帮助医生诊断疾病，提高诊断准确率。在金融行业，算法交易已经成为主流。

然而，AI的发展也带来了一些挑战，比如隐私保护和就业问题。我们需要谨慎考虑AI的伦理问题。

未来，人工智能将继续发展，可能会实现通用人工智能（AGI）。这将彻底改变人类社会的运作方式。
`;

async function testAIService() {
  try {
    console.log('🚀 开始测试AI服务...\n');

    // 测试不同的语言风格
    const styles = [
      { name: '小红书风格', value: 'xiaohongshu' },
      { name: '简约风格', value: 'minimal' },
      { name: '严谨科学', value: 'scientific' },
      { name: '商务专业', value: 'professional' },
      { name: '轻松日常', value: 'casual' },
      { name: '文艺优雅', value: 'literary' },
    ];

    for (const style of styles) {
      console.log(`\n📝 测试${style.name}...`);

      const response = await fetch('http://localhost:3000/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testContent,
          style: style.value,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ ${style.name}测试失败:`, response.status, errorText);
        continue;
      }

      const result = await response.json();

      if (result.success && result.data) {
        console.log(`✅ ${style.name}测试成功!`);
        console.log(`   生成了 ${result.data.length} 个卡片`);

        // 显示每个卡片的标题和内容预览
        result.data.forEach((card, index) => {
          console.log(`   卡片${index + 1}: ${card.summary}`);
          console.log(`   内容: ${card.content.substring(0, 50)}...`);
          console.log(`   标签: ${card.tags.join(', ')}`);
          console.log(`   风格模板: ${card.stylePreset.template}`);
          console.log('');
        });
      } else {
        console.error(`❌ ${style.name}测试失败:`, result.error || '未知错误');
      }
    }

    console.log('\n🎯 测试特定风格的标题生成...');

    // 测试标题生成
    const titleResponse = await fetch('http://localhost:3000/api/ai/titles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testContent,
        style: 'xiaohongshu',
      }),
    });

    if (titleResponse.ok) {
      const titleResult = await titleResponse.json();
      if (titleResult.success && titleResult.data) {
        console.log('✅ 标题生成测试成功!');
        console.log('生成的标题:');
        titleResult.data.titles.forEach((title, index) => {
          console.log(`   ${index + 1}. ${title}`);
        });
      }
    }

    console.log('\n🎉 所有测试完成!');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testAIService();
