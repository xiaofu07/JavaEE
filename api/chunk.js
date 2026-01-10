#!/usr/bin/node

import { fileTypeFromFile } from 'file-type';
import fs from "node:fs/promises"
import { statSync } from "node:fs"
import login from "./login.js"
import crypto from "node:crypto"
import path from 'node:path'
import { parseArgs } from "node:util"

const options = {
  allowPositionals: true,
  options: {
    host: {type: 'string', short: 'h'},
    port: {type: 'string', short: 'p'},
    user: {type: 'string', short : 'u'},
    bucket: {type: 'string', short : 'b'},
    file: {type: 'string', short : 'f'}
  },
}

const solve = ({ values, positionals }) => ({
  host: values.host || "gungnir",
  port: values.port || "8080",
  user: values.user || "lingshin",
  password: values.password || "emiya",
  bucket: values.bucket || "firefox",
  _file: values.file,
  path: positionals[0],

  get file(){
    return this._file || path.basename(this.path)
  },

  get base(){
    return `http://${this.host}:${this.port}`
  },

  get url(){
    return `${this.base}/blob/${this.user}/${this.bucket}/${this.file}`
  }
})


const option = solve(parseArgs(options))

const login_response = await login(option)

const cookie = login_response.headers.get('set-cookie')

if (option.file === null) {
  console.error("give me file")
  process.exit(1)
}

const chunk_size = 1024 * 1024 // 1MB

const { size } = statSync(option.path)

const chunk_num = Math.ceil(size / chunk_size)

const md5 = buffer => crypto.createHash("md5").update(buffer).digest('hex')

async function upload(handle, start, length) {
  const { buffer }= await handle.read(Buffer.alloc(length), 0, length, start)
  const checksum = md5(buffer)
  await fetch(`${option.base}/part`, {
    method: 'POST',
    headers: {
      'Cookie': cookie,
      'Upload-Hash': checksum,
    },
    body: buffer,
    duplex: 'half'
  })
  return checksum
}

const handle = await fs.open(option.path, 'r')

const tasks = Array.from({length: chunk_num}, (_, index) => {
  const start = index * chunk_size
  const end = Math.min(start + chunk_size, size)
  const length = end - start
  return upload(handle, start, length)
})

const checksum_list = await Promise.all(tasks)

const typeInfo = await fileTypeFromFile(option.path);
const contentType = typeInfo ? typeInfo.mime : 'text/plain';

const url = new URL(option.url)
url.searchParams.set('mimetype', contentType)

const manifest_raw = await fetch(url.toString(), {
  method: 'POST',
  headers: {
    'Cookie': cookie,
    'Content-Type': "application/json"
  },
  body: JSON.stringify(checksum_list),
})

const manifest = await manifest_raw.json()

console.log(manifest)
