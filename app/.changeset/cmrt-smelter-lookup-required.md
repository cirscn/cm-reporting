---
"cm-reporting": patch
---

修复带冶炼厂下拉的模板在 `Smelter List` 中“选了 metal 但没选冶炼厂”时未被 checker 判为未完成的问题。

- 补充 `CMRT` 场景回归测试，锁定缺失 `smelterLookup` 时必须报错的行为。
- 将 `smelterLookup` 必填校验从模板白名单改为基于模板配置判断，避免 `CMRT` 被漏掉。
- 同步更新对外文档、集成技能说明和 examples 行为说明，避免实现和文档脱节。
