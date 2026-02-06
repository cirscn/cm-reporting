# 贡献指南

感谢你对 cm-reporting 项目的关注！以下是参与贡献的指南。

## 环境准备

- Node.js 18+
- pnpm 10+

```bash
git clone https://github.com/cirscn/cm-reporting.git
cd cm-reporting/app
pnpm install
```

## 开发流程

### 1. 创建分支

```bash
git checkout -b feature/your-feature
```

### 2. 开发与调试

```bash
pnpm dev        # 启动开发服务器
```

### 3. 提交前必须通过的检查

```bash
pnpm lint                           # ESLint 检查
pnpm exec tsc -b --pretty false     # TypeScript 类型检查
pnpm test                           # 单元测试
pnpm sg:scan                        # 安全扫描
```

所有检查必须通过，CI 会自动验证。

### 4. 添加 Changeset

涉及 `app/` 目录的变更必须包含 changeset 文件，否则 CI 会失败。

```bash
pnpm changeset
```

按提示选择变更类型：

- **patch**: Bug 修复、文档修正
- **minor**: 新功能、向后兼容的变更
- **major**: 破坏性变更

### 5. 提交 Pull Request

- PR 标题应简洁明了地描述变更内容
- 确保所有 CI 检查通过

## 代码规范

- **Prettier** 格式化：`pnpm format`
- **ESLint** 规则：`pnpm lint:fix`
- TypeScript **strict** 模式
- 样式优先级：Ant Design 默认 > Tailwind CSS > CSS-in-JS > 全局 CSS

## 版本发布

版本号由 [Changesets](https://github.com/changesets/changesets) 自动维护，禁止手动修改 `package.json` 中的 `version` 字段。合并到 `main` 后自动发布到 npm。

## 报告问题

请通过 [GitHub Issues](https://github.com/cirscn/cm-reporting/issues) 提交问题，并包含：

- 问题的清晰描述
- 复现步骤
- 预期行为与实际行为
- 相关的模板类型和版本（如适用）

## 许可证

提交贡献即表示你同意你的贡献将按照 [PolyForm Noncommercial 1.0.0](LICENSE) 许可证授权。
