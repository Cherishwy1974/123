import re
from pathlib import Path

def check_and_fix_duration(html_file):
    """检查并修复HTML文件中的等待时间计算"""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # 查找 getSlideDuration 函数中的时间计算
        # 匹配 subtitle.length * XXX 这种模式
        pattern = r'(subtitle\.length\s*\*\s*)(\d+)(\s*[+;])'

        issues = []
        matches = list(re.finditer(pattern, content))

        if not matches:
            return None, False

        for match in matches:
            old_value = int(match.group(2))
            if old_value > 150:  # 如果大于150毫秒，说明太慢了
                issues.append(f'发现 {old_value}ms (太慢)')
                # 替换为120
                content = content.replace(match.group(0), f'{match.group(1)}120{match.group(3)}')

        if issues:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
            return issues, True

        return None, False

    except Exception as e:
        return [f"错误: {e}"], False

def main():
    base_dir = Path(r"D:\WPS Office\2025\254805819\WPS云盘\教材\视频讲解")

    # 获取所有HTML文件（排除index和模板）
    html_files = sorted([f for f in base_dir.glob("*.html")
                        if f.name != "index.html" and "template" not in f.name.lower()])

    print("=" * 100)
    print(f"{'文件名':<50} {'问题':<30} {'状态':<10}")
    print("=" * 100)

    fixed_count = 0
    ok_count = 0

    for html_file in html_files:
        issues, fixed = check_and_fix_duration(html_file)

        if fixed:
            status = "✅ 已修复"
            issue_text = ", ".join(issues)
            fixed_count += 1
        elif issues:
            status = "❌ 错误"
            issue_text = ", ".join(issues)
        elif issues is None:
            status = "⚠️ 无函数"
            issue_text = "未找到getSlideDuration"
        else:
            status = "✅ 正常"
            issue_text = "时间配置合理 (≤150ms)"
            ok_count += 1

        print(f"{html_file.name:<50} {issue_text:<30} {status:<10}")

    print("=" * 100)
    print(f"\n✅ 正常: {ok_count} 个")
    print(f"🔧 已修复: {fixed_count} 个")
    print(f"\n💡 修复说明:")
    print(f"  - 将等待时间从 250ms/字 改为 120ms/字")
    print(f"  - 虚拟人语速=50时，实际约120ms/字")
    print(f"  - 避免翻页时中间空白时间太长")

if __name__ == "__main__":
    main()
