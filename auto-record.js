/**
 * 自动录制课程视频脚本
 *
 * 使用方法：
 * 1. 安装依赖: npm install puppeteer puppeteer-screen-recorder
 * 2. 运行: node auto-record.js <课程文件名>
 *
 * 例如: node auto-record.js 01_1.1_指数的概念与运算.html
 */

const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');
const fs = require('fs');

// 配置
const CONFIG = {
  // 视频输出目录
  OUTPUT_DIR: './recordings',

  // 录制配置
  RECORD_OPTIONS: {
    followNewTab: true,
    fps: 30,
    ffmpeg_Path: null, // 自动检测
    videoFrame: {
      width: 1920,
      height: 1080,
    },
    videoCrf: 23, // 视频质量 (18-28, 越小质量越好)
    videoCodec: 'libx264',
    videoPreset: 'medium',
    videoBitrate: 4000,
    audioCodec: 'aac',
    audioBitrate: '320k',
    autopad: {
      color: '#1a1a2e',
    },
  },

  // 浏览器配置
  BROWSER_OPTIONS: {
    headless: false, // 显示浏览器窗口
    args: [
      '--window-size=1920,1080',
      '--use-fake-ui-for-media-stream', // 自动允许麦克风/摄像头权限
      '--use-fake-device-for-media-stream',
      '--autoplay-policy=no-user-gesture-required', // 自动播放音频
      '--disable-blink-features=AutomationControlled',
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  },
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
async function recordLesson(htmlFile) {
  console.log('🎬 开始自动录制课程...');
  console.log(`📄 课程文件: ${htmlFile}`);

  // 创建输出目录
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }

  const lessonName = path.basename(htmlFile, '.html');
  const outputPath = path.join(CONFIG.OUTPUT_DIR, `${lessonName}.mp4`);
  const htmlPath = path.resolve(htmlFile);

  console.log(`💾 输出文件: ${outputPath}`);

  // 启动浏览器
  const browser = await puppeteer.launch(CONFIG.BROWSER_OPTIONS);
  const page = await browser.newPage();

  // 创建录制器
  const recorder = new PuppeteerScreenRecorder(page, CONFIG.RECORD_OPTIONS);

  try {
    // 加载课程页面
    console.log('📖 加载课程页面...');
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // 等待页面完全加载
    await sleep(3000);

    // 开始录制
    console.log('🔴 开始录制...');
    await recorder.start(outputPath);

    // 等待虚拟人SDK加载
    await page.waitForFunction(() => typeof AvatarPlatform !== 'undefined', {
      timeout: 30000,
    });
    console.log('✅ SDK已加载');

    await sleep(1000);

    // 点击启动按钮
    console.log('🚀 启动虚拟人...');
    await page.click('#startBtn');

    // 等待虚拟人连接成功
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
    await page.click('#autoPlayBtn');

    // 监听页面日志
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('🎬') || text.includes('✅') || text.includes('❌')) {
        console.log(`[浏览器] ${text}`);
      }
    });

    // 等待自动播放完成
    console.log('⏳ 等待课程播放完成...');

    // 监听播放完成 - 检测自动播放按钮文本变回"🎬 自动播放"
    await page.waitForFunction(
      () => {
        const autoPlayBtn = document.getElementById('autoPlayBtn');
        return autoPlayBtn && autoPlayBtn.textContent === '🎬 自动播放';
      },
      { timeout: 1800000 } // 最多等待30分钟
    );

    console.log('✅ 课程播放完成');

    // 额外等待3秒
    await sleep(3000);

  } catch (error) {
    console.error('❌ 录制过程出错:', error);
  } finally {
    // 停止录制
    console.log('⏹️ 停止录制...');
    await recorder.stop();

    // 关闭浏览器
    await browser.close();

    console.log('✅ 录制完成！');
    console.log(`📁 视频已保存到: ${outputPath}`);
  }
}

// 命令行参数
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ 请提供课程HTML文件名');
  console.error('用法: node auto-record.js <课程文件名.html>');
  console.error('例如: node auto-record.js 01_1.1_指数的概念与运算.html');
  process.exit(1);
}

const htmlFile = args[0];

// 检查文件是否存在
if (!fs.existsSync(htmlFile)) {
  console.error(`❌ 文件不存在: ${htmlFile}`);
  process.exit(1);
}

// 开始录制
recordLesson(htmlFile).catch(error => {
  console.error('❌ 录制失败:', error);
  process.exit(1);
});
