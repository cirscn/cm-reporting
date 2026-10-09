/** 模板 Provider：在模板/版本切换时同步重建独立 Store。 */
import type { TemplateType } from '@core/registry/types'
import type { CMReportingIntegrations } from '@lib/public/integrations'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

import { TemplateStoreContext, type TemplateStore } from './templateStoreContext'
import { createTemplateStore } from './templateStoreFactory'

interface TemplateProviderProps {
  templateType: TemplateType
  versionId: string
  readOnly?: boolean
  integrations?: CMReportingIntegrations
  children: ReactNode
}

function useUnsavedChangesWarning(store: TemplateStore) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    const unsubscribe = store.subscribe((state) => {
      if (state.isDirty) window.addEventListener('beforeunload', handler)
      else window.removeEventListener('beforeunload', handler)
    })
    return () => {
      unsubscribe()
      window.removeEventListener('beforeunload', handler)
    }
  }, [store])
}

/** 在渲染时同步切换 Store，避免子组件看到上一版本的数据。 */
export function TemplateProvider({
  templateType, versionId, readOnly = false, integrations, children,
}: TemplateProviderProps) {
  const currentKey = `${templateType}:${versionId}`
  const [prevKey, setPrevKey] = useState(currentKey)
  const [store, setStore] = useState(() =>
    createTemplateStore({ templateType, versionId, readOnly, integrations }),
  )
  if (currentKey !== prevKey) {
    setPrevKey(currentKey)
    setStore(createTemplateStore({ templateType, versionId, readOnly, integrations }))
  }
  useEffect(() => {
    store.setState({ integrations, readOnly })
  }, [store, integrations, readOnly])
  useUnsavedChangesWarning(store)
  return <TemplateStoreContext.Provider value={store}>{children}</TemplateStoreContext.Provider>
}
