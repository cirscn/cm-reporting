# PRD 图表资源

本目录包含冲突矿产模板系统 PRD 的所有导出图片（PNG 格式）。

## 图片清单

### 架构与流程图

| 文件名 | 说明 | 类型 |
|--------|------|------|
| 01-architecture.png | 系统架构图 - 四模板关系概览 | 架构图 |
| 02-user-flow.png | 用户填写主流程 | 流程图 |
| 03-cmrt-flow.png | CMRT 详细填写流程 | 流程图 |
| 04-smelter-flow.png | Smelter List 填写流程 | 流程图 |
| 05-validation.png | 校验规则优先级图 | 架构图 |
| 06-cmrt-er.png | CMRT 数据模型 ER 图 | ER图 |
| 07-emrt-flow.png | EMRT 详细填写流程（含 Mine List） | 流程图 |
| 08-amrt-minerals.png | AMRT 矿种选择流程 | 流程图 |
| 09-template-structure.png | 四模板页面结构对比 | 架构图 |

### 产品原型图

| 文件名 | 说明 | 类型 |
|--------|------|------|
| 10-declaration-ui.png | Declaration 页面结构原型 | 原型图 |
| 11-smelter-ui.png | Smelter List 表格原型 | 原型图 |
| 12-checker-ui.png | Checker 校验结果原型 | 原型图 |

## 源文件

Mermaid 源文件存放于 `mmd/` 子目录，如需修改可编辑后重新导出：

```bash
# 使用 mermaid-cli 重新导出
npx @mermaid-js/mermaid-cli -i mmd/01-architecture.mmd -o 01-architecture.png -b white
```

## 在文档中使用

Markdown 引用示例：

```markdown
![系统架构图](./assets/01-architecture.png)
```

或使用 HTML 控制尺寸：

```html
<img src="./assets/01-architecture.png" width="600" alt="系统架构图" />
```

## 交互原型

更详细的交互原型可在 Pencil 编辑器中查看 `.pen` 文件（如有）。

## 更新记录

| 日期 | 说明 |
|------|------|
| 2026-01-26 | 初始生成 12 张 PNG 图片 |
