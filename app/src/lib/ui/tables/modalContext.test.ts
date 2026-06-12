import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, test } from 'vitest'

const TABLE_FILES = ['ProductListTable.tsx', 'SmelterListTable.tsx'] as const
const STATIC_MODAL_METHOD_PATTERN = /\bModal\.(info|warning|error|success|confirm)\b/

function readTableSource(fileName: string): string {
  return fs.readFileSync(path.resolve(__dirname, fileName), 'utf8')
}

describe('table modal context usage', () => {
  test.each(TABLE_FILES)('%s uses scoped modal instead of direct modal APIs', (fileName) => {
    const source = readTableSource(fileName)

    expect(source).toContain('useScopedModal()')
    expect(source).not.toContain('App.useApp()')
    expect(source).not.toMatch(STATIC_MODAL_METHOD_PATTERN)
  })
})
