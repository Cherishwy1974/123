#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
对比 05_5.2 和 05_5.3 的虚拟人配置
"""

import re
from pathlib import Path

def extract_avatar_config(file_path):
    """提取虚拟人相关配置"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    config = {}
    
    # 提取 avatar-container 样式
    avatar_container_match = re.search(r'\.avatar-container\s*{([^}]+)}', content)
    if avatar_container_match:
        config['avatar_container_style'] = avatar_container_match.group(1).strip()
    
    # 提取 wrapper 样式
    wrapper_match = re.search(r'\.wrapper\s*{([^}]+)}', content)
    if wrapper_match:
        config['wrapper_style'] = wrapper_match.group(1).strip()
    
    # 提取 setApiInfo 配置
    api_info_match = re.search(r'setApiInfo\s*\(\s*{([^}]+)}\s*\)', content, re.DOTALL)
    if api_info_match:
        config['api_info'] = api_info_match.group(1).strip()
    
    # 提取 setGlobalParams 配置
    global_params_match = re.search(r'setGlobalParams\s*\(\s*{(.+?)}\s*\);', content, re.DOTALL)
    if global_params_match:
        config['global_params'] = global_params_match.group(1).strip()
    
    # 提取 avatarWrapper HTML
    wrapper_html_match = re.search(r'<div[^>]*id="avatarWrapper"[^>]*>.*?</div>', content)
    if wrapper_html_match:
        config['wrapper_html'] = wrapper_html_match.group(0)
    
    # 检查 SDK 导入
    sdk_import_match = re.search(r'import\([\'"]([^\'"]+avatar-sdk[^\'"]+)[\'"]\)', content)
    if sdk_import_match:
        config['sdk_path'] = sdk_import_match.group(1)
    
    return config

def compare_configs(file1, file2):
    """对比两个文件的配置"""
    print("=" * 80)
    print(f"对比虚拟人配置")
    print("=" * 80)
    print(f"文件1: {file1}")
    print(f"文件2: {file2}")
    print("=" * 80)
    print()
    
    config1 = extract_avatar_config(file1)
    config2 = extract_avatar_config(file2)
    
    all_keys = set(config1.keys()) | set(config2.keys())
    
    differences = []
    
    for key in sorted(all_keys):
        val1 = config1.get(key, '❌ 缺失')
        val2 = config2.get(key, '❌ 缺失')
        
        print(f"\n【{key}】")
        print("-" * 80)
        
        if val1 == val2:
            print(f"✅ 相同")
            print(f"   {val1[:100]}..." if len(str(val1)) > 100 else f"   {val1}")
        else:
            print(f"❌ 不同")
            print(f"\n文件1 ({file1.name}):")
            print(f"   {val1}")
            print(f"\n文件2 ({file2.name}):")
            print(f"   {val2}")
            differences.append(key)
    
    print("\n" + "=" * 80)
    if differences:
        print(f"⚠️ 发现 {len(differences)} 处差异:")
        for diff in differences:
            print(f"   - {diff}")
    else:
        print("✅ 所有配置完全相同！")
    print("=" * 80)

def main():
    file1 = Path("05_5.2_换元积分法.html")
    file2 = Path("05_5.3_分部积分法.html")
    
    if not file1.exists():
        print(f"❌ 文件不存在: {file1}")
        return
    
    if not file2.exists():
        print(f"❌ 文件不存在: {file2}")
        return
    
    compare_configs(file1, file2)

if __name__ == "__main__":
    main()

