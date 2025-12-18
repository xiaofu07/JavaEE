import { createContext, useContext, useState, useEffect } from 'react';
import socketService from '../utils/socketService';

const CollaborationContext = createContext();

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within CollaborationProvider');
  }
  return context;
};

export const CollaborationProvider = ({ children }) => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [currentFileId, setCurrentFileId] = useState(null);
  const [editingUsers, setEditingUsers] = useState({});

  // 初始化Socket连接
  useEffect(() => {
    const userId = localStorage.getItem('userId') || `user_${Date.now()}`;
    localStorage.setItem('userId', userId);
    socketService.connect(userId);

    return () => {
      socketService.disconnect();
    };
  }, []);

  // 监听用户加入
  useEffect(() => {
    socketService.onUserJoined(({ userId, username, fileId }) => {
      if (fileId === currentFileId) {
        setActiveUsers(prev => [...prev, { id: userId, name: username }]);
      }
    });

    socketService.onUserLeft(({ userId, fileId }) => {
      if (fileId === currentFileId) {
        setActiveUsers(prev => prev.filter(user => user.id !== userId));
      }
    });

    socketService.onCursorUpdate(({ userId, username, cursorPosition, fileId }) => {
      if (fileId === currentFileId) {
        setEditingUsers(prev => ({
          ...prev,
          [userId]: { username, cursorPosition, lastUpdate: Date.now() }
        }));
      }
    });

    // 清理过期的光标位置
    const interval = setInterval(() => {
      const now = Date.now();
      setEditingUsers(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(userId => {
          if (now - updated[userId].lastUpdate > 3000) { // 3秒内无更新则移除
            delete updated[userId];
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentFileId]);

  const joinFileRoom = (fileId) => {
    socketService.joinFileRoom(fileId);
    setCurrentFileId(fileId);
  };

  const leaveFileRoom = () => {
    if (currentFileId) {
      socketService.leaveFileRoom(currentFileId);
      setCurrentFileId(null);
      setActiveUsers([]);
      setEditingUsers({});
    }
  };

  const sendFileUpdate = (content, cursorPosition) => {
    if (currentFileId) {
      socketService.sendFileUpdate(currentFileId, content, cursorPosition);
    }
  };

  const sendCursorUpdate = (cursorPosition) => {
    if (currentFileId) {
      socketService.sendCursorUpdate(currentFileId, cursorPosition);
    }
  };

  return (
    <CollaborationContext.Provider value={{
      activeUsers,
      editingUsers,
      currentFileId,
      joinFileRoom,
      leaveFileRoom,
      sendFileUpdate,
      sendCursorUpdate,
      onFileUpdate: (callback) => socketService.onFileUpdate(callback)
    }}>
      {children}
    </CollaborationContext.Provider>
  );
};