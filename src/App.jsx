import { useState, useEffect } from 'react';
import './css/App.css';
import AuthModal from './components/AuthModal';
import FileSection from './components/FileSection';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FileEditor from './components/FileEditor';
import { CollaborationProvider } from './contexts/CollaborationContext';
import { sampleFiles, sampleBuckets } from './data/sampleData';
import BucketManager from './components/BucketManager';

// 主应用组件
function App() {
  const initialUserId = localStorage.getItem('userId') || `user_${Date.now()}`;
  const initialUsername = '当前用户';
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [buckets, setBuckets] = useState(() => sampleBuckets.map(b => ({
    ...b,
    ownerId: b.ownerId || initialUserId,
    ownerName: b.ownerName || initialUsername,
    permissions: b.permissions || []
  })));
  const [currentBucketId, setCurrentBucketId] = useState(() => sampleBuckets[0]?.id || null);
  const [editingFile, setEditingFile] = useState(null);
  const [showBucketManager, setShowBucketManager] = useState(false);
  const [userData] = useState({
    id: initialUserId,
    username: initialUsername
  });

  const currentBucketIndex = buckets.findIndex(bucket => bucket.id === currentBucketId);
  const currentBucket = currentBucketIndex >= 0 ? buckets[currentBucketIndex] : buckets[0];
  const files = currentBucket?.files || sampleFiles;

  // 初始化用户ID
  useEffect(() => {
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', userData.id);
    }
  }, [userData.id]);

  // 处理登录
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setShowAuthModal(false);
  };

  // 处理注册
  const handleRegister = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setShowAuthModal(false);
  };

  // 处理文件上传
  const handleUpload = () => {
    const newFile = {
      id: Date.now(),
      name: '新文件.txt',
      type: 'text',
      size: '1 KB',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      content: '# 新文件\n\n欢迎使用云存储编辑功能！\n\n这是一个支持多人协同编辑的在线文档。\n\n## 功能特性\n\n✅ 实时多人协同编辑\n✅ 自动保存\n✅ 版本历史\n✅ 在线预览\n✅ 多格式支持\n\n> 开始协作吧！'
    };
    setBuckets(prev => {
      const idx = prev.findIndex(bucket => bucket.id === currentBucketId);
      const targetIndex = idx >= 0 ? idx : 0;
      const copy = [...prev];
      const bucket = { ...copy[targetIndex] };
      bucket.files = [newFile, ...(bucket.files || [])];
      bucket.usedGB = Math.max(0, (bucket.usedGB || 0) + 0.001); // 模拟占用
      copy[targetIndex] = bucket;
      return copy;
    });
    alert('新文件已创建！');
  };

  // 处理文件下载
  const handleDownload = (file, content) => {
    let mimeType = 'text/plain';
    let extension = '.txt';
    
    const typeMap = {
      pdf: { mime: 'application/pdf', ext: '.pdf' },
      text: { mime: 'text/plain', ext: '.txt' },
      code: { mime: 'text/plain', ext: '.txt' },
      markdown: { mime: 'text/markdown', ext: '.md' },
      word: { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: '.docx' },
      excel: { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: '.xlsx' },
      image: { mime: 'image/jpeg', ext: '.jpg' }
    };
    
    if (typeMap[file.type]) {
      mimeType = typeMap[file.type].mime;
      extension = typeMap[file.type].ext;
    }
    
    const blob = new Blob([content || '无内容'], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.[^/.]+$/, "") + extension;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    const fileToEdit = { ...file };
    if (!fileToEdit.content) {
      fileToEdit.content = getDefaultContent(file.type, file.name);
    }
    setEditingFile(fileToEdit);
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

  const handleCreateBucket = ({ name, capacityGB }) => {
    if (!name) {
      alert('请输入桶名称');
      return;
    }
    const newBucket = {
      id: `bucket-${Date.now()}`,
      name,
      capacityGB: Number(capacityGB) || 10,
      usedGB: 0,
      files: [],
      ownerId: userData.id,
      ownerName: userData.username,
      permissions: []
    };
    setBuckets(prev => [...prev, newBucket]);
    setCurrentBucketId(newBucket.id);
  };

  const handleDeleteBucket = (bucketId) => {
    const target = buckets.find(b => b.id === bucketId);
    if (!target) return;
    if (target.ownerId !== userData.id) {
      alert('只有创建者可以删除此桶');
      return;
    }
    if (buckets.length <= 1) {
      alert('至少需要保留一个桶');
      return;
    }
    setBuckets(prev => {
      const filtered = prev.filter(b => b.id !== bucketId);
      const nextId = currentBucketId === bucketId ? (filtered[0]?.id || null) : currentBucketId;
      setCurrentBucketId(nextId);
      return filtered;
    });
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

  // 获得测试数据
  const getDefaultContent = (type, name) => {
    const baseContent = {
      text: `# ${name}\n\n这是一个文本文件。\n您可以在这里输入任意文本内容。\n\n创建时间: ${new Date().toLocaleString()}\n\n开始编辑吧！`,
      code: `// ${name}\n// 这是一个代码文件\n\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, Cloud Storage!" << std::endl;\n    return 0;\n}`,
      markdown: `# ${name}\n\n## 欢迎使用云存储编辑功能！\n\n这是一个支持多人协同编辑的Markdown文档。\n\n### 功能特性\n\n- ✅ 实时多人协同编辑\n- ✅ 自动保存\n- ✅ 版本历史\n- ✅ 在线预览\n- ✅ Markdown支持\n\n> 提示：您和其他协作者可以同时编辑此文档\n\n\`\`\`javascript\n// 示例代码\nconsole.log("多人协同编辑演示");\`\`\``,
      pdf: 'PDF文件不支持在线编辑，请下载到本地查看。',
      word: 'Word文档内容（模拟）',
      excel: 'Excel表格内容（模拟）',
      psd: 'PSD文件不支持在线编辑',
      image: '图片文件不支持在线编辑',
      powerpoint: '演示文稿内容（模拟）'
    };

    return baseContent[type] || `# ${name}\n\n这是一个不支持在线编辑的文件。\n请下载到本地进行查看和编辑。`;
  };

  return (
    <CollaborationProvider>
      <div>
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
            />

            <FileSection
              isLoggedIn={isLoggedIn}
              files={files}
              onDownload={handleDownload}
              onEdit={handleEditFile}
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
            onSave={handleSaveFile}
            onDownload={(file, content) => handleDownload(file, content)}
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
      </div>
    </CollaborationProvider>
  );
}

export default App;