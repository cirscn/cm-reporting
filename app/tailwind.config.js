export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 品牌主色（与 App.tsx antd 主题保持一致）
        primary: {
          DEFAULT: '#1565c0',
          dark: '#0d47a1',
          light: '#1976d2',
          bg: '#e3f2fd',
          border: '#90caf9',
        },
      },
    },
  },
  plugins: [],
}
