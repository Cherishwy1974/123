import os
import re
from pathlib import Path

def check_html_duration(file_path):
    """检查HTML文件的页面数量和预估时长"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 查找 subtitleScript 对象
        subtitle_pattern = r'const\s+subtitleScript\s*=\s*\{([^}]+)\}'
        match = re.search(subtitle_pattern, content, re.DOTALL)

        if not match:
            return None, 0, 0

        subtitle_content = match.group(1)

        # 提取所有字幕文本
        subtitle_texts = re.findall(r'["\'](\d+)["\']\s*:\s*["\']([^"\']+)["\']', subtitle_content)

        page_count = len(subtitle_texts)
        total_chars = sum(len(text) for _, text in subtitle_texts)

        # 估算时长: 每个字约0.4秒朗读时间 + 每页停顿3秒
        estimated_seconds = (total_chars * 0.4) + (page_count * 3)
        estimated_minutes = estimated_seconds / 60

        return page_count, total_chars, estimated_minutes
    except Exception as e:
        return None, 0, 0

def main():
    base_dir = Path(r"D:\WPS Office\2025\254805819\WPS云盘\教材\视频讲解")

    # 获取所有HTML文件（排除index和模板）
    html_files = sorted([f for f in base_dir.glob("*.html")
                        if f.name != "index.html" and "template" not in f.name.lower()])

    print("=" * 100)
    print(f"{'文件名':<50} {'页数':>6} {'字数':>8} {'预估时长':>10}")
    print("=" * 100)

    issues = []

    for html_file in html_files:
        pages, chars, minutes = check_html_duration(html_file)

        if pages is None:
            status = "⚠️ 无字幕"
            issues.append((html_file.name, status))
            print(f"{html_file.name:<50} {'N/A':>6} {'N/A':>8} {status:>15}")
        elif minutes < 5:
            status = f"❌ {minutes:.1f}分钟"
            issues.append((html_file.name, status))
            print(f"{html_file.name:<50} {pages:>6} {chars:>8} {status:>15}")
        else:
            status = f"✅ {minutes:.1f}分钟"
            print(f"{html_file.name:<50} {pages:>6} {chars:>8} {status:>15}")

    print("=" * 100)

    if issues:
        print(f"\n⚠️ 发现 {len(issues)} 个文件需要检查:")
        for filename, issue in issues:
            print(f"  - {filename}: {issue}")
    else:
        print("\n✅ 所有文件时长都满足要求!")

if __name__ == "__main__":
    main()
