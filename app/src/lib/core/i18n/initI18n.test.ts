/**
 * @file core/i18n/initI18n.test.ts
 * @description i18n 初始化回归测试。
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { describe, expect, test, vi } from 'vitest'

import { initI18n } from './initI18n'

describe('initI18n', () => {
  test('registers library bundles when i18next is pre-initialized', async () => {
    if (!i18n.isInitialized) {
      await i18n.init({
        resources: {},
        lng: 'en-US',
        fallbackLng: 'en-US',
        initImmediate: false,
      })
    }

    if (i18n.hasResourceBundle('en-US', 'translation')) {
      i18n.removeResourceBundle('en-US', 'translation')
    }
    if (i18n.hasResourceBundle('zh-CN', 'translation')) {
      i18n.removeResourceBundle('zh-CN', 'translation')
    }

    initI18n('en-US')

    expect(i18n.hasResourceBundle('en-US', 'translation')).toBe(true)
    expect(i18n.hasResourceBundle('zh-CN', 'translation')).toBe(true)
    expect(i18n.t('common.language')).toBe('Language')
  })

  test('binds react-i18next when i18next is pre-initialized', async () => {
    if (!i18n.isInitialized) {
      await i18n.init({
        resources: {},
        lng: 'en-US',
        fallbackLng: 'en-US',
        initImmediate: false,
      })
    }

    const reactInitSpy = vi.spyOn(initReactI18next, 'init')
    try {
      initI18n('zh-CN')
      expect(reactInitSpy).toHaveBeenCalled()
    } finally {
      reactInitSpy.mockRestore()
    }
  })
})
