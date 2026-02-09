---
"cm-reporting": patch
---

构建流程新增 CSS 去层化后处理：发布前自动展开 `@layer`，确保 `styles.css` 为可直接消费的纯 CSS 产物，避免宿主项目（含 Tailwind v3）因层指令二次处理导致构建报错。

同时在文档中补充样式消费契约说明：宿主无需（也不应）对该文件再次执行 Tailwind 编译。
