#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量移除之前添加的播放完成标记，恢复到原始状态
只保留 window.playbackFinished = false 的初始化
"""

import os
import re
from pathlib import Path

def restore_stopAutoPlay(content):
    """恢复stopAutoPlay函数到原始状态"""
    
    # 移除添加的三行代码
    pattern = r'(function stopAutoPlay\(\) \{\s*if \(isAutoPlaying\) \{\s*isAutoPlaying = false;)\s*window\.playbackFinished = true;\s*document\.title = "PLAYBACK_FINISHED";\s*console\.log\([^)]+\);'
    
    replacement = r'\1'
    
    content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
    
    return content

def restore_auto_play_end(content):
    """恢复自动播放结束时的代码"""
    
    # 移除在自动播放循环结束后添加的代码
    pattern = r'(\}\s*isAutoPlaying = false;)\s*window\.playbackFinished = true;\s*document\.title = "PLAYBACK_FINISHED";\s*console\.log\([^)]+\);(\s*document\.getElementById\([\'"]autoPlayBtn[\'"]\)\.disabled = false;)'
    
    replacement = r'\1\2'
    
    content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
    
    return content

def process_file(file_path):
    """处理单个HTML文件"""
    
    print(f"处理文件: {file_path.name}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 恢复stopAutoPlay函数
        content = restore_stopAutoPlay(content)
        
        # 恢复自动播放结束代码
        content = restore_auto_play_end(content)
        
        if content != original_content:
            # 备份原文件
            backup_path = file_path.with_suffix('.html.backup')
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)
            
            # 写入修改后的内容
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"  ✅ 已恢复（备份: {backup_path.name}）")
            return True
        else:
            print(f"  ⏭️  无需修改")
            return False
            
    except Exception as e:
        print(f"  ❌ 处理失败: {e}")
        return False

def main():
    # 获取所有HTML文件（排除1.1）
    html_files = sorted([f for f in Path('.').glob('*.html') if f.name != '01_1.1_指数的概念与运算.html'])
    
    print("=" * 80)
    print("批量移除播放完成标记")
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
        print("  - 原文件已备份为 .html.backup")
        print("  - 如果需要恢复，可以删除修改后的文件，将备份文件重命名")
        print("  - 测试无问题后，可以删除所有 .backup 文件")

if __name__ == '__main__':
    main()

