"""
单个URL录制测试脚本
用于测试录制功能是否正常工作
"""

from auto_record_smart import SmartCoursewareRecorder
from pathlib import Path

def test_single_url():
    """测试录制单个URL"""

    # 测试配置
    TEST_URL = "https://cherishwy1974.github.io/123/01_1.1_%E6%8C%87%E6%95%B0%E7%9A%84%E6%A6%82%E5%BF%B5%E4%B8%8E%E8%BF%90%E7%AE%97.html"
    OUTPUT_DIR = "测试录制"
    TEST_DURATION = 30  # 测试录制30秒（快速测试）
    
    print("="*60)
    print("单个URL录制测试")
    print("="*60)
    print(f"测试URL: {TEST_URL}")
    print(f"输出目录: {OUTPUT_DIR}")
    print(f"录制时长: {TEST_DURATION}秒")
    print("="*60)
    print()
    
    # 创建临时URL文件
    temp_url_file = Path("temp_test_url.txt")
    with open(temp_url_file, 'w', encoding='utf-8') as f:
        f.write(TEST_URL)
    
    try:
        # 创建录制器
        recorder = SmartCoursewareRecorder(str(temp_url_file), OUTPUT_DIR)
        
        # 设置浏览器
        recorder.setup_browser()
        
        # 录制单个URL
        result = recorder.record_single_url(
            url=TEST_URL,
            index=1,
            total=1,
            max_duration=TEST_DURATION
        )
        
        # 清理
        recorder.cleanup()
        
        # 检查结果
        print("\n" + "="*60)
        if result:
            print("✓ 测试成功！")
            print(f"请检查 '{OUTPUT_DIR}' 目录中的视频文件")
            print("确认视频画面和音频是否正常")
        else:
            print("✗ 测试失败")
            print("请检查错误信息并调整配置")
        print("="*60)
        
    except Exception as e:
        print(f"\n✗ 测试过程中发生错误: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # 删除临时文件
        if temp_url_file.exists():
            temp_url_file.unlink()

def test_audio_device():
    """测试音频设备检测"""
    import subprocess
    
    print("="*60)
    print("音频设备检测测试")
    print("="*60)
    
    try:
        result = subprocess.run(
            ['ffmpeg', '-list_devices', 'true', '-f', 'dshow', '-i', 'dummy'],
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='ignore'
        )
        
        print("\n可用的音频设备：")
        print("-"*60)
        
        in_audio_section = False
        for line in result.stderr.split('\n'):
            if 'DirectShow audio devices' in line:
                in_audio_section = True
                continue
            elif 'DirectShow video devices' in line:
                in_audio_section = False
                break
            
            if in_audio_section and line.strip():
                print(line)
        
        print("-"*60)
        print("\n请确认列表中包含 'CABLE Output' 或 'VB-Audio' 设备")
        
    except FileNotFoundError:
        print("✗ 错误：未找到FFmpeg")
        print("请确保FFmpeg已安装并添加到PATH环境变量")
    except Exception as e:
        print(f"✗ 错误: {e}")

def test_browser():
    """测试浏览器和ChromeDriver"""
    print("="*60)
    print("浏览器测试")
    print("="*60)
    
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        
        print("正在启动Chrome浏览器...")
        
        chrome_options = Options()
        chrome_options.add_argument("--window-size=1920,1080")
        
        driver = webdriver.Chrome(options=chrome_options)
        
        print("✓ 浏览器启动成功")
        print("正在访问测试页面...")
        
        driver.get("https://www.baidu.com")
        time.sleep(3)
        
        print("✓ 页面加载成功")
        print("浏览器将在5秒后关闭...")
        
        import time
        time.sleep(5)
        
        driver.quit()
        print("✓ 浏览器测试完成")
        
    except Exception as e:
        print(f"✗ 浏览器测试失败: {e}")
        print("\n可能的原因：")
        print("1. ChromeDriver未安装或版本不匹配")
        print("2. Chrome浏览器未安装")
        print("3. ChromeDriver未添加到PATH环境变量")

def main():
    """主测试菜单"""
    print("\n" + "="*60)
    print("自动化录制系统 - 测试工具")
    print("="*60)
    print("\n请选择测试项目：")
    print("1. 测试音频设备检测")
    print("2. 测试浏览器和ChromeDriver")
    print("3. 测试单个URL录制（完整测试）")
    print("4. 运行所有测试")
    print("0. 退出")
    print()
    
    choice = input("请输入选项 (0-4): ").strip()
    
    if choice == '1':
        test_audio_device()
    elif choice == '2':
        test_browser()
    elif choice == '3':
        test_single_url()
    elif choice == '4':
        print("\n运行所有测试...\n")
        test_audio_device()
        print("\n")
        test_browser()
        print("\n")
        
        confirm = input("\n是否继续进行录制测试？(y/n): ").strip().lower()
        if confirm == 'y':
            test_single_url()
    elif choice == '0':
        print("退出测试")
    else:
        print("无效选项")

if __name__ == "__main__":
    main()

