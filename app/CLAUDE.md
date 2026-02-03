# Claude Code 项目规范

## 样式系统优先级

编写样式时遵循以下优先级顺序：

1. **Ant Design 组件默认样式** - 优先使用组件自带样式，不做额外定制
2. **Tailwind CSS 工具类** - 对于布局、间距、颜色等通用样式
3. **CSS-in-JS（spacing.ts 常量）** - 仅用于需要 JS 计算或复杂逻辑的场景
4. **全局 CSS（index.css）** - 仅用于必须用 `!important` 覆盖 antd 的场景

## 核心规则

### 1. 禁止颜色硬编码

❌ 错误示例：
```tsx
<div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0' }}>
```

✅ 正确示例：
```tsx
<div className="bg-white border-b border-gray-200">
```

**原因**：硬编码颜色不利于未来多主题支持（深色模式等）。

**例外**：App.tsx 中的 Ant Design 主题 token 配置是允许的，因为这是集中定义主题变量的正确做法。

### 2. 优先使用 Tailwind CSS

当没有 CSS-in-JS 变量定义时，应优先使用 Tailwind CSS：

❌ 错误示例：
```tsx
<div style={{ padding: '12px 24px' }}>
```

✅ 正确示例：
```tsx
<div className="px-6 py-3">
```

### 3. 间距常量使用场景

`@ui/theme/spacing.ts` 中的常量仅用于：
- 需要与 JS 逻辑结合的动态计算
- Ant Design 组件的 `gap` 属性（如 `<Flex gap={LAYOUT.sectionGap}>`）

普通的 padding/margin 应使用 Tailwind。

### 4. Ant Design Card 组件

- 使用默认样式，不设置 `styles` prop
- 不自定义 `body` 的 padding

### 5. 全局 CSS 限制

`index.css` 仅保留：
- 必须用 `!important` 覆盖 antd 默认样式的规则
- keyframe 动画定义
- 无法用 Tailwind 实现的特殊样式

### 6. 主题色定义

品牌主题色在两处定义并保持同步：
- `tailwind.config.js` - 供 Tailwind 类使用（如 `bg-primary-dark`）
- `App.tsx` - Ant Design 主题 token 配置

## Tailwind 常用类参考

### 间距
- `p-4` = 16px padding
- `px-6` = 24px horizontal padding
- `py-3` = 12px vertical padding
- `gap-4` = 16px gap

### 颜色
- `bg-white` = 白色背景
- `bg-gray-100` = 浅灰背景 (#f5f5f5)
- `border-gray-200` = 浅灰边框
- `text-gray-500` = 次要文字颜色
- `bg-primary` = 品牌主色
- `bg-primary-dark` = 品牌深色
- `from-primary-dark to-primary` = 品牌渐变

### 布局
- `flex flex-col` = 垂直 flex
- `items-center` = 垂直居中
- `justify-between` = 两端对齐
