#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修改为使用默认音频设备，录制时可以直接听到声音
"""

import json
import glob

def use_default_audio(file_path):
    """修改为默认音频设备"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 桌面音频使用默认设备
        if 'DesktopAudioDevice1' in data:
            data['DesktopAudioDevice1']['settings']['device_id'] = 'default'
            data['DesktopAudioDevice1']['enabled'] = True
            data['DesktopAudioDevice1']['muted'] = False
            data['DesktopAudioDevice1']['monitoring_type'] = 0  # 不需要监听
        
        # 浏览器源音频设置
        if 'sources' in data:
            for source in data['sources']:
                if source.get('id') == 'browser_source':
                    source['muted'] = False
                    source['monitoring_type'] = 0  # 不需要监听
        
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
        use_default_audio(f)

print("\n✨ 完成！现在使用默认音频设备，录制时你可以直接听到声音")
print("💡 系统声音会同时：")
print("   1. 被OBS录制到视频中")
print("   2. 从你的扬声器/耳机播放出来（你能听到）")

