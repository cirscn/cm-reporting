#!/usr/bin/env node
/**
 * @file validate-templates.js
 * @description Validates that all template versions defined in manifest files
 *              have corresponding Excel template files.
 *
 * This script ensures consistency between code-defined versions and actual template files.
 * It should be run as part of CI to prevent releasing with missing templates.
 *
 * Exit codes:
 *   0 - All templates found
 *   1 - One or more templates missing
 */

import { readFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APP_ROOT = resolve(__dirname, '..')

// Template configurations
const TEMPLATES = [
  {
    type: 'CMRT',
    manifestPath: 'src/lib/core/registry/templates/cmrt/manifest.ts',
    versionArrayName: 'CMRT_VERSION_IDS',
  },
  {
    type: 'EMRT',
    manifestPath: 'src/lib/core/registry/templates/emrt/manifest.ts',
    versionArrayName: 'EMRT_VERSION_IDS',
  },
  {
    type: 'CRT',
    manifestPath: 'src/lib/core/registry/templates/crt/manifest.ts',
    versionArrayName: 'CRT_VERSION_IDS',
  },
  {
    type: 'AMRT',
    manifestPath: 'src/lib/core/registry/templates/amrt/manifest.ts',
    versionArrayName: 'AMRT_VERSION_IDS',
  },
]

/**
 * Extract version IDs from a manifest.ts file.
 * Looks for patterns like: export const CMRT_VERSION_IDS = ['6.01', '6.1', ...] as const
 */
function extractVersions(manifestContent, arrayName) {
  // Match the array definition: const XXX_VERSION_IDS = ['a', 'b', 'c'] as const
  const regex = new RegExp(
    `${arrayName}\\s*=\\s*\\[([^\\]]+)\\]`,
    's'
  )
  const match = manifestContent.match(regex)
  if (!match) {
    return []
  }

  // Extract individual version strings
  const arrayContent = match[1]
  const versionRegex = /['"]([^'"]+)['"]/g
  const versions = []
  let versionMatch
  while ((versionMatch = versionRegex.exec(arrayContent)) !== null) {
    versions.push(versionMatch[1])
  }
  return versions
}

/**
 * Get the expected template file path for a given type and version.
 * Format: templates/{TYPE}/RMI_{TYPE}_{VERSION}.xlsx
 */
function getTemplateFilePath(type, version) {
  return join(APP_ROOT, 'templates', type, `RMI_${type}_${version}.xlsx`)
}

/**
 * Validate all templates and return results.
 */
function validateTemplates() {
  const results = {
    passed: [],
    failed: [],
  }

  for (const template of TEMPLATES) {
    const manifestPath = join(APP_ROOT, template.manifestPath)

    if (!existsSync(manifestPath)) {
      results.failed.push({
        type: template.type,
        error: `Manifest file not found: ${template.manifestPath}`,
      })
      continue
    }

    const manifestContent = readFileSync(manifestPath, 'utf-8')
    const versions = extractVersions(manifestContent, template.versionArrayName)

    if (versions.length === 0) {
      results.failed.push({
        type: template.type,
        error: `Could not extract versions from manifest (looking for ${template.versionArrayName})`,
      })
      continue
    }

    const missing = []
    const found = []

    for (const version of versions) {
      const filePath = getTemplateFilePath(template.type, version)
      if (existsSync(filePath)) {
        found.push(version)
      } else {
        missing.push({
          version,
          expectedPath: `templates/${template.type}/RMI_${template.type}_${version}.xlsx`,
        })
      }
    }

    if (missing.length > 0) {
      results.failed.push({
        type: template.type,
        versions: versions.length,
        found: found.length,
        missing,
      })
    } else {
      results.passed.push({
        type: template.type,
        versions: versions.length,
      })
    }
  }

  return results
}

/**
 * Print validation results and return exit code.
 */
function printResults(results) {
  console.log('\nValidating templates...\n')

  // Print passed templates
  for (const item of results.passed) {
    console.log(`✓ ${item.type}: ${item.versions} versions, all templates found`)
  }

  // Print failed templates
  for (const item of results.failed) {
    if (item.error) {
      console.log(`✗ ${item.type}: ${item.error}`)
    } else {
      console.log(`✗ ${item.type}: ${item.found}/${item.versions} templates found`)
      for (const m of item.missing) {
        console.log(`    Missing: ${m.expectedPath}`)
      }
    }
  }

  console.log('')

  if (results.failed.length > 0) {
    console.log('Error: Template validation failed')
    console.log('Please ensure all manifest-defined versions have corresponding template files.')
    return 1
  }

  console.log('All template validations passed.')
  return 0
}

// Main execution
const results = validateTemplates()
const exitCode = printResults(results)
process.exit(exitCode)
