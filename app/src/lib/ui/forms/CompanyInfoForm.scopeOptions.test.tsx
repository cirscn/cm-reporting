import { getVersionDef } from '@core/registry'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { CompanyInfoForm } from './CompanyInfoForm'

const mockSelectField = vi.fn()
const mockTextField = vi.fn()
const mockDateField = vi.fn()

vi.mock('@ui/i18n', () => ({
  useT: () => ({
    t: (key: string) => key,
    locale: 'zh-CN',
    i18n: { t: (key: string) => key },
  }),
}))

vi.mock('../fields', () => ({
  DateField: (props: {
    label?: ReactNode
    minDate?: string
    minBoundary?: 'inclusive' | 'exclusive'
    maxDate?: string
  }) => {
    mockDateField(props)
    return <div>{props.label}</div>
  },
  SelectField: (props: { options: Array<{ value: string; label: string }> }) => {
    mockSelectField(props)
    return <div data-kind="select-field" />
  },
  TextField: (props: { label?: ReactNode; required?: boolean }) => {
    mockTextField(props)
    return <div>{props.label}</div>
  },
}))

describe('CompanyInfoForm declaration scope options', () => {
  beforeEach(() => {
    mockSelectField.mockClear()
    mockTextField.mockClear()
    mockDateField.mockClear()
  })

  test('matches the Excel template declaration scope descriptions', () => {
    const versionDef = getVersionDef('cmrt', '6.6')

    renderToStaticMarkup(
      <CompanyInfoForm
        versionDef={versionDef}
        values={{}}
        onChange={() => undefined}
      />,
    )

    const props = mockSelectField.mock.calls[0]?.[0] as {
      options?: Array<{ value: string; label: string }>
    }

    expect(props.options).toEqual([
      { value: 'A', label: 'A. Company' },
      { value: 'B', label: 'B. Product (or List of Products)' },
      { value: 'C', label: "C. User defined [Specify in 'Description of scope']" },
    ])
  })

  test('shows scope description for scope A without making it required', () => {
    const versionDef = getVersionDef('cmrt', '6.6')
    const requiredFields = new Map<string, boolean>([
      ['declarationScope', true],
      ['scopeDescription', false],
    ])

    renderToStaticMarkup(
      <CompanyInfoForm
        versionDef={versionDef}
        values={{ declarationScope: 'A' }}
        onChange={() => undefined}
        requiredFields={requiredFields}
      />,
    )

    const props = mockTextField.mock.calls
      .map((call) => call[0] as { label?: ReactNode; required?: boolean })
      .find((item) => item.label === 'fields.scopeDescription')

    expect(props).toMatchObject({ required: false })
  })

  test('shows scope description for scope C and keeps it required', () => {
    const versionDef = getVersionDef('cmrt', '6.6')
    const requiredFields = new Map<string, boolean>([
      ['declarationScope', true],
      ['scopeDescription', true],
    ])

    renderToStaticMarkup(
      <CompanyInfoForm
        versionDef={versionDef}
        values={{ declarationScope: 'C' }}
        onChange={() => undefined}
        requiredFields={requiredFields}
      />,
    )

    const props = mockTextField.mock.calls
      .map((call) => call[0] as { label?: ReactNode; required?: boolean })
      .find((item) => item.label === 'fields.scopeDescription')

    expect(props).toMatchObject({ required: true })
  })

  test('passes date range limits to authorization date field', () => {
    const versionDef = getVersionDef('cmrt', '6.22')

    renderToStaticMarkup(
      <CompanyInfoForm
        versionDef={versionDef}
        values={{}}
        onChange={() => undefined}
      />,
    )

    const props = mockDateField.mock.calls[0]?.[0] as {
      minDate?: string
      maxDate?: string
    }

    expect(props.minDate).toBe('2006-12-31')
    expect(props.maxDate).toBe('2026-03-31')
  })

  test('passes exclusive minimum date limit when version has no upper date limit', () => {
    const versionDef = getVersionDef('cmrt', '6.6')

    renderToStaticMarkup(
      <CompanyInfoForm
        versionDef={versionDef}
        values={{}}
        onChange={() => undefined}
      />,
    )

    const props = mockDateField.mock.calls[0]?.[0] as {
      minDate?: string
      minBoundary?: 'inclusive' | 'exclusive'
      maxDate?: string
    }

    expect(props.minDate).toBe('2006-12-31')
    expect(props.minBoundary).toBe('exclusive')
    expect(props.maxDate).toBeUndefined()
  })
})
