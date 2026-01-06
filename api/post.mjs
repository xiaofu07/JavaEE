#!/bin/node

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const user = process.argv[2]
const bucket = process.argv[3]
const host = "lingshin"
const port = "8080"
const file = process.argv[4]
if (!file) {
  console.error("Usage: post [user] [bucket] [filename]")
  process.exit(1)
}

const absolutePath = path.resolve(file)

const fileName = path.basename(absolutePath)

const urlbase = `http://${host}:${port}`
const url = `${urlbase}/blob/${user}/${bucket}/${fileName}`

const fileBuffer = fs.readFileSync(absolutePath);

const checksum = crypto.createHash('md5').update(fileBuffer).digest('hex');
console.log(`Checksum: ${checksum}`);

const login_rsp = await fetch(`${urlbase}/login`, {
  method: 'POST',
  headers: {
      'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username:'lingshin',
    password:'emiya'
  }),
})

const cookie = login_rsp.headers.get('set-cookie')

const webStream = ReadableStream.from(fs.createReadStream(absolutePath))
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Cookie': cookie,
    'Upload-Hash': checksum,
    'Content-Type': 'application/justfile',
  },
  body: webStream,
  duplex: 'half'
})

const data = await response.json()

console.log(data)
