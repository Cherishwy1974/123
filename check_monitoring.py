import json
from pathlib import Path

def check_and_fix_monitoring(json_file):
    """检查并修复JSON配置中的monitoring_type"""
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            config = json.load(f)

        issues_found = []
        fixed = False

        # 检查桌面音频
        if 'DesktopAudioDevice1' in config:
            if config['DesktopAudioDevice1'].get('monitoring_type') == 2:
                config['DesktopAudioDevice1']['monitoring_type'] = 1
                issues_found.append('桌面音频: 2→1')
                fixed = True

        # 检查浏览器源
        if 'sources' in config:
            for source in config['sources']:
                if source.get('id') == 'browser_source':
                    if source.get('monitoring_type') == 2:
                        source['monitoring_type'] = 1
                        issues_found.append('浏览器源: 2→1')
                        fixed = True

        # 如果有修改，保存文件
        if fixed:
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)

        return issues_found, fixed

    except Exception as e:
        return [f"错误: {e}"], False

def main():
    base_dir = Path(r"D:\WPS Office\2025\254805819\WPS云盘\教材\视频讲解")

    # 获取所有JSON文件
    json_files = sorted(base_dir.glob("*.json"))

    print("=" * 100)
    print(f"{'文件名':<50} {'问题':<30} {'状态':<10}")
    print("=" * 100)

    fixed_count = 0
    ok_count = 0

    for json_file in json_files:
        issues, fixed = check_and_fix_monitoring(json_file)

        if fixed:
            status = "✅ 已修复"
            issue_text = ", ".join(issues)
            fixed_count += 1
        elif issues:
            status = "❌ 错误"
            issue_text = ", ".join(issues)
        else:
            status = "✅ 正常"
            issue_text = "监听配置正确"
            ok_count += 1

        print(f"{json_file.name:<50} {issue_text:<30} {status:<10}")

    print("=" * 100)
    print(f"\n✅ 正常: {ok_count} 个")
    print(f"🔧 已修复: {fixed_count} 个")
    print(f"\n💡 说明:")
    print(f"  monitoring_type = 0: 关闭监听")
    print(f"  monitoring_type = 1: 仅监听（你可以听到，但不输出到录制）✅")
    print(f"  monitoring_type = 2: 监听并输出（会录制进去）❌")

if __name__ == "__main__":
    main()
