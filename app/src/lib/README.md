# CMReporting Lib — 对外接入文档

## 目录

- [概览](#概览)
- [快速开始](#快速开始)
- [公开 API 参考](#公开-api-参考)
  - [CMReporting（推荐入口）](#cmreporting推荐入口)
  - [CMReportingApp（底层组件）](#cmreportingapp底层组件)
  - [useCMReporting Hook](#usecmreporting-hook)
- [TypeScript 类型导入](#typescript-类型导入)
- [Snapshot 导入/导出（JSON）](#snapshot-导入导出json)
- [Excel 导出](#excel-导出)
- [Integrations（外部选择/回写）](#integrations外部选择回写)
  - [ProductList 外部选择](#productlist-外部选择)
  - [SmelterList 外部选择](#smelterlist-外部选择)
  - [数据回传原理](#数据回传原理)
- [Legacy Adapter（cirs-gpm JSON 互转）](#legacy-adaptercirs-gpm-json-互转)
- [Examples 场景索引](#examples-场景索引)

---

## 概览

`CMReporting` 是一套基于 React 的合规矿产报告 UI 库，支持 CMRT / EMRT / CRT / AMRT 多模板、多版本、多语言。

宿主只需引入一个组件，即可获得：
- 完整的报告填报 UI（声明页、冶炼厂列表、产品列表、矿山列表、检查器等）
- JSON Snapshot 导入/导出
- Excel 导出（基于 RMI 原始模板最小 patch）
- 外部选择/回写扩展点（integrations）
- 旧版 cirs-gpm JSON 互转（legacy adapter）

---

## 快速开始

```tsx
import { useRef } from 'react'
import { CMReporting } from '@lib/index'
import type { CMReportingRef } from '@lib/index'

function App() {
  const ref = useRef<CMReportingRef>(null)

  return (
    <CMReporting
      ref={ref}
      templateType="cmrt"
      versionId="6.5"
      locale="zh-CN"
    />
  )
}
```

通过 `ref` 可在宿主侧获取快照、回填、导出 JSON/Excel 等操作：

```tsx
// 获取当前快照
const snapshot = ref.current?.getSnapshot()

// 导出为 JSON 字符串
const json = ref.current?.exportJson()

// 回填快照
ref.current?.setSnapshot(snapshot)

// 导出 Excel
const blob = await ref.current?.exportExcel({ templateXlsx })

// 触发全量校验
const isValid = await ref.current?.validate()

// 保存草稿（不校验）
const draft = ref.current?.saveDraft()

// 提交（内部校验，失败返回 null 并跳转 checker）
const submitted = await ref.current?.submit()
```

---

## 公开 API 参考

### CMReporting（推荐入口）

**开箱即用的门面组件**，内置 UI + i18n + 主题 + 全量 Snapshot 管理。

```tsx
import { CMReporting } from '@lib/index'
import type { CMReportingRef, CMReportingProps } from '@lib/index'
```

**Props：**

| Prop | 类型 | 必须 | 说明 |
|------|------|:----:|------|
| `templateType` | `TemplateType` | ✅ | 模板类型：`'cmrt' \| 'emrt' \| 'crt' \| 'amrt'` |
| `versionId` | `string` | ✅ | 模板版本号，如 `'6.5'`、`'2.1'` |
| `locale` | `Locale` | - | 语言：`'en-US' \| 'zh-CN'`，默认 `'en-US'` |
| `onLocaleChange` | `(locale: Locale) => void` | - | 语言变化回调 |
| `theme` | `object` | - | Ant Design 主题 token 覆盖 |
| `cssVariables` | `object` | - | CSS 变量覆盖 |
| `readOnly` | `boolean` | - | 全局只读模式（默认 `false`）。启用后进入“仅浏览”态：禁用输入并拦截用户编辑相关 store action，同时隐藏 checker 页、必填横幅、上下页操作与新增删除等编辑入口。 |
| `showPageActions` | `boolean` | - | 是否显示底部翻页操作（默认 `true`）。默认仅包含上一页/下一页，不包含内置提交按钮。 |
| `maxContentWidth` | `number` | - | 内容区最大宽度（不设则撑满父容器） |
| `integrations` | `CMReportingIntegrations` | - | 外部选择/回写扩展点 |
| `initialSnapshot` | `ReportSnapshotV1` | - | 初始快照（用于"编辑旧报告"） |
| `onSnapshotChange` | `(snapshot: ReportSnapshotV1) => void` | - | 任意字段变化时回调全量快照（建议宿主自行节流） |
| `fallback` | `ReactNode` | - | 加载态内容（Suspense fallback） |

**Ref API (`CMReportingRef`)：**

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `getSnapshot()` | `ReportSnapshotV1` | 获取当前全量快照 |
| `setSnapshot(snapshot)` | `void` | 回填快照（templateType/versionId 必须匹配） |
| `saveDraft()` | `ReportSnapshotV1` | 保存草稿（不校验必填），返回当前快照。 |
| `submit()` | `Promise<ReportSnapshotV1 | null>` | 执行内部校验；失败返回 `null` 并自动跳转 checker，成功返回快照。 |
| `exportJson()` | `string` | 导出快照 JSON 字符串 |
| `exportExcel(input)` | `Promise<Blob>` | 导出 Excel（需传入模板 xlsx ArrayBuffer） |
| `validate()` | `Promise<boolean>` | 触发全量校验 |

---

### CMReportingApp（底层组件）

底层组件，适合需要**自行管理页面导航**或**不使用 CMReporting 门面**的高级场景。

```tsx
import { CMReportingApp } from '@lib/CMReportingApp'
```

**Props：**

| Prop | 类型 | 必须 | 说明 |
|------|------|:----:|------|
| `templateType` | `TemplateType` | ✅ | 模板类型 |
| `versionId` | `string` | ✅ | 模板版本号 |
| `pageKey` | `PageKey` | - | 当前页面（受控模式） |
| `onNavigatePage` | `(pageKey: PageKey) => void` | - | 页面导航回调（受控模式） |
| `showPageActions` | `boolean` | - | 是否显示底部翻页操作（默认 `true`）。传 `false` 可由宿主完全接管保存/提交流程。 |
| `maxContentWidth` | `number` | - | 内容区最大宽度 |
| `readOnly` | `boolean` | - | 全局只读模式（默认 `false`）。只读下会自动隐藏 checker 页并回退到可浏览页；若在受控 `pageKey` 模式下发生回退，会通过 `onNavigatePage` 同步父级状态。 |
| `integrations` | `CMReportingIntegrations` | - | 外部选择/回写扩展点 |
| `children` | `ReactNode` | - | 内部插入点（用于 snapshot 绑定等） |

> **注意**：使用 `CMReportingApp` 时需自行包裹 `CMReportingProvider`（提供 i18n 与主题），并用 `useCMReporting` 或 `useTemplateActions` 进行数据操作。

---

### useCMReporting Hook

在 `CMReportingProvider` / `CMReportingApp` 内部使用的 hook，用于编程式获取/回填快照。

```tsx
import { useCMReporting } from '@lib/index'
import type { CMReportingApi } from '@lib/index'
```

**返回值 (`CMReportingApi`)：**

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `snapshot` | `ReportSnapshotV1` | 当前快照（响应式，随表单变化自动更新） |
| `getSnapshot()` | `ReportSnapshotV1` | 获取当前快照 |
| `setSnapshot(snapshot)` | `void` | 回填快照 |
| `saveDraft()` | `ReportSnapshotV1` | 保存草稿（不校验必填），返回当前快照。 |
| `submit()` | `Promise<ReportSnapshotV1 | null>` | 执行内部校验；失败返回 `null` 并自动跳转 checker，成功返回快照。 |
| `exportJson()` | `string` | 导出 JSON 字符串 |
| `exportExcel(input)` | `Promise<Blob>` | 导出 Excel |
| `validate()` | `Promise<boolean>` | 触发全量校验 |

---

## TypeScript 类型导入

所有公开类型均从 `@lib/index` 统一导入：

```tsx
// ─── 核心类型 ───
import type { Locale, TemplateType } from '@lib/index'

// ─── 表格行类型 ───
import type { SmelterRow, ProductRow, MineRow, MineralsScopeRow } from '@lib/index'

// ─── Snapshot ───
import type { ReportSnapshotV1 } from '@lib/index'

// ─── Ref & Props ───
import type { CMReportingRef, CMReportingProps } from '@lib/index'
import type { CMReportingApi } from '@lib/index'

// ─── Integrations ───
import type {
  CMReportingIntegrations,
  ProductListIntegration,
  ProductPickContext,
  SmelterListIntegration,
  SmelterPickContext,
  SmelterRowPickContext,
  ExternalPickResult,
  ExternalAddMode,
  SmelterLookupMode,
} from '@lib/index'

// ─── Excel ───
import type { ExportExcelInput } from '@lib/index'

// ─── Legacy Adapter ───
import type {
  CirsGpmLegacyReport,
  CirsGpmLegacyRoundtripContext,
  ParsedCirsGpmLegacyReport,
} from '@lib/index'
```

---

## Snapshot 导入/导出（JSON）

### Snapshot 结构

```ts
interface ReportSnapshotV1 {
  schemaVersion: 1
  templateType: TemplateType
  versionId: string
  locale?: Locale
  data: {
    companyInfo: Record<string, string>
    selectedMinerals: string[]
    customMinerals: string[]
    questions: Record<string, Record<string, string> | string>
    questionComments: Record<string, Record<string, string> | string>
    companyQuestions: Record<string, Record<string, string> | string>
    mineralsScope: MineralsScopeRow[]
    smelterList: SmelterRow[]
    mineList: MineRow[]
    productList: ProductRow[]
  }
}
```

> `companyInfo.authorizationDate` 的内部标准格式为 `YYYY-MM-DD`。  
> 运行时导入（如 `parseSnapshot` / `setSnapshot` 回填）额外兼容时间戳输入（秒级或毫秒级，number/数字字符串），并会自动归一化为 `YYYY-MM-DD`。

### 导出 JSON

```tsx
import { stringifySnapshot } from '@lib/index'

// 方式 1：通过 ref
const json = ref.current?.exportJson()

// 方式 2：手动序列化
const snapshot = ref.current?.getSnapshot()
const json = stringifySnapshot(snapshot)
```

### 导入 JSON

```tsx
import { parseSnapshot } from '@lib/index'

// 从 JSON 字符串解析（含 Zod 校验）
const snapshot = parseSnapshot(JSON.parse(jsonString))

// 回填到组件
ref.current?.setSnapshot(snapshot)
```

完成日期字段示例：

```json
{
  "data": {
    "companyInfo": {
      "authorizationDate": "2026-02-09"
    }
  }
}
```

- 推荐传 `YYYY-MM-DD`。
- 运行时兼容秒/毫秒时间戳（如 `1770595200` / `1770595200000`），内部会归一化为 `YYYY-MM-DD`。
- 非法日期（如 `2026/02/09`）不会被自动修正，仍由现有校验提示错误。

### 初始化（编辑旧报告）

```tsx
<CMReporting
  ref={ref}
  templateType={snapshot.templateType}
  versionId={snapshot.versionId}
  initialSnapshot={snapshot}  // 首次渲染即回填
/>
```

---

## Excel 导出

```tsx
import { exportToExcel } from '@lib/index'
import type { ExportExcelInput } from '@lib/index'

// 方式 1：通过 ref（推荐）
const blob = await ref.current?.exportExcel({
  templateXlsx: arrayBuffer,  // 原始 RMI .xlsx 模板文件的 ArrayBuffer
})

// 方式 2：直接调用
const blob = await exportToExcel({
  templateXlsx: arrayBuffer,
  snapshot: ref.current?.getSnapshot(),
})

// 下载
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'report.xlsx'
a.click()
URL.revokeObjectURL(url)
```

> Excel 导出采用"最小 patch"策略——严格保留模板的 DV、格式、公式、隐藏 sheet 等，仅填入用户数据。

---

## Integrations（外部选择/回写）

Integrations 允许宿主接管"选择冶炼厂/产品"的交互和数据来源，典型场景是宿主自有数据库弹窗选择。

```tsx
import type { CMReportingIntegrations } from '@lib/index'

<CMReporting
  integrations={{
    productList: {
      addMode: 'external-only',
      label: '从外部系统选择',
      onPickProducts: async (ctx) => {
        // ctx 包含当前模板信息和已有行数据
        // 返回 { items: [...] } 或 null（取消）
      },
    },
    smelterList: {
      lookupMode: 'external',
      onPickSmelterForRow: async (ctx) => {
        // ctx 包含当前行信息（rowId, metal, row 等）
        // 返回 { items: [partial] } 或 null（取消）
      },
    },
  }}
/>
```

### ProductList 外部选择

**配置项 (`ProductListIntegration`)：**

| 字段 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `addMode` | `ExternalAddMode` | `'append-empty-row'` | 新增行为：`'append-empty-row'`（仅空行）/ `'external-only'`（仅外部）/ `'both'`（两者都有） |
| `label` | `string` | `'从外部选择'` | 外部选择按钮文案 |
| `showLoadingIndicator` | `boolean` | `false` | 外部选择时展示 loading |
| `onPickProducts` | `(ctx) => Promise<ExternalPickResult<Partial<ProductRow>>>` | **必须** | 宿主外部选择回调 |

**回调上下文 (`ProductPickContext`)：**

```ts
interface ProductPickContext {
  templateType: TemplateType       // 当前模板
  versionId: string                // 当前版本
  locale: Locale                   // 当前语言
  versionDef: TemplateVersionDef   // 版本定义
  config: ProductListConfig        // 列表配置（含 hasRequesterColumns 等）
  currentRows: ReadonlyArray<ProductRow>  // 当前已有行数据
}
```

**返回值：**

```ts
// 确认选择：返回 items 数组（追加到列表末尾）
return { items: [{ productNumber: 'P-001', productName: 'xxx' }] }

// 取消选择
return null
```

### SmelterList 外部选择

**配置项 (`SmelterListIntegration`)：**

| 字段 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `addMode` | `ExternalAddMode` | `'append-empty-row'` | 新增行为模式 |
| `label` | `string` | `'从外部选择'` | 外部选择按钮文案 |
| `showLoadingIndicator` | `boolean` | `false` | 外部选择时展示 loading |
| `lookupMode` | `SmelterLookupMode` | `'internal'` | 冶炼厂名称交互模式：`'internal'`（手填）/ `'external'`（外部选择）/ `'hybrid'`（两者结合） |
| `rowClassName` | `(record, index) => string` | - | 自定义行 className（由宿主提供 CSS） |
| `onPickSmelters` | `(ctx) => Promise<ExternalPickResult>` | - | 批量外部选择 |
| `onPickSmelterForRow` | `(ctx) => Promise<ExternalPickResult>` | - | 行内外部选择（选择 metal 后为当前行选择冶炼厂） |

**行内选择上下文 (`SmelterRowPickContext`)：**

```ts
interface SmelterRowPickContext extends SmelterPickContext {
  rowId: string              // 当前行 ID
  row: Readonly<SmelterRow>  // 当前行完整数据
  metal: string              // 当前行的 metal
}
```

### 数据回传原理

Integrations 使用 **"回调 + Promise"** 模式实现宿主与库之间的异步数据交换：

```
库组件                               宿主
  │                                    │
  │ ① 调用 onPickProducts(ctx)         │
  │ ──────────────────────────────►    │
  │                                    │ ② 打开宿主 UI（如 Modal）
  │     await 等待中...                │ ③ 用户在宿主 UI 中操作
  │                                    │ ④ 用户点击确认
  │ ⑤ Promise resolve { items }       │
  │ ◄──────────────────────────────    │
  │                                    │
  │ ⑥ 拿到数据，写入表单               │
```

宿主的实现通常使用 **Promise + ref** 模式暂存 `resolve`，在 Modal 确认时调用：

```tsx
const resolveRef = useRef<((result: ExternalPickResult) => void) | null>(null)

const onPickProducts = async (ctx: ProductPickContext) => {
  setModalOpen(true)
  return new Promise<ExternalPickResult<Partial<ProductRow>>>((resolve) => {
    resolveRef.current = resolve  // 暂存 resolve
  })
}

// Modal 确认时
const handleConfirm = () => {
  resolveRef.current?.({ items: selectedItems })
  resolveRef.current = null
  setModalOpen(false)
}

// Modal 取消时
const handleCancel = () => {
  resolveRef.current?.(null)
  resolveRef.current = null
  setModalOpen(false)
}
```

> 完整示例见 `app/src/demo/ExternalPickers.tsx` 和 `app/src/examples/scenarios/SmelterRowClassNameScenario.tsx`。

---

## Legacy Adapter（cirs-gpm JSON 互转）

用于旧版 cirs-gpm JSON 与内部 Snapshot 的互转。

```tsx
import { cirsGpmLegacyAdapter } from '@lib/index'
import type {
  CirsGpmLegacyReport,
  CirsGpmLegacyRoundtripContext,
} from '@lib/index'
```

### 导入 Legacy JSON → Snapshot

```tsx
// 解析并转换为内部 snapshot
const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacyJson)

// snapshot: ReportSnapshotV1 — 可直接用于 CMReporting
// ctx: CirsGpmLegacyRoundtripContext — 保存用于精确回写
```

### 导出 Snapshot → Legacy JSON

**精确回写（Roundtrip）**：需要导入时保存的 `ctx`

```tsx
const legacy = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)
```

**宽松导出（Loose）**：无需 `ctx`，仅保证 schema 兼容

```tsx
const legacy = cirsGpmLegacyAdapter.toExternalLoose(snapshot)
```

### Roundtrip vs Loose 对比

| 场景 | 方法 | 精确度 | 要求 |
|------|------|--------|------|
| 导入后再导出 | `toExternal(snapshot, ctx)` | byte-level roundtrip | 需保留 `ctx` |
| 全新报告导出 | `toExternalLoose(snapshot)` | schema 兼容 | 无需 `ctx` |

> 完整示例见 `app/src/examples/scenarios/LegacyTransformScenario.tsx`。

---

## Examples 场景索引

示例代码位于 `app/src/examples/`，用于验证 lib 的对外能力与边界。

| 场景 | 文件 | 展示内容 |
|------|------|----------|
| CMReporting + ref | `scenarios/CMReportingRefScenario.tsx` | 推荐入口、Snapshot 导入/导出、语言切换 |
| Legacy Transform | `scenarios/LegacyTransformScenario.tsx` | Legacy JSON 互转、Roundtrip vs Loose |
| Smelter 行样式 | `scenarios/SmelterRowClassNameScenario.tsx` | `rowClassName` 自定义行样式、外部 lookup |
| Demo（完整参考） | `demo/DevApp.tsx` | Integrations 外部选择、页面导航、JSON 导入 |
| 外部选择器实现 | `demo/ExternalPickers.tsx` | Promise+ref 模式、产品/冶炼厂 Modal 弹窗 |
