import type { ReportSnapshotV1 } from '@lib/public/snapshot'
import { useCMReporting } from '@lib/public/useCMReporting'
import { forwardRef, useImperativeHandle } from 'react'

export interface DevExportBridgeRef {
  getSnapshot: () => ReportSnapshotV1
  validate: () => Promise<boolean>
}

export const DevExportBridge = forwardRef<DevExportBridgeRef>(function DevExportBridge(_, ref) {
  const api = useCMReporting()

  useImperativeHandle(
    ref,
    () => ({
      getSnapshot: () => api.getSnapshot(),
      validate: () => api.validate(),
    }),
    [api]
  )

  return null
})
