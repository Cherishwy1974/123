import os
import re
from pathlib import Path

def fix_slide_sync(file_path):
    """修复HTML文件的翻页同步问题"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        modified = False

        # 修复问题1: currentSlide 初始值应该是 0
        # 如果是 let currentSlide = 1，改为 let currentSlide = 0
        if re.search(r'let\s+currentSlide\s*=\s*1\s*;', content):
            content = re.sub(
                r'let\s+currentSlide\s*=\s*1\s*;',
                'let currentSlide = 0;',
                content
            )
            modified = True
            print(f"  ✓ 修复 currentSlide 初始值: 1 → 0")

        #修复问题2: 字幕脚本的键应该从 "1" 开始（保持不变，这是正确的）
        # 不需要修改

        # 保存修改
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        else:
            return False

    except Exception as e:
        print(f"  ❌ 修复失败: {str(e)}")
        return False

def main():
    base_dir = Path(r"D:\WPS Office\2025\254805819\WPS云盘\教材\视频讲解")

    # 需要修复的文件列表（currentSlide=0的文件）
    files_to_fix = [
        "01_1.1_指数的概念与运算.html",
        "01_1.2_对数的概念与运算.html",
        "01_1.3_函数的基本概念.html",
        "01_1.4_基本初等函数.html",
        "02_2.7_函数的连续性.html",
        "03_3.2_基本求导公式与四则运算.html",
        "03_3.4_微分的概念与应用.html",
        "03_3.5_导数综合复习与习题.html",
        "04_4.1_洛必达法则.html"
    ]

    print("=" * 80)
    print("🔧 开始修复翻页同步问题...")
    print("=" * 80)

    success_count = 0
    fail_count = 0

    for filename in files_to_fix:
        file_path = base_dir / filename
        if file_path.exists():
            print(f"\n📄 {filename}")
            if fix_slide_sync(file_path):
                success_count += 1
            else:
                print(f"  ℹ️  无需修改")
        else:
            print(f"⚠️ 文件不存在: {filename}")
            fail_count += 1

    print("\n" + "=" * 80)
    print(f"✅ 成功修复: {success_count} 个文件")
    if fail_count > 0:
        print(f"❌ 失败: {fail_count} 个文件")
    print("=" * 80)

if __name__ == "__main__":
    main()
