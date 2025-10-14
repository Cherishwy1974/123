@echo off
chcp 65001 >nul
title 自动化课件录制系统

echo ========================================
echo   自动化课件录制系统
echo ========================================
echo.

:: 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到Python，请先安装Python 3.8+
    pause
    exit /b 1
)

:: 检查FFmpeg
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到FFmpeg，请先安装FFmpeg并添加到PATH
    pause
    exit /b 1
)

echo [✓] Python 已安装
echo [✓] FFmpeg 已安装
echo.

:: 检查依赖
echo 正在检查Python依赖包...
python -c "import selenium" 2>nul
if errorlevel 1 (
    echo [!] 缺少selenium，正在安装...
    pip install selenium
)

python -c "import pyautogui" 2>nul
if errorlevel 1 (
    echo [!] 缺少pyautogui，正在安装...
    pip install pyautogui
)

python -c "import psutil" 2>nul
if errorlevel 1 (
    echo [!] 缺少psutil，正在安装...
    pip install psutil
)

echo.
echo ========================================
echo   开始录制
echo ========================================
echo.
echo 提示：
echo 1. 确保VB-Cable已启动
echo 2. 系统音频输出已设置为"CABLE Input"
echo 3. 浏览器窗口会自动打开，不要最小化
echo 4. 你可以继续使用电脑，不会影响录制
echo 5. 按 Ctrl+C 可以中断录制
echo.
echo 按任意键开始录制...
pause >nul

python auto_record_courseware.py

echo.
echo ========================================
echo   录制完成
echo ========================================
pause
