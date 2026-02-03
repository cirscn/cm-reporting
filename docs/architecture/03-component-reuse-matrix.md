# 组件复用矩阵与差异策略

## 复用矩阵（高层）
| 组件 | CMRT | EMRT | CRT | AMRT | 差异策略 |
| --- | --- | --- | --- | --- | --- |
| CompanyInfoForm | ✅ | ✅ | ✅ | ✅ | 字段清单/必填由 registry 控制 |
| MineralScopeSelector | ✅ | ✅ | ❌ | ✅ | EMRT/AMRT 有版本差异；CMRT 固定 4 | 
| QuestionMatrix | ✅ | ✅ | ✅ | ✅ | 题干/选项/触发规则按版本配置 |
| CompanyQuestions | ✅ | ✅ | ✅ | ❌ | CRT 题数不同；AMRT 无此模块 |
| SmelterListTable | ✅ | ✅ | ✅ | ✅ | 列差异与 DV 来源由 registry 控制 |
| MineListTable | ❌ | ✅ | ❌ | ✅ | EMRT/AMRT 2.0+/1.3+ 才有 |
| ProductListTable | ✅ | ✅ | ✅ | ✅ | 触发条件与列差异由 registry 控制 |
| CheckerPanel | ✅ | ✅ | ✅ | ✅ | 规则集与错误码来自 registry |
| ProgressHeader | ✅ | ✅ | ✅ | ✅ | 进度规则与提示由 registry 控制 |
| VersionSelector | ✅ | ✅ | ✅ | ✅ | 统一入口，变更 registry key |

## 差异处理原则
- **结构差异**：通过页面编排开关（例如 MineList 是否存在）
- **字段差异**：通过字段配置驱动（name/label/required/options）
- **规则差异**：通过 rule definition（gating/required/checker）
- **文案差异**：通过 i18n/labels 配置，不内嵌在组件

## 组件内可配置项（示例）
- 表格列：columns schema + per-template overrides
- 选项列表：DV source/values 显式配置
- 必填规则：从 rule engine 输出 required map
- 错误定位：从 validation result 提供定位锚点
