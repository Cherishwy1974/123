/**
 * 🎬 终极方案：Playwright 录制视频 + FFmpeg 录制音频 + 合并
 *
 * 思路：
 * 1. Playwright 录制无声视频（画面完美，无错位）
 * 2. 同时 FFmpeg 录制系统音频
 * 3. 录制结束后用 FFmpeg 合并视频和音频
 */

const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CONFIG = {
    outputDir: path.join(__dirname, '录制完成'),
    tempDir: path.join(__dirname, 'temp'),
    targetViewport: { width: 1920, height: 1080 },
    // 使用 Cursor Live Server 的地址
    liveServerUrl: 'http://127.0.0.1:5500',

    waitTimes: {
        pageLoad: 15000,
        afterPlay: 5000,
    }
};

let httpServer = null;

function startHttpServer() {
    return new Promise((resolve, reject) => {
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.woff': 'application/font-woff',
            '.woff2': 'application/font-woff2',
        };

        httpServer = http.createServer((req, res) => {
            const pathname = decodeURIComponent(require('url').parse(req.url).pathname);
            const filePath = path.join(__dirname, pathname === '/' ? '/index.html' : pathname);

            fs.stat(filePath, (err, stats) => {
                if (err || !stats.isFile()) {
                    res.writeHead(404);
                    res.end('File not found');
                    return;
                }

                const ext = path.extname(filePath).toLowerCase();
                const contentType = mimeTypes[ext] || 'application/octet-stream';

                fs.readFile(filePath, (err, data) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Server error');
                        return;
                    }

                    res.writeHead(200, {
                        'Content-Type': contentType + '; charset=utf-8',
                        'Access-Control-Allow-Origin': '*',
                        'Cache-Control': 'no-cache'
                    });
                    res.end(data);
                });
            });
        });

        httpServer.listen(CONFIG.httpPort, CONFIG.httpHost, (err) => {
            if (err) reject(err);
            else {
                console.log(`✅ HTTP服务器已启动\n`);
                resolve();
            }
        });
    });
}

function stopHttpServer() {
    if (httpServer) {
        httpServer.close();
    }
}

function startAudioRecording(outputPath) {
    return new Promise((resolve, reject) => {
        console.log(`🎤 启动音频录制...\n`);

        // 使用 VB-Audio Virtual Cable 录制系统音频
        const ffmpegArgs = [
            '-f', 'dshow',
            '-i', 'audio=CABLE Output (VB-Audio Virtual Cable)',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-y',
            outputPath
        ];

        const ffmpegPath = path.join(__dirname, 'ffmpeg.exe');
        const ffmpeg = spawn(ffmpegPath, ffmpegArgs);

        let started = false;

        ffmpeg.stderr.on('data', (data) => {
            const output = data.toString();
            if (output.includes('size=') && !started) {
                started = true;
                console.log(`✅ 音频录制已开始\n`);
                resolve(ffmpeg);
            }
        });

        ffmpeg.on('error', (error) => {
            reject(new Error(`音频录制启动失败: ${error.message}`));
        });

        // 超时保护
        setTimeout(() => {
            if (!started) {
                console.log(`⚠️ 音频录制可能未正常启动，但继续执行\n`);
                resolve(ffmpeg);
            }
        }, 3000);
    });
}

function stopAudioRecording(ffmpegProcess) {
    return new Promise((resolve) => {
        console.log(`⏹️ 停止音频录制...\n`);

        ffmpegProcess.stdin.write('q');

        ffmpegProcess.on('close', () => {
            console.log(`✅ 音频录制已停止\n`);
            resolve();
        });

        setTimeout(() => {
            if (!ffmpegProcess.killed) {
                ffmpegProcess.kill();
                resolve();
            }
        }, 5000);
    });
}

function mergeVideoAudio(videoPath, audioPath, outputPath) {
    return new Promise((resolve, reject) => {
        console.log(`🔀 合并视频和音频...\n`);

        const ffmpegPath = path.join(__dirname, 'ffmpeg.exe');
        const ffmpegArgs = [
            '-i', videoPath,
            '-i', audioPath,
            '-c:v', 'libx264',  // 重新编码为H.264（webm→mp4需要）
            '-preset', 'fast',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-shortest',  // 以最短的流为准
            '-y',
            outputPath
        ];

        const ffmpeg = spawn(ffmpegPath, ffmpegArgs);

        ffmpeg.stderr.on('data', (data) => {
            const output = data.toString();
            if (output.includes('Conversion failed') || output.includes('Error')) {
                console.error(`FFmpeg 错误: ${output}`);
            }
        });

        ffmpeg.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ 合并完成\n`);
                resolve();
            } else {
                reject(new Error(`合并失败，退出码: ${code}`));
            }
        });

        ffmpeg.on('error', (error) => {
            reject(new Error(`合并失败: ${error.message}`));
        });
    });
}

async function recordFile(urlOrFile, outputName) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`       🎬 终极自动化录制系统`);
    console.log(`${'═'.repeat(60)}\n`);

    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir);
    }
    if (!fs.existsSync(CONFIG.tempDir)) {
        fs.mkdirSync(CONFIG.tempDir);
    }

    // 判断是 URL 还是文件名
    let fileUrl;
    let videoName;

    if (urlOrFile.startsWith('http://') || urlOrFile.startsWith('https://')) {
        // 完整 URL
        fileUrl = urlOrFile;
        videoName = outputName || 'output.mp4';
        console.log(`📄 URL: ${fileUrl}\n`);
        console.log(`📹 输出文件名: ${videoName}\n`);
    } else {
        // 本地文件名，使用配置的服务器
        fileUrl = `${CONFIG.liveServerUrl}/${encodeURIComponent(urlOrFile)}`;
        videoName = urlOrFile.replace('.html', '.mp4');
        console.log(`📄 文件: ${urlOrFile}\n`);
        console.log(`📡 使用服务器: ${CONFIG.liveServerUrl}\n`);
    }

    const tempVideoPath = path.join(CONFIG.tempDir, 'video_' + videoName);
    const tempAudioPath = path.join(CONFIG.tempDir, 'audio_' + videoName.replace('.mp4', '.aac'));
    const finalOutputPath = path.join(CONFIG.outputDir, videoName);

    console.log(`🚀 启动浏览器...\n`);
    const browser = await chromium.launch({
        headless: false,
        args: [
            '--force-device-scale-factor=1',
            '--high-dpi-support=1',
            '--disable-blink-features=AutomationControlled',
            '--autoplay-policy=no-user-gesture-required'  // 允许自动播放音频
        ]
    });

    const context = await browser.newContext({
        viewport: CONFIG.targetViewport,
        deviceScaleFactor: 1,
        recordVideo: {
            dir: CONFIG.tempDir,
            size: CONFIG.targetViewport
        }
    });

    const page = await context.newPage();
    let audioProcess = null;

    try {
        console.log(`📂 打开页面: ${fileUrl}\n`);
        await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 30000 });

        console.log(`⏳ 等待页面加载...\n`);
        await page.waitForTimeout(CONFIG.waitTimes.pageLoad);

        // 验证窗口大小
        const actualSize = await page.evaluate(() => {
            return {
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight
            };
        });

        console.log(`✅ 实际渲染尺寸: ${actualSize.innerWidth}x${actualSize.innerHeight}\n`);

        // 等待 SDK
        console.log(`⏳ 等待虚拟人 SDK...\n`);
        await page.waitForFunction(() => typeof AvatarPlatform !== 'undefined', { timeout: 10000 })
            .catch(() => console.log('⚠️ SDK 加载超时\n'));

        // 自动点击"开始讲课"按钮
        console.log(`🎀 点击"开始讲课"按钮...\n`);
        await page.evaluate(() => {
            const startBtn = document.getElementById('startBtn');
            if (startBtn) {
                startBtn.click();
            }
        });

        // 给虚拟人足够的时间加载和渲染（20秒）
        console.log(`⏳ 等待虚拟人完全加载和渲染（20秒）...\n`);
        console.log(`   这段时间虚拟人会建立连接、加载模型、开始渲染\n`);

        for (let i = 0; i < 20; i++) {
            await page.waitForTimeout(1000);
            process.stdout.write(`\r   ⏱️  ${i+1}/20 秒...`);
        }
        console.log(`\n\n✅ 等待完成\n`);

        // 手动确认虚拟人是否准备好
        console.log(`${'─'.repeat(60)}\n`);
        console.log(`⚠️  重要确认：\n`);
        console.log(`   请在打开的浏览器窗口中，检查虚拟人"沐沐"是否已出现\n`);
        console.log(`   如果虚拟人正常显示，回到这里按回车开始录制\n`);
        console.log(`   如果虚拟人未出现，请手动点击"开始讲课"按钮，等待出现后再按回车\n`);
        console.log(`${'─'.repeat(60)}\n`);

        // 等待用户确认
        const readline = require('readline');
        await new Promise(resolve => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question('✅ 确认虚拟人准备好后，按回车开始录制...', () => {
                rl.close();
                resolve();
            });
        });

        console.log(`\n🎬 开始录制...\n`);

        // 获取预期时长
        const durationInfo = await page.evaluate(() => {
            // 确保获取到正确的总页数
            let pages = 6;  // 默认6页
            if (typeof window.totalPages === 'number') {
                pages = window.totalPages;
            }

            let total = 0;
            const details = [];
            const hasDurationFunc = typeof getPageDuration === 'function';

            for (let i = 1; i <= pages; i++) {
                let pageDuration;
                if (hasDurationFunc) {
                    pageDuration = getPageDuration(i);
                } else {
                    pageDuration = 25000;
                }
                total += pageDuration;
                details.push({ page: i, duration: pageDuration });
            }

            return {
                total: total + 10000,  // 加10秒缓冲时间
                details: details,
                pages: pages,
                hasFunction: hasDurationFunc
            };
        });

        console.log(`📊 时长分析:`);
        console.log(`   总页数: ${durationInfo.pages}`);
        console.log(`   getPageDuration函数: ${durationInfo.hasFunction ? '存在' : '不存在'}`);
        durationInfo.details.forEach(d => console.log(`   第${d.page}页: ${(d.duration/1000).toFixed(1)}秒`));
        console.log(`   ⏱️ 预计总时长: ${(durationInfo.total / 1000).toFixed(1)} 秒\n`);
        console.log(`${'─'.repeat(60)}\n`);

        const expectedDuration = durationInfo.total;

        // 启动音频录制
        audioProcess = await startAudioRecording(tempAudioPath);
        await page.waitForTimeout(1000);

        // 开始自动播放
        console.log(`▶️ 开始自动播放...\n`);
        const startTime = Date.now();

        await page.evaluate(() => {
            const btn = document.getElementById('autoPlayBtn');
            if (btn) btn.click();
        });

        console.log(`🔴 录制中（Playwright录视频 + FFmpeg录音频）...\n`);

        // 显示进度条
        const progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / expectedDuration) * 100, 100);
            const barLength = 50;
            const filled = Math.floor(progress / 2);
            const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
            const timeLeft = Math.max(0, (expectedDuration - elapsed) / 1000);
            process.stdout.write(`\r📊 进度: [${bar}] ${progress.toFixed(1)}% | 剩余: ${timeLeft.toFixed(0)}秒`);
        }, 500);

        // 等待播放完成
        await page.waitForTimeout(expectedDuration);
        clearInterval(progressInterval);
        console.log(`\r📊 进度: [${'█'.repeat(50)}] 100.0% | 完成!          \n`);

        // 额外等待
        await page.waitForTimeout(CONFIG.waitTimes.afterPlay);

        const actualDuration = Date.now() - startTime;
        console.log(`\n✅ 播放完成 (实际时长: ${(actualDuration/1000).toFixed(1)}秒)\n`);

        // 停止音频录制
        if (audioProcess) {
            await stopAudioRecording(audioProcess);
        }

    } catch (error) {
        console.error(`\n❌ 录制失败:`, error.message);
        if (audioProcess && !audioProcess.killed) {
            audioProcess.kill();
        }
        throw error;
    } finally {
        // 关闭页面和浏览器
        console.log(`⏹️ 停止视频录制...\n`);
        await page.close();
        await context.close();
        await browser.close();

        console.log(`⏳ 等待文件写入...\n`);
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 找到 Playwright 录制的视频文件
        const tempFiles = fs.readdirSync(CONFIG.tempDir)
            .filter(f => f.endsWith('.webm'))
            .map(f => ({
                name: f,
                path: path.join(CONFIG.tempDir, f),
                mtime: fs.statSync(path.join(CONFIG.tempDir, f)).mtime
            }))
            .sort((a, b) => b.mtime - a.mtime);

        if (tempFiles.length > 0 && fs.existsSync(tempAudioPath)) {
            const videoFile = tempFiles[0].path;
            console.log(`📹 找到视频文件: ${path.basename(videoFile)}`);
            console.log(`🎤 找到音频文件: ${path.basename(tempAudioPath)}\n`);

            // 合并视频和音频
            await mergeVideoAudio(videoFile, tempAudioPath, finalOutputPath);

            // 清理临时文件
            console.log(`🗑️ 清理临时文件...\n`);
            try {
                fs.unlinkSync(videoFile);
                fs.unlinkSync(tempAudioPath);
            } catch (e) {
                console.log(`⚠️ 清理临时文件失败: ${e.message}\n`);
            }

            // 检查最终文件
            if (fs.existsSync(finalOutputPath)) {
                const stats = fs.statSync(finalOutputPath);
                const fileSize = (stats.size / 1024 / 1024).toFixed(2);

                console.log(`${'═'.repeat(60)}`);
                console.log(`              ✅ 录制成功`);
                console.log(`${'═'.repeat(60)}\n`);
                console.log(`📹 视频文件: ${videoName}`);
                console.log(`📂 保存位置: ${CONFIG.outputDir}`);
                console.log(`💾 文件大小: ${fileSize} MB`);
                console.log(`🎤 音频: 已包含\n`);
                console.log(`🎬 完整路径:`);
                console.log(`   ${finalOutputPath}\n`);
                console.log(`${'═'.repeat(60)}\n`);
            } else {
                console.log(`\n❌ 合并后的文件未找到\n`);
            }
        } else {
            console.log(`\n❌ 未找到录制文件\n`);
            console.log(`   视频文件数: ${tempFiles.length}`);
            console.log(`   音频文件存在: ${fs.existsSync(tempAudioPath)}\n`);
        }
    }
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
🎬 终极自动化录制系统

使用方法:
  node record-split.js <HTML文件名>

示例:
  node record-split.js 第02章_无穷小.html

特性:
  ✅ Playwright 录制视频（画面完美）
  ✅ FFmpeg 同时录制音频（VB-Cable）
  ✅ 自动合并视频和音频
  ✅ 完全自动化

注意:
  需要安装并配置 VB-Audio Virtual Cable
  浏览器音频输出需要设置为 CABLE Input
        `);
        return;
    }

    const htmlFile = args[0];
    const port = args[1] || '5500';

    if (!fs.existsSync(htmlFile)) {
        console.error(`\n❌ 文件不存在: ${htmlFile}\n`);
        return;
    }

    // 更新配置中的端口
    CONFIG.liveServerUrl = `http://127.0.0.1:${port}`;
    console.log(`\n📡 使用 Live Server: ${CONFIG.liveServerUrl}\n`);

    await recordFile(htmlFile);
}

main().catch(console.error);
