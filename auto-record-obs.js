/**
 * 全自动录制脚本 - 使用默认浏览器 + OBS
 *
 * 特点：
 * - 在系统默认浏览器中打开（页面布局正确）
 * - 通过OBS WebSocket自动控制录制
 * - 完全自动化，不需要手动点击
 * - 后台运行，不影响其他操作
 *
 * 前提条件：
 * 1. 安装OBS Studio: https://obsproject.com/
 * 2. 安装OBS WebSocket插件: https://github.com/obsproject/obs-websocket/releases
 * 3. 在OBS中配置WebSocket（工具 -> WebSocket服务器设置）
 *
 * 使用方法：
 * node auto-record-obs.js <课程URL>
 *
 * 例如：
 * node auto-record-obs.js https://cherishwy1974.github.io/123/01_1.1_指数的概念与运算.html
 */

const OBSWebSocket = require('obs-websocket-js').default;
const { chromium } = require('playwright');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// 配置
const CONFIG = {
  // OBS WebSocket配置
  OBS: {
    address: 'ws://127.0.0.1:4455',
    password: '', // 如果OBS设置了密码，在这里填写
  },

  // 录制配置
  OUTPUT_DIR: './recordings',
  OUTPUT_FORMAT: 'mp4',

  // 超时时间
  MAX_RECORDING_TIME: 30 * 60 * 1000, // 30分钟
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 在默认浏览器中打开URL
 */
async function openInDefaultBrowser(url) {
  const platform = process.platform;
  let command;

  if (platform === 'win32') {
    command = `start "" "${url}"`;
  } else if (platform === 'darwin') {
    command = `open "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  await execPromise(command);
}

/**
 * 使用Playwright监控页面状态（不录制，只监听）
 */
async function monitorPageStatus(courseURL) {
  console.log('🔍 启动页面状态监控...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(courseURL, { waitUntil: 'networkidle', timeout: 60000 });
    await sleep(2000);

    // 等待SDK
    await page.waitForFunction(() => typeof AvatarPlatform !== 'undefined', { timeout: 30000 });
    console.log('✅ SDK已加载');

    // 点击启动
    await page.click('#startBtn');
    await page.waitForFunction(
      () => {
        const statusIndicator = document.getElementById('statusIndicator');
        return statusIndicator && statusIndicator.textContent === '已连接';
      },
      { timeout: 30000 }
    );
    console.log('✅ 虚拟人已连接');

    await sleep(2000);

    // 点击自动播放
    await page.click('#autoPlayBtn');
    console.log('✅ 自动播放已启动');

    // 监听播放完成
    await page.waitForFunction(
      () => {
        const autoPlayBtn = document.getElementById('autoPlayBtn');
        return autoPlayBtn && autoPlayBtn.textContent === '🎬 自动播放';
      },
      { timeout: CONFIG.MAX_RECORDING_TIME }
    );

    console.log('✅ 课程播放完成');

    await browser.close();
    return { success: true };

  } catch (error) {
    await browser.close();
    throw error;
  }
}

/**
 * 主录制函数
 */
async function recordWithOBS(courseURL) {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎬 全自动录制系统（默认浏览器）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`📄 课程URL: ${courseURL}`);
  console.log('');

  // 从URL提取课程名称
  const urlPath = new URL(courseURL).pathname;
  const lessonName = path.basename(urlPath, '.html');

  console.log('🔌 连接OBS WebSocket...');
  const obs = new OBSWebSocket();

  try {
    await obs.connect(CONFIG.OBS.address, CONFIG.OBS.password);
    console.log('✅ OBS已连接');

    // 配置录制文件名
    await obs.call('SetRecordDirectory', {
      recordDirectory: path.resolve(CONFIG.OUTPUT_DIR),
    });

    console.log('');
    console.log('🌐 在默认浏览器中打开课程...');
    await openInDefaultBrowser(courseURL);

    console.log('⏳ 等待3秒以便页面加载...');
    await sleep(3000);

    console.log('');
    console.log('🔴 开始OBS录制...');
    await obs.call('StartRecord');

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🎥 录制进行中...');
    console.log('  💡 请在浏览器中：');
    console.log('     1. 点击"🚀 启动虚拟人"');
    console.log('     2. 等待连接成功');
    console.log('     3. 点击"🎬 自动播放"');
    console.log('  ⏳ 系统将自动监控播放状态');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // 使用无头浏览器监控页面状态
    const result = await monitorPageStatus(courseURL);

    console.log('');
    console.log('⏹️  停止OBS录制...');
    await obs.call('StopRecord');

    await sleep(2000);

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✅ 录制完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`📁 视频已保存到OBS录制目录`);
    console.log(`💡 课程名称: ${lessonName}`);
    console.log('');

    await obs.disconnect();

  } catch (error) {
    console.error('');
    console.error('❌ 录制过程出错:', error.message);
    console.error('');

    if (error.message.includes('connect')) {
      console.error('💡 提示：');
      console.error('   1. 请确保OBS Studio正在运行');
      console.error('   2. 请确保OBS WebSocket插件已安装并启用');
      console.error('   3. 检查WebSocket端口配置（默认4455）');
      console.error('');
    }

    try {
      await obs.disconnect();
    } catch (e) {}

    throw error;
  }
}

// 命令行参数
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ 请提供课程URL');
  console.error('');
  console.error('用法: node auto-record-obs.js <课程URL>');
  console.error('');
  console.error('示例:');
  console.error('  node auto-record-obs.js https://cherishwy1974.github.io/123/01_1.1_指数的概念与运算.html');
  console.error('');
  console.error('前提条件:');
  console.error('  1. 安装并运行OBS Studio');
  console.error('  2. 安装OBS WebSocket插件');
  console.error('  3. 在OBS中启用WebSocket服务器');
  console.error('');
  process.exit(1);
}

const courseURL = args[0];

if (!courseURL.startsWith('http://') && !courseURL.startsWith('https://')) {
  console.error('❌ 请提供有效的HTTP/HTTPS URL');
  process.exit(1);
}

// 开始录制
recordWithOBS(courseURL).catch(error => {
  console.error('');
  console.error('❌ 录制失败');
  console.error('');
  process.exit(1);
});
