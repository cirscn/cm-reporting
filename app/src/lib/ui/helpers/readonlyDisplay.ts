/**
 * @file ui/helpers/readonlyDisplay.ts
 * @description 只读/禁用文本控件的显示属性。
 */

type ReadonlyTextValue = number | string | null | undefined

interface ReadonlyTextControlOptions {
  value: ReadonlyTextValue
  placeholder: string
  disabled: boolean
  className?: string
  ellipsis?: boolean
}

interface ReadonlyTextControlProps {
  placeholder?: string
  title?: string
  className?: string
}

const READONLY_TEXT_ELLIPSIS_CLASS = 'cm-readonly-text-ellipsis'

export function getReadonlyTextControlProps(
  options: ReadonlyTextControlOptions,
): ReadonlyTextControlProps {
  const text = options.value === null || options.value === undefined ? '' : String(options.value)
  const useEllipsis = options.ellipsis ?? true
  const className = [
    options.className,
    options.disabled && useEllipsis ? READONLY_TEXT_ELLIPSIS_CLASS : '',
  ]
    .filter(Boolean)
    .join(' ')
  return {
    placeholder: options.disabled && !text ? undefined : options.placeholder,
    title: options.disabled && text ? text : undefined,
    className: className || undefined,
  }
}
