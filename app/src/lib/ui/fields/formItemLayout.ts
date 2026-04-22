import type { FormItemProps } from 'antd'

export type FieldFormLayout = 'vertical' | 'horizontal'

export interface FieldFormLayoutOptions {
  formLayout?: FieldFormLayout
  labelWidth?: number
}

export const DEFAULT_HORIZONTAL_LABEL_WIDTH = 220

export function buildFormItemLayout({
  formLayout = 'vertical',
  labelWidth = DEFAULT_HORIZONTAL_LABEL_WIDTH,
}: FieldFormLayoutOptions): Pick<
  FormItemProps,
  'layout' | 'labelCol' | 'wrapperCol' | 'labelAlign' | 'colon'
> {
  if (formLayout !== 'horizontal') {
    return { layout: 'vertical' }
  }

  return {
    layout: 'horizontal',
    labelCol: { flex: `${labelWidth}px` },
    wrapperCol: { flex: '1 1 0' },
    labelAlign: 'left',
    colon: false,
  }
}
