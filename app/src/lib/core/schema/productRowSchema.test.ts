import { getVersionDef } from '@core/registry'
import { describe, expect, test } from 'vitest'

import { buildProductRowSchema } from './index'

describe('schema - product row', () => {
  test('preserves requester fields even when template config hides requester columns (CMRT 6.5)', () => {
    const versionDef = getVersionDef('cmrt', '6.5')
    expect(versionDef.productList.hasRequesterColumns).toBe(false)

    const schema = buildProductRowSchema(versionDef)
    const parsed = schema.parse({
      productNumber: 'PN',
      productName: 'Name',
      requesterNumber: 'REQ-PN',
      requesterName: 'REQ-Name',
      comments: 'C',
    })

    expect(parsed.requesterNumber).toBe('REQ-PN')
    expect(parsed.requesterName).toBe('REQ-Name')
  })
})
