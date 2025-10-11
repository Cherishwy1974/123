/**
 * 批量录制所有课程
 *
 * 特点：
 * - 自动录制所有课程文件
 * - 顺序执行，一个接一个
 * - 自动保存到 recordings/ 目录
 * - 后台运行，不影响其他操作
 *
 * 使用方法：
 * node batch-record.js
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// GitHub Pages 基础URL
const BASE_URL = 'https://cherishwy1974.github.io/123/';

// 所有课程列表
const LESSONS = [
  '01_1.1_指数的概念与运算.html',
  '01_1.2_对数的概念与运算.html',
  '01_1.3_函数的基本概念.html',
  '01_1.4_基本初等函数.html',
  '02_2.1_极限的定义与存在条件.html',
  '02_2.2_无穷小与无穷大.html',
  '02_2.3_极限的运算法则.html',
  '02_2.4_求极限的常用方法.html',
  '02_2.5_两个重要极限.html',
  '02_2.6_无穷小的比较.html',
  '02_2.7_函数的连续性.html',
  '03_3.1_导数的概念与几何意义.html',
  '03_3.2_基本求导公式与四则运算.html',
  '03_3.3_复合函数求导与链式法则.html',
  '03_3.4_微分的概念与应用.html',
  '03_3.5_导数综合复习与习题.html',
  '04_4.1_洛必达法则.html',
  '04_4.2_函数的单调性与极值.html',
  '04_4.3_函数的凹凸性与最值.html',
  '04_4.4_函数图像的描绘.html',
  '04_4.5_导数应用综合复习.html',
  '05_5.1_不定积分的概念.html',
  '05_5.2_换元积分法.html',
  '05_5.3_分部积分法.html',
  '05_5.4_不定积分综合复习.html',
  '06_6.1_定积分的概念介绍.html',
  '06_6.2_牛顿莱布尼茨公式.html',
  '06_6.3_定积分的应用_求平面图形面积.html',
  '06_6.4_本章回顾与习题精讲.html',
  '07_7.1_微分方程的基本概念.html',
  '07_7.2_可分离变量的微分方程.html',
  '07_7.3_一阶线性微分方程.html',
  '07_7.4_本章回顾与习题精讲.html',
  '08_8.1_多元函数与偏导数入门.html',
  '08_8.2_全微分梯度与方向导数.html',
  '08_8.3_本章复盘与约束极值预告.html',
  '09_9.1_二重积分的概念与几何意义.html',
  '09_9.2_二重积分的计算_直角坐标.html',
  '09_9.3_重积分应用与总结.html',
  '10_10.1_行列式及其几何意义.html',
  '10_10.2_矩阵运算与逆矩阵.html',
  '10_10.3_线性方程组的解法.html',
  '10_10.4_本章总结与工程应用.html',
  '11_11.1_级数的概念与敛散性判别.html',
  '11_11.2_幂级数与泰勒展开.html',
  '11_11.3_本章总结与误差控制.html',
  '12_12.1_向量的概念点积与叉积.html',
  '12_12.2_平面与直线方程.html',
  '12_12.3_本章综合与空间定位.html',
  '13_13.1_概率的基本概念与性质.html',
  '13_13.2_随机变量期望与方差.html',
  '13_13.3_正态分布与中心极限定理.html',
  '13_13.4_本章总结与综合应用.html',
];

// 配置
const CONFIG = {
  OUTPUT_DIR: './recordings',
  VIDEO_SIZE: { width: 1920, height: 1080 },
  MAX_RECORDING_TIME: 30 * 60 * 1000,
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 录制单个课程
 */
async function recordSingleLesson(browser, courseURL, lessonName, index, total) {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  📚 [${index}/${total}] ${lessonName}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  const outputPath = path.join(CONFIG.OUTPUT_DIR, `${lessonName}.webm`);

  // 检查是否已录制
  if (fs.existsSync(outputPath)) {
    console.log('⏭️  已存在，跳过录制');
    return { success: true, skipped: true };
  }

  const context = await browser.newContext({
    viewport: CONFIG.VIDEO_SIZE,
    recordVideo: {
      dir: CONFIG.OUTPUT_DIR,
      size: CONFIG.VIDEO_SIZE,
    },
  });

  const page = await context.newPage();

  try {
    console.log('📖 加载页面...');
    await page.goto(courseURL, { waitUntil: 'networkidle', timeout: 60000 });
    await sleep(2000);

    console.log('⏳ 等待SDK...');
    await page.waitForFunction(() => typeof AvatarPlatform !== 'undefined', { timeout: 30000 });

    console.log('🚀 启动虚拟人...');
    await page.click('#startBtn');

    await page.waitForFunction(
      () => {
        const statusIndicator = document.getElementById('statusIndicator');
        return statusIndicator && statusIndicator.textContent === '已连接';
      },
      { timeout: 30000 }
    );

    await sleep(2000);

    console.log('🎬 开始自动播放...');
    await page.click('#autoPlayBtn');

    // 监听进度
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('📖 第') && text.includes('页')) {
        console.log(`   ${text}`);
      }
    });

    await page.waitForFunction(
      () => {
        const autoPlayBtn = document.getElementById('autoPlayBtn');
        return autoPlayBtn && autoPlayBtn.textContent === '🎬 自动播放';
      },
      { timeout: CONFIG.MAX_RECORDING_TIME }
    );

    console.log('✅ 录制完成');
    await sleep(2000);

    await context.close();

    // 重命名视频文件
    const files = fs.readdirSync(CONFIG.OUTPUT_DIR);
    const videoFile = files.find(f => f.endsWith('.webm') && !f.includes(lessonName));
    if (videoFile) {
      fs.renameSync(path.join(CONFIG.OUTPUT_DIR, videoFile), outputPath);
    }

    const stats = fs.statSync(outputPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📁 ${fileSizeMB} MB`);

    return { success: true, size: fileSizeMB };

  } catch (error) {
    console.error(`❌ 录制失败: ${error.message}`);
    await context.close();
    return { success: false, error: error.message };
  }
}

/**
 * 批量录制主函数
 */
async function batchRecord() {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎬 批量录制系统');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`📚 总课程数: ${LESSONS.length}`);
  console.log(`📁 输出目录: ${CONFIG.OUTPUT_DIR}`);
  console.log('');
  console.log('💡 提示：录制过程中可以自由操作其他窗口');
  console.log('');

  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: false,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--autoplay-policy=no-user-gesture-required',
    ],
  });

  const results = {
    total: LESSONS.length,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  const startTime = Date.now();

  for (let i = 0; i < LESSONS.length; i++) {
    const lesson = LESSONS[i];
    const lessonName = lesson.replace('.html', '');
    const courseURL = BASE_URL + encodeURIComponent(lesson);

    const result = await recordSingleLesson(browser, courseURL, lessonName, i + 1, LESSONS.length);

    if (result.skipped) {
      results.skipped++;
    } else if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push({ lesson, error: result.error });
    }

    // 间隔一下避免过快
    if (i < LESSONS.length - 1) {
      await sleep(2000);
    }
  }

  await browser.close();

  const endTime = Date.now();
  const totalMinutes = ((endTime - startTime) / 1000 / 60).toFixed(1);

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ 批量录制完成！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`📊 统计信息:`);
  console.log(`   总课程数: ${results.total}`);
  console.log(`   成功录制: ${results.success}`);
  console.log(`   跳过已有: ${results.skipped}`);
  console.log(`   录制失败: ${results.failed}`);
  console.log(`   总耗时: ${totalMinutes} 分钟`);
  console.log('');

  if (results.errors.length > 0) {
    console.log('❌ 失败列表:');
    results.errors.forEach(({ lesson, error }) => {
      console.log(`   - ${lesson}: ${error}`);
    });
    console.log('');
  }

  console.log(`📁 视频文件位置: ${path.resolve(CONFIG.OUTPUT_DIR)}`);
  console.log('');
}

// 运行批量录制
batchRecord().catch(error => {
  console.error('');
  console.error('❌ 批量录制失败:', error);
  console.error('');
  process.exit(1);
});
