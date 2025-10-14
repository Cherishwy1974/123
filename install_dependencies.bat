@echo off
chcp 65001 >nul
echo ========================================
echo 自动化课件录制系统 - 依赖安装脚本
echo ========================================
echo.

echo [1/4] 检查Python环境...
python --version
if %errorlevel% neq 0 (
    echo 错误：未找到Python，请先安装Python 3.8+
    pause
    exit /b 1
)
echo ✓ Python已安装
echo.

echo [2/4] 安装Python依赖包...
pip install selenium pyautogui psutil pillow
if %errorlevel% neq 0 (
    echo 错误：依赖包安装失败
    pause
    exit /b 1
)
echo ✓ Python依赖包已安装
echo.

echo [3/4] 检查FFmpeg...
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠ 警告：未找到FFmpeg
    echo 请手动安装FFmpeg并添加到PATH环境变量
    echo 下载地址：https://ffmpeg.org/download.html
    echo.
) else (
    echo ✓ FFmpeg已安装
)
echo.

echo [4/4] 检查ChromeDriver...
chromedriver --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠ 警告：未找到ChromeDriver
    echo 请手动安装ChromeDriver并添加到PATH环境变量
    echo 下载地址：https://chromedriver.chromium.org/downloads
    echo.
) else (
    echo ✓ ChromeDriver已安装
)
echo.

echo ========================================
echo 安装完成！
echo ========================================
echo.
echo 下一步：
echo 1. 如果FFmpeg或ChromeDriver未安装，请按照提示安装
echo 2. 确保VB-Cable已配置为系统音频输出
echo 3. 运行: python auto_record_courseware.py
echo.
pause

