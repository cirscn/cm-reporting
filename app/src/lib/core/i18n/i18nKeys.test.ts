/**
 * @file core/i18n/i18nKeys.test.ts
 * @description 测试用例。
 */

// 说明：测试用例
import fs from 'node:fs'
import path from 'node:path'

import { getAllTemplateDefinitions, getVersionDef } from '@core/registry'
import { ERROR_KEYS } from '@core/validation/errorKeys'
import { uniq } from 'lodash-es'
import { describe, expect, it } from 'vitest'

import enUS from './locales/en-US.json'
import zhCN from './locales/zh-CN.json'

function flattenKeys(obj: Record<string, unknown>, prefix = ''): Set<string> {
  const result = new Set<string>()
  Object.entries(obj).forEach(([key, value]) => {
    const next = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenKeys(value as Record<string, unknown>, next).forEach((child) => result.add(child))
    } else {
      result.add(next)
    }
  })
  return result
}

function collectRegistryKeys(): Set<string> {
  const keys = new Set<string>()
  const addKey = (key?: string) => {
    if (key) keys.add(key)
  }
  const templates = getAllTemplateDefinitions()
  templates.forEach((template) => {
    addKey(template.fullNameKey)
    template.versions.forEach((version) => {
      const versionDef = getVersionDef(template.type, version.id)
      versionDef.pages.forEach((page) => addKey(page.labelKey))
      versionDef.mineralScope.minerals.forEach((mineral) => addKey(mineral.labelKey))
      versionDef.companyInfoFields.forEach((field) => addKey(field.labelKey))
      versionDef.questions.forEach((question) => {
        addKey(question.labelKey)
        question.options.forEach((option) => addKey(option.labelKey))
      })
      versionDef.companyQuestions.forEach((question) => {
        addKey(question.labelKey)
        addKey(question.commentLabelKey)
        question.options.forEach((option) => addKey(option.labelKey))
      })
      addKey(versionDef.productList.productNumberLabelKey)
      addKey(versionDef.productList.productNameLabelKey)
      addKey(versionDef.productList.commentLabelKey)
    })
  })
  return keys
}

function collectCodeKeys(): Set<string> {
  const keys = new Set<string>()
  const srcRoot = path.resolve(__dirname, '..', '..')
  const visit = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        visit(fullPath)
        return
      }
      if (!/\.(ts|tsx)$/.test(entry.name)) return
      const content = fs.readFileSync(fullPath, 'utf8')
      const regex = /\bt\(\s*['"]([^'"]+)['"]/g
      const labelKeyRegex = /(labelKey|commentLabelKey|fullNameKey):\s*['"]([^'"]+)['"]/g
      let match: RegExpExecArray | null
      while ((match = regex.exec(content))) {
        keys.add(match[1])
      }
      while ((match = labelKeyRegex.exec(content))) {
        keys.add(match[2])
      }
    })
  }
  visit(srcRoot)
  return keys
}

function collectErrorKeys(): Set<string> {
  const keys = new Set<string>()
  const walk = (obj: Record<string, unknown>) => {
    Object.values(obj).forEach((value) => {
      if (value && typeof value === 'object') {
        walk(value as Record<string, unknown>)
        return
      }
      if (typeof value === 'string') keys.add(value)
    })
  }
  walk(ERROR_KEYS as Record<string, unknown>)
  return keys
}

function collectDocsIssues(enNode: unknown, zhNode: unknown, pathKey: string): string[] {
  const issues: string[] = []

  const isObject = (value: unknown) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

  if (Array.isArray(enNode) || Array.isArray(zhNode)) {
    if (!Array.isArray(enNode) || !Array.isArray(zhNode)) {
      issues.push(`${pathKey} type mismatch`)
      return issues
    }
    if ((enNode.length > 0 && zhNode.length === 0) || (enNode.length === 0 && zhNode.length > 0)) {
      issues.push(`${pathKey} empty array mismatch`)
    }
    if (enNode.length !== zhNode.length) {
      issues.push(`${pathKey} length mismatch (${enNode.length} vs ${zhNode.length})`)
    }
    const minLength = Math.min(enNode.length, zhNode.length)
    for (let index = 0; index < minLength; index += 1) {
      issues.push(...collectDocsIssues(enNode[index], zhNode[index], `${pathKey}[${index}]`))
    }
    if (pathKey.endsWith('.definitions')) {
      for (let index = 0; index < minLength; index += 1) {
        const enDef = (enNode[index] ?? {}) as Record<string, unknown>
        const zhDef = (zhNode[index] ?? {}) as Record<string, unknown>
        if (typeof enDef.term !== 'string' || typeof zhDef.term !== 'string') {
          issues.push(`${pathKey}[${index}].term missing`)
        }
        if (typeof enDef.definition !== 'string' || typeof zhDef.definition !== 'string') {
          issues.push(`${pathKey}[${index}].definition missing`)
        }
      }
    }
    return issues
  }

  if (isObject(enNode) || isObject(zhNode)) {
    if (!isObject(enNode) || !isObject(zhNode)) {
      issues.push(`${pathKey} type mismatch`)
      return issues
    }
    const enObj = enNode as Record<string, unknown>
    const zhObj = zhNode as Record<string, unknown>
    const keys = uniq([...Object.keys(enObj), ...Object.keys(zhObj)])
    keys.forEach((key) => {
      issues.push(...collectDocsIssues(enObj[key], zhObj[key], `${pathKey}.${key}`))
    })
    return issues
  }

  if (typeof enNode === 'string' || typeof zhNode === 'string') {
    if (typeof enNode !== 'string' || typeof zhNode !== 'string') {
      issues.push(`${pathKey} type mismatch`)
      return issues
    }
    if (!enNode.trim()) issues.push(`${pathKey} en-US empty`)
    if (!zhNode.trim()) issues.push(`${pathKey} zh-CN empty`)
    return issues
  }

  return issues
}

describe('i18n keys', () => {
  it('covers registry label keys and literal t() usage', () => {
    const available = flattenKeys(enUS as Record<string, unknown>)
    const registryKeys = collectRegistryKeys()
    const codeKeys = collectCodeKeys()
    const missing = uniq([...registryKeys, ...codeKeys]).filter((key) => !available.has(key))

    expect(missing, missing.join(', ')).toEqual([])
  })

  it('keeps zh-CN key set aligned with en-US', () => {
    const enKeys = flattenKeys(enUS as Record<string, unknown>)
    const zhKeys = flattenKeys(zhCN as Record<string, unknown>)
    const missingInZh = [...enKeys].filter((key) => !zhKeys.has(key))
    const extraInZh = [...zhKeys].filter((key) => !enKeys.has(key))

    expect(missingInZh, missingInZh.join(', ')).toEqual([])
    expect(extraInZh, extraInZh.join(', ')).toEqual([])
  })

  it('covers error key constants', () => {
    const available = flattenKeys(enUS as Record<string, unknown>)
    const errorKeys = collectErrorKeys()
    const missing = [...errorKeys].filter((key) => !available.has(key))

    expect(missing, missing.join(', ')).toEqual([])
  })

  it('rejects empty i18n keys in code', () => {
    const codeKeys = collectCodeKeys()
    const empty = [...codeKeys].filter((key) => !key.trim())

    expect(empty, empty.join(', ')).toEqual([])
  })

  it('checks docs content structure and non-empty entries', () => {
    const issues = collectDocsIssues(enUS.docs, zhCN.docs, 'docs')

    expect(issues, issues.join(', ')).toEqual([])
  })
})
