import { useState, useEffect } from 'react';
import '../css/App.css';
import { getAllUsers, getUserBuckets } from '../utils/bucketService';

function BucketManager({
  open,
  onClose,
  buckets = [],
  currentBucketId,
  onSelectBucket,
  onCreateBucket,
  onDeleteBucket,
  onAddPermission,
  onRemovePermission,
  currentUserId,
  currentUsername,
  onSelectOtherBucket
}) {
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketCapacity, setNewBucketCapacity] = useState(10);
  const [permUserId, setPermUserId] = useState('');
  const [permUsername, setPermUsername] = useState('');
  const [permRole, setPermRole] = useState('read');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [otherBuckets, setOtherBuckets] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingBuckets, setLoadingBuckets] = useState(false);

  const currentBucket = buckets.find(b => b.id === currentBucketId) || buckets[0];
  const isOwner = currentBucket && currentBucket.ownerId === currentUserId;

  // 加载用户列表
  useEffect(() => {
    if (open) {
      setLoadingUsers(true);
      getAllUsers()
        .then(data => {
          // 过滤掉当前用户
          setUsers(data.filter(u => u.id !== currentUserId));
        })
        .catch(err => console.error('获取用户列表失败:', err))
        .finally(() => setLoadingUsers(false));
    }
  }, [open, currentUserId]);

  // 当选择其他用户时，加载其桶列表
  useEffect(() => {
    if (selectedUser) {
      setLoadingBuckets(true);
      getUserBuckets(selectedUser.name)
        .then(data => setOtherBuckets(data || []))
        .catch(err => {
          console.error('获取用户桶列表失败:', err);
          setOtherBuckets([]);
        })
        .finally(() => setLoadingBuckets(false));
    } else {
      setOtherBuckets([]);
    }
  }, [selectedUser]);

  if (!open) return null;

  const handleCreateBucketSubmit = (e) => {
    e.preventDefault();
    onCreateBucket({ name: newBucketName.trim(), capacityGB: newBucketCapacity });
    setNewBucketName('');
    setNewBucketCapacity(10);
  };

  const handleAddPermissionSubmit = (e) => {
    e.preventDefault();
    if (!currentBucket) return;
    if (!permUserId.trim() || !permUsername.trim()) return;
    onAddPermission(currentBucket.id, { userId: permUserId.trim(), username: permUsername.trim(), role: permRole });
    setPermUserId('');
    setPermUsername('');
    setPermRole('read');
  };

  const handleSelectOtherBucket = (bucket) => {
    if (onSelectOtherBucket) {
      onSelectOtherBucket(selectedUser, bucket);
      onClose();
    }
  };

  return (
    <div className="bucket-manager-modal">
      <div className="bucket-manager">
        <div className="bm-header">
          <h2>桶管理</h2>
          <button className="bm-close" onClick={onClose}>×</button>
        </div>

        <div className="bm-body">
          <div className="bm-column">
            <div className="bm-section-title">桶列表</div>
            <div className="bm-bucket-list">
              {buckets.map(item => (
                <div
                  key={item.id}
                  className={`bm-bucket-item ${item.id === currentBucketId ? 'active' : ''}`}
                  onClick={() => onSelectBucket(item.id)}
                >
                  <div className="bm-bucket-name">{item.name}</div>
                  <div className="bm-bucket-meta">{item.usedGB} / {item.capacityGB} GB</div>
                  {item.ownerId === currentUserId && (
                    <button className="bm-delete" onClick={(e) => { e.stopPropagation(); onDeleteBucket(item.id); }}>删除</button>
                  )}
                </div>
              ))}
              {buckets.length === 0 && <div className="bm-empty">暂无桶</div>}
            </div>

            <form className="bm-form" onSubmit={handleCreateBucketSubmit}>
              <div className="bm-section-title">创建桶</div>
              <input
                type="text"
                value={newBucketName}
                onChange={(e) => setNewBucketName(e.target.value)}
                placeholder="新桶名称"
              />
              <input
                type="number"
                value={newBucketCapacity}
                min="1"
                onChange={(e) => setNewBucketCapacity(e.target.value)}
                placeholder="容量(GB)"
              />
              <button type="submit" className="bm-btn">创建桶</button>
            </form>
          </div>

          <div className="bm-column">
            <div className="bm-section-title">权限管理</div>
            {currentBucket ? (
              <>
                <div className="bm-current">当前桶：{currentBucket.name}</div>
                {isOwner ? (
                  <>
                    <ul className="bm-permission-list">
                      {(currentBucket.permissions || []).map(p => (
                        <li key={p.userId} className="bm-permission-item">
                          <span>{p.username} ({p.role})</span>
                          <button className="bm-delete" onClick={() => onRemovePermission(currentBucket.id, p.userId)}>移除</button>
                        </li>
                      ))}
                      {(!currentBucket.permissions || currentBucket.permissions.length === 0) && <li className="bm-permission-item">暂无权限成员</li>}
                    </ul>

                    <form className="bm-form" onSubmit={handleAddPermissionSubmit}>
                      <input
                        type="text"
                        value={permUserId}
                        onChange={(e) => setPermUserId(e.target.value)}
                        placeholder="用户ID"
                      />
                      <input
                        type="text"
                        value={permUsername}
                        onChange={(e) => setPermUsername(e.target.value)}
                        placeholder="用户名"
                      />
                      <select value={permRole} onChange={(e) => setPermRole(e.target.value)}>
                        <option value="read">只读</option>
                        <option value="write">读写</option>
                      </select>
                      <button type="submit" className="bm-btn">添加权限</button>
                    </form>
                  </>
                ) : (
                  <div className="bm-note">只有创建者可以管理权限</div>
                )}
              </>
            ) : (
              <div className="bm-note">请选择一个桶</div>
            )}
          </div>

          <div className="bm-column">
            <div className="bm-section-title">浏览其他用户</div>
            {loadingUsers ? (
              <div className="bm-note">加载中...</div>
            ) : (
              <>
                <div className="bm-user-list">
                  {users.map(user => (
                    <div
                      key={user.id}
                      className={`bm-user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      {user.avatar ? (
                        <img src={`/${user.avatar}`} alt={user.name} className="bm-user-avatar" />
                      ) : (
                        <div className="bm-user-avatar-placeholder">{user.name.charAt(0).toUpperCase()}</div>
                      )}
                      <span className="bm-user-name">{user.name}</span>
                    </div>
                  ))}
                  {users.length === 0 && <div className="bm-empty">暂无其他用户</div>}
                </div>

                {selectedUser && (
                  <div className="bm-other-buckets">
                    <div className="bm-section-title">{selectedUser.name} 的桶</div>
                    {loadingBuckets ? (
                      <div className="bm-note">加载中...</div>
                    ) : (
                      <div className="bm-bucket-list">
                        {otherBuckets.map(bucket => (
                          <div
                            key={bucket.id}
                            className="bm-bucket-item"
                            onClick={() => handleSelectOtherBucket(bucket)}
                          >
                            <div className="bm-bucket-name">{bucket.name}</div>
                            <div className="bm-bucket-meta">{bucket.description || '无描述'}</div>
                          </div>
                        ))}
                        {otherBuckets.length === 0 && <div className="bm-empty">该用户暂无公开桶</div>}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BucketManager;
