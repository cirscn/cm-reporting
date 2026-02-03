# AMRT 1.1 Consolidation Implementation Plan

> **内部计划文档（非产品交付）**  
> 状态：已完成（2026-01-22）

## Goal
将 AMRT 1.1 纳入 AMRT 版本序列（1.1–1.3），统一模板与文档口径，移除旧名称的独立入口。

## Completed Summary
- 模板：`app/templates/AMRT/RMI_AMRT_1.1.xlsx` 已就位，旧目录已移除
- 差异/验收：`docs/diffs/amrt-1.1.md`、`docs/diffs/acceptance/amrt-1.1.md`、`docs/diffs/acceptance/cases/amrt-1.1.csv` 已统一
- 矩阵/PRD/词典/定义：均以 AMRT 1.1–1.3 口径收敛

## Validation
- 确认 docs 中不存在旧名称标记  
- `rg --files app/templates/PRT` → 无输出
