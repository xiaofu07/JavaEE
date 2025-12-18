import { fileIcons } from '../data/sampleData';

// 文件卡片组件
function FileCard({ file, onDownload ,onEdit }) {
  const getFileIcon = (fileType) => {
    return fileIcons[fileType] || fileIcons.default;
  };

 const isEditable = ['text', 'code', 'markdown', 'pdf', 'word', 'excel'].includes(file.type);

  return (
    <div className="file-card">
      <div className="file-icon" onClick={() => onEdit(file)}>
        {getFileIcon(file.type)}
      </div>
      <h4>{file.name}</h4>
      <p className="file-size">{file.size}</p>
      <p className="file-date">{file.date}</p>
      <div className="file-actions">
        {isEditable ? (
          <button className="action-btn edit" onClick={() => onEdit(file)} title="编辑">
            ✏️
          </button>
        ) : null}
        <button className="action-btn download" onClick={() => onDownload(file)} title="下载">
          ⬇️
        </button>
      </div>
    </div>
  );
}

export default FileCard;