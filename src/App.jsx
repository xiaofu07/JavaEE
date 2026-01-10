import { useState, useEffect, useRef } from 'react';
import './css/App.css';
import { login } from './utils/userService.js'
import AuthModal from './components/AuthModal';
import FileSection from './components/FileSection';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FileEditor from './components/FileEditor';
import ProgressBar from './components/ProgressBar';
import { CollaborationProvider } from './contexts/CollaborationContext';
import BucketManager from './components/BucketManager';
import { uploadFile, cancelUpload } from './utils/uploadService';
import { getAllBuckets, createBucket as apiCreateBucket, deleteBucket as apiDeleteBucket, getBucketFiles } from './utils/bucketService';

// 主应用组件
function App() {
  const initialUserId = localStorage.getItem('userId') || `user_${Date.now()}`;
  const initialUsername = '当前用户';
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [buckets, setBuckets] = useState([]);
  const [currentBucketId, setCurrentBucketId] = useState(null);
  const [files, setFiles] = useState([]);
  const [editingFile, setEditingFile] = useState(null);
  const [showBucketManager, setShowBucketManager] = useState(false);
  const [userData, setUserData] = useState({
    id: initialUserId,
    username: initialUsername,
    avatar: null
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadFileName, setDownloadFileName] = useState('');
  const [progressStatus, setProgressStatus] = useState('uploading'); // 'uploading', 'downloading'
  const fileInputRef = useRef(null);

  const currentBucket = buckets.find(bucket => bucket.id === currentBucketId) || buckets[0];

  // 初始化用户ID
  useEffect(() => {
    if (!localStorage.getItem('userId') && userData.id) {
      localStorage.setItem('userId', userData.id);
    }
  }, [userData.id]);

  // 登录后加载桶列表
  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const data = await getAllBuckets();
        setBuckets(data || []);
        if (data?.length > 0 && !currentBucketId) {
          setCurrentBucketId(data[0].id);
        }
      } catch (err) {
        console.error('获取桶列表失败:', err);
      }
    })();
  }, [isLoggedIn]);

  // 切换桶时加载文件列表
  useEffect(() => {
    if (!isLoggedIn || !currentBucket) return;
    (async () => {
      try {
        const data = await getBucketFiles(userData.username, currentBucket.name);
        setFiles(data || []);
      } catch (err) {
        console.error('获取文件列表失败:', err);
        setFiles([]);
      }
    })();
  }, [isLoggedIn, currentBucket?.id, userData.username]);

  // 根据 cookie 自动登录
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/user', { credentials: 'include' });
        if (!res.ok) return;
        const body = await res.json().catch(() => null);
        if (!body || body.code !== 200 || !body.data) return;
        const user = body.data;
        setUserData({ id: user.id, username: user.name || user.username || '用户', avatar: user.avatar });
        if (user?.id) localStorage.setItem('userId', String(user.id));
        setIsLoggedIn(true);
      } catch {}
    })();
  }, []);

  // 处理登录
  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.querySelector('input[type="text"]')?.value?.trim();
    const password = form.querySelector('input[type="password"]')?.value;
    try {
      const user = await login(username, password)
      setUserData({ id: user.id, username: user.name || user.username || username || '用户', avatar: user.avatar });
      if (user?.id) localStorage.setItem('userId', String(user.id));
      setIsLoggedIn(true);
      setShowAuthModal(false);
    } catch (err) {
      alert(err.message || '登录失败');
    }
  };

  // 处理注册
  const handleRegister = async (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.querySelector('input[type="text"]')?.value?.trim();
    const email = form.querySelector('input[type="email"]')?.value?.trim();
    const pwInputs = form.querySelectorAll('input[type="password"]');
    const password = pwInputs[0]?.value;
    const confirm = pwInputs[1]?.value;
    if (password !== confirm) {
      alert('两次输入的密码不一致');
      return;
    }
    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || body?.code !== 200) {
        throw new Error(body?.msg || '注册失败');
      }
      const user = body?.data || {};
      setUserData({ id: user.id, username: user.name || user.username || username || '用户', avatar: user.avatar });
      if (user?.id) localStorage.setItem('userId', String(user.id));
      setIsLoggedIn(true);
      setShowAuthModal(false);
    } catch (err) {
      alert(err.message || '注册失败');
    }
  };

  // 处理文件上传
  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadFileName(file.name);
    setProgressStatus('uploading');

    try {
      await uploadFile(file, userData.username, currentBucket?.name, setUploadProgress);

      // 重新加载文件列表
      const data = await getBucketFiles(userData.username, currentBucket.name);
      setFiles(data || []);
      
      alert('文件上传成功！');
    } catch (err) {
      alert('上传失败: ' + (err.message || '未知错误'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadFileName('');
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  // 处理文件下载
  const handleDownload = async (file) => {
    setDownloading(true);
    setDownloadProgress(0);
    setDownloadFileName(file.name);
    setProgressStatus('downloading');

    try {
      const url = `/blob/${userData.username}/${currentBucket?.name}/${file.name}`;
      const res = await fetch(url, { credentials: 'include' });
      
      if (!res.ok) {
        throw new Error('下载失败');
      }
      
      // 获取文件总大小
      const contentLength = parseInt(res.headers.get('content-length'), 10);
      const reader = res.body.getReader();
      const chunks = [];
      let receivedLength = 0;

      // 逐块读取并更新进度
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
        
        if (contentLength) {
          const percent = Math.round((receivedLength / contentLength) * 100);
          setDownloadProgress(percent);
        }
      }

      // 合并所有块
      const blob = new Blob(chunks);
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert('下载失败: ' + (err.message || '未知错误'));
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
      setDownloadFileName('');
    }
  };

  // 处理备份
  const handleBackup = () => {
    const backupData = JSON.stringify(currentBucket?.files || [], null, 2);
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `云存储备份_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 处理文件编辑
  const handleEditFile = (file) => {
    // 添加示例内容
    setEditingFile(file);
  };

  // 保存文件编辑内容
  const handleSaveFile = (fileId, newContent) => {
    setBuckets(prev => {
      const idx = prev.findIndex(bucket => bucket.id === currentBucketId);
      const targetIndex = idx >= 0 ? idx : 0;
      const copy = [...prev];
      const bucket = { ...copy[targetIndex] };
      bucket.files = bucket.files.map(file =>
        file.id === fileId
          ? { ...file, content: newContent, date: new Date().toISOString().split('T')[0], lastModified: new Date().toLocaleString() }
          : file
      );
      copy[targetIndex] = bucket;
      return copy;
    });
  };

  const handleSelectBucket = (bucketId) => {
    setCurrentBucketId(bucketId);
    setShowBucketManager(false);
  };

  const handleCreateBucket = async ({ name, capacityGB }) => {
    if (!name) {
      alert('请输入桶名称');
      return;
    }
    try {
      const newBucket = await apiCreateBucket(name, '');
      setBuckets(prev => [...prev, newBucket]);
      setCurrentBucketId(newBucket.id);
    } catch (err) {
      alert('创建桶失败: ' + (err.message || '未知错误'));
    }
  };

  const handleDeleteBucket = async (bucketId) => {
    const target = buckets.find(b => b.id === bucketId);
    if (!target) return;
    if (buckets.length <= 1) {
      alert('至少需要保留一个桶');
      return;
    }
    try {
      await apiDeleteBucket(bucketId);
      setBuckets(prev => {
        const filtered = prev.filter(b => b.id !== bucketId);
        const nextId = currentBucketId === bucketId ? (filtered[0]?.id || null) : currentBucketId;
        setCurrentBucketId(nextId);
        return filtered;
      });
    } catch (err) {
      alert('删除桶失败: ' + (err.message || '未知错误'));
    }
  };

  const handleAddPermission = (bucketId, permission) => {
    setBuckets(prev => prev.map(bucket => {
      if (bucket.id !== bucketId) return bucket;
      if (bucket.ownerId !== userData.id) return bucket;
      const perms = bucket.permissions || [];
      const exists = perms.some(p => p.userId === permission.userId);
      const updated = exists
        ? perms.map(p => p.userId === permission.userId ? permission : p)
        : [...perms, permission];
      return { ...bucket, permissions: updated };
    }));
  };

  const handleRemovePermission = (bucketId, userId) => {
    setBuckets(prev => prev.map(bucket => {
      if (bucket.id !== bucketId) return bucket;
      if (bucket.ownerId !== userData.id) return bucket;
      const updated = (bucket.permissions || []).filter(p => p.userId !== userId);
      return { ...bucket, permissions: updated };
    }));
  };

  return (
    <CollaborationProvider>
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <Navbar
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          setShowAuthModal={setShowAuthModal}
        />

        <div className="container">
          <div className="main-content">
            <Sidebar
              isLoggedIn={isLoggedIn}
              onUpload={handleUpload}
              onBackup={handleBackup}
              bucket={currentBucket}
              onOpenBucketManager={() => setShowBucketManager(true)}
              userName={userData.username}
              userAvatar={userData.avatar}
            />

            <FileSection
              isLoggedIn={isLoggedIn}
              files={files}
              onEdit={handleEditFile}
              onDownload={handleDownload}
              bucketName={currentBucket?.name}
            />
          </div>
        </div>

        {showAuthModal && (
          <AuthModal
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onClose={() => setShowAuthModal(false)}
          />
        )}

        {editingFile && (
          <FileEditor
            file={editingFile}
            onClose={() => setEditingFile(null)}
            onDownload={(file) => handleDownload(file)}
            onFileChange={async () => {
              // 刷新文件列表
              if (currentBucket) {
                const data = await getBucketFiles(userData.username, currentBucket.name);
                setFiles(data || []);
              }
            }}
          />
        )}

        <BucketManager
          open={showBucketManager}
          onClose={() => setShowBucketManager(false)}
          buckets={buckets}
          currentBucketId={currentBucket?.id}
          onSelectBucket={handleSelectBucket}
          onCreateBucket={handleCreateBucket}
          onDeleteBucket={handleDeleteBucket}
          onAddPermission={handleAddPermission}
          onRemovePermission={handleRemovePermission}
          currentUserId={userData.id}
        />

        {/* 上传进度条 */}
        {uploading && (
          <ProgressBar
            progress={uploadProgress}
            status="uploading"
            filename={uploadFileName}
            onCancel={() => {
              cancelUpload();
              setUploading(false);
              setUploadProgress(0);
              setUploadFileName('');
            }}
          />
        )}

        {/* 下载进度条 */}
        {downloading && (
          <ProgressBar
            progress={downloadProgress}
            status="downloading"
            filename={downloadFileName}
            onCancel={() => {
              setDownloading(false);
              setDownloadProgress(0);
              setDownloadFileName('');
            }}
          />
        )}
      </div>
    </CollaborationProvider>
  );
}

export default App;
