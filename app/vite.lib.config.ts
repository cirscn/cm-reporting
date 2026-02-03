/**
 * @file vite.lib.config.ts
 * @description Vite 库模式构建配置。
 */

import path from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/lib/**/*'],
      outDir: 'dist',
      rollupTypes: true,
      tsconfigPath: './tsconfig.app.json',
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'templates/*',
          dest: 'templates',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@core': path.resolve(__dirname, './src/lib/core'),
      '@ui': path.resolve(__dirname, './src/lib/ui'),
      '@shell': path.resolve(__dirname, './src/lib/shell'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/lib/index.ts'),
      name: 'CMReporting',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      // 外部化依赖，不打包进库
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'antd',
        '@ant-design/icons',
        'i18next',
        'react-i18next',
      ],
      output: {
        // 为外部化的依赖提供全局变量名
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          antd: 'antd',
          '@ant-design/icons': 'AntDesignIcons',
          i18next: 'i18next',
          'react-i18next': 'reactI18next',
        },
        // 保留模块结构以支持 tree-shaking
        preserveModules: false,
        // CSS 输出
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'styles.css'
          return assetInfo.name || 'assets/[name][extname]'
        },
      },
    },
    // 生成 sourcemap
    sourcemap: true,
    // 清空输出目录
    emptyOutDir: true,
    // 输出目录
    outDir: 'dist',
    // CSS 代码分割
    cssCodeSplit: false,
  },
})
