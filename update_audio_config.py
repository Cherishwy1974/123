#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量更新OBS场景JSON文件的音频配置
将所有场景配置为使用Cable VB音频设备
"""

import json
import os
import glob

def update_json_audio(file_path):
    """更新单个JSON文件的音频配置"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 更新桌面音频配置
        if 'DesktopAudioDevice1' in data:
            data['DesktopAudioDevice1']['enabled'] = True
            data['DesktopAudioDevice1']['muted'] = False
            # 注意：device_id需要在OBS中手动选择Cable VB设备
            # 这里先设置为默认，后续在OBS中选择
            print(f"✅ 已启用音频: {os.path.basename(file_path)}")
        
        # 保存修改
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        return True
    except Exception as e:
        print(f"❌ 处理 {file_path} 时出错: {e}")
        return False

def main():
    """主函数"""
    print("🎵 开始批量更新音频配置...\n")
    
    # 查找所有课程JSON文件
    json_files = glob.glob("*_*.json")
    
    success_count = 0
    for json_file in json_files:
        if json_file not in ['需要录制的课程.json', '需要录制的课程_本地.json', '所有课程_分辨率已修正_已添加刷新.json']:
            if update_json_audio(json_file):
                success_count += 1
    
    print(f"\n✨ 完成! 成功更新 {success_count}/{len(json_files)} 个文件")
    print("\n📝 下一步操作：")
    print("1. 在OBS中打开任一场景集合")
    print("2. 设置 -> 音频 -> 桌面音频设备")
    print("3. 选择 'CABLE Output (VB-Audio Virtual Cable)'")
    print("4. 确保系统声音输出设置为 CABLE Input")
    print("5. 这样就能在录制时听到声音了！")

if __name__ == '__main__':
    main()

