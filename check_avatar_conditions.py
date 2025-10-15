#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""检查第3-5章文件的虚拟人启动条件"""

import glob
import re

def check_file(filepath):
    """检查单个文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 查找 startAutoPlay 函数（支持压缩和未压缩格式）
    # 先去除所有多余空格，统一处理
    compressed = re.sub(r'\s+', ' ', content)

    # 查找函数
    match = re.search(r'async function startAutoPlay\(\) \{([^}]+)\}', compressed)

    if not match:
        return "❌ 未找到startAutoPlay函数"

    func_body = match.group(1)

    # 检查是否有虚拟人启动代码
    if 'startTeaching()' not in func_body and 'await startTeaching()' not in func_body:
        return "❌ 缺少 startTeaching()"

    # 检查条件
    if '!avatarPlatform || !isConnected' in func_body or '!avatarPlatform||!isConnected' in func_body:
        return "✅ 正确（avatarPlatform && isConnected）"
    elif '!isConnected' in func_body:
        return "⚠️ 仅检查isConnected，需要改进"
    else:
        return "⚠️ 有startTeaching但条件不明"

def main():
    """主函数"""
    for chapter in range(3, 6):
        files = sorted(glob.glob(f'{chapter:02d}_*.html'))
        if files:
            print(f"\n{'='*60}")
            print(f"第{chapter}章 ({len(files)}个文件)")
            print(f"{'='*60}")

            for filepath in files:
                result = check_file(filepath)
                basename = filepath.split('\\')[-1] if '\\' in filepath else filepath
                print(f"{result} {basename}")

if __name__ == '__main__':
    main()
