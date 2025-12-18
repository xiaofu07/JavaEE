// 这是一个模拟的WebSocket服务器，实际项目中应该使用真正的后端
class MockWebSocket {
  constructor() {
    this.listeners = new Map();
    this.fileRooms = new Map();
  }

  // 模拟连接
  connect() {
    console.log('连接到协同编辑服务器（模拟）');
    setTimeout(() => {
      this.trigger('connect');
    }, 100);
  }

  // 加入房间
  joinFileRoom(fileId) {
    console.log(`加入文件房间: ${fileId}`);
    if (!this.fileRooms.has(fileId)) {
      this.fileRooms.set(fileId, new Set());
    }
    this.fileRooms.get(fileId).add('current-user');
  }

  // 离开房间
  leaveFileRoom(fileId) {
    console.log(`离开文件房间: ${fileId}`);
    if (this.fileRooms.has(fileId)) {
      this.fileRooms.get(fileId).delete('current-user');
    }
  }

  // 发送更新
  sendFileUpdate(data) {
    console.log('发送文件更新:', data);
    // 模拟网络延迟
    setTimeout(() => {
      this.trigger('file-update', {
        ...data,
        userId: 'other-user',
        timestamp: Date.now()
      });
    }, Math.random() * 1000);
  }

  // 发送光标更新
  sendCursorUpdate(data) {
    console.log('发送光标更新:', data);
  }

  // 事件监听
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // 触发事件
  trigger(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  disconnect() {
    console.log('断开连接');
  }
}

// 导出模拟实例
export const mockSocket = new MockWebSocket();