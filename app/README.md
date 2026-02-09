# cm-reporting

[![npm version](https://img.shields.io/npm/v/cm-reporting.svg)](https://www.npmjs.com/package/cm-reporting)
[![License: PolyForm Noncommercial](https://img.shields.io/badge/License-PolyForm%20Noncommercial%201.0.0-orange.svg)](https://github.com/cirscn/cm-reporting/blob/main/LICENSE)

基于 React + Ant Design 的冲突矿产报告（RMI 模板）开箱即用嵌入式组件库。

- CMRT / EMRT / CRT / AMRT 全模板、全版本覆盖
- 中英文国际化
- JSON Snapshot 导入/导出
- Excel 导出（基于 RMI 原始模板最小 patch，保留 DV / 公式 / 格式）
- Integrations 扩展点（宿主接管冶炼厂/产品选择）
- 旧版 cirs-gpm JSON 互转适配器

## 支持的模板

| 模板 | 版本 | 说明 |
|------|------|------|
| CMRT | 6.01, 6.1, 6.22, 6.31, 6.4, 6.5 | Conflict Minerals Reporting Template |
| EMRT | 1.1, 1.11, 1.2, 1.3, 2.0, 2.1 | Extended Minerals Reporting Template |
| CRT | 2.2, 2.21 | Cobalt Reporting Template |
| AMRT | 1.1, 1.2, 1.3 | Additional Minerals Reporting Template |

## 安装

```bash
npm install cm-reporting
# 或
pnpm add cm-reporting
```

**Peer dependencies**（需宿主自行安装）：

```bash
npm install react react-dom antd @ant-design/icons
```

| Peer | 版本要求 |
|------|----------|
| `react` / `react-dom` | ^18.0.0 \|\| ^19.0.0 |
| `antd` | ^5.0.0 \|\| ^6.0.0 |
| `@ant-design/icons` | ^5.0.0 \|\| ^6.0.0 |

## 快速开始

```tsx
import { CMReporting } from 'cm-reporting'
import 'cm-reporting/styles.css'

export function App() {
  return (
    <CMReporting
      templateType="cmrt"
      versionId="6.5"
      locale="zh-CN"
      onSnapshotChange={(snapshot) => {
        // 全量 JSON 快照：建议宿主自行节流后落库
        console.log(snapshot)
      }}
    />
  )
}
```

## API

### CMReporting Props

| Prop | 类型 | 必须 | 说明 |
|------|------|:----:|------|
| `templateType` | `TemplateType` | ✅ | 模板类型：`'cmrt' \| 'emrt' \| 'crt' \| 'amrt'` |
| `versionId` | `string` | ✅ | 模板版本号，如 `'6.5'`、`'2.1'` |
| `locale` | `Locale` | - | 语言：`'en-US' \| 'zh-CN'`，默认 `'en-US'` |
| `onLocaleChange` | `(locale: Locale) => void` | - | 语言变化回调 |
| `theme` | `object` | - | Ant Design 主题 token 覆盖 |
| `cssVariables` | `object` | - | CSS 变量覆盖 |
| `readOnly` | `boolean` | - | 全局只读模式（默认 `false`）。启用后进入“仅浏览”态：禁用输入并隐藏 checker/必填横幅/上下页动作及新增删除等编辑入口。 |
| `maxContentWidth` | `number` | - | 内容区最大宽度（不设则撑满父容器） |
| `integrations` | `CMReportingIntegrations` | - | 外部选择/回写扩展点，见 [Integrations](#integrations) |
| `initialSnapshot` | `ReportSnapshotV1` | - | 初始快照（用于编辑旧报告） |
| `onSnapshotChange` | `(snapshot: ReportSnapshotV1) => void` | - | 任意字段变化时回调全量快照 |
| `fallback` | `ReactNode` | - | 加载态内容（Suspense fallback） |

### CMReporting Ref

通过 `ref` 进行编程式操作：

```tsx
import { useRef } from 'react'
import { CMReporting, type CMReportingRef } from 'cm-reporting'

const ref = useRef<CMReportingRef>(null)

// 获取当前快照
ref.current?.getSnapshot()

// 回填快照（templateType/versionId 必须匹配）
ref.current?.setSnapshot(snapshot)

// 导出 JSON 字符串
ref.current?.exportJson()

// 导出 Excel（需传入模板 xlsx ArrayBuffer）
await ref.current?.exportExcel({ templateXlsx })

// 触发全量校验
await ref.current?.validate()
```

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `getSnapshot()` | `ReportSnapshotV1` | 获取当前全量快照 |
| `setSnapshot(snapshot)` | `void` | 回填快照 |
| `exportJson()` | `string` | 导出快照 JSON 字符串 |
| `exportExcel(input)` | `Promise<Blob>` | 导出 Excel |
| `validate()` | `Promise<boolean>` | 触发全量校验 |

### useCMReporting Hook

在 `CMReporting` 子组件树内使用，提供与 ref 相同的编程式 API：

```tsx
import { useCMReporting } from 'cm-reporting'

function MyComponent() {
  const api = useCMReporting()
  const snapshot = api.snapshot // 响应式，随表单变化自动更新
}
```

## JSON Snapshot

数据契约为 `ReportSnapshotV1`，包含 `schemaVersion`、`templateType`、`versionId`、`data`。

### 导出

```tsx
import { stringifySnapshot } from 'cm-reporting'

// 通过 ref
const json = ref.current?.exportJson()

// 或手动序列化
const json = stringifySnapshot(ref.current?.getSnapshot())
```

### 导入

```tsx
import { parseSnapshot } from 'cm-reporting'

// 解析（含 Zod 校验）
const snapshot = parseSnapshot(JSON.parse(jsonString))

// 回填
ref.current?.setSnapshot(snapshot)
```

### 初始化编辑旧报告

```tsx
<CMReporting
  templateType={snapshot.templateType}
  versionId={snapshot.versionId}
  initialSnapshot={snapshot}
/>
```

## Excel 导出

采用"基于原始 RMI 模板最小差异赋值"策略，严格保留模板的 DV、格式、公式、隐藏 sheet，仅填入用户数据。

```tsx
import { CMReporting, type CMReportingRef } from 'cm-reporting'
import { useRef } from 'react'

export function App() {
  const ref = useRef<CMReportingRef>(null)

  const onExport = async () => {
    // 模板来源由宿主决定：可从 CDN、静态资源，或从包导出的 templates 目录获取
    const res = await fetch('/templates/RMI_CMRT_6.5.xlsx')
    const templateXlsx = await res.arrayBuffer()
    const blob = await ref.current!.exportExcel({ templateXlsx })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cmrt-6.5.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <button onClick={onExport}>Export Excel</button>
      <CMReporting ref={ref} templateType="cmrt" versionId="6.5" />
    </>
  )
}
```

也可以脱离组件直接调用：

```tsx
import { exportToExcel } from 'cm-reporting'

const blob = await exportToExcel({ templateXlsx, snapshot })
```

### 模板文件

包内导出 RMI 原始模板文件，可复制到宿主静态资源目录：

```
cm-reporting/templates/RMI_CMRT_6.5.xlsx
cm-reporting/templates/RMI_EMRT_2.1.xlsx
...
```

## Integrations

Integrations 允许宿主接管冶炼厂/产品的"选择"交互，典型场景：从宿主自有数据库弹窗选择后回写到表单。

```tsx
<CMReporting
  integrations={{
    smelterList: {
      lookupMode: 'external',
      onPickSmelterForRow: async (ctx) => {
        // ctx.rowId, ctx.metal, ctx.row — 当前行信息
        // 返回 { items: [partial] } 或 null（取消）
      },
      rowClassName: (record, index) => {
        // 自定义行样式（宿主提供 CSS）
        return record.listed === 'Non-Listed' ? 'row-unlisted' : ''
      },
    },
    productList: {
      addMode: 'external-only',
      label: '从系统选择产品',
      onPickProducts: async (ctx) => {
        // ctx.currentRows — 当前已有行
        return { items: [{ productNumber: 'P-001', productName: 'xxx' }] }
      },
    },
  }}
/>
```

宿主的实现通常使用 **Promise + ref** 模式暂存 `resolve`，在 Modal 确认时调用：

```tsx
const resolveRef = useRef<((result: ExternalPickResult) => void) | null>(null)

const onPickProducts = async (ctx: ProductPickContext) => {
  setModalOpen(true)
  return new Promise<ExternalPickResult<Partial<ProductRow>>>((resolve) => {
    resolveRef.current = resolve
  })
}

// Modal 确认 → resolveRef.current?.({ items: selectedItems })
// Modal 取消 → resolveRef.current?.(null)
```

## Legacy Adapter

用于旧版 cirs-gpm JSON 与内部 Snapshot 的互转。

```tsx
import { cirsGpmLegacyAdapter } from 'cm-reporting'
```

### 导入

```tsx
const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacyJson)
// snapshot → 用于 CMReporting
// ctx → 保存用于精确回写
```

### 导出

```tsx
// 精确回写（Roundtrip）：需要导入时保存的 ctx
const legacy = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)

// 宽松导出（Loose）：无需 ctx，仅保证 schema 兼容
const legacy = cirsGpmLegacyAdapter.toExternalLoose(snapshot)
```

| 场景 | 方法 | 精确度 | 要求 |
|------|------|--------|------|
| 导入后再导出 | `toExternal(snapshot, ctx)` | byte-level roundtrip | 需保留 `ctx` |
| 全新报告导出 | `toExternalLoose(snapshot)` | schema 兼容 | 无需 `ctx` |

## TypeScript

所有公开类型均从包入口统一导入：

```tsx
import type {
  // 核心
  Locale, TemplateType,
  // 组件
  CMReportingProps, CMReportingRef, CMReportingApi,
  // 表格行
  SmelterRow, ProductRow, MineRow, MineralsScopeRow,
  // Snapshot
  ReportSnapshotV1,
  // Integrations
  CMReportingIntegrations, SmelterListIntegration, ProductListIntegration,
  SmelterPickContext, SmelterRowPickContext, ProductPickContext,
  ExternalPickResult, ExternalAddMode, SmelterLookupMode,
  // Excel
  ExportExcelInput,
  // Legacy
  CirsGpmLegacyReport, CirsGpmLegacyRoundtripContext,
} from 'cm-reporting'
```

## License

[PolyForm Noncommercial 1.0.0](https://github.com/cirscn/cm-reporting/blob/main/LICENSE)

> **注意**：本项目仅允许非商业用途。如需商业使用，请联系版权所有者获取单独商业授权。
