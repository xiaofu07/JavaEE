import { useState } from 'react';
import './css/App.css';
import AuthModal from './components/AuthModal';
import FileSection from './components/FileSection';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { sampleFiles } from './data/sampleData';

// 主应用组件
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [files] = useState(sampleFiles);
  const [selectedFile, setSelectedFile] = useState(null);

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
    alert('上传功能已触发！在实际应用中，这里会打开文件选择器。');
  };

  // 处理文件下载
  const handleDownload = (file) => {
    setSelectedFile(file);
    alert(`开始下载: ${file.name}`);
  };

  // 处理备份
  const handleBackup = () => {
    alert('备份功能已触发！正在备份您的文件...');
  };

   // 处理备份
  const handleRestore = () => {
    alert('恢复备份功能已触发！正在恢复您的文件...');
  };

  if(showAuthModal)
  {
    return (
    <div>
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setShowAuthModal={setShowAuthModal}
      />

      <div className="container">
        <div className="main-content">
            <AuthModal
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onClose={() => setShowAuthModal(false)}
            />
        </div>
      </div>


    </div>
  );
  }
  return (
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
            onRestore={handleRestore}
          />

          <FileSection
            isLoggedIn={isLoggedIn}
            files={files}
            onDownload={handleDownload}
          />
      
        </div>
      </div>


    </div>
  );
}

export default App;