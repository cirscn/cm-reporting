/**
 * @file public/submit.ts
 * @description 对外保存/提交能力的公共实现。
 */

import type { TemplateType } from '@core/registry/types'

import type { NavigationContextValue } from '../shell/navigation/types'
import { buildTemplatePath } from '../shell/routing/resolveTemplateRoute'

import type { ReportSnapshotV1 } from './snapshot'

interface SubmitReportInput {
  templateType: TemplateType
  versionId: string
  validate: () => Promise<boolean>
  getSnapshot: () => ReportSnapshotV1
  navigation?: NavigationContextValue | null
}

/**
 * 提交：先执行内部校验；失败时跳转 checker 并返回 null，成功返回快照。
 */
export async function submitReport({
  templateType,
  versionId,
  validate,
  getSnapshot,
  navigation,
}: SubmitReportInput): Promise<ReportSnapshotV1 | null> {
  const valid = await validate()
  if (!valid) {
    if (navigation) {
      navigation.actions.navigate(
        buildTemplatePath({
          template: templateType,
          version: versionId,
          page: 'checker',
        }),
      )
    }
    return null
  }

  return getSnapshot()
}
