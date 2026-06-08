# Toy Market Validation Playbook

> 文档类型: Product Playbook
> 状态: current control draft
> 版本基线: 2026-06-07 Agent rebaseline
> 最后更新: 2026-06-08
> 上游文档: [Toy Market Productizer PRD](../00-product-planning/TOY_MARKET_PRODUCTIZER_PRD.md), [Toy Commercialization Pack Spec](TOY_COMMERCIALIZATION_PACK_SPEC.md)

---

## 1. Definition

Market Validation Asset 是 Proposal Artifact / Customer Proposal Pack 的外发和反馈承载形式。

目标:

> 在打样、报价、开模、备料之前，用低成本概念提案测试真实客户或内部团队是否愿意选择、修改、问价、要样、给数量或给目标时间。

它不是单一网页，也不是产品核心事实源。核心事实源仍是 Productizer 的 Working Context、Proposal Artifact、Feedback Ledger、Evidence / Handoff 和 Action Cards。

---

## 2. What Validation Can And Cannot Prove

Market validation 可以证明:

- 买家是否愿意看懂并回应这个方向。
- 买家偏好哪个方向。
- 买家会改什么。
- 买家是否开始询问价格、MOQ、交期、样品或数量。
- 内部团队是否认为方向值得继续评审。

Market validation 不能证明:

- 正式报价成立。
- 样品一定要做。
- 供应商已经确认。
- 生产可行性已经完成。
- 法律/IP 风险已经清除。
- 客户一定会下单。

Productizer 负责整理 evidence and handoff，不负责闭环报价/打样决策。

---

## 3. Asset Forms

V0 优先支持:

- Workbench customer preview。
- 可复制英文 proposal 文案。
- 轻量 share page 或 preview link。
- 客户反馈问题。
- 销售手动反馈录入入口。

后续支持:

- PDF / PPT。
- 邮件提案。
- 微信/WhatsApp 图片卡。

选择原则:

- 老客户和高价值客户: 优先 preview / copy block + 销售跟进。
- 快速沟通客户: 优先 copy block，后续补微信/WhatsApp 图片卡。
- 需要结构化反馈: 使用 share page 或 preview link。
- 客户口头反馈: 销售手动录入。

---

## 4. Customer-Visible Content Boundary

可以展示:

- 客户需求或任务复述。
- Creative Directions。
- 主推方向和推荐理由。
- 概念视觉或视觉方向说明。
- SKU / lineup、CMF 和包装方向。
- 核心卖点。
- 适合渠道或目标人群。
- 目标价格带或零售价带，并标注未确认。
- 可改项。
- 反馈问题。

不得展示:

- 内部成本。
- 工艺弱点。
- 未确认 MOQ。
- 未确认交期。
- 供应商信息。
- 正式报价暗示。
- 法律/IP 清关暗示。
- supplier-ready、quotation-ready、production-ready、final design、infringement-safe 等承诺。

---

## 5. Standard Feedback Questions

每个 Asset 默认只问 5 个关键问题:

1. 哪个方向最适合你的市场？
2. 目标零售价/批发价能接受在哪个区间？
3. 你会改哪里？
4. 是否需要样品或下一步资料？
5. 如果做，预估数量、上市时间或渠道是什么？

问题数量要少。客户愿意给具体动作，比填完整问卷更重要。

---

## 6. Feedback Strength

市场验证不以“好不好看”为核心，而以客户是否产生推进动作为核心。

| 分数 | 信号 | 处理建议 |
|---:|---|---|
| 0 | 无回复、不相关或拒绝 | 停止或回到创意方向选择 |
| 1 | 泛泛感兴趣、点赞、说 interesting | 保留观察，不进入 handoff readiness |
| 2 | 选择某个方向或风格 | 补充变体，继续问目标价/渠道 |
| 3 | 提出具体修改、材料、尺寸、配色或目标价 | 可进入规格收敛 |
| 4 | 询问 MOQ、交期、样品、报价或要求下一步资料 | 可标记 `validated_interest` |
| 5 | 给出数量、上市时间、预算、采购计划或愿意付样品费 | 可准备 sample/quote review handoff |

---

## 7. Feedback Credibility Tiers

反馈强度分回答“动作有多强”，可信度分层回答“这个反馈是否足以推动 readiness / handoff”。

| Tier | 来源 | 可用于 readiness / handoff |
|---|---|---:|
| `direct_buyer_artifact_response` | 买家在 share page、邮件、WhatsApp、微信截图、客户文件或可追溯消息中直接反馈 | 是 |
| `sales_entered_buyer_response` | 销售根据电话、展会口头、微信语音等手动录入，并由用户确认 | 是，需显示 `confirmed_by_user` |
| `internal_team_judgment` | 老板、产品、销售、报价或工程团队内部判断 | 可作为辅助证据，不能单独证明买家兴趣 |
| `agent_inferred_signal` | Agent 从沉默、语气、上下文或历史中推断 | 只能提示，不得推动 readiness 或 handoff |

规则:

- `validated_interest` 及以上成熟度必须有 `direct_buyer_artifact_response` 或已确认的 `sales_entered_buyer_response`。
- `internal_team_judgment` 可以帮助选择方向，但不能伪装成真实买家兴趣。
- `agent_inferred_signal` 只能生成建议或待确认问题，不得作为状态推进证据。
- 口头反馈可以被使用，但必须记录谁录入、何时录入、是否用户确认，以及原话摘要。

---

## 8. Feedback Ledger

每条反馈至少记录:

- Pack / Proposal ID。
- 客户或客户类型。
- 反馈渠道: link / PDF / image card / email / WhatsApp / WeChat / call / manual。
- feedback trust tier。
- 反馈时间。
- 反馈强度分。
- 直接来源引用: message link / screenshot / file / call note / manual note。
- 客户原话摘要。
- 选择的方向。
- 修改建议。
- 目标价格。
- 数量或数量范围。
- 样品/报价意向。
- 下一步 action。
- 是否由用户确认。
- confirmed by user。

反馈不应只保存在聊天里。

---

## 9. Evidence And Handoff Rules

状态推进是 Evidence / Handoff 判断，不是自动执行外部动作。

| 当前成熟度 | 证据条件 | 下一步 |
|---|---|---|
| `ai_draft` | 内部确认方向和边界标签完整 | 可生成/分享验证资产 |
| `proposal_ready` | Proposal 可以给客户或内部团队看 | 用户决定是否外发或展示 |
| `market_testing` | 已外发或展示给真实对象 | 记录反馈 |
| `validated_interest` | 至少一个可信 4 分反馈，或多个可信 3 分反馈 | 准备规格收敛 |
| `handoff_ready_for_sample_review` | 有可信样品意向且关键规格较完整 | 交给人工样品评审 |
| `handoff_ready_for_quote_review` | 有可信报价意向且报价前信息较完整 | 交给人工报价评审 |

任何 readiness 变化都应保留人工确认入口。Agent 可以建议，不应自动承诺。

可信反馈指 `direct_buyer_artifact_response` 或已由用户确认的 `sales_entered_buyer_response`。仅有内部判断或 Agent 推断时，系统可以建议继续验证，但不得推进到 `validated_interest` 或 handoff-ready 状态。

---

## 10. Four-Week Pilot Rhythm

### Week 1: Context And Task Calibration

- 访谈用户当前客户类型和产品方向。
- 收集历史参考图、已有产品、竞品链接或客户 brief。
- 建立轻量 Buyer / Factory / Product context。
- 选择 3-5 个真实任务进入 Agent proposal path。

### Week 2: Proposal And First Feedback

- 生成 Creative Directions 和 Proposal Artifacts。
- 用户修改、选择和确认客户可见版本。
- 用户发给真实客户或用于内部评审。
- 记录客户回复和团队反馈。

### Week 3: Iteration

- 基于反馈修正 Creative Directions 和 Proposal。
- 针对高分方向补规格、变体、价格和包装。
- 低分方向停止、合并或重新定位。

### Week 4: Handoff Review

- 汇总反馈和证据。
- 判断哪些方向适合进入样品评审或报价评审。
- 复盘用户是否愿意继续付费。

---

## 11. Success Criteria

试点成功信号:

- 用户愿意付费或续费。
- 用户真实使用 Proposal，而不是只内部收藏。
- 客户或内部团队给出 3 分以上反馈。
- 至少 2 家试点客户在第 4 周愿意续费或继续付费试点。
- 至少一个方向进入样品/报价评审讨论。
- 用户认为销售准备和交接整理时间明显下降。

试点失败信号:

- 用户只生成图片，不推进 Proposal。
- 客户只说“好看”，没有任何动作。
- 用户把概念图误当最终设计或报价图。
- 反馈集中在“太像原品”或“有侵权风险”。
- 销售不愿记录口头反馈。
- 后续团队仍需从头整理上下文。
