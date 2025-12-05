import { fileIcons } from '../data/sampleData';

// 文件卡片组件
function FileCard({ file, onDownload }) {
  const getFileIcon = (fileType) => {
    return fileIcons[fileType] || fileIcons.default;
  };

  return (
    <div className="file-card" onClick={() => onDownload(file)}>
      <div className="file-icon">
        {getFileIcon(file.type)}
      </div>
      <h4>{file.name}</h4>
      <p>{file.size}</p>
      <p>{file.date}</p>
    </div>
  );
}

export default FileCard;