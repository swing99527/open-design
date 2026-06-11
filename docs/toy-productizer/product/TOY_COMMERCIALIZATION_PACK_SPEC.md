# Toy Commercialization Pack Spec

> 文档类型: Product Object Specification
> 状态: current control draft
> 版本基线: 2026-06-07 Agent rebaseline
> 最后更新: 2026-06-08
> 上游文档: [Toy Market Productizer PRD](../00-product-planning/TOY_MARKET_PRODUCTIZER_PRD.md), [Toy Productizer Agent System Design](../00-product-planning/TOY_PRODUCTIZER_AGENT_SYSTEM_DESIGN.md)

---

## 1. Definition

Toy Commercialization Pack 是 Productizer 内部业务聚合对象。

它把 Productizer Project、Working Context、Creative Directions、Proposal Artifact、Evidence、Feedback、Readiness Review 和 Action Cards 组织在同一个可追溯业务边界下。

Pack 不是用户最先感知的价值，也不是正式报价单、生产图纸、供应商 RFQ、法律清关文件或最终产品设计。

用户最先看到的价值表面是:

> Proposal Artifact / Customer Proposal Pack.

Pack 的角色:

> Internal business aggregate for productization context, artifact state, evidence, feedback, readiness review, and authorization.

---

## 2. Relationship To Agent System

```text
Productizer Project
  -> Working Context
  -> Creative Directions
  -> Proposal Artifact
  -> Toy Commercialization Pack
       - internal sections
       - artifacts
       - feedback
       - readiness review
       - action cards
       - audit
```

Pack 不应把 Agent 固定到 `Reference Signal -> Remix -> Pack` 的单一路径。Reference Signal 只是可能的 context source。

---

## 3. Pack Sections

V0 Pack sections 应支持 Agent-led 工作，而不是固定 procedure。

| Section | 作用 | 用户默认可见 |
|---|---|---:|
| `project_brief` | 当前项目目标、范围和用户 intent | 摘要 |
| `working_context_summary` | 当前事实、约束、假设、风险和缺失信息摘要 | 是 |
| `context_items` | 多源上下文的结构化记录 | 否，drawer |
| `creative_directions` | 2-4 个创意产品方向 | 是 |
| `selected_direction` | 当前选中的主推方向 | 是 |
| `proposal_artifact` | 客户可读 Proposal 的结构化内容 | 是 |
| `proposal_versions` | 修改历史和差异 | 按需 |
| `visual_direction` | 概念视觉、CMF、包装和展示语言 | 是 |
| `commercial_assumptions` | 价格带、SKU、渠道、材料、MOQ 等假设 | 是，标注未确认 |
| `risk_review` | 相似、IP、成本、工艺、渠道或表达风险 | 摘要 |
| `missing_info` | 报价/样品评审前缺失信息 | 按需 |
| `customer_visible_boundary` | 客户可见内容边界和禁用声明检查 | 否，系统 guard |
| `feedback_summary` | 买家/团队反馈摘要 | 按需 |
| `handoff_brief` | 后续团队交接材料 | 按需 |
| `action_cards` | 真实决策和高风险动作授权 | 仅需要时 |

旧 sections 如 `source_context`、`signal_breakdown`、`remix_angles` 可以作为兼容字段保留，但不再是所有任务的必经结构。

---

## 4. Creative Directions

Creative Directions 是 Agent 创意产品化能力的核心产物。

每个 direction 至少包含:

- `id`
- `title`
- `product_form`
- `play_or_collecting_mechanism`
- `buyer_channel_fit`
- `sku_lineup_logic`
- `visual_cmf_packaging_direction`
- `commercial_assumptions`
- `reference_differentiation`
- `risk_flags`
- `why_this_may_work`
- `confidence`

Agent 必须解释方向为什么适合买家、渠道和约束，而不是只列灵感。

---

## 5. Proposal Artifact

Proposal Artifact 是用户主工作对象，也是客户可见 Customer Proposal Pack 的来源。

必须包含:

- proposal language: `zh` / `en` / `bilingual`。
- customer / task recap。
- creative direction comparison。
- recommended direction and rationale。
- product story。
- SKU / lineup。
- CMF / packaging direction。
- customer-facing selling points。
- commercial assumptions with `unconfirmed` labels。
- editable feedback questions。
- validation-only boundary。

Proposal Artifact 必须支持:

- language switching without losing context, directions, feedback, or versions。
- versioning。
- patch updates。
- change summary。
- customer-visible / internal split。
- source links back to context items。

---

## 6. Concept Visuals

概念视觉属于 Proposal/Pack 的辅助资产，但边界必须严格。

V0 concept visuals 可以包含:

- hero concept image or visual direction。
- 2-3 个视觉变体。
- CMF / material / finish mood。
- 包装方向说明。
- 视觉边界标签。

默认标签:

```text
AI draft
For market validation only
Requires human review before sample, quote, listing, or production
Similarity risk screen only
```

不得称为:

- 最终生产设计。
- 工程图。
- 结构图。
- 生产图。
- 报价图。
- 无侵权证明。

---

## 7. Customer Proposal Pack

Customer Proposal Pack 是 Proposal Artifact 的客户可见投影。

它必须隐藏:

- 内部成本。
- 工艺弱点。
- 未确认供应商信息。
- 内部风险评分细节。
- 正式报价暗示。
- supplier-ready、production-ready、quotation-ready、final design、infringement-safe 等承诺性表述。

可渲染输出视图:

- Workbench customer preview。
- Share / preview link。
- Copy block。
- PDF。
- PPT。
- WhatsApp / WeChat image card。
- Email proposal。

输出视图是 renderer 结果，不是系统事实来源。

---

## 8. Market Validation Asset

Market Validation Asset 是 Customer Proposal Pack 的外发和反馈承载形式。

它的作用:

> 让用户在打样、报价、开模、备料之前，以低成本收集真实客户或团队反馈。

它不是 Productizer 的核心事实源，也不是报价/打样闭环。

---

## 9. Non-Copy Remix Policy

Toy Productizer 不能承诺法律意义上的不侵权，只能做相似风险筛查和非照抄约束。

禁止输出:

- 相同或高度相似的角色脸、角色轮廓、标志性配件、商标、logo、包装识别元素。
- 对知名 IP、艺术家作品、平台爆品的近距离复刻。
- 用“无侵权”“已清关”“可直接量产”等确定性法律或生产承诺描述 AI 输出。

允许借鉴:

- 主题、情绪、用户场景、材料方向、玩法机制、渠道洞察、价格带、尺寸带、系列化逻辑。
- 与原参考拉开角色、轮廓、配件、表情、配色和包装识别的差异化方向。

默认声明:

```text
Similarity risk screen only.
Not legal clearance.
Human IP review required before sample, quotation, public listing, or production.
```

---

## 10. Readiness Review

Readiness Review 是交接评审，不是系统内完成报价或打样决策。

### 10.1 Handoff Ready For Sample Review

至少需要:

- 用户或买家确认的产品方向。
- 可信反馈: `direct_buyer_artifact_response` 或已用户确认的 `sales_entered_buyer_response`。
- 目标尺寸或尺寸范围。
- 材料/工艺假设。
- 目标价格带或成本约束。
- 相似风险提醒。
- 样品目的说明。

### 10.2 Handoff Ready For Quote Review

至少需要:

- 产品方向。
- 可信反馈: `direct_buyer_artifact_response` 或已用户确认的 `sales_entered_buyer_response`。
- 数量或数量范围。
- 目标价或价格带。
- 尺寸。
- 材料/工艺假设。
- 包装方向。
- 交期期望。
- 授权/IP 状态提示。

任何 readiness label 都不得被解释为正式报价、已打样、供应商已确认或法律已清查。

`internal_team_judgment` 可以作为辅助证据，但不能单独推进到 `validated_interest` 或 handoff-ready。`agent_inferred_signal` 只能提示继续验证，不能作为 readiness evidence。

---

## 11. Action Card Boundary

以下动作必须通过 Action Card:

- 选择或锁定主推 Creative Direction。
- 覆盖硬约束或忽略高风险提示。
- 生成或分享客户可见外发资产。
- 记录会影响 readiness 的客户反馈。
- 标记 handoff ready for sample review。
- 标记 handoff ready for quote review。
- 生成多视图、3D、PPT、包装展开、样品路径等高承诺资产。

以下动作不应被 Action Card 打断:

- 分析输入。
- 生成 Creative Directions 草稿。
- 生成第一版 Proposal Draft。
- 根据用户自然语言 patch Proposal。
- 运行可撤销的评估。

以下动作不得自动执行:

- 正式报价。
- RFQ。
- 自动外发客户。
- 自动联系供应商。
- 打样。
- 生产。
- supplier-ready / quote-ready / production-ready 声明。
