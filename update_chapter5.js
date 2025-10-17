// Script to update Chapter 5 files with frame_stop event pattern from 02_2.6

const fs = require('fs');
const path = require('path');

const files = [
    '05_5.1_不定积分的概念.html',
    '05_5.2_换元积分法.html',
    '05_5.3_分部积分法.html',
    '05_5.4_不定积分综合复习.html'
];

const baseDir = 'd:/WPS Office/2025/254805819/WPS云盘/教材/视频讲解';

// Pattern to add/update:
// 1. Add speechFinishedResolve global variable
// 2. Update frame_stop handler
// 3. Update speakContent to not wait
// 4. Add getSlideDuration helper
// 5. Update startAutoPlay with Promise.race pattern

files.forEach(file => {
    const filePath = path.join(baseDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Add speechFinishedResolve after isAutoPlaying
    content = content.replace(
        /let isAutoPlaying=false;/,
        'let isAutoPlaying=false;let speechFinishedResolve=null;'
    );

    // 2. Replace old frame_stop handler with new one
    const newFrameStopHandler = `.on('frame_stop',(data)=>{console.log('✅ 虚拟人讲解完成 frame_stop:',data);if(isAutoPlaying&&speechFinishedResolve){console.log('🎬 通知自动播放：虚拟人讲解完成');speechFinishedResolve();speechFinishedResolve=null;}})`;

    content = content.replace(
        /\.on\('frame_stop',\(data\)=>\{[^}]+\}\)/,
        newFrameStopHandler
    );

    // 3. Add getSlideDuration function before startAutoPlay
    const getSlideDurationFunc = `function getSlideDuration(slideNum){const subtitle=subtitleScript[slideNum];if(!subtitle)return 5000;return subtitle.length*120+2000;}`;

    content = content.replace(
        /async function startAutoPlay\(\)/,
        `${getSlideDurationFunc}async function startAutoPlay()`
    );

    // 4. Replace entire startAutoPlay function with new Promise.race pattern
    const newStartAutoPlay = `async function startAutoPlay(){if(isAutoPlaying){stopAutoPlay();return;}try{console.log('🎬 开始自动播放完整课程...');isAutoPlaying=true;const autoPlayBtn=document.getElementById('autoPlayBtn');autoPlayBtn.textContent='⏹️ 停止播放';autoPlayBtn.style.background='linear-gradient(135deg, #f44336, #d32f2f)';updateStatus('🎬 自动播放将在 1 秒后开始，请准备录屏！','recording');await new Promise(resolve=>setTimeout(resolve,1000));updateStatus('🎬 自动播放开始！','recording');document.body.classList.add('recording-mode');if(!avatarPlatform||!isConnected){console.log('🎬 启动虚拟人...');await startTeaching();await new Promise(resolve=>setTimeout(resolve,2000));}for(let slide=1;slide<=totalSlides;slide++){try{if(!isAutoPlaying){console.log('🛑 自动播放被停止');break;}console.log(\`\\n🎬 === 开始播放第\${slide}页/\${totalSlides}页 ===\`);switchToSlideSilent(slide);updateStatus(\`📖 第\${slide}页/\${totalSlides}页\`,'recording');if(isConnected&&isTeaching&&avatarPlatform){try{const speechPromise=new Promise(resolve=>{speechFinishedResolve=resolve;});await speakContent(slide);console.log(\`⏳ 等待虚拟人讲解第\${slide}页完成...\`);const timeoutPromise=new Promise(resolve=>setTimeout(()=>{console.log(\`⚠️ 第\${slide}页讲解超时，继续下一页\`);resolve();},getSlideDuration(slide)+5000));await Promise.race([speechPromise,timeoutPromise]);console.log(\`✅ 第\${slide}页讲解完成\`);}catch(error){console.error(\`❌ 第\${slide}页讲解异常:\`,error);}}else{console.log('⚠️ 虚拟人未连接，使用固定延时');await new Promise(resolve=>setTimeout(resolve,getSlideDuration(slide)));}const waitTime=slide===totalSlides?1500:200;await new Promise(resolve=>setTimeout(resolve,waitTime));}catch(error){console.error(\`❌ 第\${slide}页播放过程出错:\`,error);await new Promise(resolve=>setTimeout(resolve,2000));}}if(isAutoPlaying){await new Promise(resolve=>setTimeout(resolve,3000));stopAutoPlay();}}catch(error){console.error('❌ 自动播放失败:',error);updateStatus('自动播放失败: '+error.message,'error');stopAutoPlay();}}`;

    // Find and replace old startAutoPlay
    content = content.replace(
        /async function startAutoPlay\(\)\{[^}]+stopAutoPlay\(\);?\}/s,
        newStartAutoPlay
    );

    // 5. Add switchToSlideSilent function before startAutoPlay
    const switchToSlideSilentFunc = `function switchToSlideSilent(slideNum){if(slideNum<1||slideNum>totalSlides){console.log(\`❌ 页面切换失败：页码\${slideNum}超出范围(1-\${totalSlides})\`);return;}console.log(\`🔄 开始切换到第\${slideNum}页...\`);showSlide(slideNum-1);console.log(\`✅ 成功切换到第\${slideNum}页\`);}`;

    content = content.replace(
        /function getSlideDuration/,
        `${switchToSlideSilentFunc}function getSlideDuration`
    );

    // 6. Add stopAutoPlay if missing
    if (!content.includes('function stopAutoPlay()')) {
        const stopAutoPlayFunc = `function stopAutoPlay(){if(isAutoPlaying){isAutoPlaying=false;window.playbackFinished=true;document.title="PLAYBACK_FINISHED";console.log('🎉 播放完成！已修改标题为 PLAYBACK_FINISHED');document.body.classList.remove('recording-mode');const autoPlayBtn=document.getElementById('autoPlayBtn');autoPlayBtn.textContent='🎬 自动播放';autoPlayBtn.style.background='linear-gradient(135deg, #2196f3, #1976d2)';console.log('⏹️ 自动播放已停止');updateStatus('自动播放已停止','normal');}}`;

        content = content.replace(
            /document\.addEventListener\('keydown'/,
            `${stopAutoPlayFunc}document.addEventListener('keydown'`
        );
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${file}`);
});

console.log('🎉 All Chapter 5 files updated successfully!');
