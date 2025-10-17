#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修改OBS JSON配置，启用音频监听
monitoring_type: 0=关闭, 1=仅监听, 2=监听并输出
"""

import json
import glob

def update_audio_monitoring(file_path):
    """更新JSON文件的音频监听配置"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 更新桌面音频 - 启用并设置监听
        if 'DesktopAudioDevice1' in data:
            data['DesktopAudioDevice1']['enabled'] = True
            data['DesktopAudioDevice1']['muted'] = False
            data['DesktopAudioDevice1']['monitoring_type'] = 2  # 监听并输出
        
        # 更新所有浏览器源的音频监听
        if 'sources' in data:
            for source in data['sources']:
                if source.get('id') == 'browser_source':
                    source['monitoring_type'] = 2  # 监听并输出
                    source['muted'] = False
        
        # 保存
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ {file_path}")
        return True
    except Exception as e:
        print(f"❌ {file_path}: {e}")
        return False

# 更新所有课程JSON
json_files = glob.glob("*_*_*.json")
for f in json_files:
    if '需要录制' not in f and '所有课程' not in f:
        update_audio_monitoring(f)

print("\n✨ 完成！现在录制时你可以听到声音了")

