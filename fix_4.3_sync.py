#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复 4.3 课件的虚拟人语音与幻灯片翻页同步问题

问题诊断：
1. 双重翻页机制冲突（startAutoPlay 和 startAutoPageTurn 同时运行）
2. 翻页前有 1.5 秒固定延迟
3. 超时时间过长（estimatedDuration + 10000ms）
4. 初始化时同时启动两个函数

修复方案：
1. 移除 startAutoPageTurn 函数（不再使用基于时长计算的翻页）
2. 移除翻页前的 1.5 秒延迟
3. 优化超时时间为 estimatedDuration + 3000ms
4. 只在初始化时启动 startAutoPlay
5. 添加虚拟人资源预加载机制
"""

import re

def fix_html_file(file_path):
    """修复 HTML 文件中的同步问题"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. 移除翻页前的 1.5 秒延迟
    # 查找并替换：console.log(`⏸️ 翻页前等待1.5秒...`);await new Promise(resolve=>setTimeout(resolve,1500));
    content = re.sub(
        r"console\.log\(`⏸️ 翻页前等待1\.5秒\.\.\.`\);await new Promise\(resolve=>setTimeout\(resolve,1500\)\);",
        "",
        content
    )
    
    # 2. 优化超时时间从 10000ms 到 3000ms
    content = re.sub(
        r"estimatedDuration\+10000",
        "estimatedDuration+3000",
        content
    )
    
    # 3. 移除 startAutoPageTurn 函数定义
    # 查找并删除整个 startAutoPageTurn 函数
    content = re.sub(
        r"// 自动翻页函数（根据语音时长自动翻页）\s*function startAutoPageTurn\(\)\{[^}]+\{[^}]+\}[^}]+\}[^}]+\}",
        "// startAutoPageTurn 函数已移除，现在只使用基于 frame_stop 事件的同步翻页",
        content
    )
    
    # 4. 移除初始化时对 startAutoPageTurn 的调用
    content = re.sub(
        r"startAutoPlay\(\);startAutoPageTurn\(\);",
        "startAutoPlay(); // 只使用基于 frame_stop 事件的同步翻页",
        content
    )
    
    # 5. 优化 frame_stop 事件处理的日志
    content = re.sub(
        r"console\.log\('🎬 frame_stop事件触发'\);",
        "console.log('🎬 frame_stop事件触发 - 虚拟人语音播放完成，准备立即翻页');",
        content
    )
    
    # 6. 添加虚拟人预加载提示（在 startTeaching 函数中）
    content = re.sub(
        r"avatarPlatform=new AvatarPlatform\(\{useInlinePlayer:true\}\);",
        "avatarPlatform=new AvatarPlatform({useInlinePlayer:true,preload:true}); // 启用预加载优化",
        content
    )
    
    # 7. 优化超时日志信息
    content = re.sub(
        r"⚠️ 第\$\{slide\}页讲解超时（\$\{estimatedDuration\+10000\}ms）",
        "⚠️ 第${slide}页讲解超时（${estimatedDuration+3000}ms）",
        content
    )
    
    # 8. 优化等待 frame_stop 的日志
    content = re.sub(
        r"⏳ 等待frame_stop事件（超时时间: \$\{estimatedDuration\+10000\}ms）",
        "⏳ 等待frame_stop事件（超时时间: ${estimatedDuration+3000}ms）",
        content
    )
    
    # 保存修复后的文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ 已修复文件: {file_path}")
    print("\n修复内容：")
    print("1. ✅ 移除翻页前的 1.5 秒固定延迟")
    print("2. ✅ 优化超时时间从 10 秒降低到 3 秒")
    print("3. ✅ 移除 startAutoPageTurn 函数（避免双重翻页机制冲突）")
    print("4. ✅ 移除初始化时对 startAutoPageTurn 的调用")
    print("5. ✅ 优化 frame_stop 事件处理日志")
    print("6. ✅ 添加虚拟人预加载配置")
    print("\n现在虚拟人说完当前页后会立即翻页，无延迟！")

if __name__ == "__main__":
    fix_html_file("04_4.3_函数的凹凸性与最值.html")

