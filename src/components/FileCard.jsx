import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { FileIcon } from '@untitledui/file-icons';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// mimeType 到图标类型的映射
const mimeToIconType = {
  // 文档
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  // 压缩包
  'application/zip': 'zip',
  'application/x-rar-compressed': 'rar',
  'application/x-7z-compressed': 'zip',
  'application/x-tar': 'zip',
  'application/gzip': 'zip',
  // 代码/文本
  'application/json': 'json',
  'application/xml': 'xml',
  'application/javascript': 'js',
  'application/java': 'java',
  'application/sql': 'sql',
  'text/plain': 'txt',
  'text/html': 'html',
  'text/css': 'css',
  'text/csv': 'csv',
  'text/xml': 'xml',
  // 图片
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
  'image/tiff': 'tiff',
  // 音频
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/mp3': 'mp3',
  // 视频
  'video/mp4': 'mp4',
  'video/webm': 'video',
  'video/quicktime': 'video',
  'video/x-msvideo': 'avi',
  'video/x-matroska': 'mkv',
  'video/mpeg': 'mpeg',
  // 设计
  'application/postscript': 'ai',
  'image/vnd.adobe.photoshop': 'psd',
  // 可执行
  'application/x-msdownload': 'exe',
  'application/x-apple-diskimage': 'dmg',
};

// 从文件名获取图标类型
const getIconTypeFromFileName = (fileName) => {
  if (!fileName) return null;
  const parts = fileName.split('.');
  if (parts.length <= 1) return null;
  const ext = parts.pop().toLowerCase();
  
  const extMap = {
    pdf: 'pdf', doc: 'doc', docx: 'docx', xls: 'xls', xlsx: 'xlsx',
    ppt: 'ppt', pptx: 'pptx', zip: 'zip', rar: 'rar', '7z': 'zip',
    tar: 'zip', gz: 'zip', json: 'json', xml: 'xml', js: 'js',
    java: 'java', sql: 'sql', txt: 'txt', html: 'html', css: 'css',
    csv: 'csv', jpg: 'jpg', jpeg: 'jpg', png: 'png', gif: 'gif',
    svg: 'svg', webp: 'webp', tiff: 'tiff', mp3: 'mp3', wav: 'wav',
    mp4: 'mp4', avi: 'avi', mkv: 'mkv', mpeg: 'mpeg', mov: 'video',
    webm: 'video', ai: 'ai', psd: 'psd', eps: 'eps', indd: 'indd',
    fig: 'fig', exe: 'exe', dmg: 'dmg', aep: 'aep',
  };
  return extMap[ext] || null;
};

// 从 mimeType 获取通用图标类型
const getFallbackIconType = (mimeType) => {
  if (!mimeType) return 'document';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('text/')) return 'code';
  return 'document';
};

const getIconType = (mimeType, fileName) => {
  return mimeToIconType[mimeType] || getIconTypeFromFileName(fileName) || getFallbackIconType(mimeType);
};

// 文件卡片组件
function FileCard({ file, onEdit, onDownload }) {
  const iconType = getIconType(file.mimeType, file.name);

  return (
    <div className="file-card" onClick={() => onEdit(file)}>
      <div className="file-icon">
        <FileIcon type={iconType} size={48} />
      </div>
      <h4>{file.name}</h4>
      <p className="file-date">{dayjs(file.current.time).fromNow()}</p>
    </div>
  );
}

export default FileCard;
