/**
 * @file examples/ExamplesHeader.tsx
 * @description Example 环境专用 Header，深色玻璃态设计风格。
 */

import { ExportOutlined, ImportOutlined, SwapOutlined } from '@ant-design/icons'
import type { Locale } from '@core/i18n'
import { getVersions } from '@core/registry'
import type { TemplateType } from '@core/registry/types'
import { useT } from '@ui/i18n/useT'
import { useCreation, useMemoizedFn } from 'ahooks'
import { Button, Flex, Select, Typography } from 'antd'

const { Text } = Typography

interface ExamplesHeaderProps {
  /** 当前模板类型 */
  templateType: TemplateType
  /** 当前版本 */
  versionId: string
  /** 当前语言 */
  locale: Locale
  /** 模板切换回调 */
  onTemplateChange: (template: TemplateType) => void
  /** 版本切换回调 */
  onVersionChange: (version: string) => void
  /** 语言切换回调 */
  onLocaleChange: (locale: Locale) => void
  /** 导出回调 */
  onExport?: () => void
  /** 导入回调 */
  onImport?: () => void
}

/** 模板切换选项 */
const templateOptions: { value: TemplateType; label: string }[] = [
  { value: 'cmrt', label: 'CMRT' },
  { value: 'emrt', label: 'EMRT' },
  { value: 'crt', label: 'CRT' },
  { value: 'amrt', label: 'AMRT' },
]

/** 语言选项 */
const localeOptions: { value: Locale; label: string }[] = [
  { value: 'en-US', label: 'EN' },
  { value: 'zh-CN', label: '中文' },
]

/**
 * ExamplesHeader：Example 环境专用顶部导航栏。
 * 深色玻璃态设计，包含模板选择器、版本选择器、语言切换器和导出按钮。
 */
export function ExamplesHeader({
  templateType,
  versionId,
  locale,
  onTemplateChange,
  onVersionChange,
  onLocaleChange,
  onExport,
  onImport,
}: ExamplesHeaderProps) {
  const { t } = useT()

  /** 当前模板的版本列表 */
  const versions = useCreation(() => getVersions(templateType), [templateType])

  /** 版本下拉选项 */
  const versionOptions = useCreation(
    () => versions.map((v) => ({ value: v, label: `v${v}` })),
    [versions],
  )

  const handleTemplateChange = useMemoizedFn((next: TemplateType) => {
    onTemplateChange(next)
  })

  const handleVersionChange = useMemoizedFn((next: string) => {
    onVersionChange(next)
  })

  const handleLocaleChange = useMemoizedFn((next: Locale) => {
    onLocaleChange(next)
  })

  const handleExport = useMemoizedFn(() => {
    onExport?.()
  })

  const handleImport = useMemoizedFn(() => {
    onImport?.()
  })

  return (
    <header className="examples-header sticky top-[44px] z-[70]">
      {/* 主导航区域 - 深色玻璃态背景 */}
      <div
        className="relative overflow-hidden px-4"
        style={{
          height: 56,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* 背景光晕装饰 */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: -120,
            left: '20%',
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: -80,
            right: '15%',
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />

        {/* 底部渐变线 */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: 1,
            background:
              'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.4) 30%, rgba(6, 182, 212, 0.4) 70%, transparent 100%)',
          }}
        />

        {/* 内容容器 */}
        <Flex align="center" justify="space-between" className="relative z-10 h-full px-5">
          {/* 左侧 Logo 区域 */}
          <Flex align="center" gap={14}>
            {/* Logo 图标 */}
            <div
              className="flex items-center justify-center font-bold text-white"
              style={{
                width: 38,
                height: 38,
                background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                borderRadius: 10,
                fontSize: 14,
                letterSpacing: '0.05em',
                boxShadow:
                  '0 4px 16px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              CM
            </div>

            {/* 标题文字 */}
            <div className="flex flex-col">
              <Text
                strong
                style={{
                  color: '#fff',
                  fontSize: 15,
                  letterSpacing: '0.02em',
                  lineHeight: 1.2,
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                }}
              >
                {t('common.appTitle')}
              </Text>
              <Text
                style={{
                  color: 'rgba(148, 163, 184, 0.8)',
                  fontSize: 10,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}
              >
                Compliance Reporting
              </Text>
            </div>
          </Flex>

          {/* 右侧控件区 */}
          <Flex align="center" gap={10}>
            {/* 控件组容器 - 玻璃态背景 */}
            <Flex
              align="center"
              gap={8}
              className="examples-header-controls"
              style={{
                padding: '6px 12px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* 模板选择器 */}
              <Select
                value={templateType}
                onChange={handleTemplateChange}
                options={templateOptions}
                variant="borderless"
                suffixIcon={
                  <SwapOutlined style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                }
                style={{ minWidth: 85 }}
                popupMatchSelectWidth={false}
              />

              {/* 分隔点 */}
              <div
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                }}
              />

              {/* 版本选择器 */}
              {versions.length > 0 && (
                <Select
                  value={versionId}
                  onChange={handleVersionChange}
                  options={versionOptions}
                  variant="borderless"
                  style={{ minWidth: 70 }}
                  popupMatchSelectWidth={false}
                />
              )}

              {/* 分隔点 */}
              <div
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                }}
              />

              {/* 语言选择器 */}
              <Select
                value={locale}
                onChange={handleLocaleChange}
                options={localeOptions}
                variant="borderless"
                style={{ minWidth: 60 }}
                popupMatchSelectWidth={false}
              />
            </Flex>

            {/* 导出按钮 */}
            <Flex align="center" gap={8}>
              <Button
                icon={<ImportOutlined />}
                onClick={handleImport}
                style={{
                  height: 36,
                  borderRadius: 8,
                }}
              >
                导入
              </Button>
              <Button
                type="primary"
                icon={<ExportOutlined />}
                onClick={handleExport}
                className="examples-header-export"
                style={{
                  height: 36,
                  paddingLeft: 16,
                  paddingRight: 16,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 13,
                  boxShadow:
                    '0 4px 14px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.2s ease',
                }}
              >
                {t('common.export')}
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </div>
    </header>
  )
}
