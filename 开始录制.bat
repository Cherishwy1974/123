@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   课程录制助手
echo ========================================
echo.
echo 🎬 准备在默认浏览器中打开课程...
echo.
echo ⚠️  录制前请确保：
echo    1. 已安装OBS Studio或其他录屏软件
echo    2. 网络连接正常
echo    3. 系统音量已打开
echo.
echo ⏳ 3秒后将打开浏览器...
timeout /t 3 /nobreak >nul

echo.
echo ✅ 正在打开课程URL...

REM 在默认浏览器中打开课程URL
start https://cherishwy1974.github.io/123/01_1.1_指数的概念与运算.html

echo.
echo ========================================
echo   📝 录制步骤：
echo ========================================
echo.
echo 1️⃣  在OBS中点击"开始录制"
echo 2️⃣  在浏览器中点击"🚀 启动虚拟人"
echo 3️⃣  等待显示"💖 虚拟人已就绪"
echo 4️⃣  点击"🎬 自动播放"按钮
echo 5️⃣  等待课程自动播放完成
echo 6️⃣  在OBS中点击"停止录制"
echo.
echo 💡 提示：课程会自动翻页，无需手动操作
echo.
pause
