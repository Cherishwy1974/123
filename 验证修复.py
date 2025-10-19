#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
验证 05_5.3_分部积分法.html 的 LaTeX 公式修复
"""

import re
from pathlib import Path

def check_latex_format(file_path):
    """检查 LaTeX 公式格式"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    issues = []
    
    # 检查 HTML 中是否还有双反斜杠（错误格式）
    # 排除 JavaScript 代码区域
    html_sections = []
    script_pattern = r'<script[^>]*>.*?</script>'
    scripts = re.findall(script_pattern, content, re.DOTALL)
    
    # 移除 script 标签内容
    temp_content = re.sub(script_pattern, '<!-- SCRIPT_REMOVED -->', content, flags=re.DOTALL)
    
    # 在非 script 区域查找双反斜杠
    double_backslash_pattern = r'\$[^$]*\\\\(int|frac|sin|cos|ln|lim|sum|infty|to|cdot|times)[^$]*\$'
    matches = re.findall(double_backslash_pattern, temp_content)
    
    if matches:
        issues.append(f"❌ HTML 中发现 {len(matches)} 处双反斜杠格式（应使用单反斜杠）")
        for match in matches[:5]:  # 只显示前5个
            issues.append(f"   示例: \\\\{match}")
    else:
        print("✅ HTML 中的 LaTeX 公式格式正确（使用单反斜杠）")
    
    # 检查是否有 renderMath 函数
    if 'function renderMath(' in content:
        print("✅ 已添加 renderMath() 函数")
    else:
        issues.append("❌ 缺少 renderMath() 函数")
    
    # 检查是否有 forceRerenderMath 函数
    if 'function forceRerenderMath(' in content:
        print("✅ 已添加 forceRerenderMath() 函数")
    else:
        issues.append("❌ 缺少 forceRerenderMath() 函数")
    
    # 检查 MathJax 配置
    if 'processEscapes: true' in content:
        print("✅ MathJax 配置包含 processEscapes")
    else:
        issues.append("❌ MathJax 配置缺少 processEscapes")
    
    if 'noerrors' in content:
        print("✅ MathJax 配置包含 noerrors 包")
    else:
        issues.append("❌ MathJax 配置缺少 noerrors 包")
    
    # 检查是否有重新渲染按钮
    if 'forceRerenderMath()' in content and '重新渲染公式' in content:
        print("✅ 已添加'重新渲染公式'按钮")
    else:
        issues.append("❌ 缺少'重新渲染公式'按钮")
    
    # 检查 showSlide 函数是否调用 renderMath
    if 'function showSlide(' in content:
        showslide_match = re.search(r'function showSlide\([^)]*\)\s*{([^}]+(?:{[^}]*}[^}]*)*)}', content, re.DOTALL)
        if showslide_match:
            showslide_body = showslide_match.group(1)
            if 'renderMath' in showslide_body:
                print("✅ showSlide() 函数调用了 renderMath()")
            else:
                issues.append("❌ showSlide() 函数未调用 renderMath()")
    
    # 统计公式数量
    inline_formulas = len(re.findall(r'\$[^$]+\$', temp_content))
    display_formulas = len(re.findall(r'\$\$[^$]+\$\$', temp_content))
    
    print(f"\n📊 统计信息:")
    print(f"   行内公式: {inline_formulas} 个")
    print(f"   显示公式: {display_formulas} 个")
    print(f"   总计: {inline_formulas + display_formulas} 个")
    
    return issues

def main():
    file_path = Path("05_5.3_分部积分法.html")
    
    if not file_path.exists():
        print(f"❌ 文件不存在: {file_path}")
        return
    
    print("=" * 60)
    print("LaTeX 公式修复验证")
    print("=" * 60)
    print(f"文件: {file_path}")
    print("=" * 60)
    print()
    
    issues = check_latex_format(file_path)
    
    print()
    print("=" * 60)
    if issues:
        print(f"⚠️ 发现 {len(issues)} 个问题:")
        print()
        for issue in issues:
            print(issue)
    else:
        print("✅ 所有检查通过！")
    print("=" * 60)

if __name__ == "__main__":
    main()

