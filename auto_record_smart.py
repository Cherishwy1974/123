"""
智能自动化录制网页课件视频脚本（改进版）
新增功能：
1. 智能检测课件播放完成
2. 更好的播放按钮识别
3. 录制状态监控
4. 错误恢复机制
"""

import os
import time
import subprocess
import json
from pathlib import Path
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import psutil
try:
    from screeninfo import get_monitors
    HAS_SCREENINFO = True
except ImportError:
    HAS_SCREENINFO = False

class SmartCoursewareRecorder:
    def __init__(self, url_file, output_dir="录制视频"):
        self.url_file = url_file
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.driver = None
        self.ffmpeg_process = None
        self.log_file = self.output_dir / "录制日志.txt"
        self.primary_monitor = self._get_primary_monitor_info()
        
    def _get_primary_monitor_info(self):
        """获取主显示器信息（Windows多显示器支持）"""
        try:
            if not HAS_SCREENINFO:
                print("⚠ screeninfo未安装，使用默认显示器设置")
                return {'x': 0, 'y': 0, 'width': 1920, 'height': 1080}

            # 获取所有显示器信息
            monitors = get_monitors()

            # 主显示器通常是第一个，且左上角坐标为(0, 0)
            primary = None
            for monitor in monitors:
                if monitor.x == 0 and monitor.y == 0:
                    primary = {
                        'x': monitor.x,
                        'y': monitor.y,
                        'width': monitor.width,
                        'height': monitor.height
                    }
                    break

            # 如果没找到，使用第一个显示器
            if not primary and monitors:
                monitor = monitors[0]
                primary = {
                    'x': monitor.x,
                    'y': monitor.y,
                    'width': monitor.width,
                    'height': monitor.height
                }

            # 默认值
            if not primary:
                primary = {'x': 0, 'y': 0, 'width': 1920, 'height': 1080}

            print(f"✓ 主显示器信息: {primary}")
            return primary

        except Exception as e:
            print(f"⚠ 获取显示器信息失败: {e}，使用默认值")
            return {'x': 0, 'y': 0, 'width': 1920, 'height': 1080}

    def log(self, message):
        """记录日志"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_message = f"[{timestamp}] {message}"
        print(log_message)
        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write(log_message + '\n')
    
    def read_urls(self):
        """读取URL列表"""
        with open(self.url_file, 'r', encoding='utf-8') as f:
            urls = [line.strip() for line in f if line.strip()]
        return urls
    
    def setup_browser(self):
        """设置浏览器（双显示器优化）"""
        chrome_options = Options()

        # 基础配置（与simple_browser_test.py相同）
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")

        # 音频自动播放
        chrome_options.add_argument("--autoplay-policy=no-user-gesture-required")

        # 使用当前目录的chromedriver.exe
        chromedriver_path = str(Path("chromedriver.exe").absolute())

        if Path(chromedriver_path).exists():
            service = Service(executable_path=chromedriver_path)
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.log(f"使用ChromeDriver: {chromedriver_path}")
        else:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.log("使用系统PATH中的ChromeDriver")

        # 设置窗口大小和位置
        window_width = min(1920, self.primary_monitor['width'])
        window_height = min(1080, self.primary_monitor['height'])

        self.driver.set_window_position(self.primary_monitor['x'], self.primary_monitor['y'])
        self.driver.set_window_size(window_width, window_height)

        self.log(f"浏览器窗口设置: 位置({self.primary_monitor['x']}, {self.primary_monitor['y']}), 大小({window_width}x{window_height})")
        
    def get_browser_window_info(self):
        """获取浏览器窗口位置和大小"""
        position = self.driver.get_window_position()
        size = self.driver.get_window_size()
        
        return {
            'x': position['x'],
            'y': position['y'],
            'width': size['width'],
            'height': size['height']
        }
    
    def find_and_click_play_button(self, timeout=15):
        """智能查找并点击播放按钮"""
        try:
            self.log("正在查找播放按钮...")
            time.sleep(3)
            
            # 方法1: 通过文本查找
            text_selectors = [
                "自动播放", "播放", "开始", "Start", "Play", "开始播放"
            ]
            
            for text in text_selectors:
                try:
                    buttons = self.driver.find_elements(By.XPATH, f"//button[contains(text(), '{text}')]")
                    if buttons:
                        buttons[0].click()
                        self.log(f"✓ 通过文本'{text}'找到并点击播放按钮")
                        return True
                except:
                    continue
            
            # 方法2: 通过class和id查找
            class_id_selectors = [
                (By.CLASS_NAME, "play-button"),
                (By.CLASS_NAME, "btn-play"),
                (By.ID, "playButton"),
                (By.ID, "autoPlay"),
                (By.CLASS_NAME, "start-button"),
            ]
            
            for by, selector in class_id_selectors:
                try:
                    button = self.driver.find_element(by, selector)
                    button.click()
                    self.log(f"✓ 通过选择器'{selector}'找到并点击播放按钮")
                    return True
                except:
                    continue
            
            # 方法3: JavaScript全局搜索
            try:
                result = self.driver.execute_script("""
                    const keywords = ['播放', '自动', '开始', 'play', 'start'];
                    const buttons = document.querySelectorAll('button, div[role="button"], a[role="button"]');
                    
                    for (let btn of buttons) {
                        const text = btn.textContent.toLowerCase();
                        const className = btn.className.toLowerCase();
                        const id = btn.id.toLowerCase();
                        
                        for (let keyword of keywords) {
                            if (text.includes(keyword) || className.includes(keyword) || id.includes(keyword)) {
                                btn.click();
                                return keyword;
                            }
                        }
                    }
                    return null;
                """)
                
                if result:
                    self.log(f"✓ 通过JavaScript找到并点击播放按钮（关键词: {result}）")
                    return True
            except Exception as e:
                self.log(f"JavaScript查找失败: {e}")
            
            self.log("⚠ 未找到播放按钮，将继续录制（可能需要手动点击）")
            return False
            
        except Exception as e:
            self.log(f"查找播放按钮时出错: {e}")
            return False
    
    def check_playback_status(self):
        """检查播放状态"""
        try:
            # 检查是否有"播放完成"、"结束"等标志
            result = self.driver.execute_script("""
                // 检查是否有完成标志
                const body = document.body.textContent;
                if (body.includes('播放完成') || body.includes('已结束') || body.includes('完成')) {
                    return 'completed';
                }
                
                // 检查当前幻灯片索引
                const slideInfo = document.querySelector('.slide-info, .page-info');
                if (slideInfo) {
                    return slideInfo.textContent;
                }
                
                return 'playing';
            """)
            return result
        except:
            return 'unknown'
    
    def get_audio_device_name(self):
        """获取VB-Cable音频设备的准确名称"""
        try:
            # 使用当前目录的ffmpeg.exe
            ffmpeg_path = str(Path("ffmpeg.exe").absolute())
            if not Path(ffmpeg_path).exists():
                ffmpeg_path = 'ffmpeg'

            result = subprocess.run(
                [ffmpeg_path, '-list_devices', 'true', '-f', 'dshow', '-i', 'dummy'],
                capture_output=True,
                text=True,
                encoding='utf-8',
                errors='ignore'
            )
            
            output = result.stderr
            
            # 查找CABLE相关的音频设备
            for line in output.split('\n'):
                if 'CABLE Output' in line or 'VB-Audio' in line:
                    # 提取设备名称
                    if '"' in line:
                        device_name = line.split('"')[1]
                        self.log(f"找到音频设备: {device_name}")
                        return device_name
            
            # 默认名称
            return "CABLE Output (VB-Audio Virtual Cable)"
        except Exception as e:
            self.log(f"获取音频设备名称失败: {e}")
            return "CABLE Output (VB-Audio Virtual Cable)"
    
    def start_ffmpeg_recording(self, window_info, output_file, max_duration=600):
        """启动FFmpeg录制（双显示器优化）"""
        audio_device = self.get_audio_device_name()

        # 使用当前目录的ffmpeg.exe
        ffmpeg_path = str(Path("ffmpeg.exe").absolute())
        if not Path(ffmpeg_path).exists():
            ffmpeg_path = 'ffmpeg'

        # 验证录制区域在主显示器内
        self.log(f"录制区域: x={window_info['x']}, y={window_info['y']}, "
                f"width={window_info['width']}, height={window_info['height']}")
        self.log(f"主显示器: x={self.primary_monitor['x']}, y={self.primary_monitor['y']}, "
                f"width={self.primary_monitor['width']}, height={self.primary_monitor['height']}")

        cmd = [
            ffmpeg_path,
            '-f', 'gdigrab',
            '-framerate', '30',
            '-offset_x', str(window_info['x']),
            '-offset_y', str(window_info['y']),
            '-video_size', f"{window_info['width']}x{window_info['height']}",
            '-i', 'desktop',
            '-f', 'dshow',
            '-i', f'audio={audio_device}',
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-t', str(max_duration),
            '-y',
            str(output_file)
        ]
        
        self.log(f"FFmpeg命令: {' '.join(cmd)}")
        
        self.ffmpeg_process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            stdin=subprocess.PIPE,
            creationflags=subprocess.CREATE_NO_WINDOW
        )
        
        return self.ffmpeg_process
    
    def stop_ffmpeg_recording(self):
        """停止FFmpeg录制"""
        if self.ffmpeg_process:
            self.log("正在停止录制...")
            try:
                # 发送'q'命令
                self.ffmpeg_process.stdin.write(b'q')
                self.ffmpeg_process.stdin.flush()
                self.ffmpeg_process.wait(timeout=10)
            except:
                self.ffmpeg_process.terminate()
                time.sleep(2)
                if self.ffmpeg_process.poll() is None:
                    self.ffmpeg_process.kill()
            
            self.ffmpeg_process = None
            self.log("录制已停止")
    
    def record_single_url(self, url, index, total, max_duration=600, check_interval=30):
        """录制单个URL（智能检测完成）"""
        self.log(f"\n{'='*60}")
        self.log(f"正在录制 [{index}/{total}]: {url}")
        self.log(f"{'='*60}")
        
        filename = url.split('/')[-1].replace('.html', '.mp4')
        output_file = self.output_dir / filename
        
        # 如果文件已存在，跳过
        if output_file.exists():
            self.log(f"⊙ 文件已存在，跳过: {output_file}")
            return True
        
        try:
            # 打开网页
            self.log("正在加载网页...")
            self.driver.get(url)
            time.sleep(5)
            
            # 获取窗口信息
            window_info = self.get_browser_window_info()
            self.log(f"浏览器窗口: {window_info}")
            
            # 注入CSS优化（仅统一字号，不修改播放时长）
            self.log("正在优化页面样式...")
            self.driver.execute_script("""
                // 统一字号：基于01_1.1的尺寸减少3px
                // 原始：subtitle 18px, h2 22px, h3 20px, 普通文本 18px
                // 新尺寸：subtitle 15px, h2 19px, h3 17px, 普通文本 15px
                const style = document.createElement('style');
                style.textContent = `
                    .subtitle-area,
                    .subtitle-text,
                    [class*="subtitle"] {
                        font-size: 15px !important;
                    }
                    .blackboard h2,
                    .content h2,
                    h2 {
                        font-size: 19px !important;
                    }
                    .blackboard h3,
                    .content h3,
                    h3 {
                        font-size: 17px !important;
                    }
                    .blackboard p,
                    .blackboard li,
                    .content p,
                    .content li,
                    p, li {
                        font-size: 15px !important;
                    }
                `;
                document.head.appendChild(style);
            """)
            self.log("✓ 已优化：统一字号(15/17/19px)，保持原有播放节奏")
            time.sleep(2)

            # 查找并点击播放按钮
            play_clicked = self.find_and_click_play_button()

            if not play_clicked:
                self.log("⚠ 请在10秒内手动点击播放按钮...")
                time.sleep(10)
            else:
                time.sleep(3)
            
            # 开始录制
            self.log(f"开始录制，最大时长: {max_duration}秒")
            self.start_ffmpeg_recording(window_info, output_file, max_duration)
            
            # 智能监控录制过程
            start_time = time.time()
            last_check = 0
            
            while True:
                elapsed = time.time() - start_time
                
                # 检查是否超时
                if elapsed >= max_duration:
                    self.log(f"达到最大录制时长 {max_duration}秒")
                    break
                
                # 定期检查播放状态
                if elapsed - last_check >= check_interval:
                    status = self.check_playback_status()
                    self.log(f"已录制 {int(elapsed)}秒，状态: {status}")
                    
                    if status == 'completed':
                        self.log("检测到播放完成")
                        time.sleep(5)  # 多录5秒确保完整
                        break
                    
                    last_check = elapsed
                
                time.sleep(1)
            
            # 停止录制
            self.stop_ffmpeg_recording()
            
            # 检查文件是否生成
            if output_file.exists():
                file_size = output_file.stat().st_size / (1024 * 1024)  # MB
                self.log(f"✓ 录制完成: {output_file.name} ({file_size:.2f} MB)")
                return True
            else:
                self.log(f"✗ 录制失败: 文件未生成")
                return False
            
        except Exception as e:
            self.log(f"✗ 录制失败: {e}")
            self.stop_ffmpeg_recording()
            return False
    
    def record_all(self, start_index=0, max_duration=600):
        """录制所有URL"""
        urls = self.read_urls()
        total = len(urls)
        
        self.log(f"共找到 {total} 个URL")
        self.log(f"从第 {start_index + 1} 个开始录制")
        self.log(f"每个视频最大录制时长: {max_duration}秒")
        
        self.setup_browser()
        
        success_count = 0
        fail_count = 0
        skip_count = 0
        
        try:
            for i, url in enumerate(urls[start_index:], start=start_index):
                result = self.record_single_url(url, i + 1, total, max_duration)
                
                if result:
                    success_count += 1
                else:
                    fail_count += 1
                
                if i < total - 1:
                    self.log("等待5秒后继续下一个...")
                    time.sleep(5)
        
        finally:
            if self.driver:
                self.driver.quit()
            
            self.log(f"\n{'='*60}")
            self.log(f"录制完成！")
            self.log(f"成功: {success_count}, 失败: {fail_count}")
            self.log(f"输出目录: {self.output_dir.absolute()}")
            self.log(f"{'='*60}")
    
    def cleanup(self):
        """清理资源"""
        self.stop_ffmpeg_recording()
        if self.driver:
            self.driver.quit()


def load_config():
    """加载配置文件"""
    config_file = Path("config.json")
    if config_file.exists():
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
            print("✓ 已加载配置文件: config.json")
            return config
        except Exception as e:
            print(f"⚠ 配置文件加载失败: {e}")
            print("使用默认配置")
    return None


if __name__ == "__main__":
    # 尝试加载配置文件
    config = load_config()

    if config:
        # 使用配置文件中的参数
        URL_FILE = config["录制配置"]["URL文件路径"]
        OUTPUT_DIR = config["录制配置"]["输出目录"]
        MAX_DURATION = config["录制配置"]["最大录制时长_秒"]
        START_INDEX = config["录制配置"]["起始索引"]
    else:
        # 使用默认配置
        URL_FILE = r"D:\WPS Office\2025\254805819\WPS云盘\教材\视频讲解\课程链接_已解码.txt"
        OUTPUT_DIR = "录制视频"
        MAX_DURATION = 600
        START_INDEX = 0

    print(f"\n配置信息：")
    print(f"  URL文件: {URL_FILE}")
    print(f"  输出目录: {OUTPUT_DIR}")
    print(f"  最大时长: {MAX_DURATION}秒")
    print(f"  起始索引: {START_INDEX}")
    print()

    recorder = SmartCoursewareRecorder(URL_FILE, OUTPUT_DIR)

    try:
        recorder.record_all(start_index=START_INDEX, max_duration=MAX_DURATION)
    except KeyboardInterrupt:
        print("\n用户中断录制")
        recorder.cleanup()
    except Exception as e:
        print(f"\n发生错误: {e}")
        recorder.cleanup()

