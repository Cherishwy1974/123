#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""批量给HTML文件添加自动播放功能"""

import os
import glob
import re

# 要添加的自动播放代码 - 类型1 (showSlide版本)
AUTOPLAY_CODE_TYPE1 = """
        // 🚀 自动启动播放 - 延迟3秒后自动开始
        setTimeout(() => {
            console.log('🚀 自动启动播放...');
            startAutoPlay();
        }, 3000);"""

# 要添加的自动播放代码 - 类型2 (DOMContentLoaded版本)
AUTOPLAY_CODE_TYPE2 = """
            // 🚀 自动启动播放 - 延迟3秒后自动开始
            setTimeout(() => {
                console.log('🚀 自动启动播放...');
                startAutoPlay();
            }, 3000);"""

def add_autoplay_to_file(filepath):
    """给单个文件添加自动播放功能"""
    print(f"处理文件: {filepath}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查是否已经添加过
    if '🚀 自动启动播放' in content:
        print(f"  ✓ 已存在自动播放代码,跳过")
        return False

    # 类型1: 检查是否有showSlide(0)
    if 'showSlide(0);' in content:
        # 在 showSlide(0); 后面添加自动播放代码
        pattern = r'(showSlide\(0\);)\s*(</script>)'
        replacement = r'\1' + AUTOPLAY_CODE_TYPE1 + r'\n  \2'
        new_content = re.sub(pattern, replacement, content)

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"  ✓ 添加成功 (类型1: showSlide)")
            return True
        else:
            print(f"  ⚠ 类型1匹配失败")
            return False

    # 类型2: 检查是否有DOMContentLoaded + switchToPage
    if 'DOMContentLoaded' in content and 'switchToPage' in content:
        # 在 switchToPage(1); 后面添加自动播放代码
        pattern = r'(document\.addEventListener\([\'"]DOMContentLoaded[\'"],[^\{]*\{[^\}]*switchToPage\(1\);)\s*(\}\);)'
        replacement = r'\1' + AUTOPLAY_CODE_TYPE2 + r'\n        \2'
        new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"  ✓ 添加成功 (类型2: DOMContentLoaded)")
            return True
        else:
            print(f"  ⚠ 类型2匹配失败")
            return False

    print(f"  ⚠ 未找到匹配的模式,跳过")
    return False

def main():
    """主函数"""
    # 获取所有第四章及以后的HTML文件
    pattern = '[0-9][0-9]_*.html'
    files = sorted(glob.glob(pattern))

    # 过滤掉第1-5章 (因为前5章已处理完)
    files = [f for f in files if int(f.split('_')[0]) >= 6]

    print(f"找到 {len(files)} 个文件需要处理\n")

    success_count = 0
    for filepath in files:
        if add_autoplay_to_file(filepath):
            success_count += 1
        print()

    print(f"\n处理完成! 成功修改了 {success_count} 个文件")

if __name__ == '__main__':
    main()
