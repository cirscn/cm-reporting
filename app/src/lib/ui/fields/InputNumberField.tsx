/**
 * @file ui/fields/InputNumberField.tsx
 * @description 使用 Ant Design Form.Item 封装的数值输入字段（垂直布局）。
 */

import type { ErrorKey } from '@core/validation/errorKeys'
import { useT } from '@ui/i18n/useT'
import { useMemoizedFn } from 'ahooks'
import { ConfigProvider, Form, InputNumber } from 'antd'

import { resolveErrorMessage } from './error'

type ControlSize = 'small' | 'middle' | 'large'

interface InputNumberFieldProps {
  value?: number | null
  onChange?: (value?: number) => void
  label?: string
  placeholder?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  error?: ErrorKey
  min?: number
  max?: number
  step?: number
  size?: ControlSize
  fieldPath?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * InputNumberField：使用 Ant Design Form.Item 的数值输入组件（垂直布局）。
 */
export function InputNumberField({
  value,
  onChange,
  label,
  placeholder,
  hint,
  required,
  disabled,
  error,
  min,
  max,
  step,
  size,
  fieldPath,
  className,
  style,
}: InputNumberFieldProps) {
  const { t } = useT()
  const { componentDisabled } = ConfigProvider.useConfig()
  const isFieldDisabled = disabled || componentDisabled
  const errorText = resolveErrorMessage(t, error)
  const validateStatus = errorText ? 'error' : undefined

  const resolvedPlaceholder = placeholder ?? t('placeholders.number')

  const handleChange = useMemoizedFn((nextValue: number | null) => {
    onChange?.(nextValue ?? undefined)
  })

  const normalizedValue = value ?? undefined

  // 必填字段的黄色背景样式
  const inputClassName = required && !isFieldDisabled && normalizedValue === undefined ? 'field-required-empty' : undefined

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
      <InputNumber
        value={normalizedValue}
        onChange={handleChange}
        placeholder={resolvedPlaceholder}
        disabled={isFieldDisabled}
        min={min}
        max={max}
        step={step}
        size={size}
        className={`w-full ${inputClassName ?? ''}`}
      />
    </Form.Item>
  )
}
