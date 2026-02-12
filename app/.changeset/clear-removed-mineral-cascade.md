---
"cm-reporting": patch
---

修复动态矿种模板在“取消申报范围金属”后的数据残留问题，确保申报范围、题目答案与列表数据保持一致。

- 当在 `dynamic-dropdown` 模式（EMRT 2.x / AMRT 1.3）取消某金属后，自动清空该金属在按金属题目与备注中的答案值。
- 当 `other` 仍勾选但某个自定义矿种名称被清空时，自动按槽位清理对应 `other-*` 的按金属题目与备注答案，避免残留失活矿种数据。
- 同步清空该金属在按金属公司题（含备注）中的答案值，避免隐藏的历史回答继续残留。
- 自动删除该金属在 `Smelter List` / `Mine List` 的历史行，避免继续保留已不在申报范围内的数据。
- 补充 `TemplateStore` 回归测试，覆盖 EMRT 2.1 与 AMRT 1.3 的取消矿种级联清理场景。
- 同步更新 `app/src/lib/README.md`、`app/src/examples/README.md` 与 `skills/cm-reporting-integration/SKILL.md` 的行为说明。
