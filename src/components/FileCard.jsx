import { fileIcons } from '../data/sampleData';

// 文件卡片组件
function FileCard({ file, onEdit, onDownload }) {
  const getFileIcon = (fileType) => {
    return fileIcons[fileType] || fileIcons.default;
  };

  const handleDownloadClick = (e) => {
    e.stopPropagation();
    onDownload?.(file);
  };

  return (
    <div className="file-card" onClick={() => onEdit(file)}>
      <div className="file-icon">
        {getFileIcon(file.type)}
      </div>
      <h4>{file.name}</h4>
      <p className="file-size">{file.size}</p>
      <p className="file-date">{file.date}</p>
      {onDownload && (
        <button 
          className="file-download-btn" 
          onClick={handleDownloadClick}
          title="下载文件"
        >
          ⬇️
        </button>
      )}
    </div>
  );
}

export default FileCard;
