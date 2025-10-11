# OBS WebSocket 配置指南

## 🎯 目标
让OBS能够接收外部程序的控制命令，实现自动开始/停止录制。

## 📋 详细步骤

### 步骤1：检查OBS版本

1. 打开OBS Studio
2. 点击菜单：**帮助** -> **关于**
3. 查看版本号

**重要**：
- OBS 28.0+ 已内置WebSocket插件（推荐）
- OBS 27.x 及以下需要手动安装插件

### 步骤2：启用WebSocket服务器

#### 如果是OBS 28.0+（内置版本）

1. 打开OBS Studio
2. 点击菜单：**工具** -> **WebSocket服务器设置**
3. 勾选 **启用WebSocket服务器**
4. 配置参数：
   ```
   服务器端口：4455（保持默认）
   启用身份验证：✅ 勾选
   服务器密码：uKH7kKKv74GDFf7Z（你提供的密码）
   ```
5. 点击 **应用** 然后 **确定**

#### 如果是OBS 27.x（需要安装插件）

1. 下载插件：https://github.com/obsproject/obs-websocket/releases
2. 选择适合你系统的版本（Windows 64位）
3. 下载 `obs-websocket-X.X.X-windows-x64-Installer.exe`
4. 双击安装（自动检测OBS路径）
5. 重启OBS
6. 按照上面的步骤配置WebSocket

### 步骤3：配置OBS录制设置

#### 3.1 添加音频源（VB-Cable）

1. 在OBS主界面，找到 **音频混音器** 区域
2. 点击 **设置** ⚙️ -> **音频**
3. 在 **桌面音频** 下拉菜单中选择：
   ```
   CABLE Input (VB-Audio Virtual Cable)
   ```
4. 点击 **应用**

#### 3.2 添加显示器捕获源

1. 在 **来源** 区域点击 **+**
2. 选择 **显示器捕获**
3. 命名为 "屏幕录制" 并点击 **确定**
4. 在弹出窗口中：
   - 选择你的主显示器
   - 点击 **确定**

#### 3.3 配置录制格式

1. 点击 **文件** -> **设置**
2. 选择 **输出** 标签
3. **录像** 配置：
   ```
   录像路径：选择一个目录（如 D:\Recordings）
   录像格式：mp4
   音频轨道：1
   编码器：x264（软件编码）或 NVENC（N卡硬件编码）
   ```

4. 如果选择 **x264**：
   ```
   速率控制：CBR
   比特率：5000 Kbps
   预设：medium
   配置：high
   ```

5. 点击 **应用** 和 **确定**

### 步骤4：测试WebSocket连接

创建测试文件 `test-obs-connection.js`：

```javascript
const OBSWebSocket = require('obs-websocket-js').default;

async function testConnection() {
  const obs = new OBSWebSocket();

  try {
    console.log('🔌 连接OBS WebSocket...');
    await obs.connect('ws://127.0.0.1:4455', 'uKH7kKKv74GDFf7Z');
    console.log('✅ 连接成功！');

    // 获取OBS版本信息
    const version = await obs.call('GetVersion');
    console.log('📊 OBS版本信息:');
    console.log('   版本:', version.obsVersion);
    console.log('   WebSocket版本:', version.obsWebSocketVersion);

    // 获取录制状态
    const status = await obs.call('GetRecordStatus');
    console.log('🎬 录制状态:');
    console.log('   正在录制:', status.outputActive);

    await obs.disconnect();
    console.log('');
    console.log('🎉 测试成功！OBS WebSocket配置正确！');

  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    console.error('');
    console.error('💡 请检查：');
    console.error('   1. OBS是否正在运行');
    console.error('   2. WebSocket服务器是否启用');
    console.error('   3. 端口是否为4455');
    console.error('   4. 密码是否正确');
  }
}

testConnection();
```

运行测试：
```bash
node test-obs-connection.js
```

### 步骤5：配置浏览器音频输出

确保浏览器音频输出到VB-Cable：

#### Windows 11/10音频设置

1. 右键点击任务栏音量图标
2. 选择 **声音设置**
3. 找到你的浏览器（Chrome/Edge）
4. 点击右侧的 **>** 展开
5. 在 **输出** 下拉菜单选择：
   ```
   CABLE Input (VB-Audio Virtual Cable)
   ```

或使用音量混合器：

1. 右键点击任务栏音量图标
2. 选择 **打开音量混合器**
3. 找到浏览器
4. 点击扬声器图标，切换到 **CABLE Input**

## ✅ 验证配置

完成所有配置后，验证步骤：

1. **OBS显示**：
   - 可以看到屏幕画面 ✅
   - 音频混音器中CABLE Input有音量条跳动 ✅

2. **WebSocket连接**：
   ```bash
   node test-obs-connection.js
   ```
   应该显示 "✅ 连接成功！"

3. **录制测试**：
   ```bash
   node auto-record-obs.js https://cherishwy1974.github.io/123/01_1.1_指数的概念与运算.html
   ```
   应该自动开始录制

## 🎬 使用自动录制

配置完成后，运行：

```bash
# 单个课程
node auto-record-obs.js https://cherishwy1974.github.io/123/课程.html

# 批量录制
node batch-record-obs.js
```

## 🆘 常见问题

### Q: WebSocket连接被拒绝
A:
1. 确认OBS正在运行
2. 检查WebSocket服务器是否启用
3. 确认端口是4455
4. 检查防火墙设置

### Q: 没有音频
A:
1. 检查OBS音频混音器中CABLE Input是否有音量
2. 确认浏览器音频输出到VB-Cable
3. 确认VB-Cable驱动已安装

### Q: 录制的视频是黑屏
A:
1. 检查显示器捕获源是否正确
2. 尝试重新添加显示器捕获
3. 确认没有隐私保护软件阻止屏幕捕获

### Q: 自动播放没有启动
A:
1. 检查网络连接
2. 确认虚拟人SDK加载成功
3. 查看浏览器控制台是否有错误

## 📁 相关文件

- `auto-record-obs.js` - 自动录制脚本（已配置密码）
- `test-obs-connection.js` - WebSocket连接测试
- `batch-record-obs.js` - 批量录制脚本

---

**配置完成后，你就可以完全自动化录制课程了！** 🎉
