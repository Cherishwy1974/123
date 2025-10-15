#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""修复05_5.1的虚拟人启动条件"""

filepath = '05_5.1_不定积分的概念.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 替换条件
old_code = "if(!isConnected){console.log('🎬 连接虚拟人"
new_code = "if(!avatarPlatform||!isConnected){console.log('🎬 启动虚拟人"

if old_code in content:
    new_content = content.replace(old_code, new_code)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"✅ 已修复 {filepath}")
    print(f"   替换: {old_code[:40]}...")
    print(f"   为:   {new_code[:40]}...")
else:
    print(f"❌ 未找到旧代码")
