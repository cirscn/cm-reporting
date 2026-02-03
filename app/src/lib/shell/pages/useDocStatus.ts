/**
 * @file app/pages/useDocStatus.ts
 * @description 页面组件。
 */
// 说明：页面组件
import type { I18nKey } from '@core/i18n'
import type { TemplateVersionDef } from '@core/registry/types'
import { type DocStatusData } from '@core/rules/docStatus'
import { getDisplayMinerals } from '@core/template/minerals'
import { useTemplateDerived, useTemplateState } from '@shell/store'
import { useT } from '@ui/i18n/useT'
import { compact } from 'lodash-es'

import type { DocSectionKey } from './docTypes'

/**
 * 导出类型：DocStatusTone。
 */
export type DocStatusTone = 'info' | 'success' | 'warning'

/**
 * 导出接口类型：DocStatus。
 */
export interface DocStatus {
  tone: DocStatusTone
  text: string
}

type StatusMapEntry = {
  tone: DocStatusTone
  key: I18nKey
  withMetalsKey?: I18nKey
}

/** DocStatus 类型到展示文案的映射表。 */
const STATUS_TEXT_MAP: Record<string, StatusMapEntry> = {
  productListRequired: { tone: 'success', key: 'docStatus.productListRequired' },
  productListNotRequired: { tone: 'info', key: 'docStatus.productListNotRequired' },
  productListUnknown: { tone: 'warning', key: 'docStatus.productListUnknown' },
  smelterListUnknown: { tone: 'warning', key: 'docStatus.smelterListUnknown' },
  smelterListNotRequired: { tone: 'info', key: 'docStatus.smelterListNotRequired' },
  smelterListPending: { tone: 'warning', key: 'docStatus.smelterListPending' },
  smelterListRequired: {
    tone: 'success',
    key: 'docStatus.smelterListRequired',
    withMetalsKey: 'docStatus.smelterListRequiredWithMetals',
  },
  mineListAvailable: { tone: 'info', key: 'docStatus.mineListAvailable' },
  mineListNotAvailable: { tone: 'info', key: 'docStatus.mineListNotAvailable' },
}

/** 计算文档章节状态提示（产品/冶炼厂/矿山）。 */
export function useDocStatus(section: DocSectionKey): DocStatus | null {
  const { meta, form } = useTemplateState()
  const { versionDef } = meta
  const { selectedMinerals, customMinerals } = form
  const { docStatusBySection } = useTemplateDerived()
  const { t } = useT()
  /** 规则引擎输出的章节状态（按 section 分类）。 */
  const statusBySection = docStatusBySection

  if (section === 'productList') {
    return resolveStatus(statusBySection.productList, t)
  }

  if (section === 'smelterList') {
    return resolveStatus(
      statusBySection.smelterList,
      t,
      versionDef,
      selectedMinerals,
      customMinerals
    )
  }

  if (section === 'mineList') {
    return resolveStatus(statusBySection.mineList, t)
  }

  return null
}

/** 将规则状态映射为展示文案与语气。 */
function resolveStatus(
  status: DocStatusData,
  t: (key: I18nKey, options?: Record<string, unknown>) => string,
  versionDef?: TemplateVersionDef,
  selectedMinerals: string[] = [],
  customMinerals: string[] = []
): DocStatus {
  const entry = STATUS_TEXT_MAP[status.type]
  if (!entry) {
    return { tone: 'info', text: t('docStatus.productListNotRequired') }
  }

  let key = entry.key
  const params: Record<string, unknown> = {}

  if (status.type === 'smelterListPending') {
    const metalLabels = versionDef
      ? getMetalLabels(
          versionDef,
          selectedMinerals,
          customMinerals,
          status.metals ?? [],
          t
        )
      : []
    params.metals = metalLabels.join(', ')
    params.questions = status.questions ?? 'Q1/Q2'
  }

  if (status.type === 'smelterListRequired') {
    const metalLabels = versionDef
      ? getMetalLabels(
          versionDef,
          selectedMinerals,
          customMinerals,
          status.metals ?? [],
          t
        )
      : []
    if (metalLabels.length > 0 && entry.withMetalsKey) {
      key = entry.withMetalsKey
      params.metals = metalLabels.join(', ')
    }
  }

  return { tone: entry.tone, text: t(key, params) }
}

/** 解析矿产 key -> 展示 label（优先自定义矿产名）。 */
function getMetalLabels(
  versionDef: TemplateVersionDef,
  selectedMinerals: string[],
  customMinerals: string[],
  keys: string[],
  t: (key: I18nKey) => string
): string[] {
  const displayMinerals = getDisplayMinerals(versionDef, selectedMinerals, customMinerals)
  const labelByKey = new Map(
    displayMinerals.map((mineral) => [
      mineral.key,
      mineral.label ?? t(mineral.labelKey),
    ])
  )
  return compact(keys.map((key) => labelByKey.get(key)))
}
