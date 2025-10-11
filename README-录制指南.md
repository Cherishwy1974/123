# 课程视频自动录制指南

## 🎯 系统特点

### ✨ 事件驱动自动翻页
- **不使用硬编码时间** - 通过监听虚拟人SDK的 `frame_stop` 事件自动翻页
- **完美同步** - 虚拟人讲完一页，系统自动翻到下一页
- **智能等待** - 自动等待页面加载和动画完成

### 🎬 全自动录制
- 使用 Puppeteer 自动化浏览器操作
- 自动点击启动、自动播放按钮
- 自动录制屏幕和音频
- 自动检测播放完成并停止录制

### 📦 资源本地化
- 字体文件已本地化 (Noto Serif SC)
- D3.js 已本地化
- MathJax 已本地化
- 减少网络依赖，加快加载速度

## 🚀 快速开始

### 1. 安装依赖

```bash
cd "D:\WPS Office\2025\254805819\WPS云盘\教材\视频讲解"
npm install
```

### 2. 录制课程

**推荐：使用在线URL录制**（确保虚拟人SDK能正常连接）

```bash
# 录制在线课程
node auto-record.js https://cherishwy1974.github.io/123/01_1.1_指数的概念与运算.html
```

**或使用本地文件**

```bash
# 录制本地课程
node auto-record.js 01_1.1_指数的概念与运算.html
```

### 3. 查看录制结果

录制完成的视频会保存在 `./recordings/` 目录下。

## ⚠️ 重要提示

### 使用在线URL的优势
- ✅ **虚拟人SDK连接更稳定** - HTTPS/HTTP协议下SDK能正常工作
- ✅ **跨域资源加载正常** - 避免本地文件的CORS限制
- ✅ **推荐使用方式** - GitHub Pages部署后使用在线URL录制

### 本地文件的限制
- ⚠️ 虚拟人SDK可能因为file://协议而连接失败
- ⚠️ 某些资源可能因为CORS策略无法加载
- ⚠️ 仅用于测试或离线场景

## 📋 工作原理

### 事件驱动翻页流程

```
1. 用户点击"自动播放"按钮
   ↓
2. 系统连接虚拟人SDK
   ↓
3. 显示第1页，虚拟人开始讲解
   ↓
4. 虚拟人讲解完成 → 触发 frame_stop 事件
   ↓
5. 系统自动翻到第2页
   ↓
6. 虚拟人自动讲解第2页
   ↓
7. 重复步骤4-6，直到所有页面播放完成
```

### 关键代码改进

#### 添加 frame_stop 事件监听

```javascript
avatarPlatform
    .on('frame_stop', (data) => {
        console.log('✅ 虚拟人讲解完成 frame_stop:', data);
        if (isAutoPlaying && currentSlide < totalSlides - 1) {
            // 自动翻页到下一页
            setTimeout(() => {
                currentSlide++;
                showSlide(currentSlide);
                updateSlideInfo();
                setTimeout(() => {
                    speakContent(currentSlide + 1);
                }, 800);
            }, 1500);
        }
    });
```

#### 简化自动播放函数

不再使用 `getSlideDuration()` 硬编码时间，而是完全依赖事件驱动：

```javascript
async function startAutoPlay() {
    // 连接虚拟人
    await startTeaching();

    // 开始第一页讲解
    speakContent(1);

    // 后续翻页由 frame_stop 事件自动触发
}
```

## 🎥 录制配置

### 视频参数 (可在 auto-record.js 中修改)

```javascript
RECORD_OPTIONS: {
    fps: 30,                    // 帧率
    videoFrame: {
        width: 1920,
        height: 1080,
    },
    videoCrf: 23,               // 质量 (18-28)
    videoBitrate: 4000,         // 比特率
    audioCodec: 'aac',
    audioBitrate: '320k',       // 音频比特率
}
```

## 📁 文件结构

```
教材/视频讲解/
├── 01_1.1_指数的概念与运算.html    # 课程HTML（已改进）
├── auto-record.js                   # 自动录制脚本
├── package.json                     # 依赖配置
├── d3.v7.min.js                     # D3.js本地化
├── mathjax-tex-mml-chtml.js         # MathJax本地化
├── assets/
│   └── noto-serif-sc.css            # 字体本地化
├── recordings/                      # 录制输出目录
│   └── 01_1.1_指数的概念与运算.mp4
└── README-录制指南.md               # 本文档
```

## ⚠️ 注意事项

### 虚拟人SDK要求
- 需要稳定的网络连接（虚拟人API需要联网）
- 确保API密钥有效
- 首次使用需要等待SDK加载

### 录制环境
- 建议在安静的环境中录制
- 确保系统音频输出正常
- 关闭不必要的后台程序以保证性能

### 自动化限制
- 不要在录制过程中操作鼠标键盘
- 不要切换窗口或最小化浏览器
- 确保有足够的磁盘空间（每个视频约100-500MB）

## 🐛 常见问题

### Q: 录制过程中虚拟人不说话？
A: 检查虚拟人API连接状态，查看控制台是否有错误信息。

### Q: 翻页不同步怎么办？
A: 检查 `frame_stop` 事件是否正常触发，可以在控制台看到日志。

### Q: 录制的视频没有声音？
A: 确保系统音频输出设备正常，Puppeteer启动时带了自动播放参数。

### Q: 如何调整翻页延迟？
A: 修改 `frame_stop` 事件处理中的 `setTimeout` 时间（当前1500ms）。

## 📊 下一步优化

- [ ] 支持批量录制多个课程
- [ ] 添加录制进度显示
- [ ] 支持录制失败自动重试
- [ ] 添加视频质量检测
- [ ] 支持自定义录制参数

## 📞 技术支持

如有问题，请查看：
1. 浏览器控制台日志
2. Node.js终端输出
3. recordings目录下的录制文件

---

**版本**: 2.1.0 - 事件驱动版
**更新时间**: 2025-10-11
