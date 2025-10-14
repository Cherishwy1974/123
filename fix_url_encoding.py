"""
修复URL编码问题
将UTF-16编码的URL文件转换为UTF-8，并解码URL编码
"""

import urllib.parse
from pathlib import Path

def fix_url_file(input_file, output_file):
    """修复URL文件的编码问题"""

    # 尝试不同的编码读取
    encodings = ['utf-16', 'utf-16-le', 'utf-16-be', 'utf-8', 'gbk']

    content = None
    used_encoding = None

    for encoding in encodings:
        try:
            with open(input_file, 'r', encoding=encoding) as f:
                content = f.read()
            used_encoding = encoding
            print(f"成功使用 {encoding} 编码读取文件")
            break
        except:
            continue

    if content is None:
        print("错误：无法读取文件")
        return False

    # 清理内容（移除零宽字符）
    content = content.replace('\x00', '')

    # 分割成行
    lines = [line.strip() for line in content.split('\n') if line.strip()]

    # 解码URL编码的部分
    decoded_urls = []
    for line in lines:
        try:
            # URL解码
            decoded = urllib.parse.unquote(line)
            decoded_urls.append(decoded)
            print(f"✓ 解码: {line[:50]}... -> {decoded.split('/')[-1]}")
        except:
            decoded_urls.append(line)
            print(f"× 保持原样: {line}")

    # 写入新文件
    with open(output_file, 'w', encoding='utf-8') as f:
        for url in decoded_urls:
            f.write(url + '\n')

    print(f"\n成功！已保存到: {output_file}")
    print(f"原始编码: {used_encoding}")
    print(f"输出编码: utf-8")
    print(f"共处理 {len(decoded_urls)} 个URL")

    return True


if __name__ == "__main__":
    input_file = r"D:\WPS Office\2025\254805819\WPS云盘\教材\视频讲解\URL编码链接.txt"
    output_file = r"D:\WPS Office\2025\254805819\WPS云盘\教材\视频讲解\课程链接_已解码.txt"

    fix_url_file(input_file, output_file)
