/**
 * @file core/template/formDefaults.ts
 * @description 基于模板定义构造空表单默认值。
 *
 * 该函数在两处消费：
 * - templateStore.tsx（zustand store 初始化时）
 * - toInternal.ts（将 legacy 数据导入时作为 base state）
 *
 * 提取到此处以消除重复实现。
 */

import type { TemplateVersionDef } from '@core/registry/types'
import type { FormData } from '@core/schema'

import { humanizeKey } from './strings'

// ---------------------------------------------------------------------------
// 构造空表单默认值
// ---------------------------------------------------------------------------

/**
 * 根据模板版本定义，构造一份所有字段为空值的表单状态。
 *
 * - companyInfo：所有字段初始为空字符串
 * - questions / questionComments：按 perMineral 分为 Record<矿种, ''> 或纯字符串 ''
 * - companyQuestions：同 questions 逻辑，额外处理 commentField
 * - selectedMinerals：fixed 模式全选，其余为空
 * - customMinerals：free-text 模式使用 defaults 或 humanizeKey 生成
 * - 列表字段：初始为空数组
 */
export function createEmptyFormData(versionDef: TemplateVersionDef): FormData {
  // ── 公司信息：每个字段初始为空字符串 ──
  const companyInfo: Record<string, string> = {}
  for (const field of versionDef.companyInfoFields) {
    companyInfo[field.key] = ''
  }

  // ── 问题 & 问题备注 ──
  const questions: Record<string, Record<string, string> | string> = {}
  const questionComments: Record<string, Record<string, string> | string> = {}
  for (const question of versionDef.questions) {
    if (question.perMineral) {
      // perMineral 问题：每个矿种一个空字符串
      const perMineral: Record<string, string> = {}
      for (const mineral of versionDef.mineralScope.minerals) {
        perMineral[mineral.key] = ''
      }
      questions[question.key] = perMineral
      questionComments[question.key] = { ...perMineral }
    } else {
      questions[question.key] = ''
      questionComments[question.key] = ''
    }
  }

  // ── 公司级问题 ──
  const companyQuestions: Record<string, Record<string, string> | string> = {}
  for (const cq of versionDef.companyQuestions) {
    if (cq.perMineral) {
      const perMineral: Record<string, string> = {}
      for (const mineral of versionDef.mineralScope.minerals) {
        perMineral[mineral.key] = ''
      }
      companyQuestions[cq.key] = perMineral
    } else {
      companyQuestions[cq.key] = ''
    }
    // 带 comment 字段的公司问题，额外初始化 comment 键
    if (cq.hasCommentField) {
      if (cq.perMineral) {
        const perMineralComment: Record<string, string> = {}
        for (const mineral of versionDef.mineralScope.minerals) {
          perMineralComment[mineral.key] = ''
        }
        companyQuestions[`${cq.key}_comment`] = perMineralComment
      } else {
        companyQuestions[`${cq.key}_comment`] = ''
      }
    }
  }

  // ── 矿种选择 & 自定义矿种名 ──
  const allMinerals = versionDef.mineralScope.minerals.map((m) => m.key)
  const selectedMinerals = versionDef.mineralScope.mode === 'fixed' ? allMinerals : []
  const customMinerals =
    versionDef.mineralScope.mode === 'free-text'
      ? allMinerals.map((mineral, index) => {
          const defaults = versionDef.mineralScope.defaultCustomMinerals
          if (defaults && defaults.length > 0) {
            return defaults[index] ?? humanizeKey(mineral)
          }
          return humanizeKey(mineral)
        })
      : []

  return {
    companyInfo,
    selectedMinerals,
    customMinerals,
    questions,
    questionComments,
    companyQuestions,
    mineralsScope: [],
    smelterList: [],
    mineList: [],
    productList: [],
  }
}
