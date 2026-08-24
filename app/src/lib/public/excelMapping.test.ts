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

  test('maps AMRT 1.31 declaration question anchors', () => {
    expect(EXCEL_TEMPLATE_ANCHORS.amrt['1.31'].amrtQ1Row).toBe(30)
    expect(EXCEL_TEMPLATE_ANCHORS.amrt['1.31'].amrtQ2Row).toBe(42)
  })

  test.each([
    {
      name: 'CMRT 6.6 / 6.6.1',
      branded: EXCEL_TEMPLATE_ANCHORS.cmrt['6.6'],
      unbranded: EXCEL_TEMPLATE_ANCHORS.cmrt['6.6.1'],
    },
    {
      name: 'EMRT 2.11 / 2.11.1',
      branded: EXCEL_TEMPLATE_ANCHORS.emrt['2.11'],
      unbranded: EXCEL_TEMPLATE_ANCHORS.emrt['2.11.1'],
    },
    {
      name: 'AMRT 1.31 / 1.31.1',
      branded: EXCEL_TEMPLATE_ANCHORS.amrt['1.31'],
      unbranded: EXCEL_TEMPLATE_ANCHORS.amrt['1.31.1'],
    },
  ])(
    'keeps $name declaration anchors structurally identical',
    ({ branded, unbranded }) => {
      expect(unbranded).toEqual(branded)
    }
  )
})
