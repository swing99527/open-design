# Toy Market Productizer MRD

> 文档类型: Market Requirements Document
> 状态: current control draft
> 版本基线: 2026-06-07 Agent rebaseline
> 最后更新: 2026-06-08
> 上游文档: [Toy Productizer Agent System Design](TOY_PRODUCTIZER_AGENT_SYSTEM_DESIGN.md), [Toy Productizer Open System Model](TOY_PRODUCTIZER_OPEN_SYSTEM_MODEL.md)
> 适用范围: 市场需求、用户、商业假设、需求强度、竞品定位、MVP 验证
> 不包含: 具体页面、字段 schema、API contract、数据库 schema、工程实现

---

## 1. Core Conclusion

Toy Market Productizer 面向玩具/潮玩贸易商、工厂销售团队和产品开发型业务团队。

一句话定义:

> 帮玩具生意团队把客户 brief、已有产品、参考图和市场线索转成有商业约束的创意产品方向，并持续维护可发客户讨论的 Proposal 与后续交接证据。

英文工作定义:

> Help toy trading and factory sales teams turn fragmented buyer briefs, existing products, references, and market signals into constrained creative product directions, customer-readable proposals, and handoff-ready evidence.

产品形态:

> Chat-driven, artifact-backed Productization Workspace.

核心竞争力:

> Creative Productization Agent.

价值呈现:

> Conversational Proposal Workspace.

V0 要验证的市场命题:

> 有客户关系和产品开发压力的玩具生意团队，是否愿意付费让一个专业 Agent 持续帮助他们形成更好的新品方向、客户提案和反馈证据，而不是只购买一个通用 AI 生成工具账号。

V0 首发 wedge:

> 已有产品或客户参考图 -> 3 个非照抄产品改造方向 -> 一份可发老客户的中文或英文 Proposal -> 手动记录买家反馈和交接证据。

V0 不验证:

- 普通个人是否愿意订阅潮玩生成器。
- AI 图片是否能画得更好看。
- 系统是否能闭环完成报价、打样、供应商、生产或法律清查。

---

## 2. Market Background

玩具和潮玩行业的新品前期越来越依赖多源外部输入:

- 买家用截图、竞品链接、参考图和一句话 brief 发起需求。
- 工厂和贸易商需要持续给老客户发送新品方向。
- 既有产品需要做玩法改进、价格带调整、系列化延展和渠道重定位。
- 社媒、展会、平台和竞品信号传播更快，但热度不等于可卖机会。
- AI 图像、3D 和文案工具降低了内容生成成本，但没有解决专业产品化判断。

行业断点从“能不能生成东西”转移到:

```text
fragmented business input
  -> professional productization judgment
  -> constrained creative directions
  -> customer-readable proposal
  -> real buyer / team response
  -> handoff evidence
```

---

## 3. Target Users

### 3.1 Beachhead Paying User

首发必须优先服务一个高频、可付费、可拿真实任务验证的场景:

> 玩具贸易商或工厂销售团队，把已有产品、样品照片、产品目录片段、老客户参考图或竞品图，快速改造成客户可讨论的新品 Proposal。

这个 wedge 比“从零生成潮玩 IP”更适合 V0，因为:

- 用户已经有客户、产品或供应链上下文。
- 任务更高频，通常每周都会发生。
- 输出可以直接发给老客户或用于内部评审。
- 买家反馈可以手动回填，不要求系统闭环报价/打样。
- Agent 的专业价值体现在非照抄改造、商业约束和提案质量，而不是单次图片生成。

### 3.2 First Paying Users

首发付费用户不是普通个人创作者，而是有客户关系、供应链资源或销售压力的玩具生意团队。

优先买单人:

- 玩具贸易商老板或业务负责人。
- 潮玩/礼品/手办/毛绒工厂老板或外贸负责人。
- 产品开发型销售团队负责人。

优先使用者:

- 每周需要给老客户发新品方向的外贸销售。
- 需要把客户参考图或已有产品变成提案的销售/产品同事。
- 需要判断哪些方向值得继续讨论、打样前补什么信息的老板或产品开发负责人。

### 3.3 Secondary Users

- 独立潮玩主理人。
- IP 方 / 授权方。
- 角色设计师。
- 品牌方礼品/周边团队。
- 有粉丝或渠道、但缺玩具商品化能力的创作者。

这些用户可以贡献灵感、IP、角色和验证机会，但 V0 不把他们作为主要付费方。

### 3.4 Not Prioritized

- 只想生成图片的普通用户。
- 没有客户、渠道或供应链资源的纯创作者。
- 已有完整研发/商品/供应链团队的大型玩具集团。
- 强监管儿童玩具、医疗玩具、食品接触玩具等高合规场景。
- 要求平台直接承诺正式报价、交期、MOQ 或量产结果的客户。

---

## 4. Core Business Problem

当前团队通常这样处理新品机会:

```text
客户 brief / 参考图 / 竞品链接 / 现有产品
  -> 发给老板、销售、产品、设计或报价同事
  -> 人工判断怎么改、能不能发客户、缺什么信息
  -> 手工整理 PPT / PDF / 微信图文 / 邮件方案
  -> 客户反馈后再追问尺寸、数量、目标价、包装、交期
```

主要问题:

- 太依赖少数有经验的人。
- 销售很难把模糊输入变成专业产品方向。
- 参考图容易被照抄，带来 IP/外观相似风险。
- 创意容易脱离价格、渠道、玩法和供应链约束。
- Proposal、客户反馈和团队判断没有结构化沉淀。
- 后续报价/工程团队经常拿到信息不完整的需求。

V0 要解决的核心任务:

> 让团队更快获得值得继续讨论的新品方向、客户可读提案和可交接证据。

---

## 5. Market Needs

### 5.1 Must Have

1. 用户可以用自然语言、已有产品、客户参考图、竞品图、链接或 brief 发起任务，不需要先选择固定 source mode。
2. Agent 能理解用户真实目标: 现有产品改进、非照抄改造、买家提案、渠道适配、降本、升级或系列化。
3. Agent 能在必要时只问 1-3 个关键问题，而不是让用户填完整表单。
4. Agent 能把多源输入整理为 Working Context，并区分事实、约束、偏好、假设、证据、风险和缺失信息。
5. Agent 能基于已有产品、参考图、买家 brief 或市场线索生成非照抄 Creative Directions。
6. Creative Directions 必须体现玩法、渠道、价格带、SKU、包装或产品线改进，而不是只换文案。
7. 系统必须自动生成第一版客户可读 Proposal Artifact。
8. 用户可以通过自然语言持续修改 Proposal，例如“不要毛绒，改成机器人手办”“更适合博物馆礼品店”“价格压到 15 美元以内”。
9. Proposal 必须有版本、修改痕迹、事实/假设/未确认项和客户可见边界。
10. 系统必须记录真实客户或内部团队反馈，并形成 Handoff Evidence。
11. 系统必须清楚声明边界: 不承诺正式报价、生产结果、supplier-ready、quotation-ready、production-ready、final design 或 infringement-safe。

### 5.1a V0 Non-Negotiable Productization Assets

V0 不是只靠大模型 prompt。首发版本至少要沉淀以下资产，哪怕先是轻量 YAML/JSON/Markdown:

1. 玩具玩法 taxonomy: 收藏、互动、展示、礼品、教育、解压、节日、盲盒等机制。
2. 产品结构 library: 盲盒、手办、钥匙扣、毛绒、礼品套装、文旅周边的形态、SKU、包装 starter set。
3. 约束 library: 价格带、材料、尺寸、包装复杂度、渠道、MOQ 假设 checklist。
4. 非照抄差异化规则: 角色脸、轮廓、标志配件、配色、包装识别、IP/外观相似风险。
5. Proposal good/bad examples: 让输出具备客户可读结构，而不是泛泛文案。
6. Buyer/team feedback examples: 区分礼貌性兴趣和真实推进动作。
7. Direction scoring rubric: creative quality、buyer fit、channel fit、price plausibility、risk score。

### 5.2 Should Have

1. 按团队积累 Buyer / Factory / Product Library / Team Memory。
2. 按需检索市场、竞品、玩法、渠道和包装案例。
3. 支持多种 Proposal 输出视图: preview、copy block、share link、PDF/PPT、图片卡。
4. 支持模板化 Proposal，但模板不能限制 Agent 的创意判断。
5. 支持 Evidence / Handoff Brief，方便老板、产品、报价、工程继续接手。
6. 支持把后续报价/打样/成交结果作为回填信号。

### 5.3 Won't Have In V0

- 不做正式报价。
- 不自动生成供应商 RFQ。
- 不自动联系客户或供应商。
- 不安排打样或生产。
- 不承诺交期、MOQ、成本或生产结果。
- 不做法律/IP 清关。
- 不做开放 marketplace。
- 不做大规模自动趋势平台。
- 不做普通个人 AI 玩具图片生成器。

---

## 6. Demand Strength

| 需求 | 强度 | 判断 |
|---|---:|---|
| 持续找新品方向 | 高 | 玩具/潮玩依赖新鲜感、系列化、热点和渠道节奏 |
| 把模糊 brief / 参考图 / 现有产品变成客户提案 | 高 | 高频、耗时、依赖经验，且影响客户沟通质量 |
| 在已有产品上做创意改进或玩法延展 | 高 | 工厂/贸易商更常见，不是每次从零设计 |
| 打样/报价前收集买家兴趣证据 | 中高 | 能降低无效沟通，但最终闭环常在系统外发生 |
| 付费买纯 SaaS 工具账号 | 中 | 需要教育，除非直接提升客户回复和销售效率 |
| 付费买 Agent-assisted proposal service + workspace | 中高 | 更贴近结果购买和早期试点 |

真需求不等于“用户觉得 AI 好玩”。真需求成立的信号是:

- 用户带入真实客户或真实产品任务。
- 用户愿意根据 Agent 输出修改、选择和继续推进。
- Proposal 被真实客户或内部团队使用。
- 买家产生具体反馈。
- 用户第二周继续使用，并愿意付费或续费。
- 3 家 4 周试点中，至少 2 家在第 4 周愿意继续付费，并继续提供真实客户 brief / 已有产品 / 参考图任务。

---

## 7. Competitive Position

| 对比对象 | 它们解决什么 | Toy Productizer 解决什么 |
|---|---|---|
| ChatGPT / 豆包 | 通用脑暴、文案、问答 | 维护业务上下文、创意产品化、Proposal artifact、反馈和交接证据 |
| Midjourney / 图像模型 | 视觉生成 | 从多源输入到商业约束下的产品方向和客户提案 |
| Meshy / 3D 工具 | 3D toy model / prototyping | 报价/打样前的产品机会和买家验证材料 |
| Canva / Gamma | 提案视觉和模板表达 | Agent 先做产品化判断，再由模板表达 |
| Clay | 业务上下文、结构化 records、AI actions | 类似结构化业务系统，但垂直在玩具产品化和新品提案 |
| Intercom Fin | Procedure + support automation | 可借鉴版本/审批/流程控制，但 Toy Productizer 不是固定 support procedure |
| Artilora / Makeship | 创作者商品化和小批量生产 | 工厂/贸易商的买家提案、产品改进和报价/打样前证据 |
| Xometry | 制造需求到报价/供应商网络 | 报价前的产品方向、提案、规格和买家兴趣证据 |

核心差异:

```text
not prompt wrapper
not image generator
not PPT generator
not CRM

but:
Creative Productization Agent
  + Working Context
  + Proposal Artifact
  + Evidence / Feedback / Handoff
  + Action Card boundaries
```

---

## 8. Business Model Hypothesis

短期优先卖 4 周付费试点，而不是纯自助 SaaS 账号。

建议试点包:

- 每周处理 3-5 个真实新品任务，优先来自已有产品或客户参考图。
- 每周产出 3-5 组 Creative Directions。
- 每周形成 2-3 个可发客户或内部评审的 Proposal Artifact。
- 支持用户把资产发给真实客户。
- 每周整理客户反馈、内部反馈和下一步 handoff 建议。

试点价格验证:

- 中国客户: RMB 8,000-20,000 / 4 周团队试点。
- 海外客户: USD 1,200-3,000 / team / 4 weeks。
- 成立标准不是“愿意免费试用”，而是第 4 周愿意续费、延长付费试点，或把更多真实客户任务继续交给系统。

收费对象是工厂、贸易商和销售型团队。早期成交话术应围绕:

> 每周更快拿出客户能看懂的新产品方向，并把反馈和交接材料整理清楚。

长期可以演进为 SaaS，但早期更准确的形态是:

> Productized Service + SaaS Workbench.

---

## 9. Success Metrics

### 9.1 North Star

> 被真实客户或内部团队使用，并产生具体修改、选择、目标价、数量、样品/报价问题或后续动作的 Proposal Artifacts 数量。

### 9.2 90-Day Validation Metrics

| 指标 | 目标 |
|---|---:|
| 付费试点工厂/贸易商 | 3 家 |
| 真实业务任务输入 | 30 个，其中 70% 来自已有产品或客户参考图 |
| 生成 Creative Directions | 90 个 |
| 形成 Proposal Artifacts | 30 个 |
| 被用户发给客户或用于内部评审的 Proposal | 20 个 |
| 获得 3 分以上具体反馈的 Proposal | 10 个 |
| 产生样品/报价/规格收敛讨论的方向 | 3 个 |
| 第 4 周愿意续费或继续付费试点的客户 | 2 家 |

### 9.3 Anti-Metrics

- 只生成图或 Proposal，但不用于真实客户或团队。
- Agent 输出固定品类，例如输入机器人盲盒却默认输出毛绒挂件。
- 用户大量重写，说明 Agent 未理解真实目标。
- 客户反馈集中在“太像原品/有侵权风险”。
- 用户不断要求正式报价，但系统没有足够规格和外部团队闭环。
- 后续团队仍需从头整理上下文。

---

## 10. Risks And Constraints

| 风险 | 影响 | 缓解 |
|---|---|---|
| 产品沦为 ChatGPT 套壳 | 无壁垒、难收费 | Productizer-owned Working Context、Creative Directions、Proposal versions、Evidence/Handoff |
| Agent 创意泛化 | 输出看似合理但没有玩具商业价值 | 加入玩法、SKU、渠道、价格带、材料、包装和相似风险 eval |
| 多源上下文冲突 | 方向跑偏或误解客户 | Working Context 记录 conflict，必要时提问 |
| 用户输入太少 | Agent 胡乱假设 | Ask sparingly, assume transparently, revise conversationally |
| 买家验证不闭环 | 难证明最终价值 | 明确 Productizer 负责 evidence/handoff，不伪装成报价/打样闭环 |
| 服务化吞噬产品 | 每个客户都变咨询 | 约束 V0 主路径: Agent-assisted creative proposal workspace |
| MVP 场景过宽 | 工程和销售都无法验证真需求 | 首发只押已有产品/客户参考图到 Proposal 的 4 周试点 |
| IP/外观相似风险 | 客户信任和法律风险 | 非照抄策略、相似风险提示、人工 IP review 边界 |
| 工具链过重 | 先做 runtime 而不是产品价值 | 先验证 Agent 创意产品化和 Proposal 使用 |

---

## 11. Open Assumptions To Validate

1. 工厂/贸易商是否愿意为“已有产品/客户参考图到客户 Proposal”付费。
2. 用户是否认为 Agent 生成的 Creative Directions 明显优于自己直接问 ChatGPT。
3. 用户最常见的起点是买家 brief、已有产品、参考图、竞品、市场信号，还是混合输入。
4. 用户是否愿意维护 Buyer / Factory / Product Library 等长期上下文。
5. 买家反馈主要来自链接、PDF、图片卡、邮件、WhatsApp、微信、电话还是展会口头。
6. Proposal Artifact 的版本和修改痕迹是否是团队协作刚需。
7. Evidence / Handoff 是否能减少后续报价/工程团队重复追问。
8. 哪些玩具品类最适合首发: 盲盒/手办、钥匙扣、毛绒、礼品套装、博物馆/文旅周边。
9. RMB 8,000-20,000 / 4 周试点的成交阻力主要来自预算、信任、任务量、输出质量，还是后续报价/打样不闭环。
