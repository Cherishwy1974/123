"""
自动化录制网页课件视频脚本
功能：
1. 读取URL列表
2. 在浏览器中打开课件
3. 自动点击播放按钮
4. 录制视频和音频（VB-Cable）
5. 保存为MP4文件

依赖：
- selenium
- pyautogui
- psutil
"""

import os
import time
import subprocess
import json
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import pyautogui
import psutil

class CoursewareRecorder:
    def __init__(self, url_file, output_dir="录制视频"):
        self.url_file = url_file
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.driver = None
        self.ffmpeg_process = None
        
    def read_urls(self):
        """读取URL列表"""
        with open(self.url_file, 'r', encoding='utf-8') as f:
            urls = [line.strip() for line in f if line.strip()]
        return urls
    
    def setup_browser(self):
        """设置浏览器"""
        chrome_options = Options()
        # 设置浏览器窗口大小（标准1080p）
        chrome_options.add_argument("--window-size=1920,1080")
        # 允许自动播放音频
        chrome_options.add_argument("--autoplay-policy=no-user-gesture-required")
        # 禁用GPU加速（避免录制问题）
        chrome_options.add_argument("--disable-gpu")
        # 设置音频输出到VB-Cable
        chrome_options.add_experimental_option("prefs", {
            "profile.default_content_setting_values.media_stream_mic": 1,
            "profile.default_content_setting_values.media_stream_camera": 1,
        })
        
        self.driver = webdriver.Chrome(options=chrome_options)
        # 最大化窗口
        self.driver.maximize_window()
        
    def get_browser_window_info(self):
        """获取浏览器窗口位置和大小"""
        # 获取窗口位置
        position = self.driver.get_window_position()
        size = self.driver.get_window_size()
        
        return {
            'x': position['x'],
            'y': position['y'],
            'width': size['width'],
            'height': size['height']
        }
    
    def find_and_click_play_button(self, timeout=10):
        """查找并点击播放按钮"""
        try:
            # 等待页面加载
            time.sleep(3)
            
            # 尝试多种可能的播放按钮选择器
            selectors = [
                "//button[contains(text(), '自动播放')]",
                "//button[contains(text(), '播放')]",
                "//button[contains(@class, 'play')]",
                "//button[contains(@id, 'play')]",
                "//div[contains(@class, 'play-button')]",
                "//button[contains(text(), '开始')]",
                "//button[contains(@onclick, 'play')]",
            ]
            
            for selector in selectors:
                try:
                    play_button = WebDriverWait(self.driver, 2).until(
                        EC.element_to_be_clickable((By.XPATH, selector))
                    )
                    print(f"找到播放按钮: {selector}")
                    play_button.click()
                    print("已点击播放按钮")
                    return True
                except:
                    continue
            
            # 如果没找到，尝试JavaScript查找
            try:
                self.driver.execute_script("""
                    const buttons = document.querySelectorAll('button');
                    for (let btn of buttons) {
                        if (btn.textContent.includes('播放') || 
                            btn.textContent.includes('自动') ||
                            btn.textContent.includes('开始')) {
                            btn.click();
                            return true;
                        }
                    }
                """)
                print("通过JavaScript点击了播放按钮")
                return True
            except:
                pass
            
            print("警告：未找到播放按钮，将继续录制")
            return False
            
        except Exception as e:
            print(f"查找播放按钮时出错: {e}")
            return False
    
    def start_ffmpeg_recording(self, window_info, output_file, duration=None):
        """启动FFmpeg录制"""
        # FFmpeg命令
        # 使用gdigrab捕获特定窗口区域
        # 使用dshow捕获VB-Cable音频
        
        cmd = [
            'ffmpeg',
            '-f', 'gdigrab',
            '-framerate', '30',
            '-offset_x', str(window_info['x']),
            '-offset_y', str(window_info['y']),
            '-video_size', f"{window_info['width']}x{window_info['height']}",
            '-i', 'desktop',
            '-f', 'dshow',
            '-i', 'audio=CABLE Output (VB-Audio Virtual Cable)',
            '-c:v', 'libx264',
            '-preset', 'ultrafast',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-y',
            str(output_file)
        ]
        
        if duration:
            cmd.insert(-2, '-t')
            cmd.insert(-2, str(duration))
        
        print(f"启动FFmpeg录制: {' '.join(cmd)}")
        self.ffmpeg_process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            creationflags=subprocess.CREATE_NO_WINDOW
        )
        
        return self.ffmpeg_process
    
    def stop_ffmpeg_recording(self):
        """停止FFmpeg录制"""
        if self.ffmpeg_process:
            print("正在停止录制...")
            # 发送'q'命令优雅地停止FFmpeg
            try:
                self.ffmpeg_process.communicate(input=b'q', timeout=5)
            except:
                self.ffmpeg_process.terminate()
                time.sleep(2)
                if self.ffmpeg_process.poll() is None:
                    self.ffmpeg_process.kill()
            
            self.ffmpeg_process = None
            print("录制已停止")
    
    def record_single_url(self, url, index, total, duration=300):
        """录制单个URL"""
        print(f"\n{'='*60}")
        print(f"正在录制 [{index}/{total}]: {url}")
        print(f"{'='*60}")
        
        # 从URL提取文件名
        filename = url.split('/')[-1].replace('.html', '.mp4')
        output_file = self.output_dir / filename
        
        try:
            # 打开网页
            print("正在加载网页...")
            self.driver.get(url)
            time.sleep(5)  # 等待页面完全加载
            
            # 获取窗口信息
            window_info = self.get_browser_window_info()
            print(f"浏览器窗口: {window_info}")
            
            # 查找并点击播放按钮
            self.find_and_click_play_button()
            
            # 等待2秒确保播放开始
            time.sleep(2)
            
            # 开始录制
            print(f"开始录制，时长: {duration}秒")
            self.start_ffmpeg_recording(window_info, output_file, duration)
            
            # 等待录制完成
            print("录制进行中...")
            for i in range(duration):
                if i % 30 == 0:
                    print(f"已录制 {i}/{duration} 秒")
                time.sleep(1)
            
            # 停止录制
            self.stop_ffmpeg_recording()
            
            print(f"✓ 录制完成: {output_file}")
            return True
            
        except Exception as e:
            print(f"✗ 录制失败: {e}")
            self.stop_ffmpeg_recording()
            return False
    
    def record_all(self, start_index=0, duration=300):
        """录制所有URL"""
        urls = self.read_urls()
        total = len(urls)
        
        print(f"共找到 {total} 个URL")
        print(f"从第 {start_index + 1} 个开始录制")
        print(f"每个视频录制时长: {duration}秒")
        
        # 设置浏览器
        self.setup_browser()
        
        success_count = 0
        fail_count = 0
        
        try:
            for i, url in enumerate(urls[start_index:], start=start_index):
                result = self.record_single_url(url, i + 1, total, duration)
                if result:
                    success_count += 1
                else:
                    fail_count += 1
                
                # 短暂休息
                if i < total - 1:
                    print("等待5秒后继续下一个...")
                    time.sleep(5)
        
        finally:
            # 清理
            if self.driver:
                self.driver.quit()
            
            print(f"\n{'='*60}")
            print(f"录制完成！")
            print(f"成功: {success_count}, 失败: {fail_count}")
            print(f"输出目录: {self.output_dir.absolute()}")
            print(f"{'='*60}")
    
    def cleanup(self):
        """清理资源"""
        self.stop_ffmpeg_recording()
        if self.driver:
            self.driver.quit()


if __name__ == "__main__":
    # 配置
    URL_FILE = r"D:\WPS Office\2025\254805819\WPS云盘\教材\视频讲解\课程链接_已解码.txt"
    OUTPUT_DIR = "录制视频"
    RECORDING_DURATION = 300  # 每个视频录制5分钟，根据实际情况调整
    START_INDEX = 0  # 从第几个URL开始（0表示从头开始）
    
    # 创建录制器
    recorder = CoursewareRecorder(URL_FILE, OUTPUT_DIR)
    
    try:
        # 开始录制
        recorder.record_all(start_index=START_INDEX, duration=RECORDING_DURATION)
    except KeyboardInterrupt:
        print("\n用户中断录制")
        recorder.cleanup()
    except Exception as e:
        print(f"\n发生错误: {e}")
        recorder.cleanup()

