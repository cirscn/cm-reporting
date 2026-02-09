import { getVersionDef } from '@core/registry'
import { createEmptyFormData } from '@core/template/formDefaults'
import { useContext } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'

import { useTemplateActions } from './templateContext'
import { TemplateProvider } from './templateStore'
import { TemplateStoreContext } from './templateStoreContext'

function SetFormDataProbe(props: {
  authorizationDate: string
  onSnapshot: (value: string) => void
}) {
  const store = useContext(TemplateStoreContext)
  const { setFormData } = useTemplateActions()

  if (!store) throw new Error('TemplateStoreContext is not available')

  const data = createEmptyFormData(getVersionDef('cmrt', '6.5'))
  data.companyInfo.authorizationDate = props.authorizationDate
  setFormData(data)
  props.onSnapshot(store.getState().companyInfo.authorizationDate ?? '')

  return null
}

describe('TemplateProvider setFormData authorizationDate normalization', () => {
  test('normalizes millisecond timestamp string', () => {
    let captured = ''

    renderToStaticMarkup(
      <TemplateProvider templateType="cmrt" versionId="6.5">
        <SetFormDataProbe
          authorizationDate="1770595200000"
          onSnapshot={(value) => {
            captured = value
          }}
        />
      </TemplateProvider>
    )

    expect(captured).toBe('2026-02-09')
  })

  test('normalizes second timestamp string', () => {
    let captured = ''

    renderToStaticMarkup(
      <TemplateProvider templateType="cmrt" versionId="6.5">
        <SetFormDataProbe
          authorizationDate="1770595200"
          onSnapshot={(value) => {
            captured = value
          }}
        />
      </TemplateProvider>
    )

    expect(captured).toBe('2026-02-09')
  })

  test('keeps invalid date text unchanged for validator to report', () => {
    let captured = ''

    renderToStaticMarkup(
      <TemplateProvider templateType="cmrt" versionId="6.5">
        <SetFormDataProbe
          authorizationDate="2026/02/09"
          onSnapshot={(value) => {
            captured = value
          }}
        />
      </TemplateProvider>
    )

    expect(captured).toBe('2026/02/09')
  })
})
