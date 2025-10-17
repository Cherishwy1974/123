import os
import re
from pathlib import Path

def check_slide_sync(file_path):
    """检查HTML文件的翻页和虚拟人同步问题"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 提取关键信息
        issues = []

        # 1. 检查 currentSlide 初始值
        current_slide_match = re.search(r'let currentSlide\s*=\s*(\d+)', content)
        if current_slide_match:
            current_slide_init = int(current_slide_match.group(1))
        else:
            issues.append("未找到 currentSlide 初始化")
            return issues

        # 2. 检查 totalSlides
        total_slides_match = re.search(r'const totalSlides\s*=\s*(\d+)', content)
        if total_slides_match:
            total_slides = int(total_slides_match.group(1))
        else:
            issues.append("未找到 totalSlides")
            return issues

        # 3. 检查字幕脚本的键
        subtitle_pattern = r'const\s+subtitleScript\s*=\s*\{([^}]+)\}'
        subtitle_match = re.search(subtitle_pattern, content, re.DOTALL)
        if subtitle_match:
            subtitle_content = subtitle_match.group(1)
            # 提取所有键
            keys = re.findall(r'["\']?(\d+)["\']?\s*:', subtitle_content)
            subtitle_keys = [int(k) for k in keys]
            min_key = min(subtitle_keys) if subtitle_keys else None
            max_key = max(subtitle_keys) if subtitle_keys else None
        else:
            issues.append("未找到 subtitleScript")
            return issues

        # 4. 检查索引一致性
        if min_key != current_slide_init:
            issues.append(f"⚠️ 索引不匹配: currentSlide初始值={current_slide_init}, 字幕最小键={min_key}")

        if max_key != total_slides:
            issues.append(f"⚠️ 页数不匹配: totalSlides={total_slides}, 字幕最大键={max_key}")

        # 5. 检查 speakContent 调用
        speak_calls = re.findall(r'speakContent\((\d+|currentSlide[^\)]*)\)', content)

        # 6. 检查 showSlide 调用 (应该使用0-based索引)
        show_slide_calls = re.findall(r'showSlide\(([^\)]+)\)', content)

        # 7. 检查自动播放循环
        autoplay_loop = re.search(r'for\s*\(\s*let\s+slide\s*=\s*(\d+)\s*;.*?slide\s*<=\s*(\d+)', content)
        if autoplay_loop:
            loop_start = int(autoplay_loop.group(1))
            if loop_start != current_slide_init:
                issues.append(f"⚠️ 自动播放循环起始值={loop_start}, 应该={current_slide_init}")

        return issues

    except Exception as e:
        return [f"检查失败: {str(e)}"]

def main():
    base_dir = Path(r"D:\WPS Office\2025\254805819\WPS云盘\教材\视频讲解")

    html_files = sorted([f for f in base_dir.glob("*.html")
                        if f.name != "index.html" and "template" not in f.name.lower()])

    print("=" * 100)
    print(f"{'文件名':<50} {'同步状态':<50}")
    print("=" * 100)

    problem_files = []

    for html_file in html_files:
        issues = check_slide_sync(html_file)

        if issues:
            status = "❌ 有问题"
            problem_files.append((html_file.name, issues))
        else:
            status = "✅ 正常"

        print(f"{html_file.name:<50} {status:<50}")

    print("=" * 100)

    if problem_files:
        print(f"\n⚠️ 发现 {len(problem_files)} 个文件有翻页同步问题:\n")
        for filename, issues in problem_files:
            print(f"\n📄 {filename}:")
            for issue in issues:
                print(f"   {issue}")
    else:
        print("\n✅ 所有文件的翻页和虚拟人配合都正常!")

if __name__ == "__main__":
    main()
