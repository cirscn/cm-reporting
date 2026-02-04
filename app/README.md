# cm-reporting

基于 React + Ant Design 的冲突矿产报告（RMI 模板）开箱即用嵌入式应用组件库，支持 CMRT / EMRT / CRT / AMRT 的全版本覆盖。

## 安装

```bash
npm install cm-reporting
# 或
pnpm add cm-reporting
```

## 使用（开箱即用）

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
        // 全量 JSON：建议宿主自行节流 + 落库/上报
        console.log(snapshot)
      }}
    />
  )
}
```

## JSON（全量快照）

- 数据契约：`ReportSnapshotV1`（含 `schemaVersion/templateType/versionId/data`）
- 工具：`parseSnapshot()` / `stringifySnapshot()`

组件 ref 方式（推荐用于“导出/保存/回填”）：

```tsx
import { CMReporting, type CMReportingRef } from 'cm-reporting'
import { useRef } from 'react'

export function App() {
  const ref = useRef<CMReportingRef>(null)

  return (
    <>
      <button onClick={() => console.log(ref.current?.getSnapshot())}>Export JSON</button>
      <CMReporting ref={ref} templateType="cmrt" versionId="6.5" locale="en-US" />
    </>
  )
}
```

## Excel（基于模板赋值导出）

严格要求：打开 Excel 后视觉/校验（DV）/公式行为一致，因此导出采用“基于原始 RMI 模板最小差异赋值后导出”的策略。

对外 API：

- `exportToExcel({ templateXlsx, snapshot })`
- `ref.exportExcel({ templateXlsx })`

示例（浏览器下载）：

```tsx
import { CMReporting, type CMReportingRef } from 'cm-reporting'
import { useRef } from 'react'

async function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function App() {
  const ref = useRef<CMReportingRef>(null)

  const onExportExcel = async () => {
    // 模板来源由宿主决定：可从你们的静态资源/CDN，或从包导出的 templates 复制到你的 public。
    const res = await fetch('/templates/RMI_CMRT_6.5.xlsx')
    const templateXlsx = await res.arrayBuffer()
    const blob = await ref.current!.exportExcel({ templateXlsx })
    await downloadBlob(blob, 'cmrt-6.5.xlsx')
  }

  return (
    <>
      <button onClick={onExportExcel}>Export Excel</button>
      <CMReporting ref={ref} templateType="cmrt" versionId="6.5" locale="en-US" />
    </>
  )
}
```

## 模板文件

包内导出静态模板文件：`cm-reporting/templates/*`（用于宿主自持有/下载/二次分发）。

## License

MIT
