/**
 * @file ui/fields/CheckboxField.tsx
 * @description 使用 Ant Design Form.Item 封装的复选字段（垂直布局）。
 */

import { useMemoizedFn } from 'ahooks'
import { Checkbox, Form } from 'antd'

interface CheckboxFieldProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  disabled?: boolean
  error?: string
  fieldPath?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * CheckboxField：使用 Ant Design Form.Item 的复选组件（垂直布局）。
 */
export function CheckboxField({
  checked,
  onChange,
  label,
  disabled,
  error,
  fieldPath,
  className,
  style,
}: CheckboxFieldProps) {
  const handleChange = useMemoizedFn((nextChecked: boolean) => {
    onChange?.(nextChecked)
  })

  const handleEventChange = useMemoizedFn((event: { target: { checked: boolean } }) => {
    handleChange(event.target.checked)
  })

  const validateStatus = error ? 'error' : undefined

  return (
    <Form.Item
      validateStatus={validateStatus}
      help={error}
      layout="vertical"
      data-field-path={fieldPath}
      className={className}
      style={style}
    >
      <Checkbox checked={checked} onChange={handleEventChange} disabled={disabled}>
        {label}
      </Checkbox>
    </Form.Item>
  )
}
