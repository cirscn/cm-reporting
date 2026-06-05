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
      versionId="6.6"
      locale="zh-CN"
    />
  )
}
```

宿主项目推荐导入 `cm-reporting/styles.scoped.css`。`CMReporting` 会在内部创建 `cm-reporting-scope` 容器，并把 Ant Design 弹层挂回该容器内，这样库里的 Tailwind reset、只读态样式和 Ant Design 覆盖只会影响组件内部。旧入口 `cm-reporting/styles.css` 仍保留兼容，但它会全局生效。

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

// 提交（内部全量校验：zod + checker，失败返回 null 并跳转 checker）
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
| `versionId` | `string` | ✅ | 模板版本号，如 `'6.6'`、`'2.11'` |
| `locale` | `Locale` | - | 语言：`'en-US' \| 'zh-CN'`，默认 `'en-US'` |
| `onLocaleChange` | `(locale: Locale) => void` | - | 语言变化回调 |
| `theme` | `object` | - | Ant Design 主题 token 覆盖 |
| `cssVariables` | `object` | - | CSS 变量覆盖 |
| `readOnly` | `boolean` | - | 全局只读模式（默认 `false`）。启用后进入“仅浏览”态：禁用输入并拦截用户编辑相关 store action；空值控件不展示 placeholder，同时隐藏 checker 页、必填横幅、上下页操作与新增删除等编辑入口。 |
| `showPageActions` | `boolean` | - | 是否显示底部翻页操作（默认 `true`）。默认仅包含上一页/下一页，不包含内置提交按钮。 |
| `maxContentWidth` | `number` | - | 内容区最大宽度（不设则撑满父容器） |
| `integrations` | `CMReportingIntegrations` | - | 外部选择/回写扩展点 |
| `initialSnapshot` | `ReportSnapshotV1` | - | 初始快照（用于"编辑旧报告"） |
| `onSnapshotChange` | `(snapshot: ReportSnapshotV1) => void` | - | 任意字段变化时回调全量快照（建议宿主自行节流） |
| `fallback` | `ReactNode` | - | 加载态内容（Suspense fallback） |

**工作流布局说明：**

- 顶部步骤条（如“申报 / 冶炼厂 / 矿场列表 / 产品列表 / 校验”）默认使用吸顶布局，长内容滚动时会固定在组件顶部。
- 页面主体内容区单独滚动，不会把步骤条一起卷走；宿主若自行包裹容器，需要给外层提供可计算高度，避免整个页面跟着外层一起滚。

**Ref API (`CMReportingRef`)：**

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `getSnapshot()` | `ReportSnapshotV1` | 获取当前全量快照 |
| `setSnapshot(snapshot)` | `void` | 回填快照（templateType/versionId 必须匹配） |
| `saveDraft()` | `ReportSnapshotV1` | 保存草稿（不校验必填），返回当前快照。 |
| `submit()` | `Promise<ReportSnapshotV1 | null>` | 执行内部全量校验（`zod + checker`）；失败返回 `null` 并自动跳转 checker，成功返回快照。 |
| `exportJson()` | `string` | 导出快照 JSON 字符串 |
| `exportExcel(input)` | `Promise<Blob>` | 导出 Excel（需传入模板 xlsx ArrayBuffer） |
| `validate()` | `Promise<boolean>` | 触发全量校验（`zod + checker`） |

**提交/校验一致性说明：**

- `submit()` 与 `validate()` 使用同一套全量校验门控（`zod + checker`）。
- 当 checker 仍有“必填未完成”项时，`submit()` 一定返回 `null`，不会出现“checker 提示未完成但仍提交成功”的状态分叉。

**Checker 一致性说明（Smelter List）：**

- `Smelter List` 相关的 checker 校验与进度统计共用同一门控：仅当矿种处于“需要填写冶炼厂”状态时生效。
- 当用户后续将 `Q1/Q2` 改为否定或其它不满足当前模板门控的选项，导致某金属不再要求冶炼厂时，该金属在 `smelterList` 中的行会自动删除。
- 该规则用于确保 checker 错误数与完成度一致，避免“错误为 0 但完成度下降”的状态偏差。
- 对所有带 `smelterLookup` 下拉的模板版本，只要某一行已经选择 `metal`，该行的 `smelterLookup` 就属于 checker 必填；未选择时会直接判定为未完成。

**EMRT 申报范围默认值说明：**

- EMRT 在初始化空表单时默认选中当前版本全部矿种（含 `dynamic-dropdown` 版本）。
- 在非只读模式（`readOnly=false`）下，用户可在 Declaration 页继续调整矿种选择。
- 在只读模式（`readOnly=true`）下，矿种范围仅展示当前值，不提供编辑交互。
- 在只读模式下，输入框、下拉框、日期选择等控件仍保留 `disabled` 表单语义；已有内容正常显示，空值控件不展示 placeholder，背景统一为 `#f5f5f5`，边框透明，内容文字与 label 使用同一文本色。
- 在 `dynamic-dropdown` 模式（EMRT 2.x / AMRT 1.3+）下，取消某矿种会自动清空该矿种在按矿种题目与备注中的值，并删除该矿种在 `Smelter List` / `Mine List` 的历史行，避免残留不可见脏数据。
- 当 `other` 保持勾选但某个自定义矿种槽位被清空时，会同步清理对应 `other-*` 的题目/备注与 `Smelter List` / `Mine List` 行数据。

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

**工作流布局说明：**

- `CMReportingApp` 内置的工作流步骤条默认固定在组件顶部，适合长表单连续填写时始终看见当前步骤。
- 中间内容区独立滚动；如果宿主把组件放进弹窗、抽屉或自定义容器，记得让该容器本身有明确高度。

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
| `submit()` | `Promise<ReportSnapshotV1 | null>` | 执行内部全量校验（`zod + checker`）；失败返回 `null` 并自动跳转 checker，成功返回快照。 |
| `exportJson()` | `string` | 导出 JSON 字符串 |
| `exportExcel(input)` | `Promise<Blob>` | 导出 Excel |
| `validate()` | `Promise<boolean>` | 触发全量校验（`zod + checker`） |

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
  SmelterNumberLookupPickContext,
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

### AMRT 1.31 矿产范围

- `AMRT 1.31` 已按官方 Excel 模板接入，默认版本为 `1.31`。
- 相比 `AMRT 1.3`，`AMRT 1.31` 新增 `Cadmium`、`Lead`、`Molybdenum`、`Rhenium`、`Selenium`、`Tellurium`。
- 这些矿产会进入 Declaration 矿产选择、按矿产题目、`Smelter List`、`Mine List`、`Minerals Scope` 和 Excel 导出。

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
        // 返回 { items: [{ id, smelterNumber, ...partial }] } 或 null（取消）
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

**Product List 当前规则：**

- 当 `Declaration Scope = Product`（内部值 `scopeType === 'B'`）时，`Product List` 必须至少有 1 行数据。
- `回复方的产品编号`（字段 `productNumber`）始终按必填处理。
- 当模板配置 `hasRequesterColumns=true`（如 `CMRT 6.6`、`EMRT 2.11`、`AMRT 1.3 / 1.31`）时，`请求方的产品编号`（字段 `requesterNumber`）也按必填处理。
- “请求方的产品编号 / 请求方的产品名称”只是前端显示文案调整，对接字段仍分别是 `requesterNumber / requesterName`。

### SmelterList 外部选择

**配置项 (`SmelterListIntegration`)：**

| 字段 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `showLoadingIndicator` | `boolean` | `false` | 外部选择时展示 loading |
| `lookupMode` | `SmelterLookupMode` | `'internal'` | 冶炼厂名称交互模式：`'internal'`（手填）/ `'external'`（外部选择）/ `'hybrid'`（两者结合） |
| `rowClassName` | `(record, index) => string` | - | 自定义行 className（由宿主提供 CSS） |
| `onPickSmelterForRow` | `(ctx) => Promise<ExternalPickResult>` | - | 行内外部选择（点击“新增一行”后，选择 metal，再为当前行选择冶炼厂） |
| `onLookupSmelterByNumber` | `(ctx) => Promise<ExternalPickResult>` | - | 输入冶炼厂 CID 后由宿主系统查询主数据并回填当前行 |
| `onPickSmelterForNumberLookup` | `(ctx) => Promise<ExternalPickResult>` | - | CID 查询返回多条时，由宿主打开选择器让用户确认一条；`ctx.searchField='smelterNumber'`，`ctx.searchValue` 为用户输入值 |

**外部回写字段规则：**

- 行 `id` 与冶炼厂识别号码（`smelterNumber` 列）语义严格分离：
  - `id` 仅表示宿主数据主键（用于行 ID 与去重判定）；
  - `smelterNumber` 仅用于展示；
  - `smelterId` 为内部兼容字段，不参与展示与业务判定。
- 点击“新增一行”时，库会先生成临时行 ID（格式：`smelter-new-<timestamp>`）。
- 宿主回写了 `id` 后，库会使用该 `id` 覆盖临时行 ID；未回写 `id` 时本次回写无效并提示错误。
- 同一个 `metal` 下禁止重复选择同一冶炼厂（按回写 `id` 去重）。
- 行内外部选择成功后（且非 `Smelter not listed / not yet identified`），`smelterNumber`、`country`、`smelterIdentification`、`sourceId`、`street`、`city`、`state` 字段会锁定为不可编辑。
- 锁定后的空字段不显示 placeholder，避免把 `Source ID`、`街道`、`城市` 等占位提示误看成真实数据；有真实值的只读文本会单行省略，鼠标悬浮显示全文。
- 如果宿主外部回写只带了 `smelterName`、没带 `smelterLookup`，库会自动用 `smelterName` 回填到 `smelterLookup`，保证“冶炼厂查找”列显示正常，且 checker 不会把该行继续判成未选择冶炼厂。
- 外部回写里 `smelterNumber` 是冶炼厂 CID 展示号；“冶炼厂识别”列也会使用该 CID。`sourceId` 是来源识别号；如果宿主把 RMI 来源值放在 `smelterIdentification` 且未传 `sourceId`，库会把该值归入 `sourceId`。
- 配置 `onLookupSmelterByNumber` 后，用户在“冶炼厂识别号码输入列”输入 CID 并离开输入框时，库会把 CID 交给宿主查询；宿主返回唯一结果时，库会先确认该结果的 `metal` 仍在当前申报范围内（例如 Q1/Q2 都为 `Yes`），再自动回填金属、名称、国家、CID、RMI 来源和地址等字段；不在范围内时只提示，不写入表格。
- 若 `onLookupSmelterByNumber` 返回多条，库会优先调用 `onPickSmelterForNumberLookup`，由宿主用选择器让用户确认一条；未配置该回调时只提示多条，不自动猜测。
- 外部回写 `metal` 可传内部 key（如 `cobalt`），也可传当前下拉显示名（如 `钴`）；库会归一化成下拉使用的 key。归一化失败且该金属不在当前可选范围时，不自动回填。
- 当全局只读（`readOnly=true`）或父级 `ConfigProvider` 处于禁用态时，上述字段仍遵循 `parentDisabled || readOnly` 禁用规则，不会被局部锁定条件覆盖。
- 上述规则适用于 `onPickSmelterForRow`（行内）与 `onLookupSmelterByNumber`（按 CID 查询）。
- `saveDraft()` / `submit()` 返回的 Snapshot 中会按该规则回传：
  - `data.smelterList[*].id`（宿主数据主键）
  - `data.smelterList[*].smelterNumber`（展示号）
  - `data.smelterList[*].smelterId`（内部兼容字段）

**Smelter List 表头与模板对齐规则：**

- 冶炼厂列表表头现在按 `templateType + versionId` 与对应 RMI Excel 模板对齐，不再只用一套通用表头。
- 当前覆盖范围是全部调查类型：`CMRT / CRT / EMRT / AMRT`，并保留版本差异。
- UI 表头只调整“显示名称、显示顺序、显示/隐藏”，不改底层 Snapshot / 后端字段名。
- 以下 3 个辅助列不再在 UI 冶炼厂列表中显示：`Standard Smelter Name`、`Country Code`、`State / Province Code`。
- `smelterId` 仍是内部兼容字段，不作为当前冶炼厂列表推荐对外字段；识别号码请使用 `smelterNumber`。

**Mine List 表头与模板对齐规则：**

- `Mine List` 只在支持该工作表的模板中显示：当前是 `AMRT 1.1 / 1.2 / 1.3 / 1.31` 与 `EMRT 2.0 / 2.1 / 2.11`。
- 这些版本的矿厂列表 UI 表头已按对应 RMI Excel 模板对齐。
- 当前 UI 显示列仍只保留业务可编辑列，不显示模板里的辅助列：`Country Code`、`State / Province Code`。
- UI 表头文案对齐模板，不代表底层字段名变化；例如“矿厂识别（例如《CID》）”对应的仍是 `mineId` 字段。
- `EMRT / AMRT` 矿厂行只要选择了 `metal`，`smelterName`、`mineName`、`mineCountry` 就会按必填项参与校验和进度统计；`mineCountry` 在 UI 中是文本输入框，不再使用国家/地区下拉。

**行内选择上下文 (`SmelterRowPickContext`)：**

```ts
interface SmelterRowPickContext {
  templateType: TemplateType     // 当前模板
  versionId: string              // 当前版本
  locale: Locale                 // 当前语言
  versionDef: TemplateVersionDef // 版本定义
  config: SmelterListConfig      // 列表配置
  currentRows: ReadonlyArray<SmelterRow> // 当前已有行数据
  rowId: string              // 当前行 ID
  row: Readonly<SmelterRow>  // 当前行完整数据
  metal: string              // 当前行的 metal
}

interface SmelterNumberLookupContext {
  templateType: TemplateType
  versionId: string
  locale: Locale
  versionDef: TemplateVersionDef
  config: SmelterListConfig
  currentRows: ReadonlyArray<SmelterRow>
  rowId: string
  row: Readonly<SmelterRow>
  smelterNumber: string // 用户输入的 CID
}

interface SmelterNumberLookupPickContext extends SmelterNumberLookupContext {
  searchField: 'smelterNumber'
  searchValue: string // 默认搜索值，即用户输入的 CID
  candidates: ReadonlyArray<SmelterExternalPickItem> // 本次 CID 查询返回的多条候选
}

type SmelterExternalPickItem = Partial<SmelterRow> & {
  id: string             // 宿主数据主键（external/hybrid 模式下必须提供）
  smelterNumber?: string // 冶炼厂 CID，冶炼厂识别列也显示该值
  sourceId?: string      // 来源识别号，例如 RMI
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
