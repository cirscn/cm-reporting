import { AMRT_VERSION_IDS } from '@core/registry/templates/amrt/manifest'
import { CMRT_VERSION_IDS } from '@core/registry/templates/cmrt/manifest'
import { CRT_VERSION_IDS } from '@core/registry/templates/crt/manifest'
import { EMRT_VERSION_IDS } from '@core/registry/templates/emrt/manifest'
import { describe, expect, test } from 'vitest'

import { EXCEL_TEMPLATE_ANCHORS } from './excelMappings.generated'

describe('excel mapping coverage', () => {
  test('covers all manifest versions', () => {
    CMRT_VERSION_IDS.forEach((id) => expect(EXCEL_TEMPLATE_ANCHORS.cmrt[id]).toBeTruthy())
    EMRT_VERSION_IDS.forEach((id) => expect(EXCEL_TEMPLATE_ANCHORS.emrt[id]).toBeTruthy())
    CRT_VERSION_IDS.forEach((id) => expect(EXCEL_TEMPLATE_ANCHORS.crt[id]).toBeTruthy())
    AMRT_VERSION_IDS.forEach((id) => expect(EXCEL_TEMPLATE_ANCHORS.amrt[id]).toBeTruthy())
  })
})
