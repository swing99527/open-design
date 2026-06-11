# Toy Productizer Positioning Brief

> 文档类型: Product Positioning Brief
> 状态: current control draft
> 版本基线: 2026-06-07 Agent rebaseline
> 最后更新: 2026-06-08
> 上游文档: [Toy Productizer Agent System Design](TOY_PRODUCTIZER_AGENT_SYSTEM_DESIGN.md), [Toy Market Productizer MRD](TOY_MARKET_PRODUCTIZER_MRD.md)

---

## 1. Positioning

Toy Productizer 不是通用 chatbot、流程表单、PPT 生成器、AI 图片生成器或 CRM。

产品定位:

> Chat-driven, artifact-backed Productization Workspace powered by a Creative Productization Agent.

一句话:

> 帮玩具生意团队把客户 brief、已有产品、参考图和市场线索转成有商业约束的新品方向，并持续维护客户可读 Proposal 和后续交接证据。

---

## 2. User Perception

用户应该感受到:

> 我在和一位专业玩具产品经理 / 提案设计师协作；他理解客户需求和参考信息，快速整理新品方向，并在旁边生成一份可以持续修改的客户提案。

5 秒内:

> 我输入客户需求，系统会帮我形成一份客户提案。

5 分钟后:

> 它比直接用 ChatGPT 强，因为提案不会丢，修改有版本，反馈能记录，团队能审核，下一步判断有依据。

---

## 3. Core Value

核心竞争力:

> Creative Productization Agent.

价值呈现:

> Conversational Proposal Workspace.

系统不是从单一 Reference Signal 机械生成 Pack。Agent 必须能处理:

- 买家 brief。
- 已有产品。
- 参考图。
- 市场/竞品线索。
- 工厂能力。
- 渠道和价格约束。
- 历史 Proposal 和反馈。
- 用户的临时改口和人工判断。

---

## 4. First Paying User

首发付费用户:

- 玩具贸易商老板或业务负责人。
- 潮玩/礼品/手办/毛绒工厂老板或外贸负责人。
- 产品开发型销售团队负责人。

他们购买的不是“AI 工具账号”，而是:

> 更快形成客户能看懂的新产品方向，并把反馈和交接材料整理清楚。

---

## 5. Product Surface

默认主界面:

```text
Main Composer
  + Advisor Conversation
  + Proposal Workspace
```

生成后工作区:

```text
Proposal
Directions
Context
Feedback
Handoff
```

默认隐藏:

- 完整 Pack schema。
- Raw ledger。
- Procedure 状态。
- Run/Audit events。
- Readiness 内部规则。

---

## 6. Business Objects

| Object | Role |
|---|---|
| Productizer Project | 当前项目目标 |
| Working Context | 多源信息、事实、约束、假设、证据和风险 |
| Creative Directions | Agent 生成并评估的新品方向 |
| Proposal Artifact | 用户主价值表面 |
| Proposal Versions | 修改历史和差异 |
| Toy Commercialization Pack | 内部聚合对象 |
| Market Validation Asset | Proposal 的外发/反馈承载形式 |
| Feedback Ledger | 买家/团队反馈记录 |
| Evidence / Handoff | 后续团队交接材料 |
| Action Cards | 真实决策和高风险动作授权 |

---

## 7. Boundaries

Productizer 不承诺:

- 正式报价。
- RFQ。
- 自动外发客户。
- 自动联系供应商。
- 打样。
- 生产。
- 法律/IP 清关。
- supplier-ready、quotation-ready、production-ready、final design 或 infringement-safe。

Productizer 可以输出:

- 创意产品方向。
- 客户可读 Proposal。
- 事实、假设和风险。
- 买家/团队反馈摘要。
- 样品/报价评审前的 handoff evidence。

---

## 8. MVP Focus

V0 只做:

```text
已有产品或客户参考图
  -> 3 个非照抄产品改造方向
  -> 一份可发老客户的中文或英文 Proposal
  -> 通过 chat 修改和版本追踪
  -> 关键决策 Action Card
  -> 手动记录买家反馈和交接证据
```

暂不做:

- 复杂 dashboard。
- CRM。
- 供应商流程。
- 报价流程。
- 打样流程。
- 多 Agent 产品界面。
