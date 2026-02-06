## Examples 能力边界说明

本目录用于验证 `@lib` 的对外能力与边界，不作为生产 UI 的“最佳实践示例”承诺。

### 场景索引

- 运行入口（可直接在本项目启动时看到）：`app/src/examples/ExamplesApp.tsx`
- 推荐门面组件（`CMReporting` + ref）：`app/src/examples/scenarios/CMReportingRefScenario.tsx`
- legacy transform（roundtrip vs loose）：`app/src/examples/scenarios/LegacyTransformScenario.tsx`
- 自定义行样式（`rowClassName`）：`app/src/examples/scenarios/SmelterRowClassNameScenario.tsx`

启动后可通过页面顶部的 `Examples` 场景选择器切换不同场景。

### JSON 导入/导出

- 导入支持两类 JSON：
  - **RMI legacy JSON**：通过 `cirsGpmLegacyAdapter.toInternal()` 导入；会生成 `legacyCtx` 以支持后续精确回写（roundtrip）。
  - **ReportSnapshotV1**：通过 `parseSnapshot()` 导入；不包含 legacy 的“历史字段类型/缺失细节”，因此无法做 byte-level roundtrip。

- 导出（Examples 约定）：
  - `ExamplesApp` 始终导出 **RMI legacy schema**：
    - 若导入来源是 legacy JSON：使用 `cirsGpmLegacyAdapter.toExternal(snapshot, legacyCtx)` 精确回写。
    - 若未导入 legacy JSON：使用 `cirsGpmLegacyAdapter.toExternalLoose(snapshot)` 进行 loose transform（只保证 schema 兼容）。

### SmelterList 行样式

- `SmelterListIntegration.rowClassName(record, index)` 由宿主决定 className，库不内置任何“标红”等表现。
- Examples 里的 `.smelter-row-unlisted` 仅用于演示宿主自定义样式与规则。
