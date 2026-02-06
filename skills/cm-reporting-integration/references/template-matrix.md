# Template Matrix

## TOC

1. Naming convention
2. Full mapping table
3. Recommended path resolution
4. Script usage

## 1) Naming convention

Template filenames follow:

- CMRT: `RMI_CMRT_<version>.xlsx`
- EMRT: `RMI_EMRT_<version>.xlsx`
- CRT: `RMI_CRT_<version>.xlsx`
- AMRT: `RMI_AMRT_<version>.xlsx`

Package export path base:

- `cm-reporting/templates/<TYPE>/<FILE>.xlsx`

## 2) Full mapping table

| templateType | versionId | dir | filename |
|---|---|---|---|
| `cmrt` | `6.01` | `CMRT` | `RMI_CMRT_6.01.xlsx` |
| `cmrt` | `6.1` | `CMRT` | `RMI_CMRT_6.1.xlsx` |
| `cmrt` | `6.22` | `CMRT` | `RMI_CMRT_6.22.xlsx` |
| `cmrt` | `6.31` | `CMRT` | `RMI_CMRT_6.31.xlsx` |
| `cmrt` | `6.4` | `CMRT` | `RMI_CMRT_6.4.xlsx` |
| `cmrt` | `6.5` | `CMRT` | `RMI_CMRT_6.5.xlsx` |
| `emrt` | `1.1` | `EMRT` | `RMI_EMRT_1.1.xlsx` |
| `emrt` | `1.11` | `EMRT` | `RMI_EMRT_1.11.xlsx` |
| `emrt` | `1.2` | `EMRT` | `RMI_EMRT_1.2.xlsx` |
| `emrt` | `1.3` | `EMRT` | `RMI_EMRT_1.3.xlsx` |
| `emrt` | `2.0` | `EMRT` | `RMI_EMRT_2.0.xlsx` |
| `emrt` | `2.1` | `EMRT` | `RMI_EMRT_2.1.xlsx` |
| `crt` | `2.2` | `CRT` | `RMI_CRT_2.2.xlsx` |
| `crt` | `2.21` | `CRT` | `RMI_CRT_2.21.xlsx` |
| `amrt` | `1.1` | `AMRT` | `RMI_AMRT_1.1.xlsx` |
| `amrt` | `1.2` | `AMRT` | `RMI_AMRT_1.2.xlsx` |
| `amrt` | `1.3` | `AMRT` | `RMI_AMRT_1.3.xlsx` |

## 3) Recommended path resolution

Preferred runtime key format:

- `${templateType}:${versionId}`

Host strategy example:

```ts
const key = `${templateType}:${versionId}`
const url = templateUrlMap[key] // CDN/public URL from host config
```

Keep mapping centralized and version-controlled in host app.

## 4) Script usage

Use bundled helper script for deterministic mapping:

```bash
node skills/cm-reporting-integration/scripts/resolve-template-path.mjs cmrt 6.5
node skills/cm-reporting-integration/scripts/resolve-template-path.mjs emrt 2.1 --json
```
