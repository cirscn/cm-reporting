/**
 * @file examples/scenarios/SmelterRowClassNameScenario.tsx
 * @description Examples 场景：宿主通过 `SmelterListIntegration.rowClassName` 自定义行样式。
 */

import { SMELTER_LOOKUP_DATA } from '@core/data/lookups'
import { CMReportingApp } from '@lib/CMReportingApp'
import type { SmelterRow } from '@lib/index'
import { CMReportingProvider } from '@lib/providers/CMReportingProvider'
import { useTemplateActions } from '@lib/shell/store'
import { Flex, Typography } from 'antd'
import { useCallback, useEffect, useMemo } from 'react'

function SeedSmelterList({ rows }: { rows: SmelterRow[] }) {
  const { setSmelterList } = useTemplateActions()
  useEffect(() => {
    setSmelterList(rows)
  }, [rows, setSmelterList])
  return null
}

export function SmelterRowClassNameScenario() {
  const seedRows = useMemo<SmelterRow[]>(
    () => [
      {
        id: 'S1',
        metal: 'Sn',
        smelterLookup: 'Malaysia Smelting Corporation',
        smelterName: '',
        smelterCountry: '',
        smelterIdentification: '',
        sourceId: '',
        smelterStreet: '',
        smelterCity: '',
        smelterState: '',
        smelterContactName: '',
        smelterContactEmail: '',
        proposedNextSteps: '',
        mineName: '',
        mineCountry: '',
        recycledScrap: '',
        comments: '',
        combinedMetal: '',
        combinedSmelter: '',
        smelterId: '',
      },
      {
        id: 'S2',
        metal: 'Sn',
        smelterLookup: 'Some External Smelter Not In Lookup',
        smelterName: '',
        smelterCountry: '',
        smelterIdentification: '',
        sourceId: '',
        smelterStreet: '',
        smelterCity: '',
        smelterState: '',
        smelterContactName: '',
        smelterContactEmail: '',
        proposedNextSteps: '',
        mineName: '',
        mineCountry: '',
        recycledScrap: '',
        comments: '',
        combinedMetal: '',
        combinedSmelter: '',
        smelterId: '',
      },
    ],
    []
  )

  const handleNavigatePage = useCallback(() => {}, [])

  return (
    <Flex vertical gap={12} style={{ padding: 16 }}>
      <Typography.Title level={5} style={{ margin: 0 }}>
        SmelterListIntegration.rowClassName
      </Typography.Title>
      <Typography.Paragraph style={{ margin: 0 }}>
        本示例仅展示“宿主决定样式”的接口形态；具体 CSS 可参考 `app/src/examples/examples.css:24`。
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
              rowClassName: (record) => {
                const lookup = record.smelterLookup?.trim() ?? ''
                if (!lookup) return ''
                if (lookup.toLowerCase() === 'smelter not listed') return 'smelter-row-unlisted'
                if (lookup.toLowerCase() === 'smelter not yet identified') return ''
                return SMELTER_LOOKUP_DATA[lookup] ? '' : 'smelter-row-unlisted'
              },
            },
          }}
        >
          <SeedSmelterList rows={seedRows} />
        </CMReportingApp>
      </CMReportingProvider>
    </Flex>
  )
}
