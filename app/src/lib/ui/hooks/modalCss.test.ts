import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

const modalCss = readFileSync(resolve(process.cwd(), 'src/lib/modal.css'), 'utf8')

describe('scoped command modal css', () => {
  test('keeps command modals horizontally centered and top aligned', () => {
    expect(modalCss).toContain('.cm-reporting-modal-wrap')
    expect(modalCss).toContain('position: fixed')
    expect(modalCss).toContain('inset: 0')
    expect(modalCss).toContain('display: flex')
    expect(modalCss).toContain('align-items: flex-start')
    expect(modalCss).toContain('justify-content: center')
  })
})
