/**
 * @file ui/fields/AutoCompleteField.tsx
 * @description 使用 Ant Design Form.Item 封装的自动完成字段（垂直布局）。
 */

import type { ErrorKey } from '@core/validation/errorKeys'
import { useT } from '@ui/i18n/useT'
import { useMemoizedFn } from 'ahooks'
import { AutoComplete, Form } from 'antd'

import { resolveErrorMessage } from './error'

interface AutoCompleteOption {
  value: string
  label?: string
}

type ControlSize = 'small' | 'middle' | 'large'

interface AutoCompleteFieldProps {
  value?: string
  onChange?: (value: string) => void
  label?: string
  placeholder?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  error?: ErrorKey
  options: AutoCompleteOption[]
  allowClear?: boolean
  size?: ControlSize
  fieldPath?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * AutoCompleteField：使用 Ant Design Form.Item 的自动完成组件（垂直布局）。
 */
export function AutoCompleteField({
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
  size,
  fieldPath,
  className,
  style,
}: AutoCompleteFieldProps) {
  const { t } = useT()
  const errorText = resolveErrorMessage(t, error)
  const validateStatus = errorText ? 'error' : undefined

  const resolvedPlaceholder = placeholder ?? t('placeholders.input')

  const handleChange = useMemoizedFn((nextValue: string) => {
    onChange?.(nextValue)
  })

  const normalizedValue = value === '' ? undefined : value

  // 必填字段的黄色背景样式
  const inputClassName = required && !value ? 'field-required-empty' : undefined

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
      <AutoComplete
        value={normalizedValue}
        onChange={handleChange}
        placeholder={resolvedPlaceholder}
        disabled={disabled}
        options={options}
        allowClear={allowClear}
        size={size}
        className={`w-full ${inputClassName ?? ''}`}
      />
    </Form.Item>
  )
}
