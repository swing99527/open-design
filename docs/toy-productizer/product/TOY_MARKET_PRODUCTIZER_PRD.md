# Toy Market Productizer PRD

> 文档类型: Product Requirements Document
> 状态: current control draft
> 版本基线: 2026-06-07 Agent rebaseline
> 最后更新: 2026-06-08
> 上游文档: [Toy Market Productizer MRD](TOY_MARKET_PRODUCTIZER_MRD.md), [Toy Productizer Agent System Design](TOY_PRODUCTIZER_AGENT_SYSTEM_DESIGN.md)
> 关联规格: [Toy Productizer Interaction Spec](../01-product/TOY_PRODUCTIZER_INTERACTION_SPEC.md), [Toy Commercialization Pack Spec](../01-product/TOY_COMMERCIALIZATION_PACK_SPEC.md), [Toy Market Validation Playbook](../01-product/TOY_MARKET_VALIDATION_PLAYBOOK.md)

---

## 1. Product Definition

Toy Market Productizer 是面向玩具贸易商、工厂销售团队和产品开发型业务团队的 Agent-led Productization Workspace。

产品目标:

> 用户输入客户 brief、已有产品、参考图、市场线索或一句产品目标后，Productizer Agent 动态理解上下文、必要时提问、生成有商业约束的 Creative Directions，并持续维护客户可读 Proposal Artifact 和后续 Evidence / Handoff。

产品定位:

> Chat-driven, artifact-backed Productization Workspace.

V0 产品形态:

> Productized Service + SaaS Workbench.

V0 首发主场景:

> 已有产品或客户参考图 -> 3 个非照抄产品改造方向 -> 一份可发老客户的中文或英文 Proposal -> 手动记录买家反馈和交接证据。

产品不是:

- 通用 chatbot。
- 固定流程表单。
- PPT 生成器。
- AI 图片生成器。
- CRM。
- 报价、打样、供应商或生产系统。

---

## 2. MVP Validation Proposition

MVP 要验证:

> 玩具贸易商/工厂销售团队是否愿意付费，用一个专业 Productizer Agent 持续把真实业务输入转成更好的新品方向、客户提案和反馈证据。

成立信号:

- 用户带入真实客户、真实已有产品或真实参考任务。
- 用户通过 chat 修改、约束、选择或否决 Agent 方向。
- Proposal 被用于客户沟通或内部评审。
- 买家或团队产生具体反馈。
- 用户第二周继续提出真实任务。
- 用户愿意为试点或续费付费。

不成立信号:

- 用户只把系统当 AI 画图或文案工具。
- 用户不愿意提供真实上下文。
- Agent 方向无法明显优于用户直接用 ChatGPT。
- Proposal 没有被真实使用。

---

## 3. MVP Scope

V0 只设计并实现一条主路径，首发优先覆盖已有产品、样品照片、产品目录片段、客户参考图、竞品图或买家 brief 到 Proposal 的任务:

```text
Empty composer
  -> user provides task / references / constraints
  -> Productizer Agent builds Working Context
  -> Agent asks only if necessary
  -> Agent generates Creative Directions
  -> Agent creates first Proposal Draft
  -> user revises through chat
  -> Proposal Artifact updates with versions
  -> user selects or locks key direction through Action Card
  -> user captures buyer/team feedback
  -> Agent produces Evidence / Handoff
```

暂不设计:

- 复杂 dashboard。
- 完整 CRM。
- 供应商流程。
- 报价流程。
- 打样流程。
- 自动趋势平台。
- 多 Agent 分工 UI。

---

## 4. Core Product Objects

| 对象 | 用户是否默认看见 | 作用 |
|---|---:|---|
| Productizer Project | 否，摘要可见 | 当前项目目标和范围 |
| Working Context | 摘要可见，详情按需 | 多源输入、事实、约束、假设、证据、风险和冲突 |
| Creative Directions | 是 | Agent 生成并评估的产品方向 |
| Proposal Artifact | 是，主价值表面 | 客户可读提案和持续修改对象 |
| Proposal Versions | 是，按需 | 修改历史、差异和回滚 |
| Toy Commercialization Pack | 默认否 | 内部聚合对象，不是用户主价值表面 |
| Market Validation Asset | 按需 | Proposal 的外发/反馈承载形式 |
| Feedback Ledger | 按需 | 真实买家/团队反馈记录 |
| Readiness Review | 按需 | Handoff readiness，不是报价/打样闭环 |
| Action Cards | 只在需要决策时 | 锁定方向、外发、反馈、readiness、外部/高风险动作确认 |

聊天记录不是业务事实来源。

---

## 5. Functional Requirements

### 5.1 Main Composer

用户可以直接输入:

- 买家 brief 或客户原话。
- 已有产品描述、图片或文件。
- 参考图、商品图、竞品链接、社媒截图、展会照片。
- 市场线索或一句产品目标。
- 价格、材料、渠道、客户类型、SKU、包装等约束。

系统不得要求用户先选择唯一入口模式。

V0 可以接受市场线索或从零创意目标，但首发验收必须优先跑通:

```text
existing product / customer reference
  -> non-copy creative directions
  -> Chinese or English customer proposal
  -> manual buyer/team feedback
  -> handoff evidence
```

### 5.2 Working Context Creation

Agent 必须把输入整理为:

- facts。
- hard constraints。
- soft preferences。
- assumptions。
- evidence。
- risks。
- missing info。
- conflicts。

每个重要 context item 必须有来源、置信度、适用范围和是否用户确认。

### 5.3 Clarification

Agent 只在问题会显著改变产品方向、风险或商业约束时询问用户。

规则:

```text
information sufficient -> generate directly
missing but non-blocking -> generate with visible assumptions
direction/risk/cost/customer claim changes -> ask 1-3 focused questions
```

### 5.4 Creative Directions

Agent 必须生成 2-4 个 Creative Directions。

每个方向至少包含:

- concept title。
- product form。
- play / interaction / collecting mechanism。
- buyer/channel fit。
- SKU or lineup logic。
- packaging / CMF direction。
- commercial assumption。
- differentiation from references。
- key risks。
- why this may work。

Agent 不得固定输出某个品类。输入机器人盲盒时，不能默认变成 Desk buddy plush charm series。

以下方向必须被判为不合格并要求重写:

- 只换风格或文案，没有玩法、SKU、包装、渠道或价格带变化。
- 与参考图角色脸、轮廓、标志配件、配色或包装识别过近。
- 违反硬约束，例如用户明确不要毛绒却输出毛绒方向。
- 无法解释为什么适合目标买家或渠道。
- 目标价格带下没有材料、尺寸、包装或复杂度假设。
- 没有明确可问买家的反馈问题。
- 多个方向差异很小，只是同一概念换名字。

### 5.5 Proposal Draft

Agent 在足够信息下必须直接生成第一版 Proposal Draft。

Proposal 必须包含:

- proposal language: 中文、英文或 bilingual，由客户沟通场景决定，用户可切换。
- 客户需求或任务复述。
- 2-4 个方向比较。
- 推荐方向和理由。
- 客户可读卖点。
- 视觉/CMF/包装方向说明。
- SKU / lineup。
- 商业假设和未确认项。
- 3-5 个反馈问题。
- validation-only 边界说明。

Proposal 是 artifact，不是 chat 回复。

语言切换必须 patch 同一个 Proposal Artifact 并形成版本，不得重新生成一个丢失上下文的新提案。

### 5.6 Conversational Revision

用户可以用自然语言修改:

- “不要毛绒，改成机器人手办。”
- “更适合博物馆礼品店。”
- “价格压到 15 美元以内。”
- “再给我两个更高端方向。”
- “把这个方向做成钥匙扣系列。”

Agent 必须:

- 更新 Working Context。
- patch Proposal Artifact。
- 生成版本。
- 说明关键变化。
- 保持硬约束校验。

### 5.7 Version History

每次有意义的 Proposal 修改必须形成版本。

版本至少记录:

- version id。
- changed sections。
- user intent。
- agent rationale。
- context items changed。
- created at。
- created by。

### 5.8 Proposal Templates

模板用于表达，不用于限制 Agent 判断。

V0 保留三类 starter templates:

| Template | 适合对象 | 展示重点 |
|---|---|---|
| `collectible_line` | 潮玩、盲盒、手办、钥匙扣 | 角色系列、变体、包装、收藏感 |
| `plush_soft_goods` | 毛绒、公仔、抱枕 | 面料、尺寸、表情、触感、成本敏感点 |
| `gift_seasonal_set` | 节日礼品、促销品、文具礼盒、文旅周边 | 套装结构、价格带、渠道、场景 |

Agent 可以推荐模板。用户切换模板只影响 Proposal 表达，不应丢失 Working Context 或 Creative Directions。

### 5.9 Feedback Capture

系统必须记录真实客户或内部团队反馈:

- 无回复。
- 泛泛感兴趣。
- 选择某个方向。
- 提出具体修改。
- 问价格/MOQ/交期。
- 要样品。
- 要报价。
- 给数量、目标价、上市时间或渠道。

反馈可以来自链接、PDF、图片卡、邮件、WhatsApp、微信、电话、展会口头或销售手动录入。

### 5.10 Evidence / Handoff

系统必须生成 Handoff Brief，帮助后续团队接手。

Handoff 至少包含:

- selected direction。
- buyer/team feedback。
- facts and assumptions。
- unresolved questions。
- risk summary。
- missing info for quote/sample review。
- recommended next human owner。

Handoff 不得宣称报价或打样已经在 Productizer 内闭环。

### 5.11 Action Cards

Action Cards 只用于真实决策或高风险动作。

V0 Action Cards:

- Select / lock direction。
- Override or relax hard constraint。
- Share / export customer-visible proposal。
- Record confirmed buyer feedback if it changes readiness。
- Mark evidence ready for quote/sample review.

不得为以下内部步骤创建显眼确认:

- analyze input。
- generate draft。
- patch proposal。
- run eval。
- render reversible preview。

禁止自动执行:

- 正式报价。
- RFQ。
- 自动外发客户。
- 自动联系供应商。
- 打样。
- 生产。
- 法律/IP 清关。

---

## 6. Maturity Model

V0 使用 maturity label，而不是承诺性生产状态。

| Maturity | 含义 | 边界 |
|---|---|---|
| `ai_draft` | Agent 初稿 | 未验证，不是最终设计 |
| `proposal_ready` | 可供内部评审或客户初步讨论 | 仍需人工决定是否外发 |
| `market_testing` | 用户已用于客户或团队反馈 | 不代表客户真实购买 |
| `validated_interest` | 有具体买家/团队兴趣证据 | 不代表可报价或可打样 |
| `handoff_ready_for_sample_review` | 样品评审信息较完整 | 不是已打样，不自动触发样品 |
| `handoff_ready_for_quote_review` | 报价评审信息较完整 | 不是正式报价，不自动对外承诺 |

若工程暂时保留旧 enum `sample_ready` / `quote_ready_draft`，UI 和文案必须把它们解释为 handoff review draft，而非外部承诺。

---

## 7. Non-Goals

V0 不做:

- 普通个人 AI 潮玩图片生成器。
- 完整 3D 建模工具。
- 正式报价系统。
- 自动 RFQ。
- 自动客户外发。
- 自动供应商联系。
- 样品或生产 workflow。
- 开放 marketplace。
- 实体样品库存平台。
- 完整 CRM。
- 实时全网趋势平台。
- 多 Agent swarm 产品界面。

---

## 8. UX Principles

1. First-run 必须极简: 只显示项目入口和足够大的输入框。
2. Proposal-first: 用户最先看到客户可理解 Proposal，不是 Pack、Ledger、Gate。
3. Chat 要像专业 advisor: 解释判断、提出建议、承认假设，不播报系统状态。
4. Artifact-backed: 所有有价值输出必须进入 Proposal / Context / Direction / Feedback / Handoff。
5. Action Card 要少: 只出现在真实决策和高风险动作。
6. Internal state hidden by default: Pack、Evidence、Ledger、Readiness、Run 默认进 drawer / tab。
7. Reversible draft updates should be automatic: 生成和修改 Proposal 不应被过度确认打断。

---

## 9. Acceptance Criteria

V0 主路径验收:

- 用户在空白输入中提供已有产品或客户参考图描述后，系统能生成第一版中文或英文 Proposal Draft。
- Agent 在信息不足但不阻塞时能带透明假设生成，而不是停住。
- Agent 在方向会被价格、材料、渠道或客户类型显著改变时提出不超过 3 个问题。
- 系统生成至少 2 个 Creative Directions，且方向之间有真实差异。
- Creative Directions 通过 failure rubric: 非照抄、有产品机制、有渠道/价格/包装判断。
- 用户说“不要毛绒，改成机器人手办”后，Proposal 不再输出毛绒挂件方向。
- 用户说“更适合博物馆礼品店”后，渠道、包装、价格和卖点同步更新。
- 用户要求“改成中文给国内客户”或“改成英文给海外客户”后，Proposal 语言更新且方向、约束、反馈问题和版本历史保留。
- Proposal 有版本历史和 change summary。
- 客户可见内容不包含禁用承诺。
- 选择/锁定方向、外发/导出、readiness/handoff 变化通过 Action Card。
- 反馈被记录为 ledger，而不是只留在聊天里。

---

## 10. Metrics

| 指标 | 目标 |
|---|---:|
| 从真实 brief 到第一版 Proposal Draft | < 5 分钟 |
| 每个任务生成 Creative Directions | 2-4 个 |
| 用户修改后硬约束违规率 | < 5% |
| Proposal 被真实客户或内部团队使用 | 20 个 / 90 天 |
| 获得 3 分以上具体反馈 | 10 个 / 90 天 |
| 第 4 周愿意续费或继续付费试点 | 3 家试点中至少 2 家 |
| 团队认为 Handoff 减少重复整理 | 3 家试点中至少 2 家认可 |

---

## 11. Engineering Direction

工程更新应按以下顺序推进:

1. 定义 Productizer Agent loop、Working Context、Creative Directions、Proposal Artifact 和 Proposal Versions。
2. 调整 API，使主入口接受 user message / attachments / current artifact，而不是固定 `action` 枚举。
3. 调整 data model，支持多源 context items 和 proposal versioning。
4. 保留 Action Cards、Feedback Ledger、Run/Audit，但减少内部 draft 生成的确认。
5. 实现客户可见 guard。
6. 再接入可替换 agent runtime / workflow subroutines / image or renderer tools。

详细工程 handoff 见 [Toy Productizer Agent Rebase Engineering Handoff](../04-development/TOY_PRODUCTIZER_AGENT_REBASE_ENGINEERING_HANDOFF.md)。
