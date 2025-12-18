import { useState, useEffect } from 'react';
import './css/App.css';
import AuthModal from './components/AuthModal';
import FileSection from './components/FileSection';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FileEditor from './components/FileEditor';
import { CollaborationProvider } from './contexts/CollaborationContext';
import { sampleFiles } from './data/sampleData';

// 主应用组件
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [files, setFiles] = useState(sampleFiles);
  const [editingFile, setEditingFile] = useState(null);
  const [userData] = useState({
    id: localStorage.getItem('userId') || `user_${Date.now()}`,
    username: '当前用户'
  });

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
      id: files.length + 1,
      name: '新文件.txt',
      type: 'text',
      size: '1 KB',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      content: '# 新文件\n\n欢迎使用云存储编辑功能！\n\n这是一个支持多人协同编辑的在线文档。\n\n## 功能特性\n\n✅ 实时多人协同编辑\n✅ 自动保存\n✅ 版本历史\n✅ 在线预览\n✅ 多格式支持\n\n> 开始协作吧！'
    };
    setFiles([newFile, ...files]);
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
    const backupData = JSON.stringify(files, null, 2);
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
    setFiles(files.map(file =>
      file.id === fileId
        ? {
          ...file,
          content: newContent,
          date: new Date().toISOString().split('T')[0],
          lastModified: new Date().toLocaleString()
        }
        : file
    ));
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
            />

            <FileSection
              isLoggedIn={isLoggedIn}
              files={files}
              onDownload={handleDownload}
              onEdit={handleEditFile}
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
      </div>
    </CollaborationProvider>
  );
}

export default App;