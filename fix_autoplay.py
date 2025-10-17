#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix the startAutoPlay function in Chapter 4 HTML files
"""

import re
import os

def fix_autoplay_function(file_path):
    """Fix the startAutoPlay function to use Promise.race pattern"""

    print(f"Processing: {file_path}")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find and replace the old startAutoPlay function
    # Match from "async function startAutoPlay(){" to the next "document.addEventListener"
    old_pattern = r'async function startAutoPlay\(\)\{[^}]+\{[^}]+\}[^}]+\}[^}]+\}[^}]+\}(?=document\.addEventListener)'

    new_autoplay = r'''async function startAutoPlay(){if(isAutoPlaying){stopAutoPlay();return;}try{console.log('🎬 开始自动播放完整课程...');isAutoPlaying=true;const autoPlayBtn=document.getElementById('autoPlayBtn');autoPlayBtn.textContent='⏹️ 停止播放';autoPlayBtn.style.background='linear-gradient(135deg, #f44336, #d32f2f)';updateStatus('🎬 自动播放将在 1 秒后开始，请准备录屏！','recording');await new Promise(resolve=>setTimeout(resolve,1000));updateStatus('🎬 自动播放开始！','recording');document.body.classList.add('recording-mode');if(!avatarPlatform||!isConnected){console.log('🎬 启动虚拟人...');await startTeaching();await new Promise(resolve=>setTimeout(resolve,2000));}for(let slide=1;slide<=totalSlides;slide++){try{if(!isAutoPlaying){console.log('🛑 自动播放被停止');break;}console.log(`\n🎬 === 开始播放第${slide}页/${totalSlides}页 ===`);showSlide(slide-1);updateStatus(`📖 第${slide}页/${totalSlides}页 - 讲解中`,'recording');if(isConnected&&isTeaching&&avatarPlatform){try{const speechPromise=new Promise(resolve=>{speechFinishedResolve=resolve;});await speakContent(slide);console.log(`⏳ 等待虚拟人讲解第${slide}页完成...`);const timeoutPromise=new Promise(resolve=>setTimeout(()=>{console.log(`⚠️ 第${slide}页讲解超时，继续下一页`);resolve();},getSlideDuration(slide)+5000));await Promise.race([speechPromise,timeoutPromise]);console.log(`✅ 第${slide}页讲解完成`);}catch(error){console.error(`❌ 第${slide}页讲解异常:`,error);}}else{console.log('⚠️ 虚拟人未连接，使用固定延时');await new Promise(resolve=>setTimeout(resolve,getSlideDuration(slide)));}const waitTime=slide===totalSlides?1500:200;await new Promise(resolve=>setTimeout(resolve,waitTime));}catch(error){console.error(`❌ 第${slide}页播放过程出错:`,error);await new Promise(resolve=>setTimeout(resolve,2000));}}if(isAutoPlaying){await new Promise(resolve=>setTimeout(resolve,3000));stopAutoPlay();}}catch(error){console.error('❌ 自动播放失败:',error);updateStatus('自动播放失败: '+error.message,'error');stopAutoPlay();}}function stopAutoPlay(){if(isAutoPlaying){isAutoPlaying=false;window.playbackFinished=true;document.title="PLAYBACK_FINISHED";console.log('🎉 播放完成！已修改标题为 PLAYBACK_FINISHED');document.body.classList.remove('recording-mode');const autoPlayBtn=document.getElementById('autoPlayBtn');autoPlayBtn.textContent='🎬 自动播放';autoPlayBtn.style.background='linear-gradient(135deg, #2196f3, #1976d2)';console.log('⏹️ 自动播放已停止');updateStatus('自动播放已停止','normal');}}'''

    content = re.sub(old_pattern, new_autoplay, content)

    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ Fixed: {file_path}")
    return True

def main():
    """Main function"""

    base_dir = os.path.dirname(os.path.abspath(__file__))

    files = [
        "04_4.2_函数的单调性与极值.html",
        "04_4.3_函数的凹凸性与最值.html",
        "04_4.4_函数图像的描绘.html",
        "04_4.5_导数应用综合复习.html"
    ]

    fixed = []

    for filename in files:
        file_path = os.path.join(base_dir, filename)
        if os.path.exists(file_path):
            try:
                if fix_autoplay_function(file_path):
                    fixed.append(filename)
            except Exception as e:
                print(f"❌ Error fixing {filename}: {e}")
        else:
            print(f"⚠️ File not found: {file_path}")

    print(f"\n✅ Successfully fixed {len(fixed)} files:")
    for filename in fixed:
        print(f"   - {filename}")

if __name__ == "__main__":
    main()
