#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""修复第2章文件的虚拟人启动条件"""

import os
import re
import glob

def fix_avatar_condition(filepath):
    """修复单个文件"""
    print(f"处理文件: {filepath}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 模式: if (!isConnected) { ... startTeaching().catch ...
    # 需要替换成: if (!avatarPlatform || !isConnected) { ... await startTeaching() ...

    # 查找旧模式（使用.catch的版本）
    old_pattern = r'''if \(!isConnected\) \{
                    console\.log\('🎬 后台尝试连接虚拟人\.\.\.'\);
                    startTeaching\(\)\.catch\(error => \{
                        console\.log\('⚠️ 虚拟人连接失败[,，]继续页面播放:', error\);
                    \}\);
                \}'''

    new_code = '''if (!avatarPlatform || !isConnected) {
                    console.log('🎬 启动虚拟人...');
                    await startTeaching();
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }'''

    if re.search(old_pattern, content):
        new_content = re.sub(old_pattern, new_code, content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"  ✓ 已修复虚拟人启动条件（.catch版本）")
        return True

    # 查找另一种模式（02_2.1使用的版本）
    old_pattern2 = r'''if \(!isConnected\) \{
                    console\.log\('🎬 连接虚拟人\.\.\.'\);
                    await startTeaching\(\);
                    // 等待连接完成
                    await new Promise\(resolve => setTimeout\(resolve, 2000\)\);
                \}'''

    new_code2 = '''if (!avatarPlatform || !isConnected) {
                    console.log('🎬 启动虚拟人...');
                    await startTeaching();
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }'''

    if re.search(old_pattern2, content):
        new_content = re.sub(old_pattern2, new_code2, content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"  ✓ 已修复虚拟人启动条件（await版本）")
        return True

    print(f"  ⚠ 未找到匹配模式或已经正确")
    return False

def main():
    """主函数"""
    files = sorted(glob.glob('02_*.html'))
    print(f"找到 {len(files)} 个第2章文件\n")

    skip_files = ['02_2.1_极限的定义与存在条件.html', '02_2.2_无穷小与无穷大.html']

    success_count = 0
    for filepath in files:
        basename = os.path.basename(filepath)
        if basename in skip_files:
            print(f"跳过: {filepath} (已手动修复)\n")
            continue

        if fix_avatar_condition(filepath):
            success_count += 1
        print()

    print(f"\n处理完成! 成功修改了 {success_count} 个文件")

if __name__ == '__main__':
    main()
