@echo off
chcp 65001 >nul
title 自动化课件录制系统

:menu
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║          自动化课件录制系统 - 启动菜单                    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo  [1] 运行系统测试（推荐首次使用）
echo  [2] 开始批量录制（智能版）
echo  [3] 开始批量录制（基础版）
echo  [4] 安装/检查依赖
echo  [5] 查看使用说明
echo  [0] 退出
echo.
echo ════════════════════════════════════════════════════════════
set /p choice="请选择操作 (0-5): "

if "%choice%"=="1" goto test
if "%choice%"=="2" goto smart
if "%choice%"=="3" goto basic
if "%choice%"=="4" goto install
if "%choice%"=="5" goto help
if "%choice%"=="0" goto end
goto menu

:test
cls
echo ════════════════════════════════════════════════════════════
echo 运行系统测试...
echo ════════════════════════════════════════════════════════════
echo.
python test_single_recording.py
echo.
pause
goto menu

:smart
cls
echo ════════════════════════════════════════════════════════════
echo 启动智能版批量录制
echo ════════════════════════════════════════════════════════════
echo.
echo 提示：
echo - 确保VB-Cable已配置为系统音频输出
echo - 录制过程中浏览器窗口会显示，请勿最小化
echo - 你可以在其他窗口继续工作
echo - 按Ctrl+C可以随时中断录制
echo.
set /p confirm="确认开始录制？(Y/N): "
if /i "%confirm%"=="Y" (
    python auto_record_smart.py
) else (
    echo 已取消
)
echo.
pause
goto menu

:basic
cls
echo ════════════════════════════════════════════════════════════
echo 启动基础版批量录制
echo ════════════════════════════════════════════════════════════
echo.
echo 提示：
echo - 基础版使用固定时长录制
echo - 建议使用智能版（选项2）
echo.
set /p confirm="确认开始录制？(Y/N): "
if /i "%confirm%"=="Y" (
    python auto_record_courseware.py
) else (
    echo 已取消
)
echo.
pause
goto menu

:install
cls
echo ════════════════════════════════════════════════════════════
echo 安装/检查依赖
echo ════════════════════════════════════════════════════════════
echo.
call install_dependencies.bat
goto menu

:help
cls
echo ════════════════════════════════════════════════════════════
echo 使用说明
echo ════════════════════════════════════════════════════════════
echo.
echo 详细文档：
echo - README_录制系统.md （快速开始指南）
echo - 录制配置说明.md （详细配置说明）
echo.
echo 快速步骤：
echo 1. 首次使用：选择[4]安装依赖
echo 2. 配置VB-Cable：系统音频输出 → CABLE Input
echo 3. 运行测试：选择[1]测试系统
echo 4. 开始录制：选择[2]批量录制
echo.
echo 常见问题：
echo Q: 录制没有声音？
echo A: 检查系统音频输出是否设置为VB-Cable
echo.
echo Q: 找不到播放按钮？
echo A: 脚本会提示手动点击，在10秒内点击即可
echo.
echo Q: 如何断点续录？
echo A: 编辑脚本中的START_INDEX参数
echo.
pause
goto menu

:end
cls
echo 感谢使用！
timeout /t 2 >nul
exit

