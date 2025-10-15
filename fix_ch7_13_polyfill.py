#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""为第7-13章添加polyfill.min.js引用，修复虚拟人不显示的问题"""

import os
import glob
import re

def fix_chapter_file(filepath):
    """修复单个文件"""
    print(f"处理文件: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 检查是否已经有polyfill
    if 'polyfill.min.js' in content:
        print(f"  ✓ 已存在polyfill引用,跳过")
        return False
    
    # 在SDK导入之前添加polyfill
    # 查找 <script type="module"> 标签（SDK导入的位置）
    pattern = r'(<!-- 讯飞官方SDK -->)\s*\n(<script type="module">)'
    
    if not re.search(pattern, content):
        print(f"  ⚠ 未找到SDK导入标记")
        return False
    
    # 在 SDK script 之前插入 polyfill script
    polyfill_code = '<!-- Polyfill for older browsers -->\n<script src="./polyfill.min.js"></script>\n\n'
    
    new_content = re.sub(
        pattern,
        r'\1\n' + polyfill_code + r'\2',
        content
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"  ✓ 已添加polyfill.min.js引用")
    return True

def main():
    """主函数"""
    files = []
    for chapter in range(7, 14):
        pattern = f'{chapter:02d}_*.html'
        files.extend(sorted(glob.glob(pattern)))
    
    print(f"找到 {len(files)} 个文件需要处理\n")
    
    success_count = 0
    for filepath in files:
        if fix_chapter_file(filepath):
            success_count += 1
        print()
    
    print(f"\n处理完成! 成功修改了 {success_count} 个文件")

if __name__ == '__main__':
    main()

