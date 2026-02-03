import path from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@core': path.resolve(__dirname, './src/lib/core'),
      '@ui': path.resolve(__dirname, './src/lib/ui'),
      '@shell': path.resolve(__dirname, './src/lib/shell'),
      '@demo': path.resolve(__dirname, './src/demo'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'i18n'
          }
          if (id.includes('node_modules/@ant-design/icons') || id.includes('node_modules/antd')) {
            return 'antd'
          }
        },
      },
    },
  },
})
