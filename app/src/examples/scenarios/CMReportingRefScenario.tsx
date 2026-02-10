/**
 * @file examples/scenarios/CMReportingRefScenario.tsx
 * @description Examples 场景：宿主以 `CMReporting` + ref 方式接入。
 */

import type { Locale } from '@lib/index'
import type { CMReportingRef, ReportSnapshotV1 } from '@lib/index'
import { CMReporting, parseSnapshot, stringifySnapshot } from '@lib/index'
import { Button, Flex, Typography } from 'antd'
import { useMemo, useRef, useState } from 'react'

function downloadJson(filename: string, jsonText: string) {
  const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function CMReportingRefScenario() {
  const reportingRef = useRef<CMReportingRef | null>(null)
  const [locale, setLocale] = useState<Locale>('zh-CN')
  const [readOnly, setReadOnly] = useState(false)
  const [actionResult, setActionResult] = useState('')

  const initialSnapshot = useMemo<ReportSnapshotV1 | undefined>(() => {
    return undefined
  }, [])

  const readOnlyHint = readOnly
    ? '只读已开启：checker/必填提示/底部翻页及编辑入口都会隐藏。'
    : '可编辑模式：支持输入、导航与外置保存/提交。'

  return (
    <Flex vertical gap={12} style={{ padding: 16 }}>
      <Typography.Title level={5} style={{ margin: 0 }}>
        CMReporting + ref（外置保存/提交）
      </Typography.Title>
      <Flex gap={8} wrap>
        <Button
          onClick={() => {
            const snapshot = reportingRef.current?.saveDraft()
            if (!snapshot) return
            downloadJson('snapshot.draft.json', stringifySnapshot(snapshot))
            setActionResult('已保存草稿（未校验必填）')
          }}
        >
          保存草稿（不校验）
        </Button>
        <Button
          type="primary"
          onClick={async () => {
            const snapshot = await reportingRef.current?.submit()
            if (!snapshot) {
              setActionResult('提交失败，已跳转 checker 页面')
              return
            }
            downloadJson('snapshot.submit.json', stringifySnapshot(snapshot))
            setActionResult('提交校验通过，已导出提交快照')
          }}
        >
          提交（内部校验）
        </Button>
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
            const stable = stringifySnapshot(snapshot)
            downloadJson('snapshot.canonical.json', stable)
          }}
        >
          导出 Canonical
        </Button>
        <Button onClick={() => setLocale((value) => (value === 'zh-CN' ? 'en-US' : 'zh-CN'))}>
          切换语言（当前：{locale}）
        </Button>
        <Button onClick={() => setReadOnly((value) => !value)}>
          切换只读（当前：{readOnly ? '是' : '否'}）
        </Button>
      </Flex>
      <Typography.Text type="secondary">{readOnlyHint}</Typography.Text>
      {actionResult ? <Typography.Text>{actionResult}</Typography.Text> : null}

      <div style={{ border: '1px solid var(--ant-color-border)', borderRadius: 8, overflow: 'hidden' }}>
        <CMReporting
          ref={reportingRef}
          templateType="emrt"
          versionId="2.1"
          locale={locale}
          readOnly={readOnly}
          showPageActions={false}
          initialSnapshot={initialSnapshot}
        />
      </div>
    </Flex>
  )
}
