# 自动化课件录制系统

## 📋 项目概述

这是一个自动化录制网页课件视频的系统，可以批量录制在线课件并保存为MP4视频文件，同时捕获画面和音频。

### ✨ 主要特性

- ✅ **批量自动化录制**：自动读取URL列表，逐个录制
- ✅ **智能播放检测**：自动查找并点击播放按钮
- ✅ **音频同步录制**：通过VB-Cable捕获系统音频
- ✅ **半后台运行**：不锁定鼠标/键盘，可以继续使用电脑
- ✅ **断点续录**：支持从指定位置继续录制
- ✅ **智能完成检测**：自动检测播放完成（改进版）
- ✅ **详细日志记录**：记录所有操作和错误信息

## 📦 文件说明

| 文件名 | 说明 |
|--------|------|
| `auto_record_courseware.py` | 基础版录制脚本（固定时长） |
| `auto_record_smart.py` | **智能版录制脚本（推荐）** |
| `test_single_recording.py` | 测试工具（测试单个URL录制） |
| `install_dependencies.bat` | 依赖安装脚本 |
| `录制配置说明.md` | 详细配置和使用说明 |
| `URL编码链接.txt` | 课件URL列表（53个） |

## 🚀 快速开始

### 1. 安装依赖

**方法A：自动安装（推荐）**
```bash
双击运行: install_dependencies.bat
```

**方法B：手动安装**
```bash
# 安装Python包
pip install selenium pyautogui psutil pillow

# 下载并安装FFmpeg
# https://ffmpeg.org/download.html

# 下载并安装ChromeDriver
# https://chromedriver.chromium.org/downloads
```

### 2. 配置VB-Cable音频

1. 确保VB-Cable已安装
2. 右键任务栏音量图标 → 声音设置
3. 输出设备选择：**CABLE Input (VB-Audio Virtual Cable)**
4. 这样浏览器音频会输出到VB-Cable，FFmpeg可以捕获

### 3. 测试系统

```bash
# 运行测试工具
python test_single_recording.py

# 选择选项4：运行所有测试
# 这会测试：音频设备、浏览器、单个URL录制
```

### 4. 开始批量录制

```bash
# 使用智能版脚本（推荐）
python auto_record_smart.py
```

## ⚙️ 配置参数

编辑 `auto_record_smart.py` 文件底部：

```python
# URL列表文件
URL_FILE = r"D:\WPS Office\2025\254805819\WPS云盘\教材\视频讲解\URL编码链接.txt"

# 输出目录
OUTPUT_DIR = "录制视频"

# 每个视频最大录制时长（秒）
MAX_DURATION = 600  # 10分钟

# 从第几个URL开始（0=从头开始）
START_INDEX = 0
```

## 📊 录制流程

```
1. 读取URL列表
   ↓
2. 启动Chrome浏览器
   ↓
3. 打开课件URL
   ↓
4. 自动查找并点击播放按钮
   ↓
5. 启动FFmpeg录制（画面+音频）
   ↓
6. 智能监控播放状态
   ↓
7. 检测到完成或达到最大时长
   ↓
8. 停止录制，保存MP4文件
   ↓
9. 继续下一个URL
```

## 🎯 关于"后台录制"

### 当前方案（半后台）

✅ **可以做到：**
- 浏览器在独立窗口运行
- 不锁定鼠标和键盘
- 可以在其他窗口工作
- 可以使用其他应用程序

❌ **限制：**
- 浏览器窗口会显示在屏幕上
- 不能最小化或遮挡浏览器窗口
- 录制的是该窗口的内容

### 建议的使用方式

**如果有双显示器：**
- 将浏览器窗口移到第二个显示器
- 在主显示器上正常工作
- 完全不受影响

**如果只有单显示器：**
- 将浏览器窗口缩小到屏幕一角
- 在其他区域工作
- 或者在录制时做其他事情（看书、休息等）

### 完全后台方案（进阶）

如果确实需要完全后台（窗口不可见），可以使用：

1. **虚拟显示器方案**
   - 安装虚拟显示器驱动（IddSampleDriver）
   - 在虚拟显示器上运行浏览器
   - 录制虚拟显示器内容

2. **云端录制方案**
   - 使用云服务器或Docker
   - 运行Selenium Grid
   - 远程录制

如需这些方案的详细实现，请告诉我。

## 📝 使用示例

### 示例1：录制所有课件

```python
python auto_record_smart.py
```

### 示例2：从第10个开始录制

编辑 `auto_record_smart.py`：
```python
START_INDEX = 9  # 从第10个开始（索引从0开始）
```

### 示例3：测试单个URL

```python
python test_single_recording.py
# 选择选项3
```

## 🔧 常见问题

### Q1: 提示找不到FFmpeg

**解决方法：**
1. 下载FFmpeg：https://ffmpeg.org/download.html
2. 解压到任意目录（如 `C:\ffmpeg`）
3. 将 `C:\ffmpeg\bin` 添加到系统PATH环境变量
4. 重启命令行窗口
5. 运行 `ffmpeg -version` 验证

### Q2: 录制的视频没有声音

**检查清单：**
- [ ] VB-Cable是否已安装
- [ ] 系统音频输出是否设置为"CABLE Input"
- [ ] 运行测试脚本检查音频设备是否被识别
- [ ] 浏览器是否有声音输出

**验证音频设备：**
```bash
python test_single_recording.py
# 选择选项1：测试音频设备检测
```

### Q3: 提示ChromeDriver版本不匹配

**解决方法：**
1. 打开Chrome浏览器
2. 设置 → 关于Chrome → 查看版本号（如：120.0.6099.109）
3. 下载对应版本的ChromeDriver：https://chromedriver.chromium.org/downloads
4. 将 `chromedriver.exe` 放到Python的Scripts目录或添加到PATH

### Q4: 找不到播放按钮

**解决方法：**
1. 脚本会尝试多种方式自动查找
2. 如果失败，会提示"请在10秒内手动点击"
3. 你可以手动点击播放按钮
4. 录制会正常进行

### Q5: 如何确定录制时长

**建议步骤：**
1. 手动打开一个课件
2. 从头播放到结束，记录时间
3. 设置 `MAX_DURATION` 为该时间 + 30秒缓冲

**示例：**
- 如果课件播放需要8分钟
- 设置 `MAX_DURATION = 540`（9分钟）

## 📈 性能优化

### 录制质量设置

在 `auto_record_smart.py` 的 `start_ffmpeg_recording` 方法中：

```python
# 当前设置（平衡质量和文件大小）
'-preset', 'medium',  # 编码速度：ultrafast/fast/medium/slow
'-crf', '23',         # 质量：18(高质量) - 28(低质量)
'-b:a', '192k',       # 音频比特率

# 高质量设置
'-preset', 'slow',
'-crf', '18',
'-b:a', '256k',

# 快速录制设置
'-preset', 'ultrafast',
'-crf', '28',
'-b:a', '128k',
```

### 批量录制建议

- 建议晚上或不使用电脑时运行
- 53个课件，每个10分钟 = 约9小时
- 可以分批录制，使用 `START_INDEX` 断点续录

## 📂 输出文件

### 目录结构

```
录制视频/
├── 01_1.1_指数的概念与运算.mp4
├── 01_1.2_对数的概念与运算.mp4
├── ...
└── 录制日志.txt
```

### 日志文件

`录制日志.txt` 包含：
- 每个URL的录制状态
- 播放按钮查找结果
- 录制时长和文件大小
- 错误信息

## 🎓 技术栈

- **Python 3.8+**
- **Selenium**：浏览器自动化
- **FFmpeg**：视频录制和编码
- **VB-Cable**：虚拟音频设备
- **ChromeDriver**：Chrome浏览器驱动

## 📞 支持

如果遇到问题：

1. 查看 `录制配置说明.md` 获取详细文档
2. 运行 `test_single_recording.py` 进行诊断
3. 检查 `录制日志.txt` 查看错误信息

## 🔄 更新日志

### v2.0 (智能版)
- ✨ 新增智能播放完成检测
- ✨ 新增自动音频设备识别
- ✨ 新增详细日志记录
- ✨ 新增测试工具
- 🐛 修复播放按钮查找问题
- 🐛 修复FFmpeg停止命令

### v1.0 (基础版)
- ✨ 基础批量录制功能
- ✨ 固定时长录制
- ✨ VB-Cable音频捕获

## 📄 许可

本项目仅供学习和个人使用。

