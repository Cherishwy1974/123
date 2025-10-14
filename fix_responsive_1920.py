"""
修改响应式设计：为1920宽度优化，同比例放大
1. 移除max-width限制
2. 调整viewport为固定1920宽度
3. 增大字号适配1920屏幕
"""

import os
import re
from pathlib import Path

def modify_html_responsive(file_path):
    """修改HTML的响应式设计"""
    print(f"正在处理: {file_path.name}")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. 修改viewport为固定1920宽度
    content = re.sub(
        r'<meta name="viewport" content="width=device-width, initial-scale=1\.0">',
        '<meta name="viewport" content="width=1920, initial-scale=1.0">',
        content
    )

    # 2. 移除max-width限制，改为width: 100%
    content = re.sub(
        r'max-width:\s*1400px;',
        'width: 100%;',
        content
    )

    # 3. 增大主要内容区域的字号（1.3倍）
    # h2: 22px -> 29px
    content = re.sub(
        r'(\.blackboard h2[^}]*?font-size:\s*)22px',
        r'\g<1>29px',
        content
    )

    # h3: 20px -> 26px
    content = re.sub(
        r'(\.blackboard h3[^}]*?font-size:\s*)20px',
        r'\g<1>26px',
        content
    )

    # p, li: 18px -> 23px
    content = re.sub(
        r'(\.blackboard p[^}]*?font-size:\s*)18px',
        r'\g<1>23px',
        content
    )
    content = re.sub(
        r'(\.blackboard li[^}]*?font-size:\s*)18px',
        r'\g<1>23px',
        content
    )

    # subtitle: 18px -> 23px
    content = re.sub(
        r'(\.subtitle-area[^}]*?font-size:\s*)18px',
        r'\g<1>23px',
        content
    )

    # 4. 增大虚拟人容器尺寸（1.3倍）
    # width: 750px -> 975px
    content = re.sub(
        r'(\.avatar-container[^}]*?width:\s*)750px',
        r'\g<1>975px',
        content
    )

    # height: 850px -> 1105px
    content = re.sub(
        r'(\.avatar-container[^}]*?height:\s*)850px',
        r'\g<1>1105px',
        content
    )

    # 5. 增大控制按钮尺寸
    # width: 270px -> 350px
    content = re.sub(
        r'(\.nav-btn[^}]*?width:\s*)270px',
        r'\g<1>350px',
        content
    )

    # 检查是否有修改
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
            if modify_html_responsive(html_file):
                success_count += 1
            else:
                fail_count += 1
        except Exception as e:
            print(f"  ❌ 处理失败: {e}")
            fail_count += 1

    print("="*60)
    print(f"响应式设计优化完成！")
    print(f"成功: {success_count} 个")
    print(f"失败: {fail_count} 个")
    print()
    print("修改内容：")
    print("1. ✅ viewport固定为1920宽度")
    print("2. ✅ 移除max-width限制")
    print("3. ✅ 字号放大1.3倍（h2:29px, h3:26px, p:23px）")
    print("4. ✅ 虚拟人容器放大1.3倍")
    print("5. ✅ 控制按钮放大1.3倍")

if __name__ == "__main__":
    main()
