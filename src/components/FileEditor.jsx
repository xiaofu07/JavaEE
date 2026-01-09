import { useState, useEffect, useRef, useCallback } from 'react';
import { useCollaboration } from '../contexts/CollaborationContext';
import '../css/FileEditor.css';

const FileEditor = ({ file, onClose, onSave, onDownload, username, bucketName }) => {
  const [content, setContent] = useState(file.content || '');
  const [isEditing, setIsEditing] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved'
  const editorRef = useRef(null);
  const cursorRef = useRef(null);

  // 判断文件类型
  const isImage = file.contentType?.startsWith('image/');
  const isText = file.contentType?.startsWith('text/') || 
                 file.contentType === 'application/json' ||
                 file.contentType === 'application/javascript';
  
  // 构建文件URL
  const fileUrl = `/blob/${username}/${bucketName}/${file.name}`;

  const {
    activeUsers,
    editingUsers,
    joinFileRoom,
    leaveFileRoom,
    sendFileUpdate,
    sendCursorUpdate,
    onFileUpdate
  } = useCollaboration();

  // 加入文件编辑房间
  useEffect(() => {
    if (file) {
      joinFileRoom(file.id);
    }
    return () => {
      leaveFileRoom();
    };
  }, [file.id]);

  // 监听远程更新
  useEffect(() => {
    const handleRemoteUpdate = ({ content: remoteContent, userId }) => {
      if (userId !== localStorage.getItem('userId')) {
        setContent(remoteContent);
        setSaveStatus('saved');
      }
    };

    onFileUpdate(handleRemoteUpdate);

    return () => {
      // 清理
    };
  }, []);

  // 自动保存
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    if (saveStatus === 'unsaved') {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000); // 2秒后自动保存

      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [content, saveStatus]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setSaveStatus('unsaved');
    
    // 发送更新到其他用户
    sendFileUpdate(newContent, cursorPosition);
    
    // 发送光标位置
    sendCursorUpdate(cursorPosition);
  };

  const handleSave = () => {
    if (saveStatus !== 'saving') {
      setSaveStatus('saving');
      
      // 模拟保存到服务器
      setTimeout(() => {
        onSave(file.id, content);
        setSaveStatus('saved');
      }, 500);
    }
  };

  const handleDownload = () => {
    onDownload(file, content);
  };

  const handleCursorMove = (e) => {
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);
    sendCursorUpdate(cursorPos);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const renderOtherUsersCursors = () => {
    return Object.entries(editingUsers).map(([userId, userData]) => {
      if (userId === localStorage.getItem('userId')) return null;

      const cursorStyle = {
        left: `${userData.cursorPosition * 8}px`, // 粗略计算位置
        backgroundColor: getColorFromUserId(userId)
      };

      return (
        <div
          key={userId}
          className="other-user-cursor"
          style={cursorStyle}
          title={`${userData.username} 正在编辑`}
        >
          <div className="cursor-label">{userData.username}</div>
        </div>
      );
    });
  };

  const getColorFromUserId = (userId) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="file-editor-modal">
      <div className="file-editor-content">
        <div className="editor-header">
          <div className="header-left">
            <h2>
              {file.name}
              <span className="file-badge">在线编辑</span>
            </h2>
            <div className="save-status">
              <span className={`status-dot ${saveStatus}`}></span>
              {saveStatus === 'saved' && '已保存'}
              {saveStatus === 'saving' && '保存中...'}
              {saveStatus === 'unsaved' && '未保存'}
            </div>
          </div>
          <div className="header-right">
            <div className="active-users">
              <span className="user-count">{activeUsers.length} 人在线</span>
              {activeUsers.map(user => (
                <span key={user.id} className="user-badge" style={{ backgroundColor: getColorFromUserId(user.id) }}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ))}
            </div>
            <button className="btn edit-toggle" onClick={handleEditToggle}>
              {isEditing ? '只读模式' : '编辑模式'}
            </button>
            <button className="btn btn-save" onClick={handleSave} disabled={saveStatus === 'saving'}>
              {saveStatus === 'saving' ? '保存中...' : '保存'}
            </button>
            <button className="btn btn-download" onClick={handleDownload}>
              下载
            </button>
            <button className="btn btn-close" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="editor-main">
          <div className="file-info">
            <div className="info-item">
              <strong>文件类型:</strong> {(file.contentType || 'unknown').toUpperCase()}
            </div>
            <div className="info-item">
              <strong>大小:</strong> {file.size || '未知'}
            </div>
            <div className="info-item">
              <strong>最后修改:</strong> {file.date || '未知'}
            </div>
            <div className="info-item">
              <strong>创建时间:</strong> {file.createdAt || '未知'}
            </div>
          </div>

          <div className="editor-container" ref={editorRef}>
            <div className="editor-header-bar">
              <div className="editor-tools">
                <button className="tool-btn" title="加粗">B</button>
                <button className="tool-btn" title="斜体">I</button>
                <button className="tool-btn" title="下划线">U</button>
                <div className="tool-separator"></div>
                <button className="tool-btn" title="插入链接">🔗</button>
                <button className="tool-btn" title="插入图片">🖼️</button>
              </div>
              <div className="editor-meta">
                <span>字符数: {content.length}</span>
                <span>行数: {content.split('\n').length}</span>
              </div>
            </div>

            <div className="editor-wrapper">
              {renderOtherUsersCursors()}
              {isImage ? (
                <div className="image-preview">
                  <img src={fileUrl} alt={file.name} style={{ maxWidth: '100%', maxHeight: '70vh' }} />
                </div>
              ) : isText ? (
                <textarea
                  className="text-editor"
                  value={content}
                  onChange={handleContentChange}
                  onSelect={handleCursorMove}
                  onKeyUp={handleCursorMove}
                  onClick={handleCursorMove}
                  readOnly={!isEditing}
                  placeholder={isEditing ? '开始编辑...' : '切换到编辑模式以修改内容'}
                />
              ) : (
                <div className="unsupported-preview">
                  <p>⚠️ 此类文件暂不支持预览</p>
                  <p>文件类型: {file.contentType || '未知'}</p>
                  <button className="btn btn-download" onClick={() => onDownload(file)}>
                    下载文件
                  </button>
                </div>
              )}
            </div>

            <div className="editor-footer">
              <div className="collaboration-status">
                {activeUsers.length > 0 && (
                  <div className="collaborators">
                    <strong>正在协作的用户:</strong>
                    {activeUsers.map(user => (
                      <span key={user.id} className="collaborator" style={{ color: getColorFromUserId(user.id) }}>
                        {user.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="editor-hints">
                {isEditing ? (
                  <p>💡 您的编辑会自动同步给其他用户，2秒后自动保存</p>
                ) : (
                  <p>🔒 只读模式，点击"编辑模式"按钮开始编辑</p>
                )}
              </div>
            </div>
          </div>

          <div className="editor-sidebar">
            <div className="sidebar-section">
              <h3>版本历史</h3>
              <ul className="version-list">
                <li className="version-item">
                  <span className="version-time">刚刚</span>
                  <span className="version-user">您</span>
                  <span className="version-action">自动保存</span>
                </li>
                <li className="version-item">
                  <span className="version-time">5分钟前</span>
                  <span className="version-user">张三</span>
                  <span className="version-action">修改了内容</span>
                </li>
                <li className="version-item">
                  <span className="version-time">今天 10:30</span>
                  <span className="version-user">李四</span>
                  <span className="version-action">创建了文件</span>
                </li>
              </ul>
              <button className="btn btn-history">查看全部历史</button>
            </div>

            <div className="sidebar-section">
              <h3>协作工具</h3>
              <button className="btn btn-collab">分享链接</button>
              <button className="btn btn-collab">邀请协作者</button>
              <button className="btn btn-collab">添加评论</button>
            </div>

            <div className="sidebar-section">
              <h3>文件操作</h3>
              <button className="btn btn-file-action">重命名</button>
              <button className="btn btn-file-action">复制</button>
              <button className="btn btn-file-action">移动</button>
              <button className="btn btn-file-action btn-danger">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileEditor;
