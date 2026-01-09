import React from 'react';
import '../css/ProgressBar.css';

/**
 * 进度条组件
 * @param {number} progress - 进度百分比 (0-100)
 * @param {string} status - 状态: 'uploading', 'downloading', 'completed', 'error'
 * @param {string} filename - 文件名
 * @param {function} onCancel - 取消操作的回调
 */
const ProgressBar = ({ progress = 0, status = 'uploading', filename = '', onCancel }) => {
  if (progress === 0 && status !== 'uploading' && status !== 'downloading') {
    return null;
  }

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return '上传中...';
      case 'downloading':
        return '下载中...';
      case 'completed':
        return '已完成';
      case 'error':
        return '失败';
      default:
        return '';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'uploading':
        return 'progress-uploading';
      case 'downloading':
        return 'progress-downloading';
      case 'completed':
        return 'progress-completed';
      case 'error':
        return 'progress-error';
      default:
        return '';
    }
  };

  return (
    <div className={`progress-container ${getStatusClass()}`}>
      <div className="progress-content">
        <div className="progress-info">
          <span className="progress-filename">{filename}</span>
          <span className="progress-status">{getStatusText()}</span>
        </div>
        <div className="progress-bar-wrapper">
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <span className="progress-percent">{Math.min(progress, 100)}%</span>
        </div>
      </div>
      {(status === 'uploading' || status === 'downloading') && onCancel && (
        <button className="progress-cancel-btn" onClick={onCancel}>
          ✕
        </button>
      )}
    </div>
  );
};

export default ProgressBar;
