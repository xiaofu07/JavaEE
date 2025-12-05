import '../css/Sidebar.css'

// 侧边栏组件
function Sidebar({ isLoggedIn, onUpload, onBackup, onRestore }) {
  return (
    <aside className="sidebar">
      {isLoggedIn ? (
        <>
          <div className="user-info">
            <div className="user-avatar">U</div>
            <div>
              <h3>张三</h3>
            </div>
          </div>
          
          <div className="storage-info">
            <p>存储空间使用情况</p>
            <div className="storage-bar">
              <div className="storage-progress"></div>
            </div>
            <p>6.5 GB / 10 GB</p>
          </div>
          
          <div className="action-buttons">
            <button className="action-btn" onClick={onUpload}>
              <span role="img" aria-label="upload">📤</span> 上传文件
            </button>
            <button className="action-btn" onClick={onBackup}>
              <span role="img" aria-label="backup">💾</span> 备份文件
            </button>
            <button className="action-btn" onClick={onRestore}>
              <span role="img" aria-label="restore">🔄</span> 恢复备份
            </button>
          </div>
        </>
      ) : (
        <div style={{textAlign: 'center', padding: '20px 0'}}>
          <p>请登录以使用完整服务</p>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;