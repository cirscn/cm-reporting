/**
 * @file ui/fields/DateField.tsx
 * @description 使用 Ant Design Form.Item 封装的日期选择字段（垂直布局）。
 */

import type { ErrorKey } from '@core/validation/errorKeys'
import { useT } from '@ui/i18n/useT'
import { useMemoizedFn } from 'ahooks'
import { DatePicker, Form } from 'antd'
import dayjs from 'dayjs'

import { resolveErrorMessage } from './error'

/** UI 展示格式。 */
const DISPLAY_FORMAT = 'DD-MMM-YYYY'
/** 存储格式。 */
const STORAGE_FORMAT = 'YYYY-MM-DD'

interface DateFieldProps {
  value?: string // ISO format: YYYY-MM-DD
  onChange?: (value: string) => void
  label?: string
  placeholder?: string
  hint?: string
  formatHint?: string
  required?: boolean
  disabled?: boolean
  error?: ErrorKey
  minDate?: string
  maxDate?: string
  fieldPath?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * DateField：使用 Ant Design Form.Item 的日期选择组件（垂直布局）。
 */
export function DateField({
  value,
  onChange,
  label,
  placeholder,
  hint,
  formatHint,
  required,
  disabled,
  error,
  minDate,
  maxDate,
  fieldPath,
  className,
  style,
}: DateFieldProps) {
  const { t } = useT()

  const errorText = resolveErrorMessage(t, error)
  const validateStatus = errorText ? 'error' : undefined
  const dayjsValue = value ? dayjs(value) : undefined
  const displayHint = hint ?? formatHint
  const displayPlaceholder = placeholder ?? formatHint ?? t('placeholders.date')

  const handleChange = useMemoizedFn((date: dayjs.Dayjs | null) => {
    onChange?.(date ? date.format(STORAGE_FORMAT) : '')
  })

  const disabledDate = useMemoizedFn((current: dayjs.Dayjs) => {
    if (!current) return false
    if (minDate && current.isBefore(dayjs(minDate), 'day')) return true
    if (maxDate && current.isAfter(dayjs(maxDate), 'day')) return true
    return false
  })

  // 必填字段的黄色背景样式
  const pickerClassName = required && !value ? 'field-required-empty' : undefined

  return (
    <Form.Item
      label={label}
      required={required}
      validateStatus={validateStatus}
      help={errorText}
      extra={displayHint}
      layout="vertical"
      data-field-path={fieldPath}
      className={className}
      style={style}
    >
      <DatePicker
        value={dayjsValue}
        onChange={handleChange}
        placeholder={displayPlaceholder}
        disabled={disabled}
        disabledDate={disabledDate}
        format={DISPLAY_FORMAT}
        className={pickerClassName}
        style={{ width: '100%' }}
      />
    </Form.Item>
  )
}
