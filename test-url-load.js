/**
 * 测试URL加载 - 快速验证脚本能否正确加载在线URL
 * 不进行实际录制，只测试到SDK加载
 */

const puppeteer = require('puppeteer');

async function testURLLoad(url) {
  console.log('🧪 测试URL加载功能...');
  console.log(`📄 目标URL: ${url}`);

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--window-size=1920,1080',
      '--autoplay-policy=no-user-gesture-required',
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });

  const page = await browser.newPage();

  try {
    console.log('📖 加载页面...');
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    console.log('✅ 页面加载成功！');

    // 等待SDK加载
    console.log('⏳ 等待虚拟人SDK加载...');
    await page.waitForFunction(
      () => typeof AvatarPlatform !== 'undefined',
      { timeout: 30000 }
    );

    console.log('✅ SDK加载成功！');

    // 检查关键元素
    const hasStartBtn = await page.$('#startBtn');
    const hasAutoPlayBtn = await page.$('#autoPlayBtn');

    console.log(`✅ 启动按钮: ${hasStartBtn ? '存在' : '❌ 缺失'}`);
    console.log(`✅ 自动播放按钮: ${hasAutoPlayBtn ? '存在' : '❌ 缺失'}`);

    console.log('\n🎉 测试通过！脚本可以正常加载在线URL。');
    console.log('💡 现在可以使用 auto-record.js 进行完整录制了。');

    // 等待5秒让用户查看
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
  }
}

// 使用示例URL
const testURL = process.argv[2] || 'https://cherishwy1974.github.io/123/01_1.1_指数的概念与运算.html';

testURLLoad(testURL).catch(error => {
  console.error('❌ 测试出错:', error);
  process.exit(1);
});
