# React 性能与工程最佳实践（Vercel）

> 约束：遵循 $vercel-react-best-practices 规则集。此文档作为实现期强制准则。

## 优先级 1：消除瀑布（async-*)
- 并行化独立数据加载（`async-parallel`）
- 延迟 await，避免无条件阻塞（`async-defer-await`）
- 依赖链拆分，避免串行（`async-dependencies`）

## 优先级 2：Bundle 体积（bundle-*)
- 禁止 barrel import（`bundle-barrel-imports`）
- 大组件动态加载（`bundle-dynamic-imports`）
- 条件加载重模块（`bundle-conditional`）

## 优先级 5：重渲染优化（rerender-*)
- 组件拆分与 memo（`rerender-memo`）
- effect 依赖使用原始值（`rerender-dependencies`）
- state 初始化使用函数惰性（`rerender-lazy-state-init`）

## 优先级 6：渲染性能（rendering-*)
- 长列表启用 `content-visibility` 或虚拟滚动
- 静态 JSX 提升到组件外（`rendering-hoist-jsx`）
- 使用三元表达式替代 `&&` 以减少不必要渲染（`rendering-conditional-render`）

## 落地约束（工程层）
- UI 组件必须可拆分并具备 memo 策略
- 表格/列表组件默认支持虚拟滚动开关
- 任何数据获取必须可并行化或缓存

## useEffect 约束（必遵守）
- 禁止用 useEffect 进行“派生状态同步”（改用计算派生或 memo）
- 禁止用 useEffect 处理一次性初始化且无副作用的逻辑（改用 lazy init）
- 仅在必要副作用场景使用（订阅/定时器/外部系统交互）并保证清理\n
## 工具库规范（提高复用性）
- 使用 `lodash-es` 替代手写工具方法与全量 lodash\n
- 使用 `ahooks` 统一处理：防抖/节流、异步请求、事件/滚动、状态持久化等\n

## 代码评审清单（摘录）
- 是否存在无意义的重复 render？
- 是否存在模块级别重复计算？
- 是否存在隐式串行 await？
- 是否使用了非必要的大型依赖？
- 是否滥用 useEffect 或引入了派生状态同步？
