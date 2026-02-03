/**
 * @file app/routing/resolveTemplateRoute.ts
 * @description 路由解析工具。
 */

// 说明：路由解析工具
import { getDefaultVersion, isValidTemplateType, isValidVersion } from '@core/registry'
import type { PageKey, TemplateType } from '@core/registry/types'

/**
 * 导出接口类型：TemplateRouteParams。
 */
export interface TemplateRouteParams {
  template?: string
  version?: string
  page?: string
}

/**
 * 导出接口类型：TemplateRouteConfig。
 */
export interface TemplateRouteConfig {
  basePath?: string
  defaultPage?: PageKey
}

/**
 * 导出类型：TemplateRouteResolution。
 */
export type TemplateRouteResolution =
  | {
      kind: 'ok'
      templateType: TemplateType
      versionId: string
      pageKey: PageKey
    }
  | {
      kind: 'redirect'
      to: string
    }

const PAGE_KEYS: PageKey[] = [
  'revision',
  'instructions',
  'definitions',
  'declaration',
  'minerals-scope',
  'smelter-list',
  'checker',
  'mine-list',
  'product-list',
  'smelter-lookup',
]

function normalizeBasePath(basePath?: string) {
  if (!basePath) return ''
  const trimmed = basePath.startsWith('/') ? basePath : `/${basePath}`
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

/** 判断是否为合法 PageKey。 */
function isPageKey(value?: string): value is PageKey {
  return Boolean(value && PAGE_KEYS.includes(value as PageKey))
}

/** 构建模板路径（支持可选 basePath）。 */
export function buildTemplatePath({
  template,
  version,
  page,
  basePath,
}: {
  template: TemplateType
  version: string
  page: PageKey
  basePath?: string
}) {
  const base = normalizeBasePath(basePath)
  return `${base}/${template}/${version}/${page}`
}

/** 解析模板路由参数并返回有效配置或重定向。 */
export function resolveTemplateRoute(
  params: TemplateRouteParams,
  config: TemplateRouteConfig = {}
): TemplateRouteResolution {
  const base = normalizeBasePath(config.basePath)
  const defaultPage = config.defaultPage ?? 'declaration'

  if (!params.template || !isValidTemplateType(params.template)) {
    return { kind: 'redirect', to: base || '/' }
  }

  const templateType = params.template as TemplateType
  const versionId = params.version

  if (!versionId || !isValidVersion(templateType, versionId)) {
    const defaultVersion = getDefaultVersion(templateType)
    return {
      kind: 'redirect',
      to: buildTemplatePath({
        template: templateType,
        version: defaultVersion,
        page: defaultPage,
        basePath: base || undefined,
      }),
    }
  }

  if (!params.page || !isPageKey(params.page)) {
    return {
      kind: 'redirect',
      to: buildTemplatePath({
        template: templateType,
        version: versionId,
        page: defaultPage,
        basePath: base || undefined,
      }),
    }
  }

  return {
    kind: 'ok',
    templateType,
    versionId,
    pageKey: params.page,
  }
}
