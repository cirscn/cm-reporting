/**
 * @file core/viewmodels/pages.ts
 * @description 页面派生数据的纯函数集合。
 */

// 说明：页面只负责渲染，这里的函数负责“从模板/表单派生展示数据”。

import { compact, uniq } from 'lodash-es'

import { getCountryOptions } from '../data/countries'
import type { TemplateType, TemplateVersionDef } from '../registry/types'
import { getCustomMineralLabels, getDisplayMinerals, getMetalsForSource } from '../template/minerals'
import { isSmelterNotIdentified, isSmelterNotListed } from '../transform'
import type { SmelterRow } from '../types/tableRows'

/** Declaration 页面派生数据。 */
export function buildDeclarationViewModel({
  versionDef,
  selectedMinerals,
  customMinerals,
}: {
  versionDef: TemplateVersionDef
  selectedMinerals: string[]
  customMinerals: string[]
}) {
  const displayMinerals = getDisplayMinerals(
    versionDef,
    selectedMinerals,
    customMinerals
  )

  return {
    displayMinerals,
  }
}

/** Smelter List 页面派生数据。 */
export function buildSmelterListViewModel({
  templateType,
  versionDef,
  questionAnswers,
  selectedMinerals,
  customMinerals,
}: {
  templateType: TemplateType
  versionDef: TemplateVersionDef
  questionAnswers: Record<string, Record<string, string> | string>
  selectedMinerals?: string[]
  customMinerals?: string[]
}) {
  const labelOverrides = getCustomMineralLabels(
    versionDef,
    customMinerals ?? [],
    selectedMinerals ?? []
  )
  const availableMetals = getMetalsForSource(
    versionDef.smelterList.metalDropdownSource,
    versionDef,
    questionAnswers,
    { selectedMinerals, customMinerals }
  ).map((mineral) => ({ ...mineral, label: labelOverrides.get(mineral.key) }))
  const countryOptions = getCountryOptions(templateType)

  const showNotYetIdentifiedCountryHint =
    (templateType === 'emrt' && versionDef.version.id === '2.1') ||
    (templateType === 'amrt' && versionDef.version.id === '1.3')

  return {
    availableMetals,
    countryOptions,
    showNotYetIdentifiedCountryHint,
  }
}

/** Mine List 页面派生数据。 */
export function buildMineListViewModel({
  templateType,
  versionDef,
  questionAnswers,
  selectedMinerals,
  customMinerals,
  smelterList,
}: {
  templateType: TemplateType
  versionDef: TemplateVersionDef
  questionAnswers: Record<string, Record<string, string> | string>
  selectedMinerals?: string[]
  customMinerals?: string[]
  smelterList: SmelterRow[]
}) {
  const labelOverrides = getCustomMineralLabels(
    versionDef,
    customMinerals ?? [],
    selectedMinerals ?? []
  )
  const availableMetals = versionDef.mineList.available
    ? getMetalsForSource(
        versionDef.mineList.metalDropdownSource,
        versionDef,
        questionAnswers,
        { selectedMinerals, customMinerals }
      ).map((mineral) => ({ ...mineral, label: labelOverrides.get(mineral.key) }))
    : []
  const countryOptions = getCountryOptions(templateType)

  const smelterNames = compact<string>(
    smelterList.map((row) => {
      if (row.smelterName) return row.smelterName
      if (
        row.smelterLookup &&
        !isSmelterNotListed(row.smelterLookup) &&
        !isSmelterNotIdentified(row.smelterLookup)
      ) {
        return row.smelterLookup
      }
      return null
    })
  )
  const smelterOptions = uniq(smelterNames).map((value) => ({ value, label: value }))
  const smelterOptionsByMetal = (() => {
    const map = new Map<string, Set<string>>()
    smelterList.forEach((row) => {
      const metalKey = row.metal?.trim()
      if (!metalKey) return
      const name = row.smelterName
        ? row.smelterName
        : row.smelterLookup &&
            !isSmelterNotListed(row.smelterLookup) &&
            !isSmelterNotIdentified(row.smelterLookup)
          ? row.smelterLookup
          : ''
      if (!name) return
      const bucket = map.get(metalKey) ?? new Set<string>()
      bucket.add(name)
      map.set(metalKey, bucket)
    })
    return Object.fromEntries(
      Array.from(map.entries()).map(([metalKey, names]) => [
        metalKey,
        Array.from(names).map((value) => ({ value, label: value })),
      ])
    )
  })()

  return {
    availableMetals,
    countryOptions,
    smelterOptions,
    smelterOptionsByMetal,
  }
}
