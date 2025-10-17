#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""精确删除1500ms页面间隔"""

import re
import glob

files = glob.glob('*.html')
count = 0

for filename in files:
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        # 精确匹配：删除注释和if语句块
        pattern = r'\n\s*// 页面间等待时间\s*\n\s*if \(slide < totalSlides\) \{\s*\n\s*await new Promise\(resolve => setTimeout\(resolve, 1500\)\);\s*\n\s*\}'

        new_content = re.sub(pattern, '', content)

        if new_content != content:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'✅ 已删除 {filename} 的1500ms页面间隔')
            count += 1
        else:
            # 尝试更宽松的匹配
            pattern2 = r'//\s*页面间等待时间[^\n]*\n[^\n]*if\s*\(\s*slide\s*<\s*totalSlides\s*\)[^\}]*1500[^\}]*\}'
            new_content2 = re.sub(pattern2, '', content, flags=re.DOTALL)
            if new_content2 != content:
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(new_content2)
                print(f'✅ 已删除 {filename} 的1500ms页面间隔 (宽松匹配)')
                count += 1
    except Exception as e:
        print(f'❌ 处理 {filename} 失败: {e}')

print(f'\n✅ 总共处理了 {count} 个文件')
