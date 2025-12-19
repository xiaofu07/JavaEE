// 模拟数据
export const sampleFiles = [
  { id: 1, name: '项目文档.pdf', type: 'pdf', size: '2.4 MB', date: '2023-05-15' },
  { id: 2, name: '设计稿.psd', type: 'psd', size: '15.7 MB', date: '2023-05-10' },
  { id: 3, name: '财务报表.xlsx', type: 'excel', size: '1.2 MB', date: '2023-05-12' },
  { id: 4, name: '演示文稿.pptx', type: 'powerpoint', size: '8.5 MB', date: '2023-05-08' },
  { id: 5, name: '产品图片.jpg', type: 'image', size: '4.3 MB', date: '2023-05-05' },
  { id: 6, name: '项目计划.docx', type: 'word', size: '3.1 MB', date: '2023-05-03' }
];

// 桶（Bucket）示例数据
export const sampleBuckets = [
  {
    id: 'bucket-1',
    name: '个人空间',
    capacityGB: 10,
    usedGB: 6.5,
    files: [
      { id: 1, name: '项目文档.pdf', type: 'pdf', size: '2.4 MB', date: '2023-05-15' },
      { id: 3, name: '财务报表.xlsx', type: 'excel', size: '1.2 MB', date: '2023-05-12' },
      { id: 6, name: '项目计划.docx', type: 'word', size: '3.1 MB', date: '2023-05-03' }
    ]
  },
  {
    id: 'bucket-2',
    name: '团队空间',
    capacityGB: 20,
    usedGB: 12.3,
    files: [
      { id: 2, name: '设计稿.psd', type: 'psd', size: '15.7 MB', date: '2023-05-10' },
      { id: 4, name: '演示文稿.pptx', type: 'powerpoint', size: '8.5 MB', date: '2023-05-08' },
      { id: 5, name: '产品图片.jpg', type: 'image', size: '4.3 MB', date: '2023-05-05' }
    ]
  },
  {
    id: 'bucket-3',
    name: '归档空间',
    capacityGB: 50,
    usedGB: 21.7,
    files: []
  }
];

// 文件类型图标映射
export const fileIcons = {
      pdf: '📄',
      psd: '🎨',
      excel: '📊',
      powerpoint: '📽️',
      image: '🖼️',
      word: '📝',
      text: '📃',
      code: '💻',
      markdown: '📋',
      default: '📁'
};