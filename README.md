# 冲突矿产报告组件库

基于 React 的冲突矿产报告应用组件库，支持 RMI（负责任矿产倡议）模板，包括 CMRT、EMRT、CRT 和 AMRT。

## 功能特性

- **多模板支持**：CMRT、EMRT、CRT、AMRT 及各版本特定配置
- **全版本覆盖**：支持所有模板版本
- **国际化**：内置中英文支持
- **表单校验**：完整的校验规则，与 Excel 模板要求一致
- **Checker 集成**：实时校验反馈，兼容 Excel 错误提示
- **Ant Design 集成**：基于 Ant Design 组件库构建

## 目录结构

```
cm/
├── app/                          # 主应用（React 组件库）
│   ├── src/lib/                  # 库源代码
│   │   ├── core/                 # 核心逻辑（registry、rules、schema）
│   │   ├── ui/                   # UI 组件（表单、表格、字段）
│   │   └── shell/                # 页面外壳和导航
│   ├── templates/                # RMI Excel 模板文件
│   │   ├── AMRT/                 # Additional Minerals Reporting Templates
│   │   ├── CMRT/                 # Conflict Minerals Reporting Templates
│   │   ├── CRT/                  # Cobalt Reporting Templates
│   │   └── EMRT/                 # Extended Minerals Reporting Templates
│   └── scripts/                  # 构建和校验脚本
├── analysis/                     # 模板分析脚本（Python）
├── data/                         # 示例数据
└── docs/                         # 文档和 PRD
```

## 安装

```bash
npm install cm-reporting
# 或
pnpm add cm-reporting
```

## 使用方法

```tsx
import { CMReporting } from 'cm-reporting'
import 'cm-reporting/styles.css'

function App() {
  return (
    <CMReporting
      templateType="cmrt"
      versionId="6.5"
      locale="zh-CN"
      onSnapshotChange={(snapshot) => console.log(snapshot)}
    />
  )
}
```

## 支持的模板

| 模板 | 版本 | 说明 |
|------|------|------|
| CMRT | 6.01, 6.1, 6.22, 6.31, 6.4, 6.5 | 冲突矿产报告模板 |
| EMRT | 1.1, 1.11, 1.2, 1.3, 2.0, 2.1 | 扩展矿产报告模板 |
| CRT | 2.2, 2.21 | 钴报告模板 |
| AMRT | 1.1, 1.2, 1.3 | 附加矿产报告模板 |

## 开发

### 环境要求

- Node.js 18+
- pnpm 10+

### 安装依赖

```bash
cd app
pnpm install
```

### 开发命令

```bash
# 启动开发服务器
pnpm dev

# 代码检查
pnpm lint

# 类型检查
pnpm exec tsc -b --pretty false

# 运行测试
pnpm test

# 校验模板文件
pnpm validate:templates

# 代码质量扫描
pnpm sg:scan

# 构建库
pnpm build:lib
```

### 模板校验

`validate:templates` 脚本确保代码中定义的所有模板版本都有对应的 Excel 模板文件。该脚本会在测试前自动运行，应纳入 CI 流程。

```bash
$ pnpm validate:templates

Validating templates...

✓ CMRT: 6 versions, all templates found
✓ EMRT: 6 versions, all templates found
✓ CRT: 2 versions, all templates found
✓ AMRT: 3 versions, all templates found

All template validations passed.
```

## 文档

- [架构概述](docs/architecture/00-overview.md)
- [CMRT PRD](docs/01-cmrt-prd.md)
- [EMRT PRD](docs/02-emrt-prd.md)
- [CRT PRD](docs/03-crt-prd.md)
- [AMRT PRD](docs/04-amrt-prd.md)

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 运行检查和测试 (`pnpm lint && pnpm test`)
4. 提交更改 (`git commit -m 'Add amazing feature'`)
5. 推送分支 (`git push origin feature/amazing-feature`)
6. 创建 Pull Request

## 许可证

[PolyForm-Noncommercial-1.0.0](LICENSE)

- 禁止商业用途（Noncommercial only）。
- 如需商业使用，请联系版权所有者获取单独商业授权。
