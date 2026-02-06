# Integration Snippets

## TOC

1. Install and baseline
2. Minimal mount
3. Host toolbar with ref APIs
4. Snapshot persistence and restore
5. Excel export recipes
6. Template delivery strategies
7. External picker integration pattern
8. Legacy adapter interop
9. Go-live checklist

## 1) Install and baseline

```bash
npm install cm-reporting react react-dom antd @ant-design/icons
```

Import styles once:

```ts
import 'cm-reporting/styles.css'
```

## 2) Minimal mount

```tsx
import { CMReporting } from 'cm-reporting'
import 'cm-reporting/styles.css'

export function ReportingPage() {
  return (
    <CMReporting
      templateType="cmrt"
      versionId="6.5"
      locale="zh-CN"
    />
  )
}
```

## 3) Host toolbar with ref APIs

```tsx
import { useRef } from 'react'
import { CMReporting, type CMReportingRef } from 'cm-reporting'

export function ReportingPage() {
  const ref = useRef<CMReportingRef>(null)

  const onValidate = async () => {
    const ok = await ref.current?.validate()
    console.log('valid=', ok)
  }

  const onExportJson = () => {
    const json = ref.current?.exportJson()
    console.log(json)
  }

  return (
    <>
      <button onClick={onValidate}>Validate</button>
      <button onClick={onExportJson}>Export JSON</button>
      <CMReporting ref={ref} templateType="cmrt" versionId="6.5" />
    </>
  )
}
```

## 4) Snapshot persistence and restore

### Persist (debounced in host)

```tsx
<CMReporting
  templateType="emrt"
  versionId="2.1"
  onSnapshotChange={(snapshot) => {
    localStorage.setItem('cm-reporting:snapshot', JSON.stringify(snapshot))
  }}
/>
```

### Restore with parse and type/version guard

```tsx
import { parseSnapshot } from 'cm-reporting'

const raw = localStorage.getItem('cm-reporting:snapshot')
const snapshot = raw ? parseSnapshot(JSON.parse(raw)) : undefined

<CMReporting
  templateType={snapshot?.templateType ?? 'emrt'}
  versionId={snapshot?.versionId ?? '2.1'}
  initialSnapshot={snapshot}
/>
```

## 5) Excel export recipes

### Via ref API (recommended)

```tsx
const res = await fetch('/templates/RMI_CMRT_6.5.xlsx')
if (!res.ok) throw new Error(`Template fetch failed: ${res.status}`)
const templateXlsx = await res.arrayBuffer()
const blob = await ref.current!.exportExcel({ templateXlsx })

const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'cmrt-6.5.xlsx'
a.click()
URL.revokeObjectURL(url)
```

### Via pure function

```tsx
import { exportToExcel } from 'cm-reporting'

const blob = await exportToExcel({ templateXlsx, snapshot })
```

## 6) Template delivery strategies

### Strategy A: Host static assets (stable default)

- Put templates under `public/templates/`.
- Fetch by explicit filename from matrix.

```ts
const url = '/templates/RMI_EMRT_2.1.xlsx'
```

### Strategy B: Internal/CDN asset service

- Resolve URL server-side by template + version.
- Keep CDN cache and immutable file naming.

```ts
const url = `${assetBase}/rmi/RMI_CRT_2.21.xlsx`
```

### Strategy C: Import from package exports (bundler-dependent)

```ts
// Example for bundlers supporting ?url asset imports
import cmrt65Url from 'cm-reporting/templates/CMRT/RMI_CMRT_6.5.xlsx?url'
```

If bundler cannot resolve exported `.xlsx` assets directly, fallback to Strategy A.

## 7) External picker integration pattern

```tsx
import type {
  CMReportingIntegrations,
  ExternalPickResult,
  ProductRow,
  ProductPickContext,
} from 'cm-reporting'

const integrations: CMReportingIntegrations = {
  productList: {
    addMode: 'external-only',
    label: '从主数据选择',
    onPickProducts: async (ctx: ProductPickContext): Promise<ExternalPickResult<Partial<ProductRow>>> => {
      const items = await openProductModal(ctx)
      if (!items) return null
      return { items }
    },
  },
}
```

Promise + modal resolver pattern:

```tsx
const resolveRef = useRef<((value: { items: any[] } | null) => void) | null>(null)

const onPickProducts = async () =>
  new Promise<{ items: any[] } | null>((resolve) => {
    resolveRef.current = resolve
    setModalOpen(true)
  })

const onConfirm = (items: any[]) => {
  resolveRef.current?.({ items })
  resolveRef.current = null
  setModalOpen(false)
}

const onCancel = () => {
  resolveRef.current?.(null)
  resolveRef.current = null
  setModalOpen(false)
}
```

## 8) Legacy adapter interop

```tsx
import { cirsGpmLegacyAdapter } from 'cm-reporting'

const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacyJson)
const roundtrip = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)
const loose = cirsGpmLegacyAdapter.toExternalLoose(snapshot)
```

Use `toExternal(snapshot, ctx)` when preserving roundtrip fidelity is required.

## 9) Go-live checklist

- Verify peer versions (`react`/`antd`/icons) satisfy ranges.
- Verify all target template files are reachable in runtime.
- Verify snapshot save/restore for every template in scope.
- Verify Excel export on representative versions (CMRT/EMRT/CRT/AMRT).
- Verify external picker cancel path returns `null` safely.
- Verify locale switching and host theme overrides.
- Verify license constraints with business/legal owners.
