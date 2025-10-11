/**
 * 全自动视频录制脚本 - Playwright版本
 *
 * 特点：
 * - 自动录制屏幕+音频
 * - 后台运行，不影响用户操作其他窗口
 * - 使用Playwright内置视频录制功能
 * - 事件驱动，完美同步虚拟人语音
 *
 * 使用方法：
 * node auto-record-playwright.js <课程URL>
 *
 * 例如：
 * node auto-record-playwright.js https://cherishwy1974.github.io/123/01_1.1_指数的概念与运算.html
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// 配置
const CONFIG = {
  // 视频输出目录
  OUTPUT_DIR: './recordings',

  // 录制配置
  VIDEO_SIZE: {
    width: 1920,
    height: 1080,
  },

  // 浏览器配置
  BROWSER_OPTIONS: {
    headless: false, // 显示浏览器窗口（可设为false查看过程）
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--autoplay-policy=no-user-gesture-required',
    ],
  },

  // 录制超时时间（毫秒）
  MAX_RECORDING_TIME: 30 * 60 * 1000, // 30分钟
};

/**
 * 等待指定时间
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 主录制函数
 */
async function recordLesson(courseURL) {
  console.log('🎬 开始全自动录制课程...');
  console.log(`📄 课程URL: ${courseURL}`);

  // 创建输出目录
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }

  // 从URL提取课程名称
  const urlPath = new URL(courseURL).pathname;
  const lessonName = path.basename(urlPath, '.html');
  const outputPath = path.join(CONFIG.OUTPUT_DIR, `${lessonName}.webm`);

  console.log(`💾 输出文件: ${outputPath}`);
  console.log('');
  console.log('⚙️  启动浏览器（后台录制模式）...');

  // 启动浏览器
  const browser = await chromium.launch(CONFIG.BROWSER_OPTIONS);

  // 创建上下文并启用视频录制
  const context = await browser.newContext({
    viewport: CONFIG.VIDEO_SIZE,
    recordVideo: {
      dir: CONFIG.OUTPUT_DIR,
      size: CONFIG.VIDEO_SIZE,
    },
    // 允许音频捕获
    permissions: ['microphone'],
  });

  const page = await context.newPage();

  try {
    console.log('📖 加载课程页面...');
    await page.goto(courseURL, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    console.log('✅ 页面加载完成');
    await sleep(2000);

    // 等待虚拟人SDK加载
    console.log('⏳ 等待虚拟人SDK加载...');
    await page.waitForFunction(() => typeof AvatarPlatform !== 'undefined', {
      timeout: 30000,
    });
    console.log('✅ SDK已加载');

    await sleep(1000);

    // 点击启动按钮
    console.log('🚀 启动虚拟人...');
    await page.click('#startBtn');

    // 等待虚拟人连接成功
    console.log('⏳ 等待虚拟人连接...');
    await page.waitForFunction(
      () => {
        const statusIndicator = document.getElementById('statusIndicator');
        return statusIndicator && statusIndicator.textContent === '已连接';
      },
      { timeout: 30000 }
    );
    console.log('✅ 虚拟人连接成功');

    await sleep(2000);

    // 点击自动播放按钮
    console.log('🎬 启动自动播放...');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🎥 录制进行中...');
    console.log('  💡 现在可以自由操作其他窗口');
    console.log('  ⏳ 等待课程自动播放完成');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    await page.click('#autoPlayBtn');

    // 监听控制台日志
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('🎬') || text.includes('✅') || text.includes('📖')) {
        console.log(`[课程] ${text}`);
      }
    });

    // 等待自动播放完成
    console.log('⏳ 监听播放状态...');
    await page.waitForFunction(
      () => {
        const autoPlayBtn = document.getElementById('autoPlayBtn');
        return autoPlayBtn && autoPlayBtn.textContent === '🎬 自动播放';
      },
      { timeout: CONFIG.MAX_RECORDING_TIME }
    );

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✅ 课程播放完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // 额外等待确保视频结束
    await sleep(3000);

  } catch (error) {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('  ❌ 录制过程出错');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
    console.error('错误详情:', error.message);

    if (error.message.includes('Timeout')) {
      console.error('');
      console.error('💡 提示：录制超时，可能是：');
      console.error('   - 课程太长（超过30分钟）');
      console.error('   - 虚拟人连接失败');
      console.error('   - 网络问题');
    }
  } finally {
    // 关闭浏览器（自动保存视频）
    console.log('⏹️  停止录制并保存视频...');
    await context.close();
    await browser.close();

    // 查找生成的视频文件
    const files = fs.readdirSync(CONFIG.OUTPUT_DIR);
    const videoFile = files.find(f => f.endsWith('.webm'));

    if (videoFile) {
      const generatedPath = path.join(CONFIG.OUTPUT_DIR, videoFile);
      const finalPath = outputPath;

      // 重命名为目标文件名
      if (generatedPath !== finalPath) {
        fs.renameSync(generatedPath, finalPath);
      }

      const stats = fs.statSync(finalPath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  ✅ 录制完成！');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log(`📁 视频文件: ${finalPath}`);
      console.log(`📊 文件大小: ${fileSizeMB} MB`);
      console.log('');
      console.log('💡 提示：视频格式为 WebM');
      console.log('   如需MP4格式，可用FFmpeg转换：');
      console.log(`   ffmpeg -i "${finalPath}" -c:v copy "${finalPath.replace('.webm', '.mp4')}"`);
      console.log('');
    } else {
      console.log('');
      console.log('⚠️  警告：未找到录制的视频文件');
      console.log(`    请检查目录: ${CONFIG.OUTPUT_DIR}`);
      console.log('');
    }
  }
}

// 命令行参数
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ 请提供课程URL');
  console.error('');
  console.error('用法: node auto-record-playwright.js <课程URL>');
  console.error('');
  console.error('示例:');
  console.error('  node auto-record-playwright.js https://cherishwy1974.github.io/123/01_1.1_指数的概念与运算.html');
  console.error('');
  process.exit(1);
}

const courseURL = args[0];

// 验证URL格式
if (!courseURL.startsWith('http://') && !courseURL.startsWith('https://')) {
  console.error('❌ 请提供有效的HTTP/HTTPS URL');
  console.error(`   收到的参数: ${courseURL}`);
  console.error('');
  process.exit(1);
}

// 开始录制
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  🎬 全自动课程录制系统');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

recordLesson(courseURL).catch(error => {
  console.error('');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('  ❌ 录制失败');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('');
  console.error('错误:', error);
  console.error('');
  process.exit(1);
});
