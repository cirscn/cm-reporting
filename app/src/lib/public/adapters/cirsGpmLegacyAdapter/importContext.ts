import { createEmptyFormData } from '@core/template/formDefaults'
import { deepCloneJson } from '@core/template/strings'

import type { ImportContext } from './conversionTypes'
import type { ParsedCirsGpmLegacyReport } from './parse'
import { getCirsGpmLegacyPlan } from './planCache'
import type { CirsGpmLegacyRoundtripContext } from './types'

function createRoundtripContext(parsed: ParsedCirsGpmLegacyReport): CirsGpmLegacyRoundtripContext {
  return {
    templateType: parsed.templateType,
    versionId: parsed.versionId,
    original: deepCloneJson(parsed.legacy),
    companyFieldStates: new Map(),
    effectiveDate: {
      exists: false, originalValue: undefined, originalType: 'missing', derivedAuthorizationDate: '',
    },
    rangeQuestionIndexByKey: new Map(),
    rangeQuestionFieldStatesByIndex: new Map(),
    companyQuestionIndexByKey: new Map(),
    companyQuestionFieldStatesByIndex: new Map(),
    mineralLabelByKey: new Map(),
    smelterLegacyIndexByInternalId: new Map(),
    smelterFieldStatesByIndex: new Map(),
    smelterNameFallbackByIndex: new Map(),
    mineLegacyIndexByInternalId: new Map(),
    mineFieldStatesByIndex: new Map(),
    productLegacyIndexByInternalId: new Map(),
    productFieldStatesByIndex: new Map(),
    productLegacyKeyByInternalKeyByIndex: new Map(),
    amrtReasonIndexByInternalId: new Map(),
    amrtReasonFieldStatesByIndex: new Map(),
  }
}

export function createImportContext(parsed: ParsedCirsGpmLegacyReport): ImportContext {
  const plan = getCirsGpmLegacyPlan(parsed.templateType, parsed.versionId)
  return {
    legacy: parsed.legacy,
    plan,
    data: createEmptyFormData(plan.versionDef),
    ctx: createRoundtripContext(parsed),
    mineralLabelToKey: new Map(),
  }
}
