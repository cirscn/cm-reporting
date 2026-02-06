# Contracts

## TOC

1. Public exports
2. Component props contract
3. Ref and hook contract
4. Snapshot contract
5. Excel contract
6. Integrations contract
7. Legacy adapter contract

## 1) Public exports

Key exports from package root:

- `CMReporting`
- `useCMReporting`
- `parseSnapshot` / `stringifySnapshot`
- `exportToExcel`
- `cirsGpmLegacyAdapter`
- types: `CMReportingProps`, `CMReportingRef`, `ReportSnapshotV1`, `CMReportingIntegrations`, `ExportExcelInput`
- assets exports: `cm-reporting/styles.css`, `cm-reporting/templates/*`

## 2) Component props contract

Required props:

- `templateType: 'cmrt' | 'emrt' | 'crt' | 'amrt'`
- `versionId: string`

Optional but common:

- `locale`, `onLocaleChange`
- `initialSnapshot`, `onSnapshotChange`
- `integrations`
- `theme`, `cssVariables`, `maxContentWidth`
- `fallback`

## 3) Ref and hook contract

`CMReportingRef` and `CMReportingApi` expose the same operational methods:

- `getSnapshot(): ReportSnapshotV1`
- `setSnapshot(snapshot): void`
- `exportJson(): string`
- `exportExcel({ templateXlsx }): Promise<Blob>`
- `validate(): Promise<boolean>`

## 4) Snapshot contract

`ReportSnapshotV1` invariants:

- `schemaVersion` is fixed to current supported value.
- `templateType` and `versionId` identify report schema and layout.
- `data` stores full report state.

Operational rules:

- Parse untrusted JSON through `parseSnapshot`.
- Serialize through `stringifySnapshot` for canonical output.
- Reject restore if host route template/version mismatches snapshot.

## 5) Excel contract

Input contract (`ExportExcelInput`):

- `templateXlsx: ArrayBuffer` (official template binary)
- `snapshot: ReportSnapshotV1` (for function mode)

Output contract:

- `Promise<Blob>` (ready for browser download/upload)

Behavior contract:

- Preserve template DV/formulas/styles/hidden sheets.
- Apply minimal patch only to user data cells.

## 6) Integrations contract

Shared callback result type:

- `ExternalPickResult<T> = { items: T[] } | null | undefined`

`productList.onPickProducts(ctx)`:

- Must return selected partial `ProductRow` list wrapped as `{ items }`.
- Return `null`/`undefined` on cancel.

`smelterList` callbacks:

- `onPickSmelters(ctx)` for bulk add.
- `onPickSmelterForRow(ctx)` for row-level selection.

Configuration knobs:

- `addMode`: `'append-empty-row' | 'external-only' | 'both'`
- `lookupMode`: `'internal' | 'external' | 'hybrid'`
- `rowClassName` for host CSS-controlled row rendering.

## 7) Legacy adapter contract

`cirsGpmLegacyAdapter.toInternal(input)`:

- Returns `{ snapshot, ctx }`.

`cirsGpmLegacyAdapter.toExternal(snapshot, ctx)`:

- Roundtrip-accurate export requiring preserved `ctx`.

`cirsGpmLegacyAdapter.toExternalLoose(snapshot)`:

- Compatibility export without preserved `ctx`.
