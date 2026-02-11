---
"cm-reporting": minor
---

调整 SmelterList 的外部选择交互为“仅行内模式”：

- 移除冶炼厂列表顶部“从外部选择”批量入口，仅保留“新增一行”。
- 用户需先新增一行并选择 `metal`，再在该行触发行内外部选择。
- 同步收敛公开集成接口：删除 `SmelterListIntegration.onPickSmelters`、`addMode`、`label` 相关能力。
- 更新 `app/src/lib/README.md`、`app/src/examples/README.md` 与集成技能文档说明。

