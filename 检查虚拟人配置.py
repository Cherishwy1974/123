#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查所有HTML文件的虚拟人SDK配置
"""

import os
import re
from pathlib import Path

def check_html_file(file_path):
    """检查单个HTML文件的配置"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    results = {
        'file': file_path.name,
        'has_sdk_import': False,
        'has_appId': False,
        'has_apiKey': False,
        'has_apiSecret': False,
        'has_sceneId': False,
        'has_serverUrl': False,
        'has_avatar_id': False,
        'sdk_path': None,
        'appId': None,
        'sceneId': None,
        'avatar_id': None
    }
    
    # 检查SDK导入
    sdk_import_pattern = r"import\(['\"](.+?avatar-sdk.+?)['\"]"
    sdk_match = re.search(sdk_import_pattern, content)
    if sdk_match:
        results['has_sdk_import'] = True
        results['sdk_path'] = sdk_match.group(1)
    
    # 检查appId
    appId_pattern = r"appId:\s*['\"]([^'\"]+)['\"]"
    appId_match = re.search(appId_pattern, content)
    if appId_match:
        results['has_appId'] = True
        results['appId'] = appId_match.group(1)
    
    # 检查apiKey
    if 'apiKey:' in content:
        results['has_apiKey'] = True
    
    # 检查apiSecret
    if 'apiSecret:' in content:
        results['has_apiSecret'] = True
    
    # 检查sceneId
    sceneId_pattern = r"sceneId:\s*['\"]([^'\"]+)['\"]"
    sceneId_match = re.search(sceneId_pattern, content)
    if sceneId_match:
        results['has_sceneId'] = True
        results['sceneId'] = sceneId_match.group(1)
    
    # 检查serverUrl
    if 'serverUrl:' in content:
        results['has_serverUrl'] = True
    
    # 检查avatar_id
    avatar_id_pattern = r"avatar_id:\s*['\"]([^'\"]+)['\"]"
    avatar_id_match = re.search(avatar_id_pattern, content)
    if avatar_id_match:
        results['has_avatar_id'] = True
        results['avatar_id'] = avatar_id_match.group(1)
    
    return results

def main():
    # 获取所有HTML文件
    html_files = sorted(Path('.').glob('*.html'))
    
    print("=" * 100)
    print("虚拟人SDK配置检查报告")
    print("=" * 100)
    print()
    
    all_results = []
    problem_files = []
    
    for html_file in html_files:
        results = check_html_file(html_file)
        all_results.append(results)
        
        # 检查是否有问题
        is_ok = all([
            results['has_sdk_import'],
            results['has_appId'],
            results['has_apiKey'],
            results['has_apiSecret'],
            results['has_sceneId'],
            results['has_serverUrl'],
            results['has_avatar_id']
        ])
        
        if not is_ok:
            problem_files.append(results)
    
    # 输出问题文件
    if problem_files:
        print(f"❌ 发现 {len(problem_files)} 个文件配置不完整：")
        print()
        
        for result in problem_files:
            print(f"📄 {result['file']}")
            print(f"   SDK导入: {'✅' if result['has_sdk_import'] else '❌'} {result['sdk_path'] or '未找到'}")
            print(f"   appId: {'✅' if result['has_appId'] else '❌'} {result['appId'] or '未找到'}")
            print(f"   apiKey: {'✅' if result['has_apiKey'] else '❌'}")
            print(f"   apiSecret: {'✅' if result['has_apiSecret'] else '❌'}")
            print(f"   sceneId: {'✅' if result['has_sceneId'] else '❌'} {result['sceneId'] or '未找到'}")
            print(f"   serverUrl: {'✅' if result['has_serverUrl'] else '❌'}")
            print(f"   avatar_id: {'✅' if result['has_avatar_id'] else '❌'} {result['avatar_id'] or '未找到'}")
            print()
    else:
        print("✅ 所有文件配置完整！")
        print()
    
    # 统计信息
    print("=" * 100)
    print("统计信息")
    print("=" * 100)
    print(f"总文件数: {len(all_results)}")
    print(f"配置完整: {len(all_results) - len(problem_files)}")
    print(f"配置不完整: {len(problem_files)}")
    print()
    
    # 检查SDK路径是否一致
    sdk_paths = set(r['sdk_path'] for r in all_results if r['sdk_path'])
    if len(sdk_paths) > 1:
        print("⚠️  发现多个不同的SDK路径:")
        for path in sdk_paths:
            count = sum(1 for r in all_results if r['sdk_path'] == path)
            print(f"   {path} ({count}个文件)")
        print()
    
    # 检查appId是否一致
    appIds = set(r['appId'] for r in all_results if r['appId'])
    if len(appIds) > 1:
        print("⚠️  发现多个不同的appId:")
        for appId in appIds:
            count = sum(1 for r in all_results if r['appId'] == appId)
            print(f"   {appId} ({count}个文件)")
        print()
    
    # 检查sceneId是否一致
    sceneIds = set(r['sceneId'] for r in all_results if r['sceneId'])
    if len(sceneIds) > 1:
        print("⚠️  发现多个不同的sceneId:")
        for sceneId in sceneIds:
            count = sum(1 for r in all_results if r['sceneId'] == sceneId)
            print(f"   {sceneId} ({count}个文件)")
        print()
    
    # 检查avatar_id是否一致
    avatar_ids = set(r['avatar_id'] for r in all_results if r['avatar_id'])
    if len(avatar_ids) > 1:
        print("⚠️  发现多个不同的avatar_id:")
        for avatar_id in avatar_ids:
            count = sum(1 for r in all_results if r['avatar_id'] == avatar_id)
            print(f"   {avatar_id} ({count}个文件)")
        print()
    
    # 特别检查1.3之后的文件
    print("=" * 100)
    print("特别检查：1.3之后的文件")
    print("=" * 100)
    
    files_after_13 = [r for r in all_results if r['file'] >= '01_1.3']
    
    for result in files_after_13[:5]:  # 只显示前5个
        print(f"📄 {result['file']}")
        print(f"   SDK路径: {result['sdk_path']}")
        print(f"   appId: {result['appId']}")
        print(f"   sceneId: {result['sceneId']}")
        print(f"   avatar_id: {result['avatar_id']}")
        print()

if __name__ == '__main__':
    main()

