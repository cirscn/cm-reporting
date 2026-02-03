# CM Reporting 主题配置指南

本指南说明如何自定义 CM Reporting 组件库的样式。

## 快速开始

### 方式一：通过 CSS 变量覆盖

在你的全局 CSS 中重新定义变量即可覆盖默认样式：

```css
:root {
  /* 自定义必填字段高亮颜色 */
  --cm-field-required-bg: #fff8e1;
  --cm-field-required-border: #ffa000;

  /* 自定义内容区域最大宽度 */
  --cm-content-max-width: 1400px;
}
```

### 方式二：通过 React Props 配置

使用 `CMReportingProvider` 的 `cssVariables` prop：

```tsx
import { CMReportingProvider, type CMCSSVariables } from '@anthropic/cm-reporting'

const customCSS: CMCSSVariables = {
  fieldRequired: {
    background: '#fff8e1',
    border: '#ffa000',
  },
  layout: {
    contentMaxWidth: '1400px',
  },
}

function App() {
  return (
    <CMReportingProvider cssVariables={customCSS}>
      <YourApp />
    </CMReportingProvider>
  )
}
```

---

## 可配置的 CSS 变量

### 布局变量

| CSS 变量 | 默认值 | 说明 |
|---------|--------|------|
| `--cm-content-max-width` | `1200px` | 内容区域最大宽度 |
| `--cm-page-padding` | `16px` | 页面内边距 |
| `--cm-section-gap` | `16px` | 区块之间的间距 |
| `--cm-step-nav-padding` | `16px 24px` | 步骤导航内边距 |

### 必填字段高亮

| CSS 变量 | 默认值 | 说明 |
|---------|--------|------|
| `--cm-field-required-bg` | `#fffde7` | 必填字段空值背景色 |
| `--cm-field-required-border` | `#fbc02d` | 必填字段空值边框色 |
| `--cm-field-focus-shadow-color` | `rgba(21, 101, 192, 0.4)` | 字段聚焦高亮阴影色 |

> **注意**：`--cm-field-focus-shadow-color` 的默认值基于默认主色 `#1565c0`（40% 透明度）。
> 如果您自定义了 Ant Design 的 `colorPrimary`，建议同步更新此变量以保持视觉一致性：
>
> ```css
> :root {
>   /* 假设您的主色是 #1890ff */
>   --cm-field-focus-shadow-color: rgba(24, 144, 255, 0.4);
> }
> ```
>
> 或通过 Props 配置：
>
> ```tsx
> <CMReportingProvider
>   theme={{ token: { colorPrimary: '#1890ff' } }}
>   cssVariables={{ fieldFocus: { shadowColor: 'rgba(24, 144, 255, 0.4)' } }}
> >
> ```

### 动画配置

| CSS 变量 | 默认值 | 说明 |
|---------|--------|------|
| `--cm-transition-duration` | `0.3s` | 默认过渡时长 |
| `--cm-transition-easing` | `ease` | 默认动画缓动函数 |

### 字体尺寸

| CSS 变量 | 默认值 | 说明 |
|---------|--------|------|
| `--cm-font-size-xs` | `12px` | 超小字体（标注、辅助文字） |
| `--cm-font-size-sm` | `13px` | 小字体（次要内容） |
| `--cm-font-size-base` | `14px` | 基础字体（正文） |
| `--cm-font-size-lg` | `18px` | 大字体（标题） |

### 组件尺寸

| CSS 变量 | 默认值 | 说明 |
|---------|--------|------|
| `--cm-button-min-width` | `96px` | 按钮最小宽度 |
| `--cm-placeholder-height` | `256px` | 加载占位区域高度 |
| `--cm-form-control-max-width` | `448px` | 表单控件最大宽度 |

### 表格/表单网格列宽

| CSS 变量 | 默认值 | 说明 |
|---------|--------|------|
| `--cm-question-matrix-label-width` | `140px` | 问题矩阵 - 标签列宽度 |
| `--cm-question-matrix-answer-width` | `240px` | 问题矩阵 - 答案列宽度 |
| `--cm-company-question-label-width` | `360px` | 公司问题 - 标签列宽度 |
| `--cm-company-question-answer-width` | `240px` | 公司问题 - 答案列宽度 |

### 间距预设

| CSS 变量 | 默认值 | 说明 |
|---------|--------|------|
| `--cm-list-item-padding` | `4px 0` | 列表项垂直间距 |
| `--cm-empty-state-padding` | `32px 0` | 空状态区域内边距 |

---

## TypeScript 类型

### CMCSSVariables

通过 Props 配置时使用的类型定义：

```typescript
interface CMCSSVariables {
  layout?: {
    contentMaxWidth?: string
    pagePadding?: string
    sectionGap?: string
    stepNavPadding?: string
  }
  fieldRequired?: {
    background?: string
    border?: string
  }
  fieldFocus?: {
    shadowColor?: string
  }
  animation?: {
    duration?: string
    easing?: string
  }
  fontSize?: {
    xs?: string
    sm?: string
    base?: string
    lg?: string
  }
  component?: {
    buttonMinWidth?: string
    placeholderHeight?: string
    formControlMaxWidth?: string
  }
  grid?: {
    questionMatrixLabelWidth?: string
    questionMatrixAnswerWidth?: string
    companyQuestionLabelWidth?: string
    companyQuestionAnswerWidth?: string
  }
  spacing?: {
    listItemPadding?: string
    emptyStatePadding?: string
  }
}
```

---

## Ant Design 主题配置

除了 CM 自定义变量外，还可以通过 `theme` prop 自定义 Ant Design 主题：

```tsx
import { CMReportingProvider } from '@anthropic/cm-reporting'
import type { ThemeConfig } from 'antd'

const customTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 4,
  },
}

<CMReportingProvider theme={customTheme}>
  <YourApp />
</CMReportingProvider>
```

### 使用主题工具函数

```tsx
import { defaultAntdTheme, mergeThemeConfig } from '@anthropic/cm-reporting'

// 基于默认主题进行扩展
const myTheme = mergeThemeConfig({
  token: {
    colorPrimary: '#1890ff',
  },
})
```

---

## 完整示例

```tsx
import {
  CMReportingProvider,
  CMReportingApp,
  type CMCSSVariables,
} from '@anthropic/cm-reporting'
import type { ThemeConfig } from 'antd'

// 自定义 Ant Design 主题
const customTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 4,
  },
}

// 自定义 CM CSS 变量
const customCSS: CMCSSVariables = {
  layout: {
    contentMaxWidth: '1400px',
    pagePadding: '24px',
  },
  fieldRequired: {
    background: '#fff8e1',
    border: '#ffa000',
  },
  grid: {
    questionMatrixLabelWidth: '160px',
    companyQuestionLabelWidth: '400px',
  },
}

function App() {
  return (
    <CMReportingProvider
      locale="zh-CN"
      theme={customTheme}
      cssVariables={customCSS}
    >
      <CMReportingApp
        templateType="cmrt"
        version="6.5"
        data={initialData}
        onChange={handleChange}
      />
    </CMReportingProvider>
  )
}
```
