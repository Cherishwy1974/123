#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Update Chapter 4 HTML files to match frame_stop event pattern from 02_2.6
"""

import re
import os

def update_html_file(file_path):
    """Update a single HTML file with the frame_stop pattern"""

    print(f"Processing: {file_path}")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Step 1: Add speechFinishedResolve to global variables
    # Find the pattern: let isAutoPlaying=false;const slides
    pattern1 = r'let isAutoPlaying=false;const slides'
    replacement1 = r'let isAutoPlaying=false;let speechFinishedResolve=null;const slides'
    content = re.sub(pattern1, replacement1, content)

    # Step 2: Add frame_stop event handler after the .on('error') handler
    # Find the pattern where error handler ends
    pattern2 = r"(\.on\('error',\(error\)=>\{console\.error\('❌ 虚拟人错误:',error\);updateStatus\('错误: '\+error\.message,'error'\);startBtn\.textContent='❌ 连接失败';startBtn\.disabled=false;isTeaching=false;\}\))"

    frame_stop_handler = r"\1.on('frame_stop',(data)=>{console.log('✅ 虚拟人讲解完成 frame_stop:',data);if(isAutoPlaying&&speechFinishedResolve){console.log('🎬 通知自动播放：虚拟人讲解完成');speechFinishedResolve();speechFinishedResolve=null;}})"

    content = re.sub(pattern2, frame_stop_handler, content)

    # Step 3: Add enable_action_status: 1 to avatar_dispatch config
    pattern3 = r"avatar_dispatch:\{interactive_mode:1,content_analysis:0\}"
    replacement3 = r"avatar_dispatch:{interactive_mode:1,content_analysis:0,enable_action_status:1}"
    content = re.sub(pattern3, replacement3, content)

    # Step 4: Add getSlideDuration helper function (before startAutoPlay function)
    pattern4 = r"(async function startAutoPlay\(\)\{)"

    get_slide_duration_func = r"function getSlideDuration(slideNum){const subtitle=subtitleScript[slideNum];if(!subtitle)return 5000;return subtitle.length*120+2000;}\1"

    content = re.sub(pattern4, get_slide_duration_func, content)

    # Step 5: Replace startAutoPlay function with Promise.race pattern
    old_auto_play = r"async function startAutoPlay\(\)\{if\(!avatarPlatform\|\|!isConnected\)\{await startTeaching\(\);await new Promise\(resolve=>setTimeout\(resolve,2000\);\)\}isAutoPlaying=true;document\.getElementById\('autoPlayBtn'\)\.disabled=true;for\(let i=currentSlide;i<totalSlides;i\+\+\)\{showSlide\(i\);speakContent\(i\+1\);const duration=\(subtitleScript\[i\+1\]\.length/5\)\*1000\+2000;await new Promise\(resolve=>setTimeout\(resolve,duration\);\)\}isAutoPlaying=false;document\.getElementById\('autoPlayBtn'\)\.disabled=false;\}"

    new_auto_play = """async function startAutoPlay(){if(isAutoPlaying){stopAutoPlay();return;}try{console.log('🎬 开始自动播放完整课程...');isAutoPlaying=true;const autoPlayBtn=document.getElementById('autoPlayBtn');autoPlayBtn.textContent='⏹️ 停止播放';autoPlayBtn.style.background='linear-gradient(135deg, #f44336, #d32f2f)';updateStatus('🎬 自动播放将在 1 秒后开始，请准备录屏！','recording');await new Promise(resolve=>setTimeout(resolve,1000));updateStatus('🎬 自动播放开始！','recording');document.body.classList.add('recording-mode');if(!avatarPlatform||!isConnected){console.log('🎬 启动虚拟人...');await startTeaching();await new Promise(resolve=>setTimeout(resolve,2000));}for(let slide=1;slide<=totalSlides;slide++){try{if(!isAutoPlaying){console.log('🛑 自动播放被停止');break;}console.log(`\\n🎬 === 开始播放第${slide}页/${totalSlides}页 ===`);showSlide(slide-1);updateStatus(`📖 第${slide}页/${totalSlides}页 - 讲解中`,'recording');if(isConnected&&isTeaching&&avatarPlatform){try{const speechPromise=new Promise(resolve=>{speechFinishedResolve=resolve;});await speakContent(slide);console.log(`⏳ 等待虚拟人讲解第${slide}页完成...`);const timeoutPromise=new Promise(resolve=>setTimeout(()=>{console.log(`⚠️ 第${slide}页讲解超时，继续下一页`);resolve();},getSlideDuration(slide)+5000));await Promise.race([speechPromise,timeoutPromise]);console.log(`✅ 第${slide}页讲解完成`);}catch(error){console.error(`❌ 第${slide}页讲解异常:`,error);}}else{console.log('⚠️ 虚拟人未连接，使用固定延时');await new Promise(resolve=>setTimeout(resolve,getSlideDuration(slide)));}const waitTime=slide===totalSlides?1500:200;await new Promise(resolve=>setTimeout(resolve,waitTime));}catch(error){console.error(`❌ 第${slide}页播放过程出错:`,error);await new Promise(resolve=>setTimeout(resolve,2000));}}if(isAutoPlaying){await new Promise(resolve=>setTimeout(resolve,3000));stopAutoPlay();}}catch(error){console.error('❌ 自动播放失败:',error);updateStatus('自动播放失败: '+error.message,'error');stopAutoPlay();}}function stopAutoPlay(){if(isAutoPlaying){isAutoPlaying=false;window.playbackFinished=true;document.title="PLAYBACK_FINISHED";console.log('🎉 播放完成！已修改标题为 PLAYBACK_FINISHED');document.body.classList.remove('recording-mode');const autoPlayBtn=document.getElementById('autoPlayBtn');autoPlayBtn.textContent='🎬 自动播放';autoPlayBtn.style.background='linear-gradient(135deg, #2196f3, #1976d2)';console.log('⏹️ 自动播放已停止');updateStatus('自动播放已停止','normal');}}"""

    content = re.sub(old_auto_play, new_auto_play, content)

    # Write updated content back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ Updated: {file_path}")
    return True

def main():
    """Main function to update all Chapter 4 files"""

    base_dir = os.path.dirname(os.path.abspath(__file__))

    files = [
        "04_4.2_函数的单调性与极值.html",
        "04_4.3_函数的凹凸性与最值.html",
        "04_4.4_函数图像的描绘.html",
        "04_4.5_导数应用综合复习.html"
    ]

    updated = []

    for filename in files:
        file_path = os.path.join(base_dir, filename)
        if os.path.exists(file_path):
            try:
                if update_html_file(file_path):
                    updated.append(filename)
            except Exception as e:
                print(f"❌ Error updating {filename}: {e}")
        else:
            print(f"⚠️ File not found: {file_path}")

    print(f"\n✅ Successfully updated {len(updated)} files:")
    for filename in updated:
        print(f"   - {filename}")

if __name__ == "__main__":
    main()
