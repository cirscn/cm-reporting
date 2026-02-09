---
'cm-reporting': minor
---

支持公司信息完成日期（authorizationDate）在运行时兼容时间戳输入（秒级/毫秒级，含数字字符串），并自动归一化为 YYYY-MM-DD。

- Snapshot 导入（parseSnapshot）支持该兼容行为。
- setSnapshot / initialSnapshot 回填链路通过 setFormData 统一归一化。
- 非法日期输入保持现有校验报错，不做静默修正。
- 同步更新对外文档与集成说明。
