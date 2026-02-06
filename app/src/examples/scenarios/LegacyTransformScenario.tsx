/**
 * @file examples/scenarios/LegacyTransformScenario.tsx
 * @description Examples 场景：宿主自定义 legacy JSON transform（有/无导入都能导出 legacy schema）。
 */

import type { CirsGpmLegacyRoundtripContext, ReportSnapshotV1 } from '@lib/index'
import { cirsGpmLegacyAdapter } from '@lib/index'
import { Button, Flex, Typography } from 'antd'
import { useMemo, useRef, useState } from 'react'

function downloadJson(filename: string, jsonText: string) {
  const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function LegacyTransformScenario() {
  const [legacyCtx, setLegacyCtx] = useState<CirsGpmLegacyRoundtripContext | null>(null)
  const snapshotRef = useRef<ReportSnapshotV1 | null>(null)

  const hint = useMemo(
    () => (
      <Typography.Paragraph style={{ margin: 0 }}>
        - 导入 legacy JSON：使用 `cirsGpmLegacyAdapter.toInternal()`，拿到 `snapshot + ctx`，后续用 `toExternal(snapshot, ctx)` 做精确回写。<br />
        - 未导入 legacy JSON：用 `toExternalLoose(snapshot)` 生成 legacy schema（schema 兼容，不承诺 byte-level roundtrip）。
      </Typography.Paragraph>
    ),
    []
  )

  return (
    <Flex vertical gap={12} style={{ padding: 16 }}>
      <Typography.Title level={5} style={{ margin: 0 }}>
        legacy transform（roundtrip vs loose）
      </Typography.Title>
      {hint}

      <Flex gap={8} wrap>
        <Button
          onClick={() => {
            // 示例：最小 legacy（未导入场景）
            const parsed = cirsGpmLegacyAdapter.toInternal({
              name: 'RMI_EMRT_2.1',
              questionnaireType: 2,
              cmtCompany: {},
              cmtRangeQuestions: [],
              cmtCompanyQuestions: [],
              cmtSmelters: [],
              minList: [],
              cmtParts: [],
            })
            snapshotRef.current = parsed.snapshot
            setLegacyCtx(parsed.ctx)
          }}
        >
          构造 legacy 并导入
        </Button>
        <Button
          onClick={() => {
            const snapshot = snapshotRef.current
            if (!snapshot) return
            const legacy = legacyCtx
              ? cirsGpmLegacyAdapter.toExternal(snapshot, legacyCtx)
              : cirsGpmLegacyAdapter.toExternalLoose(snapshot)
            downloadJson('legacy.json', JSON.stringify(legacy))
          }}
        >
          导出 legacy
        </Button>
        <Button
          onClick={() => {
            snapshotRef.current = null
            setLegacyCtx(null)
          }}
        >
          清空上下文
        </Button>
      </Flex>
    </Flex>
  )
}

