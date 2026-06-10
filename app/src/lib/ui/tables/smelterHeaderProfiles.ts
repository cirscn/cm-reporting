import type { I18nKey, Locale } from '@core/i18n'
import type { SmelterListConfig, TemplateType } from '@core/registry/types'

type Translate = (key: I18nKey, options?: Record<string, unknown>) => string

export type SmelterColumnId =
  | 'smelterNumberInput'
  | 'metal'
  | 'smelterLookup'
  | 'smelterName'
  | 'smelterCountry'
  | 'smelterIdentification'
  | 'sourceId'
  | 'smelterStreet'
  | 'smelterCity'
  | 'smelterState'
  | 'smelterContactName'
  | 'smelterContactEmail'
  | 'proposedNextSteps'
  | 'mineName'
  | 'mineCountry'
  | 'recycledScrap'
  | 'comments'

type SmelterHeaderVariant =
  | 'cmrt'
  | 'crt-emrt-v1'
  | 'emrt-v2'
  | 'amrt-v11-v12'
  | 'amrt-v13'

type SmelterHeaderRequiredMap = Partial<Record<SmelterColumnId, boolean>>

interface SmelterHeaderProfile {
  columns: SmelterColumnId[]
  labels: Record<SmelterColumnId, string>
  required: SmelterHeaderRequiredMap
}

const CMRT_AND_V2_COLUMNS: SmelterColumnId[] = [
  'smelterNumberInput',
  'metal',
  'smelterLookup',
  'smelterName',
  'smelterCountry',
  'smelterIdentification',
  'sourceId',
  'smelterStreet',
  'smelterCity',
  'smelterState',
  'smelterContactName',
  'smelterContactEmail',
  'proposedNextSteps',
  'mineName',
  'mineCountry',
  'recycledScrap',
  'comments',
]

const AMRT_V11_V12_COLUMNS: SmelterColumnId[] = [
  'metal',
  'smelterName',
  'smelterCountry',
  'smelterIdentification',
  'sourceId',
  'smelterStreet',
  'smelterCity',
  'smelterState',
  'smelterContactName',
  'smelterContactEmail',
  'proposedNextSteps',
  'mineName',
  'mineCountry',
  'recycledScrap',
  'comments',
]

function fallbackLabels(t: Translate): Record<SmelterColumnId, string> {
  return {
    smelterNumberInput: t('tables.smelterId'),
    metal: t('tables.metal'),
    smelterLookup: t('tables.smelterLookup'),
    smelterName: t('tables.smelterName'),
    smelterCountry: t('tables.country'),
    smelterIdentification: t('tables.smelterIdentification'),
    sourceId: t('tables.sourceId'),
    smelterStreet: t('tables.street'),
    smelterCity: t('tables.city'),
    smelterState: t('tables.stateProvince'),
    smelterContactName: t('tables.contactName'),
    smelterContactEmail: t('tables.contactEmail'),
    proposedNextSteps: t('tables.proposedNextSteps'),
    mineName: t('tables.mineName'),
    mineCountry: t('tables.mineCountry'),
    recycledScrap: t('tables.recycledScrap'),
    comments: t('tables.comments'),
  }
}

function resolveVariant(
  templateType: TemplateType,
  versionId: string,
  config?: SmelterListConfig,
): SmelterHeaderVariant {
  if (templateType === 'cmrt') return 'cmrt'
  if (templateType === 'crt') return 'crt-emrt-v1'
  if (templateType === 'emrt') {
    return versionId.startsWith('2.') ? 'emrt-v2' : 'crt-emrt-v1'
  }
  if (config?.hasLookup || config?.hasIdColumn) return 'amrt-v13'
  return versionId === '1.3' ? 'amrt-v13' : 'amrt-v11-v12'
}

function buildRequiredMap(variant: SmelterHeaderVariant): SmelterHeaderRequiredMap {
  if (variant === 'cmrt' || variant === 'crt-emrt-v1') {
    return {
      metal: true,
      smelterLookup: true,
      smelterCountry: true,
    }
  }

  if (variant === 'emrt-v2') {
    return {
      metal: true,
      smelterLookup: true,
      smelterName: true,
      smelterCountry: true,
    }
  }

  if (variant === 'amrt-v11-v12') {
    return {
      metal: true,
      smelterName: true,
      smelterCountry: true,
    }
  }

  return {
    metal: true,
    smelterLookup: true,
    smelterName: true,
    smelterCountry: true,
  }
}

function buildZhLabels(variant: SmelterHeaderVariant): Record<SmelterColumnId, string> {
  const common = {
    smelterNumberInput: '冶炼厂识别号码输入列',
    smelterIdentification: '冶炼厂识别',
    sourceId: '冶炼厂出处识别号',
    smelterStreet:
      variant === 'cmrt' || variant.startsWith('amrt')
        ? '冶炼厂所在街道'
        : '冶炼工厂地址（街道）',
    smelterCity:
      variant === 'cmrt' || variant.startsWith('amrt')
        ? '冶炼厂所在城市'
        : '冶炼工厂地址（城市）',
    smelterState:
      variant === 'cmrt' || variant.startsWith('amrt')
        ? '冶炼厂地址：州/省'
        : '冶炼工厂地址（州/省）',
    smelterContactName:
      variant === 'cmrt' || variant.startsWith('amrt') ? '冶炼厂联系人' : '冶炼厂联系名称',
    smelterContactEmail:
      variant === 'cmrt' || variant.startsWith('amrt')
        ? '冶炼厂联系人电子邮件'
        : '冶炼厂联系电邮地址',
    proposedNextSteps: '建议的后续步骤',
    comments: '注释',
  } satisfies Partial<Record<SmelterColumnId, string>>

  if (variant === 'cmrt') {
    return {
      ...fallbackLabels((key: I18nKey) => key),
      ...common,
      metal: '金属',
      smelterLookup: '冶炼厂查找',
      smelterName: '冶炼厂名称',
      smelterCountry: '冶炼厂所在国家或地区',
      mineName: '填写矿井名称，或如果所用矿产来自于回收料和报废料，请填写“回收”或“报废”。',
      mineCountry:
        '填写矿井所在国家或地区，或如果所用矿产来自于回收料和报废料，请填写“回收”或“报废”。',
      recycledScrap: '冶炼厂的被冶炼物料是否 100% 来自于回收料或报废料？',
    }
  }

  if (variant === 'crt-emrt-v1') {
    return {
      ...fallbackLabels((key: I18nKey) => key),
      ...common,
      metal: '金属 l',
      smelterLookup: '冶炼厂查找',
      smelterName: '冶炼厂名称',
      smelterCountry: '冶炼工厂地址（国家）',
      mineName: '填所有矿井名称，或如所用矿产来自回收料和报废料时请填“回收”或“报废”。',
      mineCountry: '填所有矿井所在的国家名称，或如所用矿产来自回收料和报废料时请填“回收”或“报废”。',
      recycledScrap: '冶炼厂的被冶炼物料100%完全来自回收料或报废料吗？',
    }
  }

  if (variant === 'emrt-v2') {
    return {
      ...fallbackLabels((key: I18nKey) => key),
      ...common,
      metal: '金属',
      smelterLookup: '冶炼厂查找',
      smelterName: '冶炼厂名称',
      smelterCountry: '冶炼工厂地址（国家）',
      mineName: '填所有矿井名称，或如所用矿产来自回收料和报废料时请填“回收”或“报废”。',
      mineCountry: '填所有矿井所在的国家名称，或如所用矿产来自回收料和报废料时请填“回收”或“报废”。',
      recycledScrap: '冶炼厂的被冶炼物料100%完全来自回收料或报废料吗？',
    }
  }

  if (variant === 'amrt-v11-v12') {
    return {
      ...fallbackLabels((key: I18nKey) => key),
      ...common,
      metal: '金属',
      smelterLookup: '冶炼厂查找',
      smelterName: '冶炼厂名称',
      smelterCountry: '冶炼厂所在国家或地区',
      mineName: '填写矿井名称，或如果所用矿产来自于回收料和报废料，请填写“回收”或“报废”。',
      mineCountry:
        '填写矿井所在国家或地区，或如果所用矿产来自于回收料和报废料，请填写“回收”或“报废”。',
      recycledScrap: '冶炼厂的被冶炼物料是否 100% 来自于回收料或报废料？',
    }
  }

  return {
    ...fallbackLabels((key: I18nKey) => key),
    ...common,
    metal: '金属',
    smelterLookup: '冶炼厂名称',
    smelterName: '冶炼厂名称',
    smelterCountry: '冶炼厂所在国家或地区',
    mineName: '填写矿井名称，或如果所用矿产来自于回收料和报废料，请填写“回收”或“报废”。',
    mineCountry:
      '填写矿井所在国家或地区，或如果所用矿产来自于回收料和报废料，请填写“回收”或“报废”。',
    recycledScrap: '冶炼厂的被冶炼物料是否 100% 来自于回收料或报废料？',
  }
}

function buildFallbackProfile(
  variant: SmelterHeaderVariant,
  t: Translate,
): SmelterHeaderProfile {
  const columns = variant === 'amrt-v11-v12' ? AMRT_V11_V12_COLUMNS : CMRT_AND_V2_COLUMNS

  return {
    columns,
    labels: fallbackLabels(t),
    required: buildRequiredMap(variant),
  }
}

export function getSmelterHeaderProfile(options: {
  templateType: TemplateType
  versionId: string
  locale: Locale
  t: Translate
  config?: SmelterListConfig
}): SmelterHeaderProfile {
  const variant = resolveVariant(options.templateType, options.versionId, options.config)

  if (options.locale !== 'zh-CN') {
    return buildFallbackProfile(variant, options.t)
  }

  if (variant === 'amrt-v11-v12') {
    return {
      columns: AMRT_V11_V12_COLUMNS,
      labels: buildZhLabels(variant),
      required: buildRequiredMap(variant),
    }
  }

  return {
    columns: CMRT_AND_V2_COLUMNS,
    labels: buildZhLabels(variant),
    required: buildRequiredMap(variant),
  }
}
