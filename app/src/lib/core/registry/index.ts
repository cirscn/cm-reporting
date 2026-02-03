/**
 * @file core/registry/index.ts
 * @description 模板/版本注册与查询的统一入口。
 */

// 说明：统一入口便于阅读与索引；业务代码建议按需直引具体模块以减少 bundle。
import { amrtDefinition, getAmrtVersionDef } from './templates/amrt'
import { cmrtDefinition, getCmrtVersionDef } from './templates/cmrt'
import { crtDefinition, getCrtVersionDef } from './templates/crt'
import { emrtDefinition, getEmrtVersionDef } from './templates/emrt'
import type { TemplateDefinition, TemplateType, TemplateVersionDef } from './types'

// ---------------------------------------------------------------------------
// Template Definitions Map
// ---------------------------------------------------------------------------

const templateDefinitions: Record<TemplateType, TemplateDefinition> = {
  cmrt: cmrtDefinition,
  emrt: emrtDefinition,
  crt: crtDefinition,
  amrt: amrtDefinition,
}

// ---------------------------------------------------------------------------
// Version Definition Getters Map
// ---------------------------------------------------------------------------

const versionDefGetters: Record<TemplateType, (versionId: string) => TemplateVersionDef> = {
  cmrt: getCmrtVersionDef,
  emrt: getEmrtVersionDef,
  crt: getCrtVersionDef,
  amrt: getAmrtVersionDef,
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * 获取所有模板类型。
 */
export function getTemplateTypes(): TemplateType[] {
  return ['cmrt', 'emrt', 'crt', 'amrt']
}

/**
 * 获取模板定义（元信息 + 版本列表）。
 */
export function getTemplateDefinition(type: TemplateType): TemplateDefinition {
  const def = templateDefinitions[type]
  if (!def) {
    throw new Error(`Unknown template type: ${type}`)
  }
  return def
}

/**
 * 获取全部模板定义。
 */
export function getAllTemplateDefinitions(): TemplateDefinition[] {
  return Object.values(templateDefinitions)
}

/**
 * 获取指定模板与版本的版本定义。
 */
export function getVersionDef(type: TemplateType, versionId: string): TemplateVersionDef {
  const getter = versionDefGetters[type]
  if (!getter) {
    throw new Error(`Unknown template type: ${type}`)
  }
  return getter(versionId)
}

/**
 * 获取模板可用版本列表。
 */
export function getVersions(type: TemplateType): string[] {
  const def = getTemplateDefinition(type)
  return def.versions.map((v) => v.id)
}

/**
 * 获取模板默认版本。
 */
export function getDefaultVersion(type: TemplateType): string {
  return getTemplateDefinition(type).defaultVersion
}

/**
 * 判断模板类型是否合法。
 */
export function isValidTemplateType(type: string): type is TemplateType {
  return type in templateDefinitions
}

/**
 * 判断版本是否属于该模板。
 */
export function isValidVersion(type: TemplateType, versionId: string): boolean {
  const versions = getVersions(type)
  return versions.includes(versionId)
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

/**
 * 模板类型与结构定义（仅类型导出）。
 */
export type {
  CheckerSeverity,
  CompanyQuestionDef,
  DateConfig,
  FieldDef,
  GatingCondition,
  GatingConfig,
  MetalDropdownSource,
  MineListConfig,
  MineralDef,
  MineralInputMode,
  MineralScopeConfig,
  PageDef,
  PageKey,
  ProductListConfig,
  QuestionDef,
  QuestionOption,
  ScopeOption,
  ScopeType,
  SmelterListConfig,
  TemplateDefinition,
  TemplateType,
  TemplateVersion,
  TemplateVersionDef,
} from './types'
