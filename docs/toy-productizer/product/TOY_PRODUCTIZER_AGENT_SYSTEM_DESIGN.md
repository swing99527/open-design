# Toy Productizer Agent System Design

> 文档类型: Agent System / Product Control Design
> 状态: current control draft
> 版本基线: 2026-06-07 Agent rebaseline
> 最后更新: 2026-06-08
> 上游决策: Toy Productizer 从固定 workflow 重定基线为 Agent-led productization system
> 适用范围: Agent 定义、系统边界、上下文、Skills、Tools、Artifacts、权限、评估和工程控制
> 不包含: 具体页面视觉、数据库迁移 SQL、模型供应商选择、报价/打样/供应商执行流程

---

## 1. Executive Decision

Toy Productizer 的产品主干不是固定流程，也不是通用 chatbot。

新的系统定义:

> Chat-driven, artifact-backed Productization Workspace powered by a Creative Productization Agent.

用户感知:

> 我在和一位专业玩具产品经理 / 提案设计师协作。他能理解客户需求、已有产品、参考图和市场线索，在信息不完整时提出少量关键问题，生成有商业约束的创意产品方向，并持续维护一份客户可以理解的 Proposal。

系统底层:

```text
Productizer Agent
  -> Working Context
  -> Creative Directions
  -> Proposal Artifact
  -> Evidence / Feedback / Handoff
  -> Action Cards for real decisions
  -> Durable Ledgers
```

固定 workflow 不是产品主干。Workflow 只能作为 Agent 可调用的确定性子程序存在。

---

## 2. Agent Definition

在本产品中，Agent 的定义是:

> 一个代表用户完成产品化目标的系统。它能维护上下文状态，处理多源、不完整和冲突信息，动态决定下一步是提问、检索、分析、创意、评估、生成还是请求确认，并把结果写入可追溯业务产物。

Agent 与 workflow 的区别:

| 维度 | Workflow | Agent |
|---|---|---|
| 主干 | 预定义步骤 | 目标、上下文、约束和工具选择 |
| 下一步 | 代码/流程规定 | Agent 根据当前状态判断 |
| 输入 | 固定表单或固定入口 | 多源、异步、不完整、可冲突 |
| 输出 | 流程节点产物 | 持续维护的 artifact 和 ledger |
| 异常 | 跳转到错误分支 | 澄清、假设、降级、请求人工判断 |
| 价值 | 稳定执行 | 处理不确定性并形成判断 |

Toy Productizer 可以使用 workflow，但不能被 workflow 定义。

---

## 3. Product Value From First Principles

玩具新品前期的核心问题不是“缺少生成能力”，而是机会处于高熵状态:

- 客户 brief 模糊。
- 参考图、已有产品和市场热点来源混杂。
- 创意容易脱离价格、渠道、材料、SKU 和供应链约束。
- 热度不等于真实买家兴趣。
- 销售、老板、产品、报价和工程团队对同一个方向缺少共同上下文。
- 后续报价/打样不会在本系统里闭环，但需要清楚的交接材料。

Productizer 的核心价值:

> 降低新品机会进入后续评估前的不确定性，产出值得继续讨论的创意方向、客户可读提案和可交接证据。

因此产品的 A/B 结构是:

| 层级 | 定义 | 说明 |
|---|---|---|
| A 核心竞争力 | Creative Productization Agent | 对已有产品、参考图、买家 brief、市场线索和商业约束做创意产品化判断 |
| B 价值呈现 | Conversational Proposal Workspace | 用 chat + proposal artifact + 版本/反馈/交接，把 Agent 价值变成用户可感知产物 |

如果只有 B，没有 A，产品就是 ChatGPT prompt 套壳加模板渲染。

### 3.1 V0 Beachhead

V0 不追求覆盖所有玩具产品化场景。首发 wedge 是:

> 已有产品或客户参考图 -> 3 个非照抄产品改造方向 -> 一份可发老客户的中文或英文 Proposal -> 手动记录买家反馈和交接证据。

优先输入:

- 工厂/贸易商已有产品照片、样品描述或产品目录片段。
- 老客户发来的参考图、竞品图、链接或一句 brief。
- 明确商业约束: 目标渠道、目标价格带、材料/工艺限制、客户类型。

优先输出:

- 2-4 个可比较 Creative Directions。
- 一个主推方向。
- 一份客户可读中文或英文 Proposal Artifact。
- 3-5 个买家反馈问题。
- 一个报价/样品评审前 Handoff Brief。

暂缓覆盖:

- 从零潮玩 IP 创作。
- 大规模趋势雷达。
- 完整产品库运营。
- 自动 3D / 图片 / PPT 生产链。
- 供应商、报价、打样、RFQ 和客户自动外发。

---

## 4. What The Agent Must Handle

Agent 不能要求用户先选择唯一信息源头。它必须能同时处理:

- 用户已有产品或样品。
- 买家 brief、客户原话、WhatsApp/邮件/会议记录。
- 参考图、商品图、竞品链接、展会照片、社媒截图。
- 工厂能力、材料限制、价格带、MOQ、渠道和客户类型。
- 历史 Proposal、历史客户反馈和团队偏好。
- 市场、竞品、玩法、包装、SKU、节日和渠道案例。
- 用户的临时改口、否决、补充和人工判断。

这些不是互斥入口，而是 Agent 的上下文材料。

---

## 5. Defensible Productization Assets

Creative Productization Agent 不能只靠通用模型和提示词。Productizer 必须逐步沉淀以下可复用资产:

| Asset | 作用 | V0 最小版本 |
|---|---|---|
| Toy play taxonomy | 判断玩法、互动、收藏、展示、礼品、教育等产品机制 | 20-30 个常见玩具/潮玩玩法模式 |
| Product structure library | 帮 Agent 理解产品形态、SKU、配件、包装和系列化 | 盲盒、手办、钥匙扣、毛绒、礼品套装、文旅周边 starter set |
| Constraint library | 让创意服从价格、材料、工艺、渠道和客户约束 | price band / material / channel / MOQ assumption checklist |
| Non-copy differentiation rules | 避免把参考图改成近距离复刻 | 角色脸、轮廓、标志配件、配色、包装识别的差异化检查 |
| Proposal examples | 让输出不是泛泛文案 | 10-20 个 good/bad proposal examples |
| Feedback corpus | 让系统理解真实买家兴趣和礼貌性反馈的差别 | 手动录入的 buyer/team feedback examples |
| Scoring rubric | 判断方向是否值得进入 proposal / handoff | creative quality, buyer fit, channel fit, price plausibility, risk score |

这些资产是产品壁垒。模型、chat UI、runtime、renderer 都应被视为可替换基础设施。

### 5.1 Direction Failure Rubric

以下 Creative Direction 应被判为不合格:

- 只换风格或文案，没有产品机制、SKU、包装、渠道或价格带变化。
- 与参考图角色脸、轮廓、标志配件、配色或包装识别过近。
- 违反硬约束，例如用户明确不要毛绒却输出毛绒方向。
- 无法解释为什么适合目标买家或渠道。
- 无法在目标价格带内给出材料、尺寸、包装或复杂度假设。
- 没有明确可问买家的反馈问题。
- 所有方向之间差异很小，只是同一个概念换名字。

---

## 6. Working Context

Agent 每次工作必须维护一个可追溯的 `Working Context`，而不是把所有输入拼成 prompt。

### 6.1 Required Context Fields

```text
Working Context
  - Current Goal
  - Known Facts
  - Available Sources
  - Hard Constraints
  - Soft Preferences
  - Agent Assumptions
  - Open Questions
  - Candidate Opportunities
  - Creative Directions
  - Conflicting Evidence
  - Risks
  - Confidence
```

每个 context item 必须带:

- source / provenance
- confidence
- freshness
- scope
- whether confirmed by user

### 6.2 Context Semantics

| 类型 | 定义 | Agent 行为 |
|---|---|---|
| `fact` | 用户或可信来源明确提供 | 默认保留，修改需说明依据 |
| `hard_constraint` | 价格、材料、渠道、品类、客户要求等不可违反限制 | 生成前后必须校验 |
| `soft_preference` | 风格、情绪、参考语感、审美偏好 | 可权衡，不得伪装成事实 |
| `assumption` | 信息不足时的透明假设 | 必须可见、可修改 |
| `evidence` | 支撑判断的买家、市场、历史或团队信息 | 必须保留来源和适用范围 |
| `risk` | IP、相似、成本、工艺、渠道、表达或合规风险 | 影响输出和 Action Card |
| `missing_info` | 影响后续交接但当前未知的信息 | 必要时提问，非阻塞时带假设生成 |
| `conflict` | 输入之间互相矛盾 | 必须向用户解释或请求确认 |

默认 UI 只展示当前必要摘要，完整上下文进入 drawer / details。

---

## 7. Three-Layer Input Model

多源输入需要组织，但不应变成多个并列输入口。

| 层 | 名称 | 内容 | 用户交互 |
|---|---|---|---|
| Layer 1 | Current Task Input | 当前 brief、参考图、已有产品、创意目标、硬约束 | 主输入框、附件、粘贴链接、少量确认问题 |
| Layer 2 | Persistent Business Context | 买家、工厂、产品库、历史 proposal、团队偏好、历史反馈 | Profile、Library、Team Memory、历史记录 |
| Layer 3 | Ambient External Signals | 市场信号、竞品、玩法模式、包装/SKU 案例、渠道案例 | Agent 按需检索和引用，来源可展开 |

用户只需要一个主入口。Agent 负责决定哪些上下文需要引入当前任务。

---

## 8. Agent Skills

Skills 是 Agent 的领域能力，不等同于外部工具。

V0 必须具备的 Skills:

| Skill | 作用 |
|---|---|
| `understand_product_goal` | 判断用户真正想要的是新品方向、现有产品改造、买家提案、渠道适配还是价格/规格收敛 |
| `deconstruct_product_value` | 拆解参考图或已有产品的吸引力、玩法、造型、渠道和不可照抄元素 |
| `identify_information_gaps` | 区分阻塞问题、可假设问题和可后续补充问题 |
| `ask_high_value_question` | 只在答案会改变方向、风险或商业约束时问 1-3 个问题 |
| `synthesize_cross_source_insight` | 融合买家 brief、已有产品、市场/竞品、工厂能力和历史反馈 |
| `create_play_innovations` | 生成玩法、互动机制、收藏机制、系列化和场景化创意 |
| `create_commercial_extensions` | 生成价格带、SKU、包装、渠道、礼品/零售/授权等商业化变体 |
| `differentiate_from_references` | 避免近距离复刻，拉开角色、轮廓、配件、配色、包装识别 |
| `critique_creative_direction` | 从买家 fit、渠道 fit、商业可行性、相似风险、可解释性评估方向 |
| `compose_and_revise_proposal` | 维护客户可读 Proposal，并响应自然语言修改 |
| `incorporate_human_judgment` | 将用户选择、否决、确认和买家反馈写回上下文和 ledger |

---

## 9. Tool Classes

Tools 是 Agent 可以调用的能力。所有工具必须按风险分级。

### 9.1 Observe Tools

Agent 可自动调用，结果进入 Working Context:

- 解析上传图片、文件、链接和文本。
- 检索内部产品库、历史 Proposal、历史反馈。
- 读取 Buyer / Factory / Team Profile。
- 检索市场、竞品、玩法、渠道和包装参考。
- 读取当前 Proposal、版本和 ledger。

### 9.2 Create / Transform Tools

Agent 可自动调用，但输出必须版本化、可撤销、可追溯:

- 生成 Creative Directions。
- 生成或修改 Proposal Artifact。
- 生成 SKU lineup、CMF、包装方向、卖点、反馈问题。
- 生成内部 handoff brief。
- 生成 concept visual prompt 或视觉方向说明。

### 9.3 Evaluation Tools

Agent 可自动调用，评估结果必须能解释:

- 硬约束校验。
- 参考相似风险筛查。
- 创意差异度评估。
- 玩具玩法价值评估。
- Direction failure rubric。
- 渠道和买家适配评估。
- 商业可行性粗评。
- 客户可见声明安全检查。

### 9.4 Commit / External Tools

必须通过 Action Card:

- 锁定或覆盖产品方向。
- 记录可能改变 readiness 的客户反馈。
- 分享、导出或外发客户可见资产。
- 改变 readiness / handoff 状态。
- 生成 3D、多视图、PPT、包装展开、样品路径等高承诺资产。
- RFQ、报价、打样、供应商联系、客户自动外发。

V0 不实现 RFQ、正式报价、自动客户外发、供应商联系、打样或生产动作。

---

## 10. Agent Loop

Agent 每一轮按以下循环工作:

```text
1. Understand current user intent
2. Inspect current Working Context and artifacts
3. Detect gaps, conflicts, risks, and opportunities
4. Decide next action:
   - answer
   - ask
   - retrieve
   - analyze
   - ideate
   - evaluate
   - update artifact
   - propose Action Card
5. Execute allowed tools
6. Patch Working Context and Proposal Artifact
7. Explain the useful decision to the user
8. Stop, continue, or request confirmation
```

Clarification rule:

```text
Information sufficient
  -> generate directly

Information missing but non-blocking
  -> generate with visible assumptions

Information changes direction, cost, risk, or customer claim
  -> ask 1-3 focused questions
```

---

## 11. Artifact Model

用户最先看到的价值不是 Pack、Ledger 或 Run，而是 Proposal。

V0 artifact hierarchy:

```text
Productizer Project
  -> Working Context
  -> Creative Directions
  -> Proposal Artifact
  -> Internal Evidence / Handoff
  -> Feedback Ledger
  -> Readiness Review
  -> Action Cards
```

Toy Commercialization Pack 可以继续存在，但它应被重新定位为内部聚合对象:

> Pack is an internal business aggregate for context, creative directions, proposal sections, evidence, feedback, readiness, and action authorization. It is not the primary user-facing value surface.

---

## 12. Proposal Artifact

Proposal Artifact 是 V0 的主价值呈现。

必须支持:

- 第一版自动生成。
- 自然语言修改。
- 局部 patch。
- 版本历史。
- change summary。
- 客户可见 / 内部信息边界。
- 事实、假设和未确认项标注。
- 2-4 个 Creative Directions 的比较。
- 选中方向后的客户提案视图。
- 后续 feedback 和 handoff 关联。

Proposal Artifact 不得包含:

- 正式报价承诺。
- supplier-ready、production-ready、quotation-ready、final design、infringement-safe 等声明。
- 内部成本、供应商、工艺弱点和未确认 MOQ，除非在内部视图。

---

## 13. Action Card Policy

Action Card 不是内部流程按钮。它只用于真实决策、高风险动作和不可轻易撤销的状态变化。

| 动作类型 | 是否需要 Action Card |
|---|---:|
| 分析输入、读取上下文 | 否 |
| 生成初稿、修改 Proposal、生成候选方向 | 否，但要版本化 |
| 选择/锁定主推方向 | 是 |
| 覆盖硬约束或忽略高风险 | 是 |
| 分享、导出、外发客户资产 | 是 |
| 记录正式客户反馈并影响 readiness | 是 |
| readiness / handoff 状态变化 | 是 |
| 报价、RFQ、打样、供应商联系、客户自动外发 | 必须，且 V0 不实现 |

---

## 14. System Records

系统必须持久化:

- Working Context items。
- Creative Directions。
- Proposal versions。
- Feedback events。
- Readiness reviews。
- Action Cards。
- Agent runs。
- Audit events。

聊天记录可以保存，但不能成为业务事实来源。

---

## 15. Product Quality Evals

V0 的质量评估不能只看是否生成了 Proposal。

必须评估:

- 是否正确理解用户目标。
- 是否尊重硬约束。
- 是否避免品类跑偏，例如机器人盲盒不能默认变成毛绒挂件。
- 是否生成了真正有差异的 Creative Directions。
- 是否通过 Direction Failure Rubric。
- 是否使用了玩具玩法、产品结构、渠道/价格和非照抄规则，而不只是通用文案。
- 是否解释了方向为什么适合买家/渠道。
- 是否把假设和未确认项显式标注。
- 是否避免客户可见禁用声明。
- 用户自然语言修改后，Proposal 是否稳定更新。
- 是否只在必要时询问用户。
- 是否在高风险动作前产生 Action Card。

---

## 16. Engineering Implications

工程实现必须遵守:

1. 首阶段只有一个 `Productizer Agent`。不要拆成多个互相转交的任务 Agent。
2. Agent runtime 可以替换；Productizer 业务状态不可被 runtime 替代。
3. Workflow 是工具，不是主架构。
4. API 应接受用户 intent/message/attachments/current artifact，而不是固定 `action` 枚举作为主入口。
5. Data model 必须支持多源上下文、Creative Directions、Proposal versions 和 Evidence/Handoff。
6. Draft 更新可以自动执行，但必须版本化。
7. Commit/external/high-risk 动作必须 Action Card。
8. Customer-visible guard 必须独立于模型输出。

---

## 17. Version Control

本基线取代旧的主干叙事:

```text
Reference Signal -> Procedure -> Pack -> Proposal -> Feedback -> Readiness
```

新的主干叙事是:

```text
Productizer Project
  -> Working Context
  -> Dynamic Agent Loop
  -> Creative Directions
  -> Proposal Artifact
  -> Evidence / Feedback / Handoff
  -> Gated Decisions
```

后续 MRD、PRD、Interaction、Architecture、Data Model、API 和工程计划必须引用本文件。若出现冲突，以本文件为准，直到产生新的决策记录。
