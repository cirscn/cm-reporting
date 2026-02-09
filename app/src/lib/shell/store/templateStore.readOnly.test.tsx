/**
 * @file lib/shell/store/templateStore.readOnly.test.tsx
 * @description TemplateStore 只读模式写入拦截测试。
 */

import { getVersionDef } from '@core/registry'
import { createEmptyFormData } from '@core/template/formDefaults'
import { useContext } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'

import { useTemplateActions } from './templateContext'
import { TemplateProvider } from './templateStore'
import { TemplateStoreContext } from './templateStoreContext'

function ReadOnlyMutationProbe({ onSnapshot }: { onSnapshot: (companyName: string) => void }) {
  const store = useContext(TemplateStoreContext)
  const { setCompanyInfoField } = useTemplateActions()

  if (!store) throw new Error('TemplateStoreContext is not available')

  setCompanyInfoField('companyName', 'Blocked Name')
  onSnapshot(store.getState().companyInfo.companyName ?? '')

  return null
}

function WritableMutationProbe({ onSnapshot }: { onSnapshot: (companyName: string) => void }) {
  const store = useContext(TemplateStoreContext)
  const { setCompanyInfoField } = useTemplateActions()

  if (!store) throw new Error('TemplateStoreContext is not available')

  setCompanyInfoField('companyName', 'Writable Name')
  onSnapshot(store.getState().companyInfo.companyName ?? '')

  return null
}

describe('TemplateProvider readOnly', () => {
  test('blocks write actions when readOnly=true', () => {
    const defaultCompanyName = createEmptyFormData(getVersionDef('cmrt', '6.5')).companyInfo.companyName
    let captured = '__unset__'

    renderToStaticMarkup(
      <TemplateProvider templateType="cmrt" versionId="6.5" readOnly>
        <ReadOnlyMutationProbe onSnapshot={(value) => { captured = value }} />
      </TemplateProvider>
    )

    expect(captured).toBe(defaultCompanyName)
  })

  test('keeps write actions working when readOnly=false', () => {
    let captured = '__unset__'

    renderToStaticMarkup(
      <TemplateProvider templateType="cmrt" versionId="6.5" readOnly={false}>
        <WritableMutationProbe onSnapshot={(value) => { captured = value }} />
      </TemplateProvider>
    )

    expect(captured).toBe('Writable Name')
  })
})
