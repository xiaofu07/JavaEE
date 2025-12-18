// 这是一个简化的WebSocket服务，不需要mockServer.js
class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
  }

  // 模拟连接
  connect(userId) {
    console.log('连接到协同编辑服务器（模拟），用户ID:', userId);
    
    // 模拟连接
    this.socket = {
      emit: (event, data) => {
        console.log(`发送 ${event}:`, data);
        
        // 模拟其他用户的响应
        if (event === 'file-update') {
          setTimeout(() => {
            this.trigger('file-update', {
              ...data,
              userId: 'other-user-' + Math.floor(Math.random() * 1000),
              username: '其他用户',
              timestamp: Date.now()
            });
          }, 1000);
        }
      },
      
      on: (event, callback) => {
        this.listeners.set(event, callback);
      },
      
      disconnect: () => {
        this.isConnected = false;
        console.log('断开连接');
      }
    };
    
    this.isConnected = true;
    
    // 模拟连接成功
    setTimeout(() => {
      this.trigger('connect');
    }, 100);
  }

  // 加入文件编辑房间
  joinFileRoom(fileId) {
    console.log(`加入文件房间: ${fileId}`);
  }

  // 离开文件编辑房间
  leaveFileRoom(fileId) {
    console.log(`离开文件房间: ${fileId}`);
  }

  // 发送文件内容更新
  sendFileUpdate(fileId, content, cursorPosition) {
    if (this.socket) {
      this.socket.emit('file-update', {
        fileId,
        content,
        cursorPosition,
        timestamp: Date.now()
      });
    }
  }

  // 发送光标位置
  sendCursorUpdate(fileId, cursorPosition) {
    if (this.socket) {
      this.socket.emit('cursor-update', {
        fileId,
        cursorPosition
      });
    }
  }

  // 监听文件更新
  onFileUpdate(callback) {
    this.listeners.set('file-update', callback);
  }

  // 监听用户加入
  onUserJoined(callback) {
    this.listeners.set('user-joined', callback);
  }

  // 监听用户离开
  onUserLeft(callback) {
    this.listeners.set('user-left', callback);
  }

  // 监听协同光标位置
  onCursorUpdate(callback) {
    this.listeners.set('cursor-update', callback);
  }

  // 触发事件
  trigger(event, data) {
    const callback = this.listeners.get(event);
    if (callback) {
      callback(data);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

// 创建单例实例
const socketService = new SocketService();

export default socketService;