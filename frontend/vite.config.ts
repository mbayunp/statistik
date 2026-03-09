import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-garut': {
        target: 'https://satudata-api.garutkab.go.id',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-garut/, '')
      }
    }
  }
})