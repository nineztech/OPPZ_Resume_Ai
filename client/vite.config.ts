import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server:{
    port: 3000,
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://oppzresumeai-production.up.railway.app/api'),
    'import.meta.env.PYTHON_URL': JSON.stringify(process.env.PYTHON_URL || 'http://localhost:5000')
  }
})
