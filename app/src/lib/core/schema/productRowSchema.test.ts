import { getVersionDef } from '@core/registry'
import { describe, expect, test } from 'vitest'

import { buildProductRowSchema } from './index'

describe('schema - product row', () => {
  test('preserves requester fields even when template config hides requester columns (CMRT 6.5)', () => {
    const versionDef = getVersionDef('cmrt', '6.5')
    expect(versionDef.productList.hasRequesterColumns).toBe(false)

    const schema = buildProductRowSchema(versionDef)
    const parsed = schema.parse({
      partNumber: 'PN',
      partName: 'Name',
      requestPartNumber: 'REQ-PN',
      requestPartName: 'REQ-Name',
      remark: 'C',
    })

    expect(parsed.partNumber).toBe('PN')
    expect(parsed.partName).toBe('Name')
    expect(parsed.requestPartNumber).toBe('REQ-PN')
    expect(parsed.requestPartName).toBe('REQ-Name')
    expect(parsed.remark).toBe('C')
  })
})
