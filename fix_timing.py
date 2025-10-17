#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复所有课程文件的翻页时序问题
在speakContent调用之前添加800ms延迟和1500ms页面间隔
"""

import re
import os
import glob

# 需要修复的文件列表
files_to_fix = [
    "02_2.7_函数的连续性.html",
    "03_3.1_导数的概念与几何意义.html",
    "03_3.4_微分的概念与应用.html",
    "03_3.5_导数综合复习与习题.html",
    "04_4.2_函数的单调性与极值.html",
    "04_4.3_函数的凹凸性与最值.html",
    "04_4.4_函数图像的描绘.html",
    "04_4.5_导数应用综合复习.html",
    "05_5.1_不定积分的概念.html",
    "05_5.2_换元积分法.html",
    "05_5.3_分部积分法.html",
    "05_5.4_不定积分综合复习.html",
    "06_6.1_定积分的概念介绍.html",
    "06_6.3_定积分的应用_求平面图形面积.html",
    "07_7.2_可分离变量的微分方程.html",
    "07_7.3_一阶线性微分方程.html",
    "07_7.4_本章回顾与习题精讲.html",
    "08_8.1_多元函数与偏导数入门.html",
    "08_8.2_全微分梯度与方向导数.html",
    "08_8.3_本章复盘与约束极值预告.html",
    "09_9.1_二重积分的概念与几何意义.html",
    "09_9.2_二重积分的计算_直角坐标.html",
    "09_9.3_重积分应用与总结.html",
    "10_10.1_行列式及其几何意义.html",
    "10_10.2_矩阵运算与逆矩阵.html",
    "10_10.3_线性方程组的解法.html",
    "10_10.4_本章总结与工程应用.html",
    "11_11.1_级数的概念与敛散性判别.html",
    "11_11.2_幂级数与泰勒展开.html",
    "11_11.3_本章总结与误差控制.html",
    "12_12.1_向量的概念点积与叉积.html",
    "12_12.2_平面与直线方程.html",
    "12_12.3_本章综合与空间定位.html",
    "13_13.1_概率的基本概念与性质.html",
    "13_13.2_随机变量期望与方差.html",
    "13_13.3_正态分布与中心极限定理.html",
    "13_13.4_本章总结与综合应用.html",
]

# 旧的模式：没有800ms延迟和1500ms页面间隔
old_pattern = re.compile(
    r'(\s+)(if \(isConnected && isTeaching && avatarPlatform\) \{\s+'
    r'try \{\s+'
    r'// 创建Promise等待虚拟人讲解完成)',
    re.DOTALL
)

# 新的替换文本
new_text = r'''\1if (isConnected && isTeaching && avatarPlatform) {
\1    try {
\1        // 先稍作等待确保状态稳定
\1        await new Promise(resolve => setTimeout(resolve, 800));

\1        // 创建Promise等待虚拟人讲解完成'''

# 模式2：在Promise.race之后添加页面间隔
old_pattern2 = re.compile(
    r'(await Promise\.race\(\[speechPromise, timeoutPromise\]\);\s+'
    r'console\.log\(`✅ 第\$\{slide\}页讲解完成`\);\s*)'
    r'(\} catch)',
    re.DOTALL
)

new_text2 = r'''\1
\1                // 页面间等待时间
\1                if (slide < totalSlides) {
\1                    await new Promise(resolve => setTimeout(resolve, 1500));
\1                }

\1            \2'''

def fix_file(filepath):
    """修复单个文件"""
    if not os.path.exists(filepath):
        print(f"⚠️ 文件不存在: {filepath}")
        return False

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 检查是否已经有800ms延迟
        if '// 先稍作等待确保状态稳定' in content:
            print(f"✅ 已修复: {filepath}")
            return True

        # 应用第一个替换
        modified_content, count1 = old_pattern.subn(new_text, content)

        if count1 > 0:
            print(f"✅ 修复 {filepath}: 添加了800ms延迟")

            # 应用第二个替换（添加页面间隔）
            modified_content, count2 = old_pattern2.subn(new_text2, modified_content)

            if count2 > 0:
                print(f"✅ 修复 {filepath}: 添加了1500ms页面间隔")

            # 写回文件
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(modified_content)

            return True
        else:
            print(f"⚠️ 未找到匹配模式: {filepath}")
            return False

    except Exception as e:
        print(f"❌ 处理文件失败 {filepath}: {e}")
        return False

def main():
    """主函数"""
    print("🔧 开始修复所有课程文件的翻页时序问题...\n")

    success_count = 0
    total_count = len(files_to_fix)

    for filename in files_to_fix:
        filepath = os.path.join(".", filename)
        if fix_file(filepath):
            success_count += 1

    print(f"\n📊 修复完成: {success_count}/{total_count} 个文件")

if __name__ == "__main__":
    main()
