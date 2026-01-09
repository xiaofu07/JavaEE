const crypto = require('crypto');
const fs = require('fs');
const fileBuffer = fs.readFileSync('./sql/babylon.sql'); 
const checksum = crypto.createHash('md5').update(fileBuffer).digest('hex');
client.global.set('hash', checksum);
console.log(`文件校验和为 ${client.global.get('hash')}`);
