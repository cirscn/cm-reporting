/**
 * @file ui/fields/SelectField.tsx
 * @description 使用 Ant Design Form.Item 封装的下拉选择字段（垂直布局）。
 */

import type { ErrorKey } from '@core/validation/errorKeys'
import { useT } from '@ui/i18n/useT'
import { useMemoizedFn } from 'ahooks'
import { Form, Select } from 'antd'

import { resolveErrorMessage } from './error'

interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  value?: string
  onChange?: (value: string) => void
  label?: string
  placeholder?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  error?: ErrorKey
  options: SelectOption[]
  allowClear?: boolean
  fieldPath?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * SelectField：使用 Ant Design Form.Item 的下拉选择组件（垂直布局）。
 */
export function SelectField({
  value,
  onChange,
  label,
  placeholder,
  hint,
  required,
  disabled,
  error,
  options,
  allowClear = true,
  fieldPath,
  className,
  style,
}: SelectFieldProps) {
  const { t } = useT()

  const errorText = resolveErrorMessage(t, error)
  const validateStatus = errorText ? 'error' : undefined
  const resolvedPlaceholder = placeholder ?? t('placeholders.select')

  const handleChange = useMemoizedFn((nextValue: string | undefined | null) => {
    onChange?.(nextValue ?? '')
  })

  const normalizedValue = value === '' ? undefined : value

  // 必填字段的黄色背景样式
  const selectClassName = required && !value ? 'field-required-empty' : undefined

  return (
    <Form.Item
      label={label}
      required={required}
      validateStatus={validateStatus}
      help={errorText}
      extra={hint}
      layout="vertical"
      data-field-path={fieldPath}
      className={className}
      style={style}
    >
      <Select
        value={normalizedValue}
        onChange={handleChange}
        placeholder={resolvedPlaceholder}
        disabled={disabled}
        options={options}
        allowClear={allowClear}
        className={selectClassName}
      />
    </Form.Item>
  )
}
