/**
 * @file examples/scenarios/CMReportingRefScenario.tsx
 * @description Examples 场景：宿主以 `CMReporting`（推荐门面组件）+ ref 方式接入。
 */

import type { Locale } from '@lib/index'
import type { CMReportingRef, ReportSnapshotV1 } from '@lib/index'
import { CMReporting, parseSnapshot, stringifySnapshot } from '@lib/index'
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

export function CMReportingRefScenario() {
  const reportingRef = useRef<CMReportingRef | null>(null)
  const [locale, setLocale] = useState<Locale>('zh-CN')
  const [readOnly, setReadOnly] = useState(false)

  const initialSnapshot = useMemo<ReportSnapshotV1 | undefined>(() => {
    // 示例：宿主可从本地存储/接口加载 snapshot 并作为 initialSnapshot 传入。
    // 这里保持 undefined，避免影响运行时行为。
    return undefined
  }, [])

  const readOnlyHint = readOnly
    ? '只读已开启：checker/必填提示/上下页与新增删除等编辑入口将隐藏。'
    : '可编辑模式：支持输入、导航与表格增删改。'

  return (
    <Flex vertical gap={12} style={{ padding: 16 }}>
      <Typography.Title level={5} style={{ margin: 0 }}>
        CMReporting + ref（Snapshot 导入/导出）
      </Typography.Title>
      <Flex gap={8} wrap>
        <Button
          onClick={() => {
            const json = reportingRef.current?.exportJson()
            if (!json) return
            downloadJson('snapshot.json', json)
          }}
        >
          导出 Snapshot JSON
        </Button>
        <Button
          onClick={() => {
            const json = reportingRef.current?.exportJson()
            if (!json) return
            const snapshot = parseSnapshot(JSON.parse(json))
            reportingRef.current?.setSnapshot(snapshot)
          }}
        >
          导出后回填（自检）
        </Button>
        <Button
          onClick={() => {
            const snapshot = reportingRef.current?.getSnapshot()
            if (!snapshot) return
            // 示例：宿主可以在这里做 canonical / schemaVersion 升级等处理
            const stable = stringifySnapshot(snapshot)
            downloadJson('snapshot.canonical.json', stable)
          }}
        >
          导出 Canonical
        </Button>
        <Button onClick={() => setLocale((v) => (v === 'zh-CN' ? 'en-US' : 'zh-CN'))}>
          切换语言（当前：{locale}）
        </Button>
        <Button onClick={() => setReadOnly((value) => !value)}>
          切换只读（当前：{readOnly ? '是' : '否'}）
        </Button>
      </Flex>
      <Typography.Text type="secondary">{readOnlyHint}</Typography.Text>

      <div style={{ border: '1px solid var(--ant-color-border)', borderRadius: 8, overflow: 'hidden' }}>
        <CMReporting
          ref={reportingRef}
          templateType="emrt"
          versionId="2.1"
          locale={locale}
          readOnly={readOnly}
          initialSnapshot={initialSnapshot}
        />
      </div>
    </Flex>
  )
}
