#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""删除所有文件中的1500ms页面间隔"""

import re

files = [
    "02_2.7_函数的连续性.html",
    "07_7.2_可分离变量的微分方程.html",
    "07_7.3_一阶线性微分方程.html",
    "07_7.4_本章回顾与习题精讲.html",
    "09_9.1_二重积分的概念与几何意义.html",
    "09_9.2_二重积分的计算_直角坐标.html",
    "09_9.3_重积分应用与总结.html"
]

pattern = r'\s*// 页面间等待时间\s+if \(slide < totalSlides\) \{\s+await new Promise\(resolve => setTimeout\(resolve, 1500\)\);\s+\}'

for filename in files:
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = re.sub(pattern, '', content)

        if new_content != content:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'✅ 已删除 {filename} 的1500ms页面间隔')
        else:
            print(f'⚠️  {filename} 中未找到匹配的页面间隔代码')
    except Exception as e:
        print(f'❌ 处理 {filename} 失败: {e}')

print('\n✅ 完成！')
