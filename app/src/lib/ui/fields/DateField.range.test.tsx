import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { DateField } from './DateField'

const mockDatePicker = vi.fn()

vi.mock('@ui/i18n/useT', () => ({
  useT: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('antd', () => ({
  ConfigProvider: {
    useConfig: () => ({ componentDisabled: false }),
  },
  DatePicker: (props: { disabledDate?: (current: Dayjs) => boolean }) => {
    mockDatePicker(props)
    return <div data-kind="date-picker" />
  },
  Form: {
    Item: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  },
}))

describe('DateField date range limits', () => {
  beforeEach(() => {
    mockDatePicker.mockClear()
  })

  test('keeps min and max dates selectable when boundary is inclusive', () => {
    renderToStaticMarkup(
      <DateField
        minDate="2006-12-31"
        maxDate="2026-03-31"
      />,
    )

    const disabledDate = mockDatePicker.mock.calls[0]?.[0].disabledDate as
      | ((current: Dayjs) => boolean)
      | undefined

    expect(disabledDate?.(dayjs('2006-12-30'))).toBe(true)
    expect(disabledDate?.(dayjs('2006-12-31'))).toBe(false)
    expect(disabledDate?.(dayjs('2026-03-31'))).toBe(false)
    expect(disabledDate?.(dayjs('2026-04-01'))).toBe(true)
  })

  test('disables the min date itself when boundary is exclusive', () => {
    renderToStaticMarkup(
      <DateField
        minDate="2006-12-31"
        minBoundary="exclusive"
      />,
    )

    const disabledDate = mockDatePicker.mock.calls[0]?.[0].disabledDate as
      | ((current: Dayjs) => boolean)
      | undefined

    expect(disabledDate?.(dayjs('2006-12-31'))).toBe(true)
    expect(disabledDate?.(dayjs('2007-01-01'))).toBe(false)
  })
})
