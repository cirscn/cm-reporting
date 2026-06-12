import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest'

import { ModalContainerContext } from './modalScopeContext'
import { useScopedModal } from './useScopedModal'

const modalMocks = vi.hoisted(() => {
  const buildResult = () => ({
    destroy: vi.fn(),
    then: vi.fn(),
    update: vi.fn(),
  })

  return {
    confirm: vi.fn(() => buildResult()),
    error: vi.fn(() => buildResult()),
    info: vi.fn(() => buildResult()),
    success: vi.fn(() => buildResult()),
    warning: vi.fn(() => buildResult()),
  }
})

vi.mock('antd', () => ({
  App: {
    useApp: () => ({
      modal: modalMocks,
    }),
  },
}))

const MODAL_METHODS = ['warning', 'error', 'confirm'] as const

type ModalMethod = (typeof MODAL_METHODS)[number]
type ModalConfigLike = {
  centered?: boolean
  getContainer?: () => HTMLElement
  rootClassName?: string
  wrapClassName?: string
}

function getLastConfig(method: ModalMethod): ModalConfigLike | undefined {
  const mock = modalMocks[method] as Mock<(config: ModalConfigLike) => unknown>
  return mock.mock.calls[0]?.[0]
}

function renderWithScope(children: ReactNode, getContainer: () => HTMLElement): void {
  renderToStaticMarkup(
    <ModalContainerContext.Provider value={getContainer}>
      {children}
    </ModalContainerContext.Provider>,
  )
}

function TriggerModal({ method }: { method: ModalMethod }) {
  const modal = useScopedModal()
  modal[method]({ title: method })

  return null
}

describe('useScopedModal', () => {
  beforeEach(() => {
    Object.values(modalMocks).forEach((mock) => mock.mockClear())
  })

  test.each(MODAL_METHODS)('adds scope container to modal.%s', (method) => {
    const scope = { nodeType: 1 } as HTMLElement

    renderWithScope(<TriggerModal method={method} />, () => scope)

    const config = getLastConfig(method)
    expect(config?.getContainer?.()).toBe(scope)
  })

  test.each(MODAL_METHODS)('adds scoped top positioning classes to modal.%s', (method) => {
    const scope = { nodeType: 1 } as HTMLElement

    renderWithScope(<TriggerModal method={method} />, () => scope)

    const config = getLastConfig(method)
    expect(config?.centered).toBeUndefined()
    expect(config?.rootClassName).toContain('cm-reporting-modal-root')
    expect(config?.wrapClassName).toContain('cm-reporting-modal-wrap')
  })

  test('keeps caller-provided modal container', () => {
    const scope = { nodeType: 1 } as HTMLElement
    const callerContainer = { nodeType: 1 } as HTMLElement

    function TriggerExplicitContainer() {
      const modal = useScopedModal()
      modal.warning({ title: 'custom', getContainer: () => callerContainer })

      return null
    }

    renderWithScope(<TriggerExplicitContainer />, () => scope)

    const config = getLastConfig('warning')
    expect(config?.getContainer?.()).toBe(callerContainer)
  })

  test('keeps caller positioning options while appending scoped classes', () => {
    const scope = { nodeType: 1 } as HTMLElement

    function TriggerCustomPositioning() {
      const modal = useScopedModal()
      modal.warning({
        title: 'custom',
        centered: false,
        rootClassName: 'caller-root',
        wrapClassName: 'caller-wrap',
      })

      return null
    }

    renderWithScope(<TriggerCustomPositioning />, () => scope)

    const config = getLastConfig('warning')
    expect(config?.centered).toBe(false)
    expect(config?.rootClassName).toBe('caller-root cm-reporting-modal-root')
    expect(config?.wrapClassName).toBe('caller-wrap cm-reporting-modal-wrap')
  })

  test('keeps caller centered positioning when explicitly requested', () => {
    const scope = { nodeType: 1 } as HTMLElement

    function TriggerCenteredModal() {
      const modal = useScopedModal()
      modal.warning({ title: 'centered', centered: true })

      return null
    }

    renderWithScope(<TriggerCenteredModal />, () => scope)

    const config = getLastConfig('warning')
    expect(config?.centered).toBe(true)
  })

  test('throws when used outside CMReportingProvider scope', () => {
    function TriggerWithoutScope() {
      const modal = useScopedModal()
      modal.warning({ title: 'missing scope' })

      return null
    }

    expect(() => renderToStaticMarkup(<TriggerWithoutScope />)).toThrow(
      'useScopedModal requires CMReportingProvider',
    )
  })
})
