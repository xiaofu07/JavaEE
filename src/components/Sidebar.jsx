import '../css/Sidebar.css'
import BucketBar from './BucketBar'

// 侧边栏组件
function Sidebar({ isLoggedIn, onUpload, onBackup, onRestore, bucket, onOpenBucketManager }) {
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
          
          <BucketBar
            name={bucket?.name || '存储空间'}
            capacityGB={bucket?.capacityGB || 10}
            usedGB={bucket?.usedGB || 0}
            onClick={onOpenBucketManager}
          />
          
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