import json
import uuid

# 定义需要创建的文件列表
files = [
    "09_9.2_二重积分的计算_直角坐标",
    "09_9.3_重积分应用与总结",
    "10_10.1_行列式及其几何意义",
    "10_10.2_矩阵运算与逆矩阵",
    "10_10.3_线性方程组的解法",
    "10_10.4_本章总结与工程应用",
    "11_11.1_级数的概念与敛散性判别",
    "11_11.2_幂级数与泰勒展开",
    "11_11.3_本章总结与误差控制",
    "12_12.1_向量的概念点积与叉积",
    "12_12.2_平面与直线方程",
    "12_12.3_本章综合与空间定位",
    "13_13.1_概率的基本概念与性质",
    "13_13.2_随机变量期望与方差",
    "13_13.3_正态分布与中心极限定理",
    "13_13.4_本章总结与综合应用"
]

# 生成UUID的辅助函数
def gen_uuid():
    return str(uuid.uuid4())

# JSON模板
start_id = 25
for idx, filename in enumerate(files):
    scene_uuid = gen_uuid()
    browser_uuid = gen_uuid()
    item_id = start_id + idx
    
    config = {
        "DesktopAudioDevice1": {"prev_ver": 536870913, "name": "桌面音频", "uuid": "f204e417-4f17-44ed-8d5b-fc21aef86d7e", "id": "wasapi_output_capture", "versioned_id": "wasapi_output_capture", "settings": {"device_id": "{0.0.0.00000000}.{bb16f8c7-bc91-4b50-824c-1a23de80b5e1}"}, "mixers": 255, "sync": 0, "flags": 0, "volume": 1.0, "balance": 0.5, "enabled": True, "muted": False, "push-to-mute": False, "push-to-mute-delay": 0, "push-to-talk": False, "push-to-talk-delay": 0, "hotkeys": {"libobs.mute": [], "libobs.unmute": [], "libobs.push-to-mute": [], "libobs.push-to-talk": []}, "deinterlace_mode": 0, "deinterlace_field_order": 0, "monitoring_type": 1, "private_settings": {}},
        "AuxAudioDevice1": {"prev_ver": 536870913, "name": "麦克风/Aux", "uuid": "c0131ef1-394a-4e3a-af0c-9bb8fd427613", "id": "wasapi_input_capture", "versioned_id": "wasapi_input_capture", "settings": {"device_id": "{0.0.1.00000000}.{6b2a10f3-b14c-4710-9e6f-5b59bba19a27}"}, "mixers": 255, "sync": 0, "flags": 0, "volume": 1.0, "balance": 0.5, "enabled": False, "muted": False, "push-to-mute": False, "push-to-mute-delay": 0, "push-to-talk": False, "push-to-talk-delay": 0, "hotkeys": {"libobs.mute": [], "libobs.unmute": [], "libobs.push-to-mute": [], "libobs.push-to-talk": []}, "deinterlace_mode": 0, "deinterlace_field_order": 0, "monitoring_type": 0, "private_settings": {}},
        "name": filename,
        "groups": [], "quick_transitions": [{"name": "直接切换", "duration": 300, "hotkeys": [], "id": 1, "fade_to_black": False}, {"name": "淡入淡出", "duration": 300, "hotkeys": [], "id": 2, "fade_to_black": False}, {"name": "淡入淡出", "duration": 300, "hotkeys": [], "id": 3, "fade_to_black": True}], "transitions": [], "saved_projectors": [], "canvases": [], "current_transition": "淡入淡出", "transition_duration": 300, "preview_locked": False, "scaling_enabled": True, "scaling_level": 0, "scaling_off_x": 0.0, "scaling_off_y": 0.0, "virtual-camera": {"type2": 3},
        "modules": {"scripts-tool": [], "output-timer": {"streamTimerHours": 0, "streamTimerMinutes": 0, "streamTimerSeconds": 30, "recordTimerHours": 0, "recordTimerMinutes": 0, "recordTimerSeconds": 30, "autoStartStreamTimer": False, "autoStartRecordTimer": False, "pauseRecordTimer": True}, "auto-scene-switcher": {"interval": 300, "non_matching_scene": "", "switch_if_not_matching": False, "active": False, "switches": []}, "captions": {"source": "", "enabled": False, "lang_id": 2052, "provider": "mssapi"}, "advanced-scene-switcher": {"sceneGroups": [], "macros": [], "macroSettings": {"highlightExecuted": False, "highlightConditions": False, "highlightActions": False, "newMacroCheckInParallel": False, "newMacroRegisterHotkey": False, "newMacroUseShortCircuitEvaluation": False, "saveSettingsOnMacroChange": True}, "variables": [], "switches": [], "ignoreWindows": [], "screenRegion": [], "pauseEntries": [], "sceneRoundTrip": [], "sceneTransitions": [], "defaultTransitions": [], "defTransitionDelay": 0, "ignoreIdleWindows": [], "idleTargetType": 0, "idleSceneName": "", "idleTransitionName": "", "idleEnable": False, "idleTime": 60, "executableSwitches": [], "randomSwitches": [], "fileSwitches": [], "readEnabled": False, "readPath": "", "writeEnabled": False, "writePath": "", "mediaSwitches": [], "timeSwitches": [], "audioSwitches": [], "audioFallbackTargetType": 0, "audioFallbackScene": "", "audioFallbackTransition": "", "audioFallbackEnable": False, "audioFallbackDuration": {"value": {"value": 0.0, "type": 0}, "unit": 0, "version": 1}, "videoSwitches": [], "interval": 300, "non_matching_scene": "", "switch_if_not_matching": 0, "noMatchDelay": {"value": {"value": 0.0, "type": 0}, "unit": 0, "version": 1}, "cooldown": {"value": {"value": 0.0, "type": 0}, "unit": 0, "version": 1}, "enableCooldown": False, "active": True, "startup_behavior": 0, "autoStartEvent": 0, "logLevel": 0, "logLevelVersion": 1, "showSystemTrayNotifications": False, "disableHints": False, "disableFilterComboboxFilter": False, "disableMacroWidgetCache": False, "warnPluginLoadFailure": True, "hideLegacyTabs": True, "priority0": 10, "priority1": 0, "priority2": 2, "priority3": 8, "priority4": 6, "priority5": 9, "priority6": 7, "priority7": 4, "priority8": 1, "priority9": 5, "priority10": 3, "threadPriority": 3, "transitionOverrideOverride": False, "adjustActiveTransitionType": True, "lastImportPath": "", "startHotkey": [], "stopHotkey": [], "toggleHotkey": [], "newMacroHotkey": [{"control": True, "key": "OBS_KEY_N"}], "upMacroSegmentHotkey": [], "downMacroSegmentHotkey": [], "removeMacroSegmentHotkey": [], "tabWidgetOrder": [{"generalTab": 0}, {"macroTab": 1}, {"windowTitleTab": 2}, {"executableTab": 3}, {"screenRegionTab": 4}, {"mediaTab": 5}, {"fileTab": 6}, {"randomTab": 7}, {"timeTab": 8}, {"idleTab": 9}, {"sceneSequenceTab": 10}, {"audioTab": 11}, {"videoTab": 12}, {"sceneGroupTab": 13}, {"transitionsTab": 14}, {"pauseTab": 15}, {"websocketConnectionTab": 16}, {"mqttConnectionTab": 17}, {"twitchConnectionTab": 18}, {"variableTab": 19}, {"actionQueueTab": 20}], "saveWindowGeo": False, "windowPosX": 0, "windowPosY": 0, "windowWidth": 0, "windowHeight": 0, "macroListMacroEditSplitterPosition": [], "version": "bf7fe71ae39a9a0a782a224dedda14513b97dfc2", "websocketConnections": [], "mqttConnections": [], "twitchConnections": [], "actionQueues": []}},
        "resolution": {"x": 1536, "y": 864}, "version": 2,
        "sources": [
            {"prev_ver": 536870913, "name": filename, "uuid": scene_uuid, "id": "scene", "versioned_id": "scene", "settings": {"id_counter": item_id, "custom_size": False, "items": [{"name": "浏览器", "source_uuid": browser_uuid, "visible": True, "locked": False, "rot": 0.0, "scale_ref": {"x": 1536.0, "y": 864.0}, "align": 5, "bounds_type": 0, "bounds_align": 0, "bounds_crop": False, "crop_left": 0, "crop_top": 0, "crop_right": 0, "crop_bottom": 0, "id": item_id, "group_item_backup": False, "pos": {"x": 0.0, "y": 0.0}, "pos_rel": {"x": -1.7777777910232544, "y": -1.0}, "scale": {"x": 1.0, "y": 1.0}, "scale_rel": {"x": 1.0, "y": 1.0}, "bounds": {"x": 0.0, "y": 0.0}, "bounds_rel": {"x": 0.0, "y": 0.0}, "scale_filter": "disable", "blend_method": "default", "blend_type": "normal", "show_transition": {"duration": 0}, "hide_transition": {"duration": 0}, "private_settings": {}}]}, "mixers": 0, "sync": 0, "flags": 0, "volume": 1.0, "balance": 0.5, "enabled": True, "muted": False, "push-to-mute": False, "push-to-mute-delay": 0, "push-to-talk": False, "push-to-talk-delay": 0, "hotkeys": {"OBSBasic.SelectScene": [], f"libobs.show_scene_item.{item_id}": [], f"libobs.hide_scene_item.{item_id}": []}, "deinterlace_mode": 0, "deinterlace_field_order": 0, "monitoring_type": 0, "canvas_uuid": "6c69626f-6273-4c00-9d88-c5136d61696e", "private_settings": {}},
            {"prev_ver": 536870913, "name": "浏览器", "uuid": browser_uuid, "id": "browser_source", "versioned_id": "browser_source", "settings": {"url": f"https://cherishwy1974.github.io/123/{filename}.html", "width": 1536, "height": 864, "reroute_audio": True, "restart_when_active": True, "shutdown": False}, "mixers": 255, "sync": 0, "flags": 0, "volume": 1.0, "balance": 0.5, "enabled": True, "muted": False, "push-to-mute": False, "push-to-mute-delay": 0, "push-to-talk": False, "push-to-talk-delay": 0, "hotkeys": {"libobs.mute": [], "libobs.unmute": [], "libobs.push-to-mute": [], "libobs.push-to-talk": [], "ObsBrowser.Refresh": []}, "deinterlace_mode": 0, "deinterlace_field_order": 0, "monitoring_type": 2, "private_settings": {}}
        ],
        "scene_order": [{"name": filename}],
        "current_scene": filename,
        "current_program_scene": filename
    }
    
    # 写入JSON文件
    output_file = f"{filename}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=4)
    
    print(f"Created: {output_file}")

print(f"\n✅ Successfully created {len(files)} JSON files!")

