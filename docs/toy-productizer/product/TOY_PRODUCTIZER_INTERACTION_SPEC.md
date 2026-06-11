# Toy Productizer Interaction Spec

> 文档类型: Interaction / UX Specification
> 状态: current control draft
> 版本基线: 2026-06-07 Agent rebaseline
> 最后更新: 2026-06-08
> 上游文档: [Toy Market Productizer PRD](../00-product-planning/TOY_MARKET_PRODUCTIZER_PRD.md), [Toy Productizer Agent System Design](../00-product-planning/TOY_PRODUCTIZER_AGENT_SYSTEM_DESIGN.md)
> 设计系统: `DESIGN.md` Claude-style restrained Proposal Studio + Product Manager Workbench

---

## 1. Interaction Decision

Toy Productizer 必须是 conversation first，但不能 chat-only。

主交互:

> 用户通过 chat 表达目标、补充上下文和修改要求；Productizer Agent 自动维护右侧 Proposal Artifact、Creative Directions、Working Context 摘要、版本和证据记录。

用户感知:

> 我输入客户需求，系统会帮我形成一份客户提案；我继续聊天，右侧提案会持续更新。

V0 首发体验应优先让用户理解:

> 我把已有产品、客户参考图或买家 brief 丢进来，系统会帮我生成非照抄的新产品方向和可发老客户的中文或英文 Proposal。

系统事实来源:

```text
Working Context
  + Creative Directions
  + Proposal Artifact
  + Proposal Versions
  + Feedback Ledger
  + Evidence / Handoff
  + Action Cards
```

不是聊天 transcript，也不是固定 procedure rail。

---

## 2. First-Run Experience

First-run 必须极简。

默认只显示:

```text
Top Bar
Centered Main Composer
Recent examples or empty state hints
```

不默认显示:

- Pack。
- Ledger。
- Readiness。
- Action Card 列表。
- 多列后台。
- 趋势 dashboard。
- Procedure stepper。

First-run composer 示例 placeholder:

```text
Paste a buyer brief, describe an existing toy, or upload references. I will turn it into product directions and a customer proposal.
```

中文语气:

```text
粘贴客户需求、描述现有产品，或上传参考图。我会帮你整理新品方向和客户提案。
```

---

## 3. Main Workspace Layout

生成第一版 Proposal 后，Workspace 展开为:

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Top Bar: project title / save state / current maturity                     │
├──────────────┬────────────────────────────┬───────────────────────────────┤
│ Sidebar      │ Advisor Conversation       │ Proposal Workspace            │
│              │                            │                               │
│ New Project  │ User messages              │ Tabs:                         │
│ Recent       │ Advisor judgment           │ Proposal / Directions         │
│ Search       │ Clarifying question        │ Context / Feedback / Handoff  │
│ Profiles     │ Inline Action Card only    │                               │
│              │ when needed                │ Current proposal artifact     │
└──────────────┴────────────────────────────┴───────────────────────────────┘
```

默认 tab:

- 没有输出前: 不显示右侧 Workspace 或显示 empty draft。
- 生成第一版后: `Proposal`。
- 用户比较方向时: `Directions`。
- 记录反馈时: `Feedback`。
- 准备交接时: `Handoff`。

---

## 4. Primary User Path

### Step 1: User Starts With Any Real Business Input

用户可以输入:

```text
我们有一款普通机器人钥匙扣，老客户发来一张复古航天机器人参考图，想做博物馆礼品店可卖的新品，零售价 15 美元以内，但不要太像原图。
```

也可以上传图片、链接、已有产品、客户邮件或 WhatsApp 摘要。

Agent 行为:

- 识别目标。
- 读取附件和上下文。
- 建立 Working Context。
- 判断是否需要确认问题。

### Step 2: Agent Asks Only If Necessary

如果信息足够:

```text
Agent:
我会按“博物馆礼品店 / 15 美元零售上限 / 复古机器人盲盒 / 避免近似轮廓”先做第一版方向。
```

如果关键不确定:

```text
Agent:
我只需要确认两个会影响方向的问题：
1. 这是给成人收藏还是儿童礼品？
2. 你更希望偏教育科普，还是偏复古装饰？
```

不允许一上来要求完整表单。

### Step 3: Agent Generates First Proposal Draft

右侧自动出现 Proposal Workspace。

Proposal Draft 包含:

- proposal language: 中文、英文或 bilingual。
- task recap。
- 2-4 个 Creative Directions。
- recommended direction。
- SKU / lineup。
- CMF / packaging。
- customer-facing selling points。
- commercial assumptions。
- feedback questions。
- boundary labels。

左侧 Advisor 不播报内部步骤，而解释判断:

```text
Agent:
我没有把它做成毛绒，因为你的硬约束是机器人盲盒和博物馆礼品店。第一版主推方向是“Retro Science Robot Mini Series”，它更容易解释为文旅/科普礼品，也能避开参考图的具体角色轮廓。
```

### Step 4: User Revises Through Chat

用户可以说:

```text
不要盲盒，改成钥匙扣系列。
```

或:

```text
更高端一点，适合礼品店橱窗展示。
```

或:

```text
保留机器人，但加入可换表情玩法。
```

或:

```text
改成中文给国内客户看。
```

Agent 必须:

- 更新 Working Context。
- patch Proposal。
- 生成 version。
- 说明变化。
- 显示 changed sections。
- 切换 Proposal language 时保留当前方向、约束、反馈问题和版本历史。

### Step 5: Key Decision Uses Action Card

当用户要锁定方向或外发时，出现 Action Card。

```text
Action Card: Lock Direction
Direction: Retro Science Robot Keychain Series
Why: matches museum gift shop, price cap, lower silhouette similarity
Risk: target retail under $15 still depends on material and packaging

[Confirm] [Revise] [Dismiss]
```

Action Card 不用于内部 draft 生成。

### Step 6: Feedback And Handoff

用户收到买家反馈后输入:

```text
客户说第二个方向更适合，想知道 MOQ 和样品费用，目标 3000 个，9 月上架。
```

Agent 行为:

- 摘要反馈。
- 写入 Feedback Ledger，包括 feedback trust tier、来源引用和用户确认状态。
- 更新 Evidence / Handoff。
- 如影响 readiness，提出 Action Card。
- 明确缺失信息和外部团队接手点。

---

## 5. Advisor Conversation Rules

Advisor 必须像专业产品经理 / 提案设计师，不像后台任务日志。

应该说:

```text
我建议把方向从“可爱机器人”收敛到“复古科学馆机器人系列”，因为它更符合博物馆礼品店的购买场景，也更容易做成 6 款 SKU。
```

不应该说:

```text
Analyze Signal completed. Generate Pack next. Render Proposal pending.
```

每轮回复优先包含:

- 判断。
- 理由。
- 当前假设。
- 用户可采取的下一步。
- 必要的风险。

不要把内部对象名压给用户，除非用户打开详情。

---

## 6. Proposal Workspace

### 6.1 Proposal Tab

Purpose:

> Customer-readable proposal artifact.

展示:

- proposal title。
- customer/task recap。
- recommended direction。
- direction comparison。
- concept / visual direction。
- SKU lineup。
- CMF / material / packaging strip。
- selling points。
- commercial assumptions with labels。
- feedback questions。
- boundary statement。

隐藏:

- 内部成本。
- 供应商 notes。
- 工艺弱点。
- raw model output。
- internal risk score。

### 6.2 Directions Tab

Purpose:

> Compare and select Creative Directions.

展示:

- 2-4 个 direction cards。
- why this may work。
- buyer/channel fit。
- constraints satisfied。
- risk flags。
- differentiation from references。

### 6.3 Context Tab

Purpose:

> Inspect Working Context when needed.

默认只显示 chips:

```text
Using: [Robot blind box] [Museum gift shop] [$15 retail cap]
Locked: [Not plush] [Avoid close silhouette copy]
Assuming: [Adult collectible] [6-SKU series]
Missing: [Target size] [Material preference]
```

完整来源和 evidence 放进 drawer。

### 6.4 Feedback Tab

Purpose:

> Capture real buyer/team feedback.

展示:

- feedback channel。
- feedback trust tier。
- feedback score。
- source reference。
- confirmed by user。
- raw summary。
- selected direction。
- target price / quantity / timeline。
- sample or quote question。
- next action。

### 6.5 Handoff Tab

Purpose:

> Prepare evidence for the next human team.

展示:

- selected direction。
- confirmed facts。
- assumptions。
- buyer/team feedback。
- missing info。
- risks。
- recommended owner。
- sample/quote review checklist。

---

## 7. Version And Change History

Proposal 每次重要修改都要形成 version。

UI 至少支持:

- version list。
- current version label。
- changed sections。
- short change summary。
- show changes。
- restore or duplicate later。

示例:

```text
v3
Changed: product form, SKU lineup, packaging, selling points
Reason: user changed from blind box to keychain series
```

---

## 8. Action Card Rules

Action Cards 是决策对象，不是普通按钮。

出现时机:

- 选择或锁定主推方向。
- 覆盖硬约束。
- 忽略高风险。
- 分享/导出客户可见 Proposal。
- 记录可信客户反馈并改变 maturity / handoff。
- 标记 handoff ready for sample/quote review。
- 任何未来 RFQ、报价、打样、供应商、客户自动外发动作。

不出现时机:

- 分析输入。
- 生成第一版草稿。
- patch Proposal。
- 运行评估。
- 渲染可撤销 preview。

---

## 9. Customer-Visible Boundary

客户可见内容必须避免:

- 正式报价承诺。
- 供应商已确认暗示。
- 样品已准备暗示。
- 生产可行性确定声明。
- 法律/IP 清查完成声明。
- internal cost / supplier / unconfirmed MOQ。

推荐边界 copy:

```text
Concept proposal for market discussion.
Details such as final size, material, MOQ, price, sample path, and IP review require human confirmation.
```

---

## 10. Mobile / Narrow Layout

窄屏可以折叠为:

```text
Top Bar
Tabs: Chat | Proposal | Directions | Context | Feedback | Handoff
Sticky Composer
Inline Action Card when needed
```

要求:

- 用户不能只能通过 chat 历史找 Proposal。
- 当前 Action Card 必须容易发现。
- Proposal 修改后必须有可见保存/版本状态。

---

## 11. Interaction Acceptance Criteria

- 5 秒内用户能理解: 输入客户需求，系统会形成客户提案。
- 第一版 Proposal 生成前，界面不展示复杂内部对象。
- 第一版 Proposal 生成后，右侧工作区出现。
- Chat 是自然对话，不是信息卡片流。
- 用户自然语言修改后，Proposal 可见更新。
- 用户能看到版本和修改摘要。
- Action Cards 少而明确。
- Pack、Ledger、Run、Readiness 默认不常驻主屏，Context / Feedback / Handoff 按需查看。
- 反馈录入能区分直接买家反馈、销售手动录入、内部团队判断和 Agent 推断。
- 未审核 AI 输出不会被描述为可报价、可生产、最终设计或无侵权。
