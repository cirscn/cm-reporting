import { App } from 'antd'
import type { ModalFuncProps } from 'antd'
import { useContext, useMemo } from 'react'

import { ModalContainerContext } from './modalScopeContext'

type ModalMethod = 'confirm' | 'error' | 'info' | 'success' | 'warning'
type ModalApi = ReturnType<typeof App.useApp>['modal']
type ModalResult = ReturnType<ModalApi[ModalMethod]>
type ScopedModalApi = Pick<ModalApi, ModalMethod>

const MODAL_METHODS = ['confirm', 'error', 'info', 'success', 'warning'] as const
const SCOPED_MODAL_ROOT_CLASS = 'cm-reporting-modal-root'
const SCOPED_MODAL_WRAP_CLASS = 'cm-reporting-modal-wrap'

function appendClassName(current: string | undefined, next: string): string {
  return current ? `${current} ${next}` : next
}

function withScopedContainer(
  config: ModalFuncProps,
  getContainer: () => HTMLElement,
): ModalFuncProps {
  const scopedConfig: ModalFuncProps = {
    ...config,
    rootClassName: appendClassName(config.rootClassName, SCOPED_MODAL_ROOT_CLASS),
    wrapClassName: appendClassName(config.wrapClassName, SCOPED_MODAL_WRAP_CLASS),
  }
  if (config.getContainer !== undefined) return scopedConfig
  return { ...scopedConfig, getContainer }
}

export function useScopedModal(): ScopedModalApi {
  const { modal } = App.useApp()
  const getContainer = useContext(ModalContainerContext)

  return useMemo(() => {
    const scopedModal = {} as Record<ModalMethod, (config: ModalFuncProps) => ModalResult>

    MODAL_METHODS.forEach((method) => {
      scopedModal[method] = (config) => {
        if (!getContainer) {
          throw new Error('useScopedModal requires CMReportingProvider')
        }

        return modal[method](withScopedContainer(config, getContainer))
      }
    })

    return scopedModal as ScopedModalApi
  }, [getContainer, modal])
}
