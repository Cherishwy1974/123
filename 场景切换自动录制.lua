--[[
OBS Lua 脚本：场景切换自动录制
功能：手动切换场景时，自动停止当前录制并开始新录制
作者：Augment Agent
版本：2.0
使用方法：
  1. 打开 OBS
  2. 工具 → 脚本
  3. 点击 "+" 添加此脚本
  4. 切换到第一个场景，手动点击"开始录制"
  5. 之后每次手动切换场景都会自动停止并重新开始录制
--]]

obs = obslua

-- 全局变量
is_recording = false
current_scene = ""
is_switching = false  -- 防止重复触发
delay_seconds = 3     -- 停止录制后等待几秒再开始新录制

-- 脚本描述
function script_description()
    return [[
<h2>🎥 场景切换自动录制</h2>
<p><b>功能：</b>手动切换场景时，自动停止当前录制并开始新录制</p>

<h3>📋 工作流程：</h3>
<ol>
  <li>✅ 切换到第一个课程场景（例如：01_1.1_指数的概念与运算）</li>
  <li>✅ 手动点击 "开始录制" 按钮</li>
  <li>✅ 等待课程播放完成</li>
  <li>✅ 手动切换到下一个场景</li>
  <li>🤖 脚本自动停止当前录制</li>
  <li>🤖 等待 3 秒</li>
  <li>🤖 脚本自动开始新录制</li>
  <li>✅ 重复步骤 3-7，直到所有课程录制完成</li>
</ol>

<h3>💡 优点：</h3>
<ul>
  <li>✅ 每个场景生成独立的视频文件</li>
  <li>✅ 你可以完全控制何时切换场景</li>
  <li>✅ 不需要担心忘记停止/开始录制</li>
  <li>✅ 浏览器源会在场景激活时自动刷新（需要配置文件支持）</li>
</ul>

<h3>⚙️ 设置：</h3>
<p>可以在下方调整停止录制后的等待时间（默认3秒）</p>
]]
end

-- 脚本属性（可配置参数）
function script_properties()
    local props = obs.obs_properties_create()
    
    obs.obs_properties_add_int_slider(props, "delay_seconds", 
        "停止录制后等待时间（秒）", 1, 10, 1)
    
    return props
end

-- 获取默认设置
function script_defaults(settings)
    obs.obs_data_set_default_int(settings, "delay_seconds", 3)
end

-- 更新设置
function script_update(settings)
    delay_seconds = obs.obs_data_get_int(settings, "delay_seconds")
end

-- 脚本加载时调用
function script_load(settings)
    print("✅ 场景切换自动录制脚本已加载")

    -- 获取当前场景名称
    local source = obs.obs_frontend_get_current_scene()
    if source ~= nil then
        current_scene = obs.obs_source_get_name(source)
        obs.obs_source_release(source)
    end

    -- 获取当前录制状态
    is_recording = obs.obs_frontend_recording_active()

    -- 注册前端事件回调
    obs.obs_frontend_add_event_callback(on_event)

    print("📋 当前场景: " .. current_scene)
    print("📹 录制状态: " .. (is_recording and "录制中" or "未录制"))
    print("⏱️  等待时间: " .. delay_seconds .. " 秒")
end

-- 脚本卸载时调用
function script_unload()
    print("👋 场景切换自动录制脚本已卸载")
    obs.obs_frontend_remove_event_callback(on_event)
end

-- 延迟开始录制的定时器回调
function start_recording_delayed()
    if not is_switching then
        return
    end

    obs.obs_frontend_recording_start()
    is_recording = true
    is_switching = false
    print("🔴 开始新录制: " .. current_scene)

    -- 移除定时器
    obs.remove_current_callback()
end

-- 处理场景切换
function handle_scene_change()
    -- 防止重复触发
    if is_switching then
        print("⚠️  正在切换中，跳过")
        return
    end

    -- 获取新场景名称
    local source = obs.obs_frontend_get_current_scene()
    if source == nil then
        return
    end

    local new_scene = obs.obs_source_get_name(source)
    obs.obs_source_release(source)

    -- 如果场景没变化，不处理
    if new_scene == current_scene then
        return
    end

    print("\n" .. string.rep("=", 60))
    print("🔄 场景切换: " .. current_scene .. " → " .. new_scene)
    print(string.rep("=", 60))

    is_switching = true
    local old_scene = current_scene
    current_scene = new_scene

    -- 如果正在录制，先停止
    if is_recording then
        obs.obs_frontend_recording_stop()
        is_recording = false
        print("⏹️  停止录制: " .. old_scene)
        print("⏳ 等待 " .. delay_seconds .. " 秒后开始新录制...")

        -- 延迟后开始新录制
        obs.timer_add(start_recording_delayed, delay_seconds * 1000)
    else
        is_switching = false
        print("⚠️  当前未录制，跳过自动开始")
        print("💡 提示：请手动点击 '开始录制' 按钮")
    end
end

-- OBS 前端事件回调
function on_event(event)
    -- 场景切换事件
    if event == obs.OBS_FRONTEND_EVENT_SCENE_CHANGED then
        handle_scene_change()

    -- 录制开始事件
    elseif event == obs.OBS_FRONTEND_EVENT_RECORDING_STARTED then
        if not is_switching then
            is_recording = true
            print("🔴 手动开始录制: " .. current_scene)
        end

    -- 录制停止事件
    elseif event == obs.OBS_FRONTEND_EVENT_RECORDING_STOPPED then
        if not is_switching then
            is_recording = false
            print("⏹️  手动停止录制: " .. current_scene)
        end
    end
end

