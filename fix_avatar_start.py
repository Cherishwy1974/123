#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""修复第6-13章的startAutoPlay函数，添加启动虚拟人的代码"""

import os
import re

# 需要添加的代码片段
AVATAR_START_CODE = """            // 首先启动虚拟人
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
    if '// 首先启动虚拟人' in content or 'await startTeaching()' in content:
        print(f"  ✓ 已存在虚拟人启动代码,跳过")
        return False

    # 查找startAutoPlay函数的开始位置
    # 模式: async function startAutoPlay() { ... isAutoPlaying = true;
    pattern = r'(async function startAutoPlay\(\)\s*\{[^\{]*isAutoPlaying\s*=\s*true;[^\n]*\n)'

    matches = list(re.finditer(pattern, content, re.DOTALL))

    if not matches:
        print(f"  ⚠ 未找到startAutoPlay函数")
        return False

    # 在第一个匹配后面添加虚拟人启动代码
    match = matches[0]
    insert_pos = match.end()

    # 查找下一个有效代码行（跳过注释和空行）
    # 我们要在isAutoPlaying=true之后,第一个实际代码之前插入
    remaining = content[insert_pos:insert_pos+500]

    # 找到下一个非空非注释行
    lines = remaining.split('\n')
    indent_count = 0
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped and not stripped.startswith('//') and not stripped.startswith('/*'):
            # 找到第一个实际代码行,在它之前插入
            indent_count = len(line) - len(line.lstrip())
            insert_pos = insert_pos + sum(len(l) + 1 for l in lines[:i])
            break

    new_content = content[:insert_pos] + '\n' + AVATAR_START_CODE + content[insert_pos:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"  ✓ 已添加虚拟人启动代码")
    return True

def main():
    """主函数"""
    # 第6-13章的所有文件
    import glob

    files = []
    for chapter in range(6, 14):
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
