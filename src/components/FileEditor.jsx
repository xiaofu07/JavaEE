import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import '../css/FileEditor.css';
import { uploadFile } from '../utils/uploadService';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const FileEditor = ({ file, onClose, onDownload, onFileChange, notify }) => {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(file.current);
  const [displayDescription, setDisplayDescription] = useState(file.description || '');
  const [editingDescription, setEditingDescription] = useState(file.description || '');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [actionLoading, setActionLoading] = useState(false);
  const [displayMimeType, setDisplayMimeType] = useState(file.mimeType || '');
  const [editingMimeType, setEditingMimeType] = useState(file.mimeType || '');
  const [isEditingMime, setIsEditingMime] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const showNotify = notify || ((msg, type) => console.log(`[${type}] ${msg}`));

  // 判断文件类型
  const isImage = displayMimeType?.startsWith('image/');
  const isVideo = displayMimeType?.startsWith('video/');
  const isAudio = displayMimeType?.startsWith('audio/');
  const isText = displayMimeType?.startsWith('text/') || 
                 displayMimeType === 'application/json' ||
                 displayMimeType === 'application/javascript' ||
                 displayMimeType === 'application/xml';
  
  // 判断内容是否已修改
  const isModified = content !== originalContent;
  
  // 构建文件URL，添加版本ID防止缓存
  const ownerName = file.bucket?.owner?.name;
  const bucketName = file.bucket?.name;
  const baseUrl = `/blob/${ownerName}/${bucketName}/${file.name}`;
  const fileUrl = `${baseUrl}?v=${currentVersion?.id || Date.now()}`;

  // 加载文本内容
  useEffect(() => {
    if (isText) {
      setLoading(true);
      fetch(fileUrl, { credentials: 'include' })
        .then(res => res.text())
        .then(text => {
          setContent(text);
          setOriginalContent(text);
          setLoading(false);
        })
        .catch(() => {
          setContent('加载失败');
          setOriginalContent('');
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
        console.log(data)
        const newVersion = history.find(h => h.id === versionId);
        setCurrentVersion(newVersion);
        showNotify('版本切换成功', 'success');
        onFileChange?.();
      }
    } catch (e) {
      showNotify('切换版本失败', 'error');
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
        showNotify('版本删除成功', 'success');
        onFileChange?.();
      }
    } catch (e) {
      showNotify('删除版本失败', 'error');
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
        showNotify('文件删除成功', 'success');
        onFileChange?.();
        onClose();
      }
    } catch (e) {
      showNotify('删除文件失败', 'error');
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
        showNotify('重命名成功', 'success');
        onFileChange?.();
        onClose();
      }
    } catch (e) {
      showNotify('重命名失败', 'error');
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
        body: JSON.stringify({ description: editingDescription.trim() })
      });
      const data = await res.json();
      if (data.code === 200) {
        setDisplayDescription(editingDescription.trim());
        showNotify('描述更新成功', 'success');
        onFileChange?.();
      }
    } catch (e) {
      showNotify('更新描述失败', 'error');
    }
    setActionLoading(false);
    setIsEditingDesc(false);
  };

  // 更新 mimeType
  const handleUpdateMimeType = async () => {
    if (!editingMimeType.trim() || editingMimeType === displayMimeType) {
      setIsEditingMime(false);
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(baseUrl, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mimetype: editingMimeType.trim() })
      });
      const data = await res.json();
      if (data.code === 200) {
        setDisplayMimeType(editingMimeType.trim());
        showNotify('文件类型更新成功', 'success');
        onFileChange?.();
      }
    } catch (e) {
      showNotify('更新文件类型失败', 'error');
    }
    setActionLoading(false);
    setIsEditingMime(false);
  };

  // 上传新版本
  const handleUploadNewVersion = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 创建一个新的 File 对象，使用原文件名
      const renamedFile = new File([selectedFile], file.name, { type: selectedFile.type });
      
      await uploadFile(renamedFile, ownerName, bucketName, setUploadProgress);
      
      showNotify('新版本上传成功', 'success');
      
      // 刷新历史记录
      const res = await fetch(`${baseUrl}/history`, { credentials: 'include' });
      const data = await res.json();
      if (data.code === 200) {
        setHistory(data.data || []);
        if (data.data?.length > 0) {
          setCurrentVersion(data.data[data.data.length - 1]);
        }
      }
      
      onFileChange?.();
    } catch (err) {
      showNotify('上传失败: ' + (err.message || '未知错误'), 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  // 保存文本内容
  const handleSaveTextContent = async () => {
    if (!isModified) return;
    
    setIsSaving(true);
    try {
      // 将文本内容转为 Blob，再用 uploadFile 上传
      const blob = new Blob([content], { type: displayMimeType || 'text/plain' });
      const textFile = new File([blob], file.name, { type: displayMimeType || 'text/plain' });
      
      await uploadFile(textFile, ownerName, bucketName, () => {});
      
      setOriginalContent(content);
      showNotify('保存成功', 'success');
      
      // 刷新历史记录
      const res = await fetch(`${baseUrl}/history`, { credentials: 'include' });
      const data = await res.json();
      if (data.code === 200) {
        setHistory(data.data || []);
        if (data.data?.length > 0) {
          setCurrentVersion(data.data[data.data.length - 1]);
        }
      }
      
      onFileChange?.();
    } catch (err) {
      showNotify('保存失败: ' + (err.message || '未知错误'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 取消编辑，恢复原内容
  const handleCancelEdit = () => {
    setContent(originalContent);
    setIsEditingText(false);
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
            <div className="info-item description-item">
              <strong>文件类型:</strong>
              {isEditingMime ? (
                <span className="desc-edit">
                  <input
                    type="text"
                    value={editingMimeType}
                    onChange={(e) => setEditingMimeType(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateMimeType()}
                  />
                  <button className="btn btn-small" onClick={handleUpdateMimeType}>保存</button>
                  <button className="btn btn-small" onClick={() => { setIsEditingMime(false); setEditingMimeType(displayMimeType); }}>取消</button>
                </span>
              ) : (
                <span onClick={() => { setIsEditingMime(true); setEditingMimeType(displayMimeType); }} style={{ cursor: 'pointer' }} title="点击编辑">
                  {displayMimeType || '未知'}
                </span>
              )}
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
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateDescription()}
                  />
                  <button className="btn btn-small" onClick={handleUpdateDescription}>保存</button>
                  <button className="btn btn-small" onClick={() => { setIsEditingDesc(false); setEditingDescription(displayDescription); }}>取消</button>
                </span>
              ) : (
                <span onClick={() => { setIsEditingDesc(true); setEditingDescription(displayDescription); }} style={{ cursor: 'pointer' }} title="点击编辑">
                  {displayDescription || '无描述，点击添加'}
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
                  <div className="text-editor-container">
                    <div className="text-editor-toolbar">
                      {isEditingText ? (
                        <>
                          <button 
                            className="btn btn-small btn-save-text" 
                            onClick={handleSaveTextContent}
                            disabled={isSaving || !isModified}
                          >
                            {isSaving ? '保存中...' : '保存'}
                          </button>
                          <button 
                            className="btn btn-small" 
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                          >
                            取消
                          </button>
                          {isModified && <span className="modified-hint">● 已修改</span>}
                        </>
                      ) : (
                        <button 
                          className="btn btn-small" 
                          onClick={() => setIsEditingText(true)}
                        >
                          编辑
                        </button>
                      )}
                    </div>
                    {isEditingText ? (
                      <textarea
                        className="text-editor"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        spellCheck={false}
                      />
                    ) : (
                      <pre className="text-preview">{content}</pre>
                    )}
                  </div>
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
              <button 
                className="btn btn-file-action" 
                onClick={handleUploadNewVersion}
                disabled={isUploading}
              >
                {isUploading ? `上传中 ${uploadProgress}%` : '上传新版本'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
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
