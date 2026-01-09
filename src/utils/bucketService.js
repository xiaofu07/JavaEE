/**
 * Bucket API 服务
 */

// 获取所有桶
export async function getAllBuckets() {
  const res = await fetch('/buckets', { credentials: 'include' });
  console.log(res)
  if (!res.ok) throw new Error('获取桶列表失败');
  const body = await res.json();
  if (body.code !== 200) throw new Error(body.msg || '获取桶列表失败');
  return body.data;
}

// 获取单个桶
export async function getBucket(id) {
  const res = await fetch(`/buckets/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('获取桶失败');
  const body = await res.json();
  if (body.code !== 200) throw new Error(body.msg || '获取桶失败');
  return body.data;
}

// 创建桶
export async function createBucket(name, description = '') {
  const res = await fetch('/buckets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error('创建桶失败');
  const body = await res.json();
  if (body.code !== 200 && body.code !== 201) throw new Error(body.msg || '创建桶失败');
  return body.data;
}

// 删除桶
export async function deleteBucket(id) {
  const res = await fetch(`/buckets/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('删除桶失败');
  const body = await res.json();
  if (body.code !== 200) throw new Error(body.msg || '删除桶失败');
  return body.data;
}

// 获取桶内所有文件
export async function getBucketFiles(username, bucketName) {
  const res = await fetch(`/blob/${username}/${bucketName}`, { credentials: 'include' });
  if (!res.ok) throw new Error('获取文件列表失败');
  const body = await res.json();
  if (body.code !== 200) throw new Error(body.msg || '获取文件列表失败');
  return body.data;
}

export default { getAllBuckets, getBucket, createBucket, deleteBucket, getBucketFiles };
