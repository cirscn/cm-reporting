# Troubleshooting

## TOC

1. Mount and style issues
2. Snapshot issues
3. Excel export issues
4. Integrations issues
5. Data and contract issues

## 1) Mount and style issues

### Symptom: component renders but styles look broken

Check:

- Ensure `import 'cm-reporting/styles.css'` exists.
- Ensure styles are imported once and not shadowed by reset overrides.

Action:

- Move style import to app entry or feature shell.
- Re-check global CSS specificity conflicts.

### Symptom: peer dependency warnings at install/runtime

Check:

- `react/react-dom`, `antd`, `@ant-design/icons` versions.

Action:

- Align to package peer ranges before debugging business code.

## 2) Snapshot issues

### Symptom: `setSnapshot` appears ineffective

Check:

- Snapshot `templateType/versionId` matches current component props.

Action:

- Route or remount with matching template/version first, then call `setSnapshot`.

### Symptom: parse errors when loading JSON

Check:

- Input structure and field types.

Action:

- Always parse via `parseSnapshot(JSON.parse(raw))`.
- Reject invalid input and keep previous state.

## 3) Excel export issues

### Symptom: export throws before generating Blob

Check:

- Template fetch URL validity.
- `res.ok` and binary response type.

Action:

- Add fetch status guard.
- Verify template file exists in runtime deployment.

### Symptom: exported file opens but data missing

Check:

- Snapshot source (latest vs stale state).
- Template/version mismatch.

Action:

- Export immediately from `ref.getSnapshot()` or current ref context.
- Validate template matrix mapping.

### Symptom: workbook corrupted or unusable

Check:

- Wrong file served (HTML/JSON instead of xlsx).

Action:

- Verify response headers and byte content.
- Disallow non-xlsx fallback responses in asset service.

## 4) Integrations issues

### Symptom: external picker returns but table not updated

Check:

- Callback return type shape.

Action:

- Return `{ items: [...] }` instead of raw arrays.
- Ensure item fields map to corresponding row schema.

### Symptom: cancel path leaves UI stuck

Check:

- Promise resolver cleanup path.

Action:

- Resolve `null` on cancel and clear resolver refs.
- Close modal in both confirm and cancel paths.

## 5) Data and contract issues

### Symptom: locale/theme does not sync with host controls

Check:

- Controlled props wiring (`locale`, `onLocaleChange`, `theme`).

Action:

- Make host state single source of truth.

### Symptom: legacy JSON roundtrip drift

Check:

- Whether roundtrip context `ctx` is persisted.

Action:

- Use `toExternal(snapshot, ctx)` for roundtrip fidelity.
- Use `toExternalLoose(snapshot)` only for compatibility export.
