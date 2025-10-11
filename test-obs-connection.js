const OBSWebSocket = require('obs-websocket-js').default;

async function testConnection() {
  const obs = new OBSWebSocket();

  try {
    console.log('🔌 连接OBS WebSocket...');
    console.log('   地址: ws://127.0.0.1:4455');
    console.log('   密码: uKH7kKKv74GDFf7Z');
    console.log('');

    await obs.connect('ws://127.0.0.1:4455', 'uKH7kKKv74GDFf7Z');
    console.log('✅ 连接成功！');
    console.log('');

    // 获取OBS版本信息
    const version = await obs.call('GetVersion');
    console.log('📊 OBS版本信息:');
    console.log('   OBS版本:', version.obsVersion);
    console.log('   WebSocket版本:', version.obsWebSocketVersion);
    console.log('');

    // 获取录制状态
    const status = await obs.call('GetRecordStatus');
    console.log('🎬 录制状态:');
    console.log('   正在录制:', status.outputActive ? '是' : '否');
    console.log('');

    await obs.disconnect();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🎉 测试成功！OBS WebSocket配置正确！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('💡 现在可以使用自动录制脚本了：');
    console.log('   node auto-record-obs.js <URL>');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('  ❌ 连接失败');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
    console.error('错误:', error.message);
    console.error('');
    console.error('💡 请检查：');
    console.error('   1. OBS Studio是否正在运行');
    console.error('   2. WebSocket服务器是否启用');
    console.error('      （工具 -> WebSocket服务器设置）');
    console.error('   3. 端口是否为4455');
    console.error('   4. 密码是否为: uKH7kKKv74GDFf7Z');
    console.error('   5. 防火墙是否阻止连接');
    console.error('');
    console.error('📖 详细配置步骤请查看: OBS配置指南.md');
    console.error('');
    process.exit(1);
  }
}

testConnection();
