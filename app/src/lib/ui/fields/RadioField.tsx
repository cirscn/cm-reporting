/**
 * @file ui/fields/RadioField.tsx
 * @description 使用 Ant Design Form.Item 封装的单选字段（垂直布局）。
 */

import { useMemoizedFn } from 'ahooks'
import { Form, Radio, Space } from 'antd'
import type { RadioChangeEvent } from 'antd'

interface RadioOption {
  value: string
  label: string
}

interface RadioFieldProps {
  value?: string
  onChange?: (value: string) => void
  label?: string
  required?: boolean
  disabled?: boolean
  error?: string
  options: RadioOption[]
  direction?: 'horizontal' | 'vertical'
  fieldPath?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * RadioField：使用 Ant Design Form.Item 的单选组件（垂直布局）。
 */
export function RadioField({
  value,
  onChange,
  label,
  required,
  disabled,
  error,
  options,
  direction = 'horizontal',
  fieldPath,
  className,
  style,
}: RadioFieldProps) {
  const handleChange = useMemoizedFn((e: RadioChangeEvent) => {
    onChange?.(e.target.value)
  })

  const validateStatus = error ? 'error' : undefined

  return (
    <Form.Item
      label={label}
      required={required}
      validateStatus={validateStatus}
      help={error}
      layout="vertical"
      data-field-path={fieldPath}
      className={className}
      style={style}
    >
      <Radio.Group value={value} onChange={handleChange} disabled={disabled}>
        <Space direction={direction}>
          {options.map((opt) => (
            <Radio key={opt.value} value={opt.value}>
              {opt.label}
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    </Form.Item>
  )
}
