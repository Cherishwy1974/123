#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
禁用所有HTML文件的自动播放功能
改为手动点击"启动虚拟人"或"自动播放"按钮
"""

import os
import re
from pathlib import Path

def disable_auto_play(content):
    """禁用自动播放"""
    
    # 注释掉自动启动播放的代码
    pattern = r'(// 自动启动播放\s*setTimeout\(\(\) => \{\s*console\.log\([^)]+\);\s*startAutoPlay\(\);\s*\}, \d+\);)'
    
    replacement = r'// 已禁用自动播放（避免浏览器阻止音频）\n            // \1'
    
    content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)
    
    return content

def process_file(file_path):
    """处理单个HTML文件"""
    
    print(f"处理文件: {file_path.name}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 禁用自动播放
        content = disable_auto_play(content)
        
        if content != original_content:
            # 备份原文件
            backup_path = file_path.with_suffix('.html.bak2')
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)
            
            # 写入修改后的内容
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"  ✅ 已禁用自动播放（备份: {backup_path.name}）")
            return True
        else:
            print(f"  ⏭️  无需修改")
            return False
            
    except Exception as e:
        print(f"  ❌ 处理失败: {e}")
        return False

def main():
    # 获取所有HTML文件
    html_files = sorted(Path('.').glob('*.html'))
    
    print("=" * 80)
    print("禁用自动播放功能")
    print("=" * 80)
    print(f"找到 {len(html_files)} 个文件需要处理")
    print()
    
    modified_count = 0
    
    for html_file in html_files:
        if process_file(html_file):
            modified_count += 1
        print()
    
    print("=" * 80)
    print(f"处理完成！共修改 {modified_count} 个文件")
    print("=" * 80)
    
    if modified_count > 0:
        print()
        print("💡 提示：")
        print("  - 原文件已备份为 .html.bak2")
        print("  - 现在需要手动点击按钮启动虚拟人")
        print("  - 这样可以避免浏览器的自动播放限制")
        print()
        print("📋 使用方法：")
        print("  1. 在OBS中切换到场景")
        print("  2. 等待浏览器加载完成（约3秒）")
        print("  3. 点击页面上的'自动播放'按钮")
        print("  4. 虚拟人会自动连接并开始讲解")

if __name__ == '__main__':
    main()

