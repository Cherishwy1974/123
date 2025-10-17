import os
import re
from pathlib import Path

def check_token_config(file_path):
    """检查HTML文件的token配置"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 查找 appId, apiKey, apiSecret, sceneId
        appid_match = re.search(r'appId:\s*[\'"]([^\'"]+)[\'"]', content)
        apikey_match = re.search(r'apiKey:\s*[\'"]([^\'"]+)[\'"]', content)
        apisecret_match = re.search(r'apiSecret:\s*[\'"]([^\'"]+)[\'"]', content)
        sceneid_match = re.search(r'sceneId:\s*[\'"]([^\'"]+)[\'"]', content)

        return {
            'appId': appid_match.group(1) if appid_match else None,
            'apiKey': apikey_match.group(1) if apikey_match else None,
            'apiSecret': apisecret_match.group(1) if apisecret_match else None,
            'sceneId': sceneid_match.group(1) if sceneid_match else None
        }
    except Exception as e:
        return None

def main():
    base_dir = Path(r"D:\WPS Office\2025\254805819\WPS云盘\教材\视频讲解")

    # 目标配置
    target_config = {
        'appId': 'e8c180ed',
        'apiKey': 'e0c44f0e2ef0f47582ffa7e864da0d9b',
        'apiSecret': 'MDZkNDNiZWU4NDkzNWM5MDQzMTY4N2Nh',
        'sceneId': '237415046114840576'
    }

    # 获取所有HTML文件（排除index和模板）
    html_files = sorted([f for f in base_dir.glob("*.html")
                        if f.name != "index.html" and "template" not in f.name.lower()])

    print("=" * 100)
    print(f"{'文件名':<50} {'配置状态':<15}")
    print("=" * 100)

    wrong_configs = []

    for html_file in html_files:
        config = check_token_config(html_file)

        if config is None:
            status = "⚠️ 读取失败"
            wrong_configs.append((html_file.name, "读取失败"))
        elif not config['appId']:
            status = "⚠️ 无配置"
            wrong_configs.append((html_file.name, "无配置"))
        elif (config['appId'] == target_config['appId'] and
              config['apiKey'] == target_config['apiKey'] and
              config['apiSecret'] == target_config['apiSecret'] and
              config['sceneId'] == target_config['sceneId']):
            status = "✅ 正确"
        else:
            status = "❌ 需要更新"
            wrong_configs.append((html_file.name, f"appId: {config['appId']}, sceneId: {config['sceneId']}"))

        print(f"{html_file.name:<50} {status:<15}")

    print("=" * 100)

    if wrong_configs:
        print(f"\n⚠️ 发现 {len(wrong_configs)} 个文件需要更新配置:")
        for filename, detail in wrong_configs:
            print(f"  - {filename}")
            if detail != "读取失败" and detail != "无配置":
                print(f"    当前: {detail}")
    else:
        print("\n✅ 所有文件的API配置都正确!")

    print(f"\n目标配置:")
    print(f"  appId: {target_config['appId']}")
    print(f"  apiKey: {target_config['apiKey']}")
    print(f"  apiSecret: {target_config['apiSecret']}")
    print(f"  sceneId: {target_config['sceneId']}")

if __name__ == "__main__":
    main()
