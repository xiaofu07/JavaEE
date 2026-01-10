import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import '../css/FileEditor.css';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const FileEditor = ({ file, onClose, onDownload, onFileChange }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(file.current);
  const [description, setDescription] = useState(file.description || '');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [actionLoading, setActionLoading] = useState(false);

  // 判断文件类型
  const isImage = file.mimeType?.startsWith('image/');
  const isVideo = file.mimeType?.startsWith('video/');
  const isAudio = file.mimeType?.startsWith('audio/');
  const isText = file.mimeType?.startsWith('text/') || 
                 file.mimeType === 'application/json' ||
                 file.mimeType === 'application/javascript' ||
                 file.mimeType === 'application/xml';
  
  // 构建文件URL
  const ownerName = file.bucket?.owner?.name;
  const bucketName = file.bucket?.name;
  const baseUrl = `/blob/${ownerName}/${bucketName}/${file.name}`;
  const fileUrl = baseUrl;

  // 加载文本内容
  useEffect(() => {
    if (isText) {
      setLoading(true);
      fetch(fileUrl, { credentials: 'include' })
        .then(res => res.text())
        .then(text => {
          setContent(text);
          setLoading(false);
        })
        .catch(() => {
          setContent('加载失败');
          setLoading(false);
        });
    }
  }, [file.id, isText, fileUrl, currentVersion?.id]);

  // 加载版本历史
  useEffect(() => {
    setHistoryLoading(true);
    fetch(`${baseUrl}/history`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) {
          setHistory(data.data || []);
        }
        setHistoryLoading(false);
      })
      .catch(() => {
        setHistoryLoading(false);
      });
  }, [baseUrl]);

  const handleDownload = () => {
    onDownload(file);
  };

  // 切换版本
  const handleSwitchVersion = async (versionId) => {
    setActionLoading(true);
    try {
      const res = await fetch(baseUrl, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentId: versionId })
      });
      const data = await res.json();
      if (data.code === 200) {
        const newVersion = history.find(h => h.id === versionId);
        setCurrentVersion(newVersion);
        onFileChange?.();
      }
    } catch (e) {
      console.error('切换版本失败', e);
    }
    setActionLoading(false);
  };

  // 删除版本
  const handleDeleteVersion = async (versionId) => {
    if (!confirm('确定要删除这个版本吗？')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${baseUrl}?id=${versionId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.code === 200) {
        setHistory(prev => prev.filter(h => h.id !== versionId));
        onFileChange?.();
      }
    } catch (e) {
      console.error('删除版本失败', e);
    }
    setActionLoading(false);
  };

  // 删除文件
  const handleDeleteFile = async () => {
    if (!confirm('确定要删除整个文件吗？此操作不可恢复！')) return;
    setActionLoading(true);
    try {
      const res = await fetch(baseUrl, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.code === 200) {
        onFileChange?.();
        onClose();
      }
    } catch (e) {
      console.error('删除文件失败', e);
    }
    setActionLoading(false);
  };

  // 重命名
  const handleRename = async () => {
    if (!newName.trim() || newName === file.name) {
      setIsRenaming(false);
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(baseUrl, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });
      const data = await res.json();
      if (data.code === 200) {
        onFileChange?.();
        onClose();
      }
    } catch (e) {
      console.error('重命名失败', e);
    }
    setActionLoading(false);
    setIsRenaming(false);
  };

  // 更新描述
  const handleUpdateDescription = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(baseUrl, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() })
      });
      const data = await res.json();
      if (data.code === 200) {
        onFileChange?.();
      }
    } catch (e) {
      console.error('更新描述失败', e);
    }
    setActionLoading(false);
    setIsEditingDesc(false);
  };

  return (
    <div className="file-editor-modal">
      <div className="file-editor-content">
        <div className="editor-header">
          <div className="header-left">
            {isRenaming ? (
              <div className="rename-input">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  autoFocus
                />
                <button className="btn btn-small" onClick={handleRename}>确定</button>
                <button className="btn btn-small" onClick={() => { setIsRenaming(false); setNewName(file.name); }}>取消</button>
              </div>
            ) : (
              <h2 onClick={() => setIsRenaming(true)} style={{ cursor: 'pointer' }} title="点击重命名">
                {file.name}
              </h2>
            )}
          </div>
          <div className="header-right">
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
              <strong>文件类型:</strong> {file.mimeType || '未知'}
            </div>
            <div className="info-item">
              <strong>最后修改:</strong> {currentVersion?.time ? dayjs(currentVersion.time).fromNow() : '未知'}
            </div>
            <div className="info-item">
              <strong>修改者:</strong> {currentVersion?.who?.name || '未知'}
            </div>
            <div className="info-item description-item">
              <strong>描述:</strong>
              {isEditingDesc ? (
                <span className="desc-edit">
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateDescription()}
                  />
                  <button className="btn btn-small" onClick={handleUpdateDescription}>保存</button>
                  <button className="btn btn-small" onClick={() => setIsEditingDesc(false)}>取消</button>
                </span>
              ) : (
                <span onClick={() => setIsEditingDesc(true)} style={{ cursor: 'pointer' }} title="点击编辑">
                  {file.description || '无描述，点击添加'}
                </span>
              )}
            </div>
          </div>

          <div className="editor-container">
            <div className="editor-wrapper">
              {isImage ? (
                <div className="image-preview">
                  <img src={fileUrl} alt={file.name} style={{ maxWidth: '100%', maxHeight: '70vh' }} />
                </div>
              ) : isVideo ? (
                <div className="video-preview">
                  <video controls style={{ maxWidth: '100%', maxHeight: '70vh' }}>
                    <source src={fileUrl} type={file.mimeType} />
                    您的浏览器不支持视频播放
                  </video>
                </div>
              ) : isAudio ? (
                <div className="audio-preview">
                  <audio controls>
                    <source src={fileUrl} type={file.mimeType} />
                    您的浏览器不支持音频播放
                  </audio>
                </div>
              ) : isText ? (
                loading ? (
                  <div className="loading">加载中...</div>
                ) : (
                  <pre className="text-preview">{content}</pre>
                )
              ) : (
                <div className="unsupported-preview">
                  <p>⚠️ 此类文件暂不支持预览</p>
                  <p>文件类型: {file.mimeType || '未知'}</p>
                  <button className="btn btn-download" onClick={handleDownload}>
                    下载文件
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="editor-sidebar">
            <div className="sidebar-section">
              <h3>版本历史</h3>
              {historyLoading ? (
                <p>加载中...</p>
              ) : (
                <ul className="version-list">
                  {history.map((ver) => (
                    <li key={ver.id} className={`version-item ${ver.id === currentVersion?.id ? 'current' : ''}`}>
                      <div className="version-info">
                        <span className="version-time">{dayjs(ver.time).fromNow()}</span>
                        <span className="version-user">{ver.who?.name}</span>
                        <span className="version-hash" title={ver.hash}>{ver.hash?.slice(0, 8)}</span>
                      </div>
                      <div className="version-actions">
                        {ver.id !== currentVersion?.id && (
                          <button 
                            className="btn btn-small" 
                            onClick={() => handleSwitchVersion(ver.id)}
                            disabled={actionLoading}
                          >
                            切换
                          </button>
                        )}
                        {history.length > 1 && (
                          <button 
                            className="btn btn-small btn-danger" 
                            onClick={() => handleDeleteVersion(ver.id)}
                            disabled={actionLoading}
                          >
                            删除
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="sidebar-section">
              <h3>文件操作</h3>
              <button className="btn btn-file-action" onClick={() => setIsRenaming(true)}>重命名</button>
              <button className="btn btn-file-action btn-danger" onClick={handleDeleteFile} disabled={actionLoading}>
                删除文件
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileEditor;
