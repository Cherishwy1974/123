#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证所有章节的虚拟人启动条件"""

import glob

def check_file(filepath):
    """检查单个文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查是否有正确的条件
    if 'if(!avatarPlatform||!isConnected)' in content or 'if (!avatarPlatform || !isConnected)' in content:
        return True
    return False

def main():
    """主函数"""
    for chapter in range(2, 14):
        files = sorted(glob.glob(f'{chapter:02d}_*.html'))
        if not files:
            continue

        print(f"\n{'='*60}")
        print(f"第{chapter}章 ({len(files)}个文件)")
        print(f"{'='*60}")

        correct_count = 0
        for filepath in files:
            basename = filepath.split('\\')[-1] if '\\' in filepath else filepath
            if check_file(filepath):
                print(f"✅ {basename}")
                correct_count += 1
            else:
                print(f"⚠️ {basename}")

        print(f"\n统计: {correct_count}/{len(files)} 个文件已修复")

if __name__ == '__main__':
    main()
