"""
批量修改HTML文件：隐藏工具栏、自动播放
1. 隐藏 .control-bar (导航按钮工具栏)
2. 保留键盘左右键切页功能
3. 页面加载后自动执行播放
"""

import os
import re
from pathlib import Path

def modify_html_file(file_path):
    """修改单个HTML文件"""
    print(f"正在处理: {file_path.name}")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. 隐藏工具栏：将 .control-bar 的 left 改为更大的负值，确保完全隐藏
    content = re.sub(
        r'(\.control-bar\s*{[^}]*?left:\s*)-\d+px',
        r'\1-9999px',
        content,
        flags=re.DOTALL
    )

    # 2. 禁用hover显示：移除 .control-bar:hover 的left设置
    content = re.sub(
        r'(\.control-bar:hover\s*{\s*)left:\s*0;',
        r'\1left: -9999px;',
        content
    )

    # 3. 添加页面加载后自动播放
    # 在 DOMContentLoaded 事件中添加自动播放代码
    auto_play_code = """
            // 自动启动播放
            setTimeout(() => {
                console.log('🎬 自动启动播放...');
                startAutoPlay();
            }, 1000);
"""

    # 在 DOMContentLoaded 的最后添加自动播放
    content = re.sub(
        r"(document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*{[^}]*?console\.log\([^)]*?\);)",
        r"\1" + auto_play_code,
        content,
        flags=re.DOTALL
    )

    # 如果修改成功，写回文件
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ 已修改")
        return True
    else:
        print(f"  ⚠️ 未找到需要修改的内容")
        return False

def main():
    base_dir = Path(r"D:\WPS Office\2025\254805819\WPS云盘\教材\视频讲解")

    # 找到所有HTML文件
    html_files = list(base_dir.glob("[0-9]*.html"))

    print(f"找到 {len(html_files)} 个HTML文件")
    print("="*60)

    success_count = 0
    fail_count = 0

    for html_file in sorted(html_files):
        try:
            if modify_html_file(html_file):
                success_count += 1
            else:
                fail_count += 1
        except Exception as e:
            print(f"  ❌ 处理失败: {e}")
            fail_count += 1

    print("="*60)
    print(f"批量修改完成！")
    print(f"成功: {success_count} 个")
    print(f"失败: {fail_count} 个")
    print()
    print("修改内容：")
    print("1. ✅ 隐藏导航工具栏（上一页/下一页按钮等）")
    print("2. ✅ 保留键盘左右键切页功能")
    print("3. ✅ 页面加载后1秒自动启动播放")

if __name__ == "__main__":
    main()
