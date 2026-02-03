# 数据契约与状态模型

## 内部表单状态（统一）
- 以模板无关的结构组织：Company、Scope、Questions、Lists、Meta
- 通过 `core/transform` 与后端数据/导出格式互转

## 关键结构（示意）
```ts
export interface FormState {
  templateKey: string; // CMRT/EMRT/CRT/AMRT + version
  company: {
    companyName: string;
    identify?: string;
    authorization?: string;
    address?: string;
    contact: { name: string; email: string; phone?: string };
    authorizer: { name: string; title?: string; email: string; phone?: string };
    effectiveDate?: string;
  };
  scope: {
    minerals: string[]; // 受版本影响
    scopeType?: "A" | "B" | "C";
    scopeDescription?: string;
  };
  questions: Record<string, Record<string, string>>; // Qx per mineral
  companyQuestions?: Record<string, string>;
  smelterList: Array<Record<string, string>>;
  mineList?: Array<Record<string, string>>;
  productList?: Array<Record<string, string>>;
}
```

## 外部数据映射
- `data/cmrt.json` 映射为 `FormState` 的一个实例
- 保留原始字段（raw）用于回写与调试
- 显示值/内部值差异统一在 transform 层处理

## 合同与稳定性
- 内部 `FormState` 作为 UI 与 rules 的稳定合同
- 后端契约变化由 transform 层吸收，避免污染 UI/core
