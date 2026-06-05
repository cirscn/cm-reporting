---
"cm-reporting": patch
---

新增 `styles.scoped.css` 样式入口，用于将组件库样式限制在 `.cm-reporting-scope` 容器内，避免 Tailwind reset 和只读态覆盖规则影响宿主全站。
