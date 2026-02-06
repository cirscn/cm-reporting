import type { ReportSnapshotV1 } from '@lib/public/snapshot'
import { useTemplateActions, useTemplateState } from '@lib/shell/store'
import { useEffect, useRef } from 'react'

export interface DevImportBridgeProps {
  pendingSnapshot: ReportSnapshotV1 | null
  onApplied: () => void
}

export function DevImportBridge({ pendingSnapshot, onApplied }: DevImportBridgeProps) {
  const { meta } = useTemplateState()
  const { setFormData } = useTemplateActions()
  const lastAppliedRef = useRef<ReportSnapshotV1 | null>(null)

  useEffect(() => {
    if (!pendingSnapshot) return
    if (pendingSnapshot.templateType !== meta.templateType || pendingSnapshot.versionId !== meta.versionId) return
    if (lastAppliedRef.current === pendingSnapshot) return
    const snapshot = pendingSnapshot
    const timer = window.setTimeout(() => {
      if (snapshot.templateType !== meta.templateType || snapshot.versionId !== meta.versionId) return
      if (lastAppliedRef.current === snapshot) return
      setFormData(snapshot.data)
      lastAppliedRef.current = snapshot
      onApplied()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [meta.templateType, meta.versionId, onApplied, pendingSnapshot, setFormData])

  return null
}
