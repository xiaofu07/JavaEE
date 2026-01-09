import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const host = 'http://gungnir:8080'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/login': host,
      '/register': host,
      '/user': host,
      '/blob': host,
      '/part': host,
      '/buckets': host
    }
  }
})
