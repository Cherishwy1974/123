import os
import re
from pathlib import Path

def update_token_config(file_path, target_config):
    """更新HTML文件的token配置"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 替换 appId
        content = re.sub(
            r'appId:\s*[\'"][^\'"]+[\'"]',
            f"appId: '{target_config['appId']}'",
            content
        )

        # 替换 apiKey
        content = re.sub(
            r'apiKey:\s*[\'"][^\'"]+[\'"]',
            f"apiKey: '{target_config['apiKey']}'",
            content
        )

        # 替换 apiSecret
        content = re.sub(
            r'apiSecret:\s*[\'"][^\'"]+[\'"]',
            f"apiSecret: '{target_config['apiSecret']}'",
            content
        )

        # 替换 sceneId
        content = re.sub(
            r'sceneId:\s*[\'"][^\'"]+[\'"]',
            f"sceneId: '{target_config['sceneId']}'",
            content
        )

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        return True
    except Exception as e:
        print(f"❌ 更新失败 {file_path.name}: {e}")
        return False

def main():
    base_dir = Path(r"D:\WPS Office\2025\254805819\WPS云盘\教材\视频讲解")

    # 新的API配置（ai已发布）
    target_config = {
        'appId': 'e8c180ed',
        'apiKey': 'e0c44f0e2ef0f47582ffa7e864da0d9b',
        'apiSecret': 'MDZkNDNiZWU4NDkzNWM5MDQzMTY4N2Nh',
        'sceneId': '237415046114840576'
    }

    # 需要更新的文件列表
    files_to_update = [
        "01_1.1_指数的概念与运算.html",
        "01_1.3_函数的基本概念.html",
        "01_1.4_基本初等函数.html",
        "02_2.1_极限的定义与存在条件.html",
        "02_2.3_极限的运算法则.html",
        "02_2.4_求极限的常用方法.html",
        "02_2.5_两个重要极限.html",
        "03_3.1_导数的概念与几何意义.html",
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
        "13_13.4_本章总结与综合应用.html"
    ]

    print("=" * 80)
    print("🔄 开始批量更新API配置...")
    print("=" * 80)

    success_count = 0
    fail_count = 0

    for filename in files_to_update:
        file_path = base_dir / filename
        if file_path.exists():
            if update_token_config(file_path, target_config):
                print(f"✅ {filename}")
                success_count += 1
            else:
                fail_count += 1
        else:
            print(f"⚠️ 文件不存在: {filename}")
            fail_count += 1

    print("=" * 80)
    print(f"✅ 成功更新: {success_count} 个文件")
    print(f"❌ 失败: {fail_count} 个文件")
    print("=" * 80)
    print("\n新配置:")
    print(f"  appId: {target_config['appId']}")
    print(f"  apiKey: {target_config['apiKey']}")
    print(f"  apiSecret: {target_config['apiSecret']}")
    print(f"  sceneId: {target_config['sceneId']}")

if __name__ == "__main__":
    main()
