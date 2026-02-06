#!/usr/bin/env node

const args = process.argv.slice(2)
const useJson = args.includes('--json')
const positional = args.filter((arg) => arg !== '--json')

if (positional.length < 2) {
  console.error(
    'Usage: node skills/cm-reporting-integration/scripts/resolve-template-path.mjs <templateType> <versionId> [--json]',
  )
  process.exit(1)
}

const templateType = String(positional[0]).toLowerCase()
const versionId = String(positional[1])

const matrix = {
  cmrt: {
    dir: 'CMRT',
    versions: ['6.01', '6.1', '6.22', '6.31', '6.4', '6.5'],
    prefix: 'RMI_CMRT_',
  },
  emrt: {
    dir: 'EMRT',
    versions: ['1.1', '1.11', '1.2', '1.3', '2.0', '2.1'],
    prefix: 'RMI_EMRT_',
  },
  crt: {
    dir: 'CRT',
    versions: ['2.2', '2.21'],
    prefix: 'RMI_CRT_',
  },
  amrt: {
    dir: 'AMRT',
    versions: ['1.1', '1.2', '1.3'],
    prefix: 'RMI_AMRT_',
  },
}

if (!Object.prototype.hasOwnProperty.call(matrix, templateType)) {
  console.error(`Unsupported templateType: ${templateType}`)
  process.exit(2)
}

const entry = matrix[templateType]
if (!entry.versions.includes(versionId)) {
  console.error(`Unsupported versionId for ${templateType}: ${versionId}`)
  process.exit(3)
}

const filename = `${entry.prefix}${versionId}.xlsx`
const relativePath = `${entry.dir}/${filename}`
const exportPath = `cm-reporting/templates/${relativePath}`

if (useJson) {
  console.log(
    JSON.stringify(
      {
        templateType,
        versionId,
        dir: entry.dir,
        filename,
        relativePath,
        exportPath,
      },
      null,
      2,
    ),
  )
} else {
  console.log(exportPath)
}
