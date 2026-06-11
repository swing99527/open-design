# Toy Productizer Open System Model

> 文档类型: System Positioning / Information Flow Model
> 状态: current control draft
> 版本基线: 2026-06-07 Agent rebaseline
> 最后更新: 2026-06-07
> 上游文档: [Toy Productizer Agent System Design](TOY_PRODUCTIZER_AGENT_SYSTEM_DESIGN.md)
> 适用范围: 开放系统边界、外部输入、内部状态、输出、反馈和系统健康
> 不包含: 页面视觉细节、API schema、数据库 schema、报价/打样执行流程

---

## 1. Executive Definition

Toy Productizer 不是一个封闭 prompt-to-proposal 工具。

它是一个开放产品化系统:

> 持续吸收买家需求、已有产品、参考图、市场信号、团队经验和商业约束，并由 Productizer Agent 将这些高熵信息转化为可讨论的创意方向、可修改的客户提案和可交接证据。

系统主干:

```text
External Inputs
  -> Productizer Agent
  -> Working Context
  -> Creative Productization
  -> Proposal Artifact
  -> Buyer / Team Response
  -> Evidence And Handoff
  -> Context Updates
```

这不是固定 route。Agent 根据目标和当前上下文动态选择下一步。

---

## 2. Open System Boundary

从系统论角度看，Productizer 必须持续消耗外部输入才能维持质量。模型预训练知识和一次性用户 prompt 不能单独支撑产品价值。

### 2.1 Inputs

系统输入包括:

- 当前任务中的客户 brief、已有产品、参考图、链接、文件和创意目标。
- 跨任务复用的买家、工厂、团队、产品库、历史 proposal 和历史反馈。
- 外部市场、竞品、玩法、包装、SKU、渠道和节日信号。
- 用户在对话中的选择、否决、修改、确认和补充。
- 买家回应和内部团队意见。
- 后续报价、打样、成交或失败的结果，如果用户愿意回填。

这些输入不等价。系统必须区分事实、约束、偏好、假设、证据、风险、缺失信息和冲突。

### 2.2 Internal State

系统内部状态不是聊天记录，而是:

- Productizer Project。
- Working Context。
- Creative Directions。
- Proposal Artifact。
- Proposal versions。
- Evidence / Feedback / Handoff。
- Action Cards。
- Run / Audit ledgers。

### 2.3 Outputs

系统输出不是正式报价、打样指令或生产结论。

主要输出:

- 有约束的新品创意方向。
- 客户可理解、可回应的 Proposal Artifact。
- 事实、假设、风险和缺失信息。
- 买家兴趣证据与反馈摘要。
- 给老板、产品、报价或工程团队的 Handoff Brief。

### 2.4 External Decisions

以下决策通常发生在系统外部:

- 是否正式报价。
- 是否安排打样。
- 是否联系供应商。
- 是否开模、备料或生产。
- 是否完成法律/IP 清查。
- 是否承诺成本、MOQ、交期和生产结果。

Productizer 可以整理证据和建议，但不应宣称这些外部决策已经在系统内闭环。

---

## 3. Three-Layer Input Organization

所有信息不能被设计成并列输入口。用户只需要一个主入口，系统负责组织多源输入。

| 层 | 名称 | 定义 | 典型形式 |
|---|---|---|---|
| Layer 1 | Current Task Input | 为当前任务提供的 brief、参考、目标和约束 | 主输入框、附件、链接、粘贴文本、少量确认问题 |
| Layer 2 | Persistent Business Context | 跨任务复用的买家、工厂、团队、产品库、历史反馈 | Profile、Library、Team Memory、历史 Proposal |
| Layer 3 | Ambient External Signals | Agent 按需检索或引用的市场、竞品、玩法、渠道信息 | Reference library、search、evidence drawer |

Layer 不是模式选择。Agent 可以在同一任务中同时使用三层信息。

---

## 4. Entropy Reduction

Productizer 的系统价值是降低新品机会的不确定性。

```text
High-entropy state
  - scattered inputs
  - unclear buyer intent
  - mixed references
  - incomplete constraints
  - unverified assumptions
  - ambiguous interest

Productizer Agent
  - classify
  - ask sparingly
  - retrieve context
  - ideate
  - evaluate
  - version artifacts
  - capture evidence

Lower-entropy state
  - clear creative directions
  - explicit assumptions
  - customer-readable proposal
  - recorded feedback
  - handoff-ready evidence
```

降低不确定性不等于制造确定性。系统必须保留未知项，而不是伪造报价、法律清查或生产可行性结论。

---

## 5. Control Loop

系统的控制回路不是单纯 feedback。它包括外部输入、内部状态转换、输出、外部响应和上下文更新。

```text
1. External input arrives
2. Agent updates Working Context
3. Agent creates or revises Creative Directions
4. Agent patches Proposal Artifact
5. User reviews, edits, selects, rejects, or shares
6. Buyer or team response is captured
7. Evidence / Handoff is updated
8. Persistent context learns cautiously with provenance
```

学习规则:

- 用户修正是强信号，但仍需记录适用范围。
- 买家反馈比内部喜好更接近真实需求。
- 礼貌性反馈不能直接当成购买兴趣。
- 单次结果不能自动写成永久规则。
- 后续报价/打样/成交结果如果缺失，系统必须标明证据链未闭环。

---

## 6. User-Facing Surface

多源输入不等于复杂界面。

用户默认看到:

```text
Main Composer
  + Advisor Conversation
  + Proposal Workspace
  + Minimal Context Summary
  + Necessary Decision / Risk Confirmation
```

按需打开:

```text
Source Tray
Context Drawer
Profile / Library
Version History
Feedback Capture
Evidence / Handoff View
Action Card Detail
Run / Audit History
```

默认隐藏:

- 完整 Pack schema。
- Raw ledger。
- Procedure 状态。
- 完整 evidence 表。
- Readiness 内部规则。
- Agent run 和 audit events。

---

## 7. System Health

系统是否有效，不能用生成次数判断。

### 7.1 Real Demand Signals

- 用户带入真实客户 brief、已有产品、参考图或产品问题。
- 用户愿意修正并继续维护 Proposal。
- Proposal 被真实发送、展示或讨论。
- 买家给出方向选择、具体修改、目标价、数量、时间或下一步问题。
- 内部团队认为 handoff 更清楚，不需要从头整理。
- 用户第二周继续提供真实任务。
- 用户愿意为持续产出的 Proposal 和证据整理付费。

### 7.2 False Demand Signals

- 用户只生成图片或文案，但不用于真实客户。
- 用户只觉得创意有趣，没有业务动作。
- 买家只说 `nice` 或 `interesting`。
- 用户拒绝提供真实上下文，也不愿维护约束。
- 后续团队仍需从头整理所有信息。

### 7.3 System Metrics

优先观察:

1. 从真实 brief 到第一版可用 Proposal 的时间。
2. 用户修改后仍违反硬约束的比例。
3. Creative Directions 被用户采纳、修改或否决的比例。
4. Proposal 被真实客户或内部团队使用的比例。
5. 获得具体买家回应的 Proposal 数量。
6. Handoff 被后续团队接受而无需重新整理的比例。
7. 第二周继续使用真实任务的团队比例。

---

## 8. Product-Owned vs Replaceable

Productizer 必须拥有:

- Working Context 及其语义。
- 玩具品类、玩法、渠道和商业约束体系。
- Creative Productization Skills。
- Proposal Artifact 和版本。
- 用户选择、买家回应和 Handoff Evidence。
- 约束校验、风险边界和质量评测。
- Action Card 授权和审计。

可替换的是:

- 通用大模型。
- Chat UI 组件。
- Agent runtime。
- Workflow 框架。
- 图像生成模型。
- PDF / PPT renderer。
- CRM、邮件和消息渠道连接器。

如果 Productizer 只剩 prompt、模型和 UI 组件，它没有核心壁垒。
