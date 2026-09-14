/**
 * @file examples/scenarios/SmelterRowClassNameScenario.tsx
 * @description Examples 场景：宿主通过 `SmelterListIntegration.rowClassName` 自定义行样式。
 */

import { CMReportingApp } from '@lib/CMReportingApp'
import type { SmelterRow } from '@lib/index'
import { CMReportingProvider } from '@lib/providers/CMReportingProvider'
import { useTemplateActions } from '@lib/shell/store'
import { Flex, Typography } from 'antd'
import { useCallback, useEffect } from 'react'

import {
  getExampleSmelterRowClassName,
  SMELTER_ROW_CLASS_NAME_SEED_ROWS,
} from '../smelterRowClassName'

function SeedSmelterList({ rows }: { rows: SmelterRow[] }) {
  const { setSmelterList } = useTemplateActions()
  useEffect(() => {
    setSmelterList(rows)
  }, [rows, setSmelterList])
  return null
}

export function SmelterRowClassNameScenario() {
  const handleNavigatePage = useCallback(() => {}, [])

  return (
    <Flex vertical gap={12} style={{ padding: 16 }}>
      <Typography.Title level={5} style={{ margin: 0 }}>
        SmelterListIntegration.rowClassName
      </Typography.Title>
      <Typography.Paragraph style={{ margin: 0 }}>
        第三行的 Smelter not listed 由库自动标红；第二行演示宿主通过 rowClassName
        仅为“外部名称未命中 lookup 主数据”的附加规则标红，具体 CSS 可参考
        `app/src/examples/examples.css:24`。
      </Typography.Paragraph>

      <CMReportingProvider locale="zh-CN">
        <CMReportingApp
          templateType="emrt"
          versionId="2.1"
          pageKey="smelter-list"
          onNavigatePage={handleNavigatePage}
          integrations={{
            smelterList: {
              lookupMode: 'external',
              rowClassName: getExampleSmelterRowClassName,
            },
          }}
        >
          <SeedSmelterList rows={SMELTER_ROW_CLASS_NAME_SEED_ROWS} />
        </CMReportingApp>
      </CMReportingProvider>
    </Flex>
  )
}
