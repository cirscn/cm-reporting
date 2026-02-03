/**
 * @file ui/fields/TextField.tsx
 * @description 使用 Ant Design Form.Item 封装的文本输入字段（垂直布局）。
 */

import type { ErrorKey } from '@core/validation/errorKeys'
import { useT } from '@ui/i18n/useT'
import { useMemoizedFn } from 'ahooks'
import { Form, Input } from 'antd'
import type { ChangeEvent } from 'react'

import { resolveErrorMessage } from './error'

interface TextFieldProps {
  value?: string
  onChange?: (value: string) => void
  label?: string
  placeholder?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  error?: ErrorKey
  multiline?: boolean
  rows?: number
  fieldPath?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * TextField：使用 Ant Design Form.Item 的文本输入组件（垂直布局）。
 */
export function TextField({
  value,
  onChange,
  label,
  placeholder,
  hint,
  required,
  disabled,
  error,
  multiline,
  rows = 3,
  fieldPath,
  className,
  style,
}: TextFieldProps) {
  const { t } = useT()

  const resolvedPlaceholder = placeholder ?? t('placeholders.input')

  const handleChange = useMemoizedFn(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange?.(e.target.value)
    }
  )

  const errorText = resolveErrorMessage(t, error)
  const validateStatus = errorText ? 'error' : undefined

  // 必填字段的黄色背景样式
  const inputClassName = required && !value?.trim() ? 'field-required-empty' : undefined

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
      {multiline ? (
        <Input.TextArea
          value={value || undefined}
          onChange={handleChange}
          placeholder={resolvedPlaceholder}
          disabled={disabled}
          rows={rows}
          className={inputClassName}
        />
      ) : (
        <Input
          value={value || undefined}
          onChange={handleChange}
          placeholder={resolvedPlaceholder}
          disabled={disabled}
          className={inputClassName}
        />
      )}
    </Form.Item>
  )
}
