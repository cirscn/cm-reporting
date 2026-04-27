import fs from 'node:fs'
import path from 'node:path'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { StepNav } from './StepNav'

vi.mock('ahooks', () => ({
  useMemoizedFn: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}))

vi.mock('antd', () => ({
  Steps: ({
    className,
    items,
  }: {
    className?: string
    items?: Array<{ key: string; title?: React.ReactNode }>
  }) => (
    <div data-kind="steps" className={className}>
      {items?.map((item) => (
        <div key={item.key} data-kind="step-item">
          {item.title}
        </div>
      ))}
    </div>
  ),
  Tag: ({ children }: { children?: React.ReactNode }) => <span data-kind="tag">{children}</span>,
}))

describe('StepNav', () => {
  test('keeps the current step indicator circular in styles', () => {
    const stylesPath = path.resolve(import.meta.dirname, '../../styles.css')
    const css = fs.readFileSync(stylesPath, 'utf8')

    expect(css).toContain('.step-nav-steps .ant-steps-item-process .ant-steps-item-icon')
    expect(css).toContain('border-radius: 50%')
    expect(css).toContain('width: 32px')
    expect(css).toContain('height: 32px')
    expect(css).not.toContain('transform: scale(1.05)')
  })

  test('sticks to the top so step navigation stays visible while content scrolls', () => {
    const html = renderToStaticMarkup(
      <StepNav
        currentKey="declaration"
        steps={[
          { key: 'declaration', label: '申报' },
          { key: 'smelterList', label: '冶炼厂' },
        ]}
      />,
    )

    expect(html).toContain('step-nav-container')
    expect(html).toContain('position:sticky')
    expect(html).toContain('top:0')
    expect(html).toContain('z-index:20')
  })

  test('renders a dedicated alignment wrapper for step label content', () => {
    const html = renderToStaticMarkup(
      <StepNav
        currentKey="declaration"
        steps={[
          { key: 'declaration', label: '申报', progress: { completed: 7, total: 57 } },
        ]}
      />,
    )

    expect(html).toContain('step-nav-title-content')
    expect(html).toContain('step-nav-title-label')
  })

  test('renders the version purpose tip above steps', () => {
    const html = renderToStaticMarkup(
      <StepNav
        currentKey="declaration"
        purposeTip="此报告的目的是收集在产品中所用锡、钽、钨、黄金等金属的采购信息。"
        steps={[{ key: 'declaration', label: '申报' }]}
      />,
    )

    expect(html).toContain('step-nav-purpose-tip')
    expect(html).toContain('此报告的目的是收集在产品中所用锡、钽、钨、黄金等金属的采购信息。')
  })
})
