#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量更新所有课程JSON配置文件，使用统一设置
"""

import json
import glob
import os

# 关键配置
DESKTOP_AUDIO_DEVICE_ID = "{0.0.0.00000000}.{bb16f8c7-bc91-4b50-824c-1a23de80b5e1}"
MIC_AUDIO_DEVICE_ID = "{0.0.1.00000000}.{6b2a10f3-b14c-4710-9e6f-5b59bba19a27}"

# 加载模板配置 (advanced-scene-switcher 模块)
with open('02_26_无穷小的比较11.json', 'r', encoding='utf-8') as f:
    template = json.load(f)
    advanced_scene_switcher_config = template['modules'].get('advanced-scene-switcher', {})

def update_json_file(file_path):
    """更新单个JSON文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 获取课程名称
        course_name = os.path.splitext(os.path.basename(file_path))[0]
        
        # 更新桌面音频配置
        if 'DesktopAudioDevice1' in data:
            data['DesktopAudioDevice1']['settings']['device_id'] = DESKTOP_AUDIO_DEVICE_ID
            data['DesktopAudioDevice1']['enabled'] = True
            data['DesktopAudioDevice1']['muted'] = False
            data['DesktopAudioDevice1']['monitoring_type'] = 1  # 仅监听
        
        # 更新麦克风配置
        if 'AuxAudioDevice1' in data:
            data['AuxAudioDevice1']['settings']['device_id'] = MIC_AUDIO_DEVICE_ID
            data['AuxAudioDevice1']['enabled'] = False
            data['AuxAudioDevice1']['muted'] = False
        
        # 添加/更新 advanced-scene-switcher 模块
        if 'modules' not in data:
            data['modules'] = {}
        data['modules']['advanced-scene-switcher'] = advanced_scene_switcher_config
        
        # 更新所有源的配置
        if 'sources' in data:
            for source in data['sources']:
                # 更新浏览器源
                if source.get('id') == 'browser_source':
                    source['monitoring_type'] = 2  # 监听并输出
                    source['muted'] = False
                    source['enabled'] = True
                
                # 更新场景中的scale
                if source.get('id') == 'scene' and 'settings' in source and 'items' in source['settings']:
                    for item in source['settings']['items']:
                        if 'scale' in item:
                            item['scale']['x'] = 1.0
                            item['scale']['y'] = 1.0
        
        # 保存修改
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        
        print(f"✅ {file_path}")
        return True
    except Exception as e:
        print(f"❌ {file_path}: {e}")
        return False

def main():
    """主函数"""
    print("🔧 开始批量更新JSON配置...\n")
    
    # 查找所有课程JSON文件
    json_files = glob.glob("*_*_*.json")
    
    # 排除模板和其他特殊文件
    exclude_files = [
        '02_26_无穷小的比较11.json',
        '需要录制的课程.json',
        '需要录制的课程_本地.json',
        '所有课程_分辨率已修正_已添加刷新.json'
    ]
    
    success_count = 0
    for json_file in json_files:
        if json_file not in exclude_files:
            if update_json_file(json_file):
                success_count += 1
    
    print(f"\n✨ 完成! 成功更新 {success_count} 个文件")
    print("\n📝 更新内容：")
    print("  - 桌面音频设备ID: Cable VB")
    print("  - 桌面音频监听类型: 1 (仅监听)")
    print("  - 麦克风设备ID: 已配置")
    print("  - 浏览器源监听类型: 2 (监听并输出)")
    print("  - 场景缩放: 1.0 x 1.0 (100%)")
    print("  - 添加: Advanced Scene Switcher 配置")

if __name__ == '__main__':
    main()

