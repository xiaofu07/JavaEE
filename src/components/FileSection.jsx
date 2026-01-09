
import FileCard from './FileCard';

// 文件区组件
function FileSection({ isLoggedIn, files, onEdit, bucketName }) {
  return (
    <section className="file-section">
      <div className="section-header">
        <h2>{bucketName ? bucketName : '我的文件'}</h2>
        <div className="search-box">
          <span>🔍</span>
          <input type="text" placeholder="搜索文件..." />
        </div>
      </div>
      
      {isLoggedIn ? (
        <div className="file-grid">
          {files.map(file => (
            <FileCard 
              key={file.id} 
              file={file} 
              onEdit={onEdit}
            />
          ))}
        </div>
      ) : (
        <div style={{textAlign: 'center', padding: '40px 0'}}>
          <h3>请登录查看您的文件</h3>
          <p>登录后您可以上传、下载和管理您的文件</p>
        </div>
      )}
    </section>
  );
}

export default FileSection;
