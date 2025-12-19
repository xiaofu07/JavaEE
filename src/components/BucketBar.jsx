import React from 'react';

function BucketBar({ name, capacityGB, usedGB, onClick }) {
  const percent = Math.min(100, Math.round((usedGB / capacityGB) * 100));
  return (
    <div className="storage-info" onClick={onClick} style={{cursor: 'pointer'}} title={`${name}：点击切换`}>
      <p>{name}（{usedGB} GB / {capacityGB} GB）</p>
      <div className="storage-bar">
        <div className="storage-progress" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

export default BucketBar;
