import { fileIcons } from '../data/sampleData';

// 文件卡片组件
function FileCard({ file, onEdit }) {
  const getFileIcon = (fileType) => {
    return fileIcons[fileType] || fileIcons.default;
  };

  return (
    <div className="file-card" onClick={() => onEdit(file)}>
      <div className="file-icon">
        {getFileIcon(file.type)}
      </div>
      <h4>{file.name}</h4>
      <p className="file-size">{file.size}</p>
      <p className="file-date">{file.date}</p>
    </div>
  );
}

export default FileCard;
