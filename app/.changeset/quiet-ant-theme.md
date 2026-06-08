---
"cm-reporting": patch
---

修复 CMReporting 默认覆盖宿主 Ant Design 主题的问题：未显式传入 `theme` 时改为继承宿主 `ConfigProvider`，显式传入主题时仍保持局部覆盖能力。
