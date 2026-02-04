import { getVersionDef } from '@core/registry'
import type { TemplateType, TemplateVersionDef } from '@core/registry/types'

export interface CirsGpmLegacyPlan {
  templateType: TemplateType
  versionId: string
  versionDef: TemplateVersionDef
  questionKeyByType: Map<number, string>
  mineralKeyByLabel: Map<string, string>
  preferredMineralLabelByKey: Map<string, string>
  legacyCompanyKeyByInternalKey: Map<string, string>
}

const cache = new Map<string, CirsGpmLegacyPlan>()

function cacheKey(templateType: TemplateType, versionId: string): string {
  return `${templateType}@${versionId}`
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function splitCamel(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
}

function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(' ')
}

function mineralCandidates(mineralKey: string): string[] {
  const spaced = splitCamel(mineralKey)
  return [
    mineralKey,
    spaced,
    toTitleCase(spaced),
  ]
}

const MINERAL_LABEL_OVERRIDES: Record<string, string> = {
  rareEarthElements: 'Rare Earth Elements',
  sodaAsh: 'Soda Ash',
}

function buildMineralMaps(versionDef: TemplateVersionDef) {
  const mineralKeyByLabel = new Map<string, string>()
  const preferredMineralLabelByKey = new Map<string, string>()

  for (const mineral of versionDef.mineralScope.minerals) {
    const key = mineral.key
    const preferred = MINERAL_LABEL_OVERRIDES[key] ?? toTitleCase(splitCamel(key))
    preferredMineralLabelByKey.set(key, preferred)

    for (const c of mineralCandidates(key)) {
      mineralKeyByLabel.set(normalize(c), key)
    }
    mineralKeyByLabel.set(normalize(preferred), key)
  }

  return { mineralKeyByLabel, preferredMineralLabelByKey }
}

function buildQuestionKeyByType(versionDef: TemplateVersionDef) {
  const questionKeyByType = new Map<number, string>()
  for (const question of versionDef.questions) {
    const match = /^Q(\d+)$/.exec(question.key)
    if (!match) continue
    const type = Number(match[1]!)
    if (!Number.isFinite(type)) continue
    questionKeyByType.set(type, question.key)
  }
  return questionKeyByType
}

function buildCompanyKeyMap(): Map<string, string> {
  return new Map<string, string>([
    ['companyName', 'companyName'],
    ['declarationScope', 'species'],
    ['scopeDescription', 'rangeDescription'],
    ['companyId', 'identify'],
    ['companyAuthId', 'authorization'],
    ['address', 'address'],
    ['contactName', 'contactName'],
    ['contactEmail', 'contactEmail'],
    ['contactPhone', 'contactPhone'],
    ['authorizerName', 'authorizerName'],
    ['authorizerTitle', 'authorizerJobTitle'],
    ['authorizerEmail', 'authorizerEmail'],
    ['authorizerPhone', 'authorizerPhone'],
    ['authorizationDate', 'effectiveDate'],
  ])
}

export function getCirsGpmLegacyPlan(templateType: TemplateType, versionId: string): CirsGpmLegacyPlan {
  const key = cacheKey(templateType, versionId)
  const cached = cache.get(key)
  if (cached) return cached

  const versionDef = getVersionDef(templateType, versionId)
  const questionKeyByType = buildQuestionKeyByType(versionDef)
  const { mineralKeyByLabel, preferredMineralLabelByKey } = buildMineralMaps(versionDef)
  const legacyCompanyKeyByInternalKey = buildCompanyKeyMap()

  const plan: CirsGpmLegacyPlan = {
    templateType,
    versionId,
    versionDef,
    questionKeyByType,
    mineralKeyByLabel,
    preferredMineralLabelByKey,
    legacyCompanyKeyByInternalKey,
  }
  cache.set(key, plan)
  return plan
}

export function normalizeMineralLabel(value: string): string {
  return normalize(value)
}
