import type { I18nKey, Locale } from '@core/i18n'

type Translate = (key: I18nKey, options?: Record<string, unknown>) => string

export type MineColumnId =
  | 'metal'
  | 'smelterName'
  | 'mineName'
  | 'mineId'
  | 'mineIdSource'
  | 'mineCountry'
  | 'mineStreet'
  | 'mineCity'
  | 'mineProvince'
  | 'mineContactName'
  | 'mineContactEmail'
  | 'proposedNextSteps'
  | 'comments'

interface MineHeaderProfile {
  columns: MineColumnId[]
  labels: Record<MineColumnId, string>
}

const MINE_COLUMNS: MineColumnId[] = [
  'metal',
  'smelterName',
  'mineName',
  'mineId',
  'mineIdSource',
  'mineCountry',
  'mineStreet',
  'mineCity',
  'mineProvince',
  'mineContactName',
  'mineContactEmail',
  'proposedNextSteps',
  'comments',
]

function buildFallbackLabels(t: Translate): Record<MineColumnId, string> {
  return {
    metal: t('tables.metal'),
    smelterName: t('tables.mineSmelterName'),
    mineName: t('tables.mineName'),
    mineId: t('tables.mineId'),
    mineIdSource: t('tables.mineSourceId'),
    mineCountry: t('tables.mineCountry'),
    mineStreet: t('tables.street'),
    mineCity: t('tables.city'),
    mineProvince: t('tables.stateProvince'),
    mineContactName: t('tables.contactName'),
    mineContactEmail: t('tables.contactEmail'),
    proposedNextSteps: t('tables.proposedNextSteps'),
    comments: t('tables.comments'),
  }
}

function buildZhLabels(): Record<MineColumnId, string> {
  return {
    metal: '金属',
    smelterName: '从该矿厂采购的冶炼厂的名称',
    mineName: '矿厂(矿场)名称',
    mineId: '矿厂识别（例如《CID》）',
    mineIdSource: '冶炼厂出处识别号',
    mineCountry: '矿厂所在国家或地区',
    mineStreet: '矿厂所在街道',
    mineCity: '矿厂所在城市',
    mineProvince: '矿厂地址：州/省',
    mineContactName: '矿厂联系人',
    mineContactEmail: '矿厂联系人电子邮件',
    proposedNextSteps: '建议的后续步骤',
    comments: '注释',
  }
}

export function getMineHeaderProfile(options: {
  locale: Locale
  t: Translate
}): MineHeaderProfile {
  if (options.locale === 'zh-CN') {
    return {
      columns: MINE_COLUMNS,
      labels: buildZhLabels(),
    }
  }

  return {
    columns: MINE_COLUMNS,
    labels: buildFallbackLabels(options.t),
  }
}
