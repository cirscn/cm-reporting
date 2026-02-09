---
name: cm-reporting-integration
description: Integrate and operationalize the `cm-reporting` library in host React applications, including dependency setup, template delivery, component wiring, Snapshot import/export, Excel export, integrations callbacks, and legacy adapter flows. Use when users need to adopt this library, design production integration architecture, implement external pickers, troubleshoot runtime/export issues, or standardize delivery checklists.
---

# CM Reporting Integration

Use this skill to deliver production-grade `cm-reporting` integrations, not only demos.

## Fast Routing

Route requests first, then load the minimum references.

- New host integration from zero → read `references/integration-snippets.md`.
- API/contract clarification → read `references/contracts.md`.
- Template/version/file lookup → read `references/template-matrix.md`.
- Runtime/export/restore failures → read `references/troubleshooting.md`.
- Template file path lookup automation → run `scripts/resolve-template-path.mjs`.

## Non-Negotiable Constraints

Apply these rules in every solution:

- Keep `templateType` and `versionId` strictly matched across render, restore, and export.
- Import `cm-reporting/styles.css` exactly once in host runtime.
- Provide official template `.xlsx` as `ArrayBuffer` when calling Excel export APIs.
- Treat Snapshot as full-state contract (`schemaVersion/templateType/versionId/data`).
- Return integrations callback result in `{ items: [...] } | null | undefined` shape only.
- Respect package license (`PolyForm-Noncommercial-1.0.0`) in usage recommendations.
- For `readOnly` behavior, treat it as **view-only contract** (not just disabled inputs):
  - hide checker page and checker entry in workflow;
  - hide global required/error hint banner and bottom prev/next actions;
  - hide table/form editing affordances (add/delete/batch/external pick/edit links), not merely `disabled`;
  - suppress required yellow highlight when fields are disabled/read-only.
- In controlled routing mode, if readOnly flow remaps page (e.g. `checker` fallback), always sync parent state via navigation callback to avoid route/UI drift.
- Never override host-level `ConfigProvider` disabled state with local false. Effective disabled rule must be `parentDisabled || readOnly`.

## Standard Delivery Workflow

Follow this order unless user asks otherwise.

1. Confirm host environment and peer dependency ranges.
2. Choose template delivery strategy (static/CDN/internal service).
3. Implement baseline `CMReporting` mounting with required props.
4. Add host orchestration via `CMReportingRef` (`get/set/export/validate`).
5. Add Snapshot persistence and recovery path.
6. Add Excel export action with tested template fetch path.
7. Add integrations callbacks if host needs external pickers.
8. Add legacy adapter flow only when interoperability is required.
9. Run final acceptance checklist from references before handoff.

## Output Requirements

When producing integration code or guidance, always include:

- Explicit dependency and peer dependency install commands.
- Concrete `templateType` + `versionId` examples.
- Snapshot save + restore behavior definition.
- Excel export data flow (template source → ArrayBuffer → Blob download).
- Failure fallback behavior (cancel flow, null return, retry boundaries).
- Explicit readOnly behavior matrix (what is hidden vs what remains visible).

## Anti-Patterns to Avoid

- Do not generate workbook from scratch for export.
- Do not assume template files exist without mapping verification.
- Do not mix incompatible template/version pairs.
- Do not return raw arrays from integrations callbacks; wrap in `{ items }`.
- Do not advise manual mutation of package internals or private APIs.

## References

Load only what the request needs:

- `references/integration-snippets.md`: full quickstart + production recipes.
- `references/contracts.md`: public API and callback contract tables.
- `references/template-matrix.md`: complete template/version/file mapping.
- `references/troubleshooting.md`: symptom-to-action playbook.
