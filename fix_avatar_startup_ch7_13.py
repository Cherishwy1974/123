#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""修复第7-13章的startAutoPlay函数，添加启动虚拟人的代码"""

import os
import re

# 需要添加的代码片段
AVATAR_START_CODE = """
                // 首先启动虚拟人
                if (!avatarPlatform || !isConnected) {
                    console.log('🎬 启动虚拟人...');
                    await startTeaching();
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

"""

def fix_start_autoplay(filepath):
    """修复单个文件的startAutoPlay函数"""
    print(f"处理文件: {filepath}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查是否已经有启动虚拟人的代码
    if 'await startTeaching()' in content and 'async function startAutoPlay' in content:
        # 进一步检查是否在startAutoPlay函数内
        autoplay_match = re.search(r'async function startAutoPlay\(\)[^{]*\{(.*?)\n        \}', content, re.DOTALL)
        if autoplay_match and 'await startTeaching()' in autoplay_match.group(1):
            print(f"  ✓ 已存在虚拟人启动代码,跳过")
            return False

    # 查找 isAutoPlaying = true; 后面的第一个实际代码行
    # 模式：找到 isAutoPlaying = true; 然后在它之后找到下一行代码（通常是 const autoPlayBtn 或类似的）
    pattern = r'(isAutoPlaying\s*=\s*true;\s*\n)\s*(const autoPlayBtn|document\.body|console\.log\([\'"]🚀)'

    matches = list(re.finditer(pattern, content))

    if not matches:
        print(f"  ⚠ 未找到匹配的代码模式")
        return False

    # 在第一个匹配的 isAutoPlaying = true; 后面插入代码
    match = matches[0]
    insert_pos = match.start(2)

    new_content = content[:insert_pos] + AVATAR_START_CODE + content[insert_pos:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"  ✓ 已添加虚拟人启动代码")
    return True

def main():
    """主函数"""
    import glob

    files = []
    for chapter in range(7, 14):
        pattern = f'{chapter:02d}_*.html'
        files.extend(sorted(glob.glob(pattern)))

    print(f"找到 {len(files)} 个文件需要处理\n")

    success_count = 0
    for filepath in files:
        if fix_start_autoplay(filepath):
            success_count += 1
        print()

    print(f"\n处理完成! 成功修改了 {success_count} 个文件")

if __name__ == '__main__':
    main()
