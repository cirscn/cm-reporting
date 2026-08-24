/**
 * @file ui/forms/CompanyInfoForm.tsx
 * @description 公司信息表单，使用 Ant Design 组件和垂直布局。
 */

import { CopyOutlined } from '@ant-design/icons'
import type { I18nKey } from '@core/i18n'
import type { FieldDef, TemplateVersionDef } from '@core/registry/types'
import type { ErrorKey } from '@core/validation/errorKeys'
import { useHandlerMap } from '@ui/hooks/useHandlerMap'
import { useT } from '@ui/i18n'
import { useCreation, useMemoizedFn } from 'ahooks'
import { Button, Card, Col, ConfigProvider, Flex, Row, Tag, Typography } from 'antd'
import { groupBy, sumBy } from 'lodash-es'

import { DateField, SelectField, TextField } from '../fields'

const { Title } = Typography

interface CompanyInfoFormProps {
  versionDef: TemplateVersionDef
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  errors?: Record<string, ErrorKey>
  requiredFields?: Map<string, boolean>
  dateFormatHint?: string
  showTitle?: boolean
  fieldLayout?: 'vertical' | 'horizontal'
  fieldSpan?: number
  labelWidth?: number
}

/** 声明范围选项。 */
const SCOPE_OPTIONS = [
  { value: 'A', label: 'A. Company' },
  { value: 'B', label: 'B. Product (or List of Products)' },
  { value: 'C', label: "C. User defined [Specify in 'Description of scope']" },
]

const COMPANY_FIELD_KEYS = new Set([
  'companyName', 'declarationScope', 'scopeDescription',
  'companyId', 'companyAuthId', 'address',
])
const CONTACT_FIELD_KEYS = new Set(['contactName', 'contactEmail', 'contactPhone'])
const AUTHORIZER_FIELD_KEYS = new Set([
  'authorizerName', 'authorizerTitle', 'authorizerEmail',
  'authorizerPhone', 'authorizationDate',
])

const PLACEHOLDER_KEYS: Record<string, I18nKey> = {
  companyName: 'placeholders.companyName',
  declarationScope: 'placeholders.declarationScope',
  scopeDescription: 'placeholders.scopeDescription',
  companyId: 'placeholders.companyId',
  companyAuthId: 'placeholders.companyAuthId',
  address: 'placeholders.address',
  contactName: 'placeholders.contactName',
  contactEmail: 'placeholders.contactEmail',
  contactPhone: 'placeholders.contactPhone',
  authorizerName: 'placeholders.authorizerName',
  authorizerTitle: 'placeholders.authorizerTitle',
  authorizerEmail: 'placeholders.authorizerEmail',
  authorizerPhone: 'placeholders.authorizerPhone',
  authorizationDate: 'placeholders.authorizationDate',
}

/** 字段的 HTML autocomplete 属性映射 */
const AUTOCOMPLETE_KEYS: Record<string, string> = {
  companyName: 'organization',
  address: 'street-address',
  contactName: 'name',
  contactEmail: 'email',
  contactPhone: 'tel',
  authorizerName: 'name',
  authorizerTitle: 'organization-title',
  authorizerEmail: 'email',
  authorizerPhone: 'tel',
}

/** 需要禁用拼写检查的字段（邮箱、电话、ID 等） */
const SPELLCHECK_DISABLED_KEYS = new Set([
  'contactEmail',
  'authorizerEmail',
  'contactPhone',
  'authorizerPhone',
  'companyId',
  'companyAuthId',
])

const DEFAULT_COMPANY_INFO_FIELD_SPAN = 12
const CMRT_PROMPT_VERSION_IDS = new Set(['6.31', '6.4', '6.5', '6.6', '6.6.1'])

/**
 * CompanyInfoForm：公司信息表单组件。
 */
export function CompanyInfoForm({
  versionDef,
  values,
  onChange,
  errors = {},
  requiredFields,
  dateFormatHint,
  showTitle = true,
  fieldLayout = 'vertical',
  fieldSpan = DEFAULT_COMPANY_INFO_FIELD_SPAN,
  labelWidth,
}: CompanyInfoFormProps) {
  const { t } = useT()
  const { componentDisabled } = ConfigProvider.useConfig()

  const showPrompts =
    versionDef.templateType !== 'cmrt' ||
    CMRT_PROMPT_VERSION_IDS.has(versionDef.version.id)

  const scopeType = values.declarationScope as 'A' | 'B' | 'C' | undefined

  const handleChange = useMemoizedFn((key: string, value: string) => {
    onChange(key, value)
  })

  const getFieldHandler = useHandlerMap(() => {
    const map = new Map<string, (value: string) => void>()
    versionDef.companyInfoFields.forEach((field) => {
      map.set(field.key, (value) => handleChange(field.key, value))
    })
    return map
  }, [versionDef.companyInfoFields, handleChange])

  const getPlaceholder = (fieldKey: string) => {
    const key = PLACEHOLDER_KEYS[fieldKey]
    if (!key) return undefined
    if (!showPrompts) return ''
    return t(key)
  }

  const renderField = (field: FieldDef, span: number = fieldSpan) => {
    const value = values[field.key] || ''
    const error = errors[field.key]
    const isRequired = requiredFields?.get(field.key) ?? field.required === true
    const label = t(field.labelKey)
    const placeholder = getPlaceholder(field.key)
    const fieldHandler = getFieldHandler(field.key)

    const content = (() => {
      if (field.type === 'select' && field.key === 'declarationScope') {
        return (
          <SelectField
            value={value}
            onChange={fieldHandler}
            label={label}
            required={isRequired}
            error={error}
            options={SCOPE_OPTIONS}
            placeholder={placeholder}
            fieldPath={`companyInfo.${field.key}`}
            formLayout={fieldLayout}
            labelWidth={labelWidth}
          />
        )
      }

      if (field.type === 'date') {
        const resolvedDateHint = showPrompts ? dateFormatHint : undefined
        return (
          <DateField
            value={value}
            onChange={fieldHandler}
            label={label}
            required={isRequired}
            error={error}
            minDate={versionDef.dateConfig.minDate}
            minBoundary={versionDef.dateConfig.minBoundary}
            maxDate={versionDef.dateConfig.maxDate}
            placeholder={placeholder}
            formatHint={resolvedDateHint}
            fieldPath={`companyInfo.${field.key}`}
            formLayout={fieldLayout}
            labelWidth={labelWidth}
          />
        )
      }

      return (
        <TextField
          value={value}
          onChange={fieldHandler}
          label={label}
          required={isRequired}
          error={error}
          multiline={field.type === 'textarea'}
          rows={field.key === 'scopeDescription' ? 3 : undefined}
          placeholder={placeholder}
          fieldPath={`companyInfo.${field.key}`}
          autoComplete={AUTOCOMPLETE_KEYS[field.key]}
          spellCheck={SPELLCHECK_DISABLED_KEYS.has(field.key) ? false : undefined}
          formLayout={fieldLayout}
          labelWidth={labelWidth}
        />
      )
    })()

    return (
      <Col key={field.key} xs={24} md={span}>
        {content}
      </Col>
    )
  }

  const { companyFields, contactFields, authorizerFields } = useCreation(() => {
    const fieldGroups = groupBy(versionDef.companyInfoFields, (field) => {
      if (CONTACT_FIELD_KEYS.has(field.key)) return 'contact'
      if (AUTHORIZER_FIELD_KEYS.has(field.key)) return 'authorizer'
      if (COMPANY_FIELD_KEYS.has(field.key)) return 'company'
      return 'other'
    })
    const companyFieldsRaw = fieldGroups.company ?? []
    const shouldShowScopeDescription = scopeType === 'A' || scopeType === 'C'
    const companyFieldsFiltered =
      shouldShowScopeDescription
        ? companyFieldsRaw
        : companyFieldsRaw.filter((field) => field.key !== 'scopeDescription')
    return {
      companyFields: companyFieldsFiltered,
      contactFields: fieldGroups.contact ?? [],
      authorizerFields: fieldGroups.authorizer ?? [],
    }
  }, [versionDef.companyInfoFields, scopeType])

  const isRequired = (field: FieldDef) =>
    requiredFields ? requiredFields.get(field.key) === true : field.required === true

  const requiredTotal = useCreation(
    () => sumBy(versionDef.companyInfoFields, (field) => (isRequired(field) ? 1 : 0)),
    [versionDef.companyInfoFields, requiredFields]
  )

  const requiredCompleted = useCreation(
    () =>
      sumBy(versionDef.companyInfoFields, (field) => {
        if (!isRequired(field)) return 0
        const value = values[field.key]
        return typeof value === 'string' && value.trim().length > 0 ? 1 : 0
      }),
    [versionDef.companyInfoFields, requiredFields, values]
  )

  const sectionHeaderStyle = { marginBottom: 0 }

  // 复制联系人信息到授权人
  const handleCopyContactToAuthorizer = useMemoizedFn(() => {
    if (values.contactName) onChange('authorizerName', values.contactName)
    if (values.contactEmail) onChange('authorizerEmail', values.contactEmail)
    if (values.contactPhone) onChange('authorizerPhone', values.contactPhone)
  })

  // 判断联系人信息是否有内容可复制
  const hasContactInfo = Boolean(values.contactName || values.contactEmail || values.contactPhone)

  return (
    <Card
      title={
        showTitle ? (
          <Flex align="center" justify="space-between" style={{ width: '100%' }}>
            <Title level={5} style={sectionHeaderStyle}>
              {t('sections.companyInfo')}
            </Title>
            {requiredTotal > 0 && (
              <Tag color="orange">
                {t('badges.requiredCompleted', { done: requiredCompleted, total: requiredTotal })}
              </Tag>
            )}
          </Flex>
        ) : undefined
      }
    >
      <Flex vertical gap={24}>
        {!showTitle && companyFields.length > 0 && (
          <div>
            <Typography.Text strong className="text-gray-600 text-sm">
              {t('sections.companyInfo')}
            </Typography.Text>
          </div>
        )}
        {/* 公司基本信息 */}
        <Row gutter={[24, 0]}>
          {companyFields.map((field) => renderField(field))}
        </Row>

        {/* 联系人信息 */}
        {contactFields.length > 0 && (
          <>
            <div className="border-t border-gray-200 pt-4">
              <Typography.Text strong className="text-gray-600 text-sm">
                {t('sections.contact')}
              </Typography.Text>
            </div>
            <Row gutter={[24, 0]}>
              {contactFields.map((field) => renderField(field))}
            </Row>
          </>
        )}

        {/* 授权人信息 */}
        {authorizerFields.length > 0 && (
          <>
            <Flex
              align="center"
              justify="space-between"
              className="border-t border-gray-200 pt-4"
            >
              <Typography.Text strong className="text-gray-600 text-sm">
                {t('sections.authorizer')}
              </Typography.Text>
              {contactFields.length > 0 && !componentDisabled && (
                <Button
                  type="link"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={handleCopyContactToAuthorizer}
                  disabled={!hasContactInfo}
                >
                  {t('actions.sameAsContact')}
                </Button>
              )}
            </Flex>
            <Row gutter={[24, 0]}>
              {authorizerFields.map((field) => renderField(field))}
            </Row>
          </>
        )}
      </Flex>
    </Card>
  )
}
