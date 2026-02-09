---
"cm-reporting": patch
---

新增 `readOnly` 全局只读参数：支持在 `CMReporting` / `CMReportingApp` 层启用只读模式，统一禁用页面内编辑控件，并在 store action 层增加用户编辑写入拦截，避免绕过 UI 直接修改数据。

同步更新接入文档、示例场景与集成 skill 参考文档，补充只读模式使用说明与排障指引。
