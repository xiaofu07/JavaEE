/**
 * 分块上传服务
 * 参考 api/chunk.js 实现前端分块上传功能
 */

import SparkMD5 from 'spark-md5';
import { fileTypeFromBlob } from 'file-type';

const CHUNK_SIZE = 1024 * 1024; // 1MB

/**
 * 计算buffer的MD5哈希
 */
function md5(buffer) {
  return SparkMD5.ArrayBuffer.hash(buffer);
}

/**
 * 上传单个分块
 */
async function uploadChunk(buffer) {
  const checksum = md5(buffer);
  
  const response = await fetch('/part', {
    method: 'POST',
    headers: {
      'Upload-Hash': checksum,
    },
    credentials: 'include',
    body: buffer,
  });
  
  if (!response.ok) {
    throw new Error(`分块上传失败: ${response.status}`);
  }
  
  return checksum;
}

/**
 * 分块上传文件
 * @param {File} file - 要上传的文件
 * @param {string} username - 用户名
 * @param {string} bucket - 桶名称
 * @param {function} onProgress - 进度回调 (percent: number)
 * @returns {Promise<object>} - 服务器返回的manifest
 */
export async function uploadFile(file, username, bucket, onProgress = () => {}) {
  const size = file.size;
  const chunkNum = Math.ceil(size / CHUNK_SIZE);
  const checksumList = [];
  
  // 分块上传
  for (let i = 0; i < chunkNum; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, size);
    const chunk = file.slice(start, end);
    const buffer = await chunk.arrayBuffer();
    
    const checksum = await uploadChunk(buffer);
    checksumList.push(checksum);
    
    // 更新进度
    const percent = Math.round(((i + 1) / chunkNum) * 100);
    onProgress(percent);
  }
  
  // 使用 file-type 获取 MIME 类型
  const typeInfo = await fileTypeFromBlob(file);
  const contentType = typeInfo ? typeInfo.mime : 'application/octet-stream';
  
  // 发送manifest请求，合并分块
  const url = new URL(`/blob/${username}/${bucket}/${file.name}`, window.location.origin);
  url.searchParams.set('mimetype', contentType);
  
  const manifestResponse = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(checksumList),
  });
  
  if (!manifestResponse.ok) {
    throw new Error(`文件合并失败: ${manifestResponse.status}`);
  }
  
  const manifest = await manifestResponse.json();
  return manifest;
}

export default { uploadFile };
