# 审计证据清单（Excel → Docs）

> 扫描源：/Users/aaron/Project/cm/analysis/scan-2026-02-02

| Rule | Excel 证据 | Docs 证据 |
|---|---|---|
| CMRT-SHEETS-LATEST | CMRT 6.5 sheets ok | NOT FOUND: CMRT：Revision / Instructions / Definitions / Declaration / Smelter List / Checker / Product List / Smelter Look-up |
| EMRT-SHEETS-LATEST | EMRT 2.1 sheets ok | NOT FOUND: EMRT：Revision / Instructions / Definitions / Declaration / Smelter List / Checker / Product List / Smelter Look-up（2\.0\+ 追加 Mine List） |
| CRT-SHEETS-LATEST | CRT 2.21 sheets ok | NOT FOUND: CRT：Instructions / Revision / Definitions / Declaration / Smelter List / Checker / Product List / Smelter Look-up |
| AMRT-SHEETS-1.3 | AMRT 1.3 sheets ok | NOT FOUND: AMRT：Revision / Instructions / Definitions / Declaration / Minerals Scope / Smelter List / Checker / Mine List / Product List / Smelter Look-up |
| AMRT-SMELTER-LOOKUP-ABSENCE-1.2 | AMRT 1.2 sheets ok; AMRT 1.2 disallowed ok | NOT FOUND: 1\.2 无 Smelter Look-up|1\.1/1\.2：无 Smelter Look-up |
| INSTRUCTIONS-ENGLISH-ONLY | CMRT 6.5 ENGLISH only found=True; sample='Instructions for completing Company Information questions (rows 8 - 22).\nProvide comments in ENGLISH only' / EMRT 2.1 ENGLISH only found=True; sample='Instructions for completing Company Information questions (rows 7 - 26).\nProvide comments in ENGLISH only' / CRT 2.21 ENGLISH only found=True; sample='Instructions for completing Company Information questions (rows 8 - 22).\nProvide comments in ENGLISH only' / AMRT 1.3 ENGLISH only found=True; sample='Instructions for completing Company Information questions (rows 8 - 24).\nProvide comments in ENGLISH only' | NOT FOUND: 仅以英文作答 |
| AMRT-MINERALS-SCOPE-INTRO | AMRT 1.3 Minerals Scope B5='The Minerals Scope tab may be completed by the AMRT requester to provide additional details on the specified minerals.' | NOT FOUND: AMRT 申请人可选择填写该页签以提供更多细节 |
| AMRT-MINERALS-SCOPE-HEADERS | AMRT 1.3 Minerals Scope B7='Select Minerals/Metals in Scope'; C7='Reasons for inclusion on the AMRT' | NOT FOUND: Select Minerals/Metals in Scope<br>NOT FOUND: Reasons for inclusion on the AMRT |
| AMRT-MINERALS-SCOPE-HEADERS-ALL | AMRT 1.1 B7='Select Minerals/Metals in Scope'; C7='Reasons for inclusion on the PRT' / AMRT 1.2 B7='Select Minerals/Metals in Scope'; C7='Reasons for inclusion on the AMRT' / AMRT 1.3 B7='Select Minerals/Metals in Scope'; C7='Reasons for inclusion on the AMRT' | NOT FOUND: Select Minerals/Metals in Scope<br>NOT FOUND: PRT 字样 |
| AMRT-MINERALS-SCOPE-RECOMMEND | AMRT 1.3 Minerals Scope recommendation found=True; sample='It is strongly recommended that the requestor complete the Minerals Scope tab prior to sharing their AMRT survey.' | NOT FOUND: 强烈建议先填写 Minerals Scope |
| EMRT-INSTRUCTIONS-DATE-FORMAT | EMRT 1.3 date format found=True; sample='13. Please enter the Date of Completion for this form using the format DD-MMM-YYYY.  This field is mandatory.' | NOT FOUND: DD-MMM-YYYY |
| EMRT-INSTRUCTIONS-DATE-FORMAT-2X | EMRT 2.0 date format found=True; sample='14. Please enter the Date of Completion for this form using the format DD-MMM-YYYY.  This field is mandatory.' / EMRT 2.1 date format found=True; sample='14. Please enter the Date of Completion for this form using the format DD-MMM-YYYY.  This field is mandatory.' | NOT FOUND: DD-MMM-YYYY |
| EMRT-INSTRUCTIONS-FILENAME-EXAMPLE | EMRT 1.3 filename example found=True; sample='14. As an example, the user may save the file name as:  companyname-date.xlsx (date as YYYY-MM-DD).' | NOT FOUND: companyname-date\.xlsx<br>NOT FOUND: YYYY-MM-DD |
| EMRT-INSTRUCTIONS-FILENAME-EXAMPLE-2X | EMRT 2.0 filename example found=True; sample='15. As an example, the user may save the file name as:  companyname-date.xlsx (date as YYYY-MM-DD).' / EMRT 2.1 filename example found=True; sample='15. As an example, the user may save the file name as:  companyname-date.xlsx (date as YYYY-MM-DD).' | NOT FOUND: companyname-date\.xlsx<br>NOT FOUND: YYYY-MM-DD |
| DEFINITIONS-CAHRA | EMRT 1.3 Definitions CAHRA found=True; sample='受冲突影响和高风险地区 (CAHRA)' | NOT FOUND: CAHRA |
| EMRT-DEFINITIONS-TERMS-2X | EMRT 2.0 terms ok / EMRT 2.1 terms ok | NOT FOUND: 授权人<br>NOT FOUND: 尽职调查 |
| EMRT-DEFINITIONS-TERMS-1X | EMRT 1.1 terms ok / EMRT 1.11 terms ok / EMRT 1.2 terms ok / EMRT 1.3 terms ok | NOT FOUND: 授权人<br>NOT FOUND: 尽职调查<br>NOT FOUND: 独立的私营审核机构<br>NOT FOUND: 有意添加<br>NOT FOUND: 有目的添加<br>NOT FOUND: 冲突矿产<br>NOT FOUND: 受冲突影响和高风险地区<br>NOT FOUND: 经济合作与发展组织<br>NOT FOUND: 冶炼厂 |
| AMRT-DEFINITIONS-TERMS-ALL | AMRT 1.1 terms ok / AMRT 1.2 terms ok / AMRT 1.3 terms ok | NOT FOUND: 授权人<br>NOT FOUND: 尽职调查 |
| CMRT-DEFINITIONS-TERMS-ALL | CMRT 6.01 terms ok / CMRT 6.1 terms ok / CMRT 6.22 terms ok / CMRT 6.31 terms ok / CMRT 6.4 terms ok / CMRT 6.5 terms ok | NOT FOUND: 授权人<br>NOT FOUND: 有意添加<br>NOT FOUND: 独立的第三方审核机构<br>NOT FOUND: 冲突矿产<br>NOT FOUND: 受冲突影响和高风险地区<br>NOT FOUND: 经济合作与发展组织<br>NOT FOUND: 冶炼厂 |
| CRT-DEFINITIONS-TERMS-ALL | CRT 2.2 terms ok / CRT 2.21 terms ok | NOT FOUND: 授权人<br>NOT FOUND: 尽职调查<br>NOT FOUND: 独立的私营审核机构<br>NOT FOUND: 有意添加<br>NOT FOUND: 冲突矿产<br>NOT FOUND: 受冲突影响和高风险地区<br>NOT FOUND: 经济合作与发展组织<br>NOT FOUND: 冶炼厂 |
| EMRT-MINE-SHEET-2X | EMRT 2.0 sheets include Mine List=True | NOT FOUND: Mine List（矿厂清单）<br>NOT FOUND: 2\.0 起 |
| EMRT-MINE-DROPDOWN-2.1 | EMRT 2.1 Mine List B5 list dv=True; EMRT 2.0 Mine List B5 list dv=False | NOT FOUND: 2\.1.*下拉<br>NOT FOUND: 2\.0.*手动 |
| AMRT-MINE-DROPDOWN-1.3 | AMRT 1.3 Mine List B5 list dv=True; 1.2=False; 1.1=False | NOT FOUND: Mine List.*下拉<br>NOT FOUND: 1\.1/1\.2.*手动|1\.1/1\.2.*手填 |
| MINE-BANG-CF | IF(FIND("!",F5),TRUE) ; IF(FIND("!",B5),TRUE) | NOT FOUND: 包含.*!.*触发提示 |
| EMRT-1X-DRC-MICA | EMRT 1.3 L sheet contains DRC only=True; India and/or Madagascar only=True | NOT FOUND: DRC only<br>NOT FOUND: India and/or Madagascar only |
| EMRT-DID-NOT-SURVEY | EMRT 2.0 has Did not survey=True; EMRT 1.3 has Did not survey=False | NOT FOUND: Did not survey |
| EMRT-1X-100PCT-NUMERIC | EMRT 1.3 L sheet Declaration B89 English value=1 | NOT FOUND: 100%.*对应值为 1 |
| EMRT-DECL-P38-P39-COBALT-MICA | EMRT 1.3 Declaration B38='Cobalt', B39='Mica'; P38='=IF(OR(D$26="No",D$26="Unknown",D$26="Not applicable for this declaration",D$32="No",D$32="Unknown",D$32="Not applicable for this declaration"),"","(*)")'; P39='=IF(OR(D$27="No",D$27="Unknown",D$27="Not applicable for this declaration",D$33="No",D$33="Unknown",D$33="Not applicable for this declaration"),"","(*)")' | NOT FOUND: Q3 是否从 CAHRA 采购指定矿产<br>NOT FOUND: Cobalt 回答<br>NOT FOUND: Mica 回答 |
| CMRT-SMELTER-LOOKUP | CMRT 6.5 Smelter List C5 list formulas=['SN'] | NOT FOUND: 冶炼厂查找为下拉字段 |
| EMRT-SMELTER-LOOKUP | EMRT 2.1 Smelter List C5 list formulas=['SN'] | NOT FOUND: 冶炼厂查找为下拉字段 |
| AMRT-SMELTER-LOOKUP-1.3 | AMRT 1.3 Smelter List C5 formulas=['SN']; 1.2 formulas=["'C'!$B$2:$B$251"] | NOT FOUND: 1\.3：新增 Smelter Look-up<br>NOT FOUND: 1\.1/1\.2：无 Smelter Look-up |
| EMRT-PRODUCT-REQUESTER | EMRT 2.1 Product List D5='Requester Product Number'; EMRT 2.0 Product List D5='Comments' | NOT FOUND: 请求方的产品编号<br>NOT FOUND: Product List 表头变化 |
| AMRT-PRODUCT-REQUESTER | AMRT 1.3 Product List D5='Requester Product Number', E5='Requester Product Name'; AMRT 1.2 Product List D5='Comments' | NOT FOUND: 请求方的产品编号<br>NOT FOUND: Product List 表头变化 |
| CHECKER-REQUIRED-FLAGS | CMRT 6.5 Checker F=1 found=True; EMRT 2.1 Checker F=1 found=True; CRT 2.21 Checker F=1 found=True; AMRT 1.3 Checker F=1 found=True | NOT FOUND: Checker 明确必填项<br>NOT FOUND: F=1 |
