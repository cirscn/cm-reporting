import path from 'path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
  },
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
})
