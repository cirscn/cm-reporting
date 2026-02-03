# 系统/隐藏列差异矩阵（按模板 × 版本）

> 说明：此处列的是 **Excel 模板中存在但通常不直接展示的系统/隐藏列**（多为自动填充或用于校验/导出对齐）。  
> 口径来源：本地模板头行解析（`app/templates`）。

## 1. Smelter List 系统/隐藏列
| 模板 | 版本 | 系统/隐藏列 | 备注 |
|---|---|---|---|
| CMRT | 6.01–6.5 | Standard Smelter Name / Country Code / State / Province Code / Smelter not yet identified / Smelter Not Listed / Unknown | 全版本一致 |
| EMRT | 1.1–2.0 | Standard Smelter Name / Country Code / State / Province Code / Smelter not yet identified / Smelter Not Listed / Unknown | 2.0 仍无 Combined 列 |
| EMRT | 2.1 | Standard Smelter Name / Country Code / State / Province Code / Smelter not yet identified / Smelter Not Listed / Unknown / **Combined Metal / Combined Smelter** | 2.1 新增 Combined 列 |
| CRT | 2.2–2.21 | Standard Smelter Name / Country Code / State / Province Code / Smelter not yet identified / Smelter Not Listed / Unknown | 2.2/2.21 一致 |
| AMRT | 1.2 | Standard Smelter Name (Not in use) / Country Code / State / Province Code / Missing Entry Check / Smelter Counter / **未知** | 1.2 无 Look‑up |
| AMRT | 1.1 | Standard Smelter Name (Not in use) / Country Code / State / Province Code / Missing Entry Check / Smelter Counter / **未知** | 无 Look‑up |
| AMRT | 1.3 | Standard Smelter Name / Country Code / State / Province Code / Missing Entry Check / Smelter Counter / Smelter not yet identified / Smelter Not Listed / **Combined Metal / Combined Smelter** | 1.3 新增 Look‑up 与 Combined 列 |

## 2. Mine List 系统/隐藏列
| 模板 | 版本 | 系统/隐藏列 | 备注 |
|---|---|---|---|
| EMRT | 2.0–2.1 | Country Code / Missing Entry Check / Smelter Counter | 2.0 起新增 Mine List（State / Province Code 为手动列） |
| AMRT | 1.2–1.3 | Country Code / State / Province Code / Missing Entry Check / Smelter Counter | 1.2/1.3 一致 |
| AMRT | 1.1 | Country Code / State / Province Code / Missing Entry Check / Smelter Counter |  |

## 3. 产品实现建议
- 上述列建议默认隐藏/只读，仅用于 **Excel 导出结构对齐** 与 **校验辅助**。  
- 若 UI 展示系统列，会显著降低可读性，建议仅在“导出设置/高级模式”下可见。
