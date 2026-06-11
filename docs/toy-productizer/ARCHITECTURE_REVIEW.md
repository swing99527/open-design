# Toy Productizer Studio — 总架构师审视报告（Architecture Review）

> 审视基准：`swing99527/open-design` 分支 `productizer/toy-productizer-studio`，远端 HEAD `dd77abb9`（`docs: add Toy Productizer branch brief and product snapshot`）。
>
> 标注约定：
> - **[远端源码事实]** —— 来自对该分支实际文件 / git 历史的直接读取，可复核。
> - **[架构建议]** —— 本报告作者的判断与裁决，非仓库既有内容。
>
> 本文档只新增 review / roadmap 内容，不修改任何产品文档原文与代码。

> 2026-06-11 implementation re-check note:
> - `plugins/_official/scenarios/` exists in this repository. The missing path on the review baseline was specifically `plugins/_official/scenarios/toy-productizer/`, not the whole scenarios directory.
> - `file-write` and `live-artifact` are implemented atom ids in `apps/daemon/src/plugins/atoms.ts`. Their absence as separate folders under `plugins/_official/atoms/` must not be treated as atom absence.
> - Productizer Action Cards should remain daemon/API state, not Claude-specific `AskUserQuestion` state. Claude `stream-json` can be used as an interaction convenience, but it must not become the Productizer Core state boundary.

---

## 1. Remote Source Audit

**[远端源码事实] 实际读取的文件：**

| 文件 | 状态 |
|---|---|
| `AGENTS.md` | 存在，280 行，包含 UI/CLI 双轨强制规范、contracts 边界、daemon 所有权 |
| `docs/architecture.md` | 存在，461 行 |
| `docs/toy-productizer/README.md` | 存在（索引文档） |
| `docs/toy-productizer/BRANCH_BRIEF.md` | 存在，702 行，是最有操作价值的文档 |
| `docs/toy-productizer/product/TOY_PRODUCTIZER_POSITIONING_BRIEF.md` | 存在，168 行 |
| `docs/toy-productizer/product/TOY_MARKET_PRODUCTIZER_MRD.md` | 存在，343 行 |
| `docs/toy-productizer/product/TOY_MARKET_PRODUCTIZER_PRD.md` | 存在，418 行 |
| `docs/toy-productizer/product/TOY_PRODUCTIZER_INTERACTION_SPEC.md` | 存在，464 行 |
| `docs/toy-productizer/product/TOY_PRODUCTIZER_AGENT_SYSTEM_DESIGN.md` | 存在，473 行 |
| `docs/toy-productizer/product/TOY_COMMERCIALIZATION_PACK_SPEC.md` | 存在，287 行 |
| `docs/toy-productizer/product/TOY_MARKET_VALIDATION_PLAYBOOK.md` | 存在，240 行 |
| `docs/toy-productizer/product/TOY_PRODUCTIZER_OPEN_SYSTEM_MODEL.md` | 存在（产品清单之外的额外文档） |

**[远端源码事实] 关键缺失（远端未找到）：**

- `plugins/_official/scenarios/` 目录**整体不存在**。`plugins/_official/` 下只有 `atoms`、`design-systems`、`examples`、`image-templates`、`video-templates`。`docs/toy-productizer/BRANCH_BRIEF.md` 第 6 节规划的 `toy-productizer` 插件骨架（SKILL.md、open-design.json、examples、evals）**一个文件都没有落地**。
- `design-systems/toy-proposal-trade-desk/DESIGN.md` **不存在**（`design-systems/` 目录已核查）。
- 任何 productizer 相关代码（daemon routes、web components、contracts、CLI 子命令、SQLite migration）在 `apps/daemon/src/`、`apps/web/src/components/`、`packages/contracts/src/` 中**均不存在**。
- 全仓库 git 历史中只有**一个** toy 相关提交：`dd77abb9 docs: add Toy Productizer branch brief and product snapshot`。

**当前远端分支能证明什么：**

- **[远端源码事实]** 产品定义层是完整、自洽且高质量的。MRD / PRD / Interaction Spec / Agent System Design / Pack Spec / Validation Playbook 覆盖了用户、wedge、对象模型、交互、反馈可信度、边界语言。
- **[远端源码事实]** `BRANCH_BRIEF.md` 的实施序列中 Step 1-2（产品文档与 brief）已完成，Step 3-6（plugin / design system / 实现）未开始。

**当前远端分支不能证明什么：**

- **[远端源码事实]** **不能证明任何东西能跑**。Phase 1（plugin + design system + artifact run 跑通）尚未开始。
- **[远端源码事实]** 不能证明 `BRANCH_BRIEF.md` 中引用的 pipeline atoms 全部可用。核对 `plugins/_official/atoms/`：`discovery-question-form`、`direction-picker`、`critique-theater`、`handoff`、`patch-edit` 存在；但 pipeline 中引用的 **`file-write` 和 `live-artifact` 两个 atom 不存在**于 atoms 目录（`live-artifact` 可能是 mode 而非 atom）。**[架构建议]** 这是 Phase 1 的第一个具体落地风险。
- **[远端源码事实]** 不能证明 forbidden claims 扫描、版本、反馈、readiness 有任何执行机制。

**[远端源码事实] 文档与代码的一处显著漂移（必须指出）：** `docs/architecture.md` §3.6 声称 "history.jsonl not SQLite ... we deliberately don't [use SQLite]"，但 `apps/daemon/src/db.ts` 实际是 better-sqlite3 + WAL + `migrate()`，已承载 projects / conversations / messages / critique / media / plugins 持久化。**[架构建议]** 这对 Productizer 是好消息——把 Proposal metadata / 版本 / 反馈 / readiness 放 SQLite 的方案有现成基座——但 `docs/architecture.md` 是陈旧的，下一位 implementation agent 不应以它为准，应以 `apps/daemon/src/db.ts` 和 `AGENTS.md` 为准。

**[架构建议] 信息不足影响的判断：** 由于零实现代码，无法验证 plugin runtime 对 `pipeline.stages` 的实际支持程度、`od plugin validate` 是否存在、以及 live-artifact 模式下 agent 流式写 proposal 的真实体验。这影响 Phase 1 工期判断，但不影响架构方向判断。

---

## 2. Product Architecture Review

> 本节判断依据：`docs/toy-productizer/product/` 全部文档与 `docs/toy-productizer/BRANCH_BRIEF.md`；结论均为 **[架构建议]**，引用处标明出处文件。

**定位是否清楚：清楚，且罕见地好。** `TOY_PRODUCTIZER_POSITIONING_BRIEF.md` 中 "Chat-driven, artifact-backed Productization Workspace" 这个定义做对了三件事：chat 是入口不是事实源；artifact 是价值表面；业务对象（Context / Directions / Proposal / Feedback / Handoff）是事实源。大多数垂直 AI 产品死在这三件事的任何一件上。

**首发付费用户是否明确：明确但未验证。** `TOY_MARKET_PRODUCTIZER_MRD.md` 定义的玩具贸易商老板 / 工厂外贸负责人是真实存在且有付费能力的人群。但 MRD 的需求强度论证是推演而非访谈证据。这不阻塞实现，但应在 4 周内拿到 3-5 个真实 pilot 用户（节奏见 `TOY_MARKET_VALIDATION_PLAYBOOK.md`）。

**V0 wedge 是否够尖：够尖。** "参考图 → 2-4 个非照抄方向 → 可发老客户的 Proposal"（`TOY_MARKET_PRODUCTIZER_PRD.md`）是一个 15 分钟内能演示完、用户当场能判断值不值的闭环。比绝大多数 "AI 工作台" 的 wedge 锋利。

**核心需求 vs 过度设计：**

核心（直接构成 wedge）：

- Working Context 结构化、Creative Directions + 非照抄差异化、Proposal Artifact + 双语 patch、版本、Feedback Ledger + credibility、forbidden claims 守卫。

过度设计 / 应砍或延后：

1. **Toy Commercialization Pack 作为独立内部聚合对象** —— `TOY_COMMERCIALIZATION_PACK_SPEC.md` 定义了一个介于 Context 和 Proposal 之间的中间聚合体。V0 不需要它作为独立持久化对象；它应该退化为 "Proposal 生成时的内部组装视图"，否则会维护两套事实源。**这是本报告建议砍掉的最大一刀。**
2. **Readiness Review 的完整规则引擎** —— V0 只需要 "feedback strength 低则不允许 handoff-ready" 这一条硬规则 + 人工 Action Card 确认。`TOY_MARKET_PRODUCTIZER_PRD.md` §6 的完整 maturity model 推迟。
3. **Concept Visuals**（`TOY_COMMERCIALIZATION_PACK_SPEC.md` §6）—— 图像生成会把产品拉回 "AI 图片工具" 感知，且引入 IP 风险。V0 Proposal 用结构化文字 + 占位即可。P2。
4. **critique-theater 循环 `until critique.score>=4`** —— `BRANCH_BRIEF.md` pipeline 里的自动评审循环在 V0 会拖慢生成且难调试。改成一次性 self-check 即可。
5. **多语言以外的 target_channel / target_price 结构化输入** —— 让 agent 从 brief 里抽，不要做表单。

**直接影响技术架构的需求：** Proposal Version（决定 artifact 与 SQLite 的关系）、Feedback credibility（决定必须有 daemon 校验层而非纯 prompt）、Action Card 门禁（决定 daemon 必须有状态机式的 guard，哪怕极小）、双语 patch 不重置 context（决定 proposal 必须是可 patch 的结构化文档而非整页重生成）。

**多行业复用判断：** 可复用的抽象是 Project binding、Context Item、Direction、Proposal metadata/version、Feedback Event、Readiness、Action Card、Audit——这些全部不含 "toy" 语义。必须行业化的是：taxonomy、direction failure rubric、proposal template 章节、forbidden claims 列表、feedback credibility 规则参数、UI 语言。这个切分在 `TOY_PRODUCTIZER_AGENT_SYSTEM_DESIGN.md` 与 `TOY_PRODUCTIZER_OPEN_SYSTEM_MODEL.md` 里已隐含成立，只是没有显式命名为 Core vs Domain Package。

**Toy 是否适合做第一个场景：适合。** 玩具行业有清晰的非照抄需求（IP 敏感）、清晰的 proposal 文化（外贸提案）、清晰的反馈链路（买家）。比礼品 / 家居更能逼出 forbidden claims 和 credibility 这两个平台壳的核心机制。

---

## 3. Competitive Positioning Review

> 本节全部为 **[架构建议]**，竞争场景定义参考 `TOY_MARKET_PRODUCTIZER_MRD.md` 与 `TOY_PRODUCTIZER_POSITIONING_BRIEF.md`。

先回答最尖锐的问题：**用户为什么不用 ChatGPT + Canva + 表格？** 因为那个组合的产出是一次性的：方向丢在 chat 里、proposal 是死文件、反馈在微信里、版本靠 "最终版_v3_真最终.pptx"、没人拦着销售把 "可直接量产" 写进客户提案。Productizer 的可防御性不在生成质量（生成质量会被通用模型追平），而在**业务事实源 + 版本 + 反馈可信度 + 边界守卫**这四件 ChatGPT 永远不会替单个垂直行业做的事。

**竞争力矩阵：**

| 对比对象 | 它强在哪里 | 它弱在哪里 | Productizer 差异 | V0 是否必须赢 |
|---|---|---|---|---|
| ChatGPT / Claude / Gemini | 生成质量、零学习成本、用户已在用 | 无业务对象、无版本、无反馈、无边界守卫、context 每次重建 | 提案不丢、修改有版本、反馈可记录可信度分级、forbidden claims 被系统拦截 | **必须赢**（这是替代品本尊） |
| Figma / Canva | 视觉编辑自由度、协作成熟 | 不理解产品方向，不产业务判断，用户要自己想内容 | 用户输入的是生意（brief / 参考图 / 价格带），不是画布元素 | 不必正面赢，错位 |
| Gamma / PPT 生成器 | 快速出 deck | deck 是终点，无方向推理、无非照抄约束、无反馈闭环 | Proposal 是活的业务对象，不是一次性 deck | 必须在感知上区分（UI 责任） |
| v0 / Lovable / Bolt | artifact-backed 生成体验成熟 | 面向软件原型，无实体产品 domain | 同样的 artifact 范式 + 实体产品 domain package | 不必赢，借鉴 |
| Midjourney / 图像模型 / Meshy | 视觉冲击力 | 给的是图不是产品方向；照抄参考图正是用户的法律风险 | 输出是方向 + SKU + 假设 + 风险，图只是配角 | 必须在感知上区分 |
| 通用 Open Design | 全能 runtime、多 agent | 通用语言（skill / plugin / artifact）对贸易商是噪音 | 垂直语言 + 默认路径 + 业务事实源 | **必须赢**（否则上层壳无存在理由） |
| Clay / CRM / Notion | 客户数据、流程管理 | 不生成产品方向，不做提案推理 | Productizer 在 proposal 之前，CRM 在成交之后 | 不必赢，明确不做 CRM |
| Alibaba / RFQ / Xometry | 供应链交易闭环 | 不帮你想 "做什么新品" | Productizer 止步于 handoff evidence，是这些平台的上游 | 不必赢，是边界 |

**竞争力来源拆解：**

- 来自**业务事实源**的：版本、反馈 ledger、credibility、readiness、audit —— 这是最硬的，且通用模型结构性不会做。
- 来自**行业 domain package** 的：非照抄 rubric、玩具 taxonomy、proposal 模板、forbidden claims —— 中等硬度，可被抄但需要行业积累。
- 来自**产品体验**的：first-run composer、Proposal Workspace、Action Card —— 软，可被抄，但决定用户是否留下试到硬价值。
- 来自 **Agent runtime** 的：多 CLI 适配 —— **这对最终用户几乎不是竞争力**，是成本结构优势（不绑模型），不要在产品叙事里强调它。

**不成立或很弱的 "竞争力"：** "我们用了 Open Design 开源架构"（用户不在乎）；"多 agent 可切换"（V0 用户应该只看到一位 advisor）；"本地优先"（贸易商不在乎，反而提高安装门槛——这是个未被文档正视的渠道风险，详见第 13 节风险 6）。

**V0 最该证明的 3 个竞争力假设：**

1. 非照抄方向 + 商业约束的质量，足以让贸易商**敢直接发给老客户**（生成价值假设）。
2. 版本 + 反馈 ledger 让用户**第二次回来用同一个 project**，而不是每次开新 chat（留存价值假设 —— 这是与 ChatGPT 的生死线）。
3. forbidden claims / validation-only 边界让老板**敢让销售用**（信任价值假设）。

**一句话定位：**

> Productizer Studio is not an AI design generator with a toy theme. It is a productization system of record that turns references and briefs into non-copy directions, customer-ready proposals, and credible feedback evidence.

---

## 4. Key Features And Priority

> 本节优先级裁决为 **[架构建议]**；"已存在" 的能力均为 **[远端源码事实]**（`apps/daemon/`、`apps/web/`、`plugins/_official/atoms/` 实际核查）。

| Feature | Priority | User value | Technical owner | V0 minimum | Defer |
|---|---|---|---|---|---|
| Vertical first-run composer | P0 | 5 秒理解产品是什么 | Web（Productizer Shell） | 大 composer + 行业 placeholder + 2 个示例 prompt | 多入口、模板库 |
| Productizer Project | P0 | 业务边界，承载一切 | Core / SQLite + 现有 project binding | 复用 OD project + 一张 binding 表 | 独立 project 体系 |
| Working Context | P0 | agent 理解生意而非重新问 | Core schema + Toy 语义 | 结构化 JSON（facts/constraints/assumptions/risks/missing），UI 只读摘要 | Context 编辑器 |
| Creative Directions | P0 | wedge 的一半 | Core schema + Toy rubric | 2-4 个 direction 持久化 + Direction Card | 方向对比矩阵、评分可视化 |
| Non-copy differentiation | P0 | 法律安全感，玩具行业命门 | Toy domain（rubric + prompt + 校验） | 每个 direction 必含 "与参考的差异点" 字段，daemon 校验非空 | 相似度算法检测 |
| Proposal Artifact | P0 | wedge 的另一半 | OD artifact（filesystem）+ design system | 结构化 10 节 proposal，live-artifact 渲染 | PDF 精排、品牌主题 |
| Proposal Versioning | P0 | "提案不会丢"——对 ChatGPT 的胜负手 | Core / SQLite metadata + artifact 文件快照 | 每次 patch 记一个 version 行 + 变更节列表 | diff 视图、回滚 UI |
| Toy Domain Package | P1 | 行业质量与平台壳验证 | Toy domain layer（文件包） | taxonomy + rubric + forbidden claims + template 作为 plugin 内静态文件 | domain registry、热加载 |
| Proposal Template / Design System | P0 | 输出 contract，不是视觉皮肤 | `design-systems/toy-proposal-trade-desk` | DESIGN.md 一份（`BRANCH_BRIEF.md` §8 的 10 节结构） | 多模板 |
| Feedback Ledger | P1 | 反馈离开微信进系统 | Core / SQLite | 手动录入：来源、原文、强度、日期 | 自动导入、邮件解析 |
| Feedback Credibility | P1 | 防自嗨，readiness 的前提 | Core 规则 + Toy 参数 | 三档（low/medium/confirmed），daemon 写死规则 | 规则可配置 |
| Readiness Review | P1 | handoff 的信任基础 | Core / daemon guard | 一条规则：无 medium+ 反馈不得 handoff-ready | 完整 maturity model |
| Action Cards | P1 | 高风险动作人工门禁 | Core / daemon + Web 卡片 | 仅 3 个：锁方向、导出/分享、标记 handoff-ready | 自定义 action 类型 |
| Customer-visible boundary guard | P0 | 老板敢让销售用 | daemon 校验（不是 prompt） | forbidden claims 字符串扫描 + 阻断导出 | 语义级检测 |
| Artifact renderer / preview | P0 | 已存在 | OD 现有能力 | 复用 FileViewer / live-artifact | 无 |
| Export / share | P1 | 提案要发出去 | OD export pipeline + guard | HTML/PDF 导出，导出前过 boundary guard | 分享链接、水印 |
| CLI support | P1 | 仓库强制规范（`AGENTS.md` 双轨） | `od productizer ...` | 与 routes 同 PR 落 `list / feedback add / version list` | 完整 CLI 工作流 |
| Agent runtime adapter | P2 | 已存在 | OD adapter pool | 复用，V0 只认证 1 个 runtime（Claude） | 多 runtime 认证 |
| Observability / evals | P2 | 质量回归 | plugin evals + fixtures | `BRANCH_BRIEF.md` §11 的 5 个 fixture 落为 evals.json | Langfuse 等 |
| Multi-industry extension | P3 | 未来 | Core 命名纪律 | 仅做到 "schema 不含 toy 字样" | 第二行业实现 |
| Open-source adapter compatibility | P3 | 未来 | adapter seam | 不做 | 全部 |
| UI verticalization / Productizer Shell | P1 | 感知垂直价值 | Web | 入口 + 五 Tab 工作区（Proposal/Directions/Context/Feedback/Handoff） | 全站重塑 |

**V0 必须做的前 7 个：** ① toy-productizer plugin + SKILL.md（含非照抄与边界指令）② toy-proposal-trade-desk design system ③ Proposal Artifact 生成跑通（Phase 1）④ Proposal Version（SQLite metadata）⑤ forbidden claims daemon 守卫 ⑥ Direction 持久化 + Direction Card ⑦ 垂直 first-run composer + Proposal Workspace 五 Tab。

**明确不做的前 7 个：** ① Concept visuals 图像生成 ② Pack 作为独立持久对象 ③ 完整 maturity model ④ CRM / 客户管理 ⑤ RFQ / 报价 / 打样任何流程 ⑥ domain registry / 第二行业实现 ⑦ 任何 Open Design 导航重构或功能删除。

**2 周版本：** Phase 1 + Phase 2 最小集 = plugin + design system + 跑通 fixture A/B + proposal version 表 + forbidden claims 扫描。无新 UI（用现有 artifact workspace 演示）。

**4 周版本：** 加 Feedback Ledger + 3 个 Action Card + 垂直入口和五 Tab 工作区 + fixture C/D/E 全绿 + `od productizer` CLI。验收标准见第 12 节。

---

## 5. Product Tone / UI / UXD Review

> 本节为 **[架构建议]**；现有 UI 结构描述为 **[远端源码事实]**（`apps/web/src/components/` 实际核查）。

**当前 Open Design 通用 UI 适不适合：不适合直接用，但骨架全部可用。** EntryShell / ChatPane / FileViewer / FileWorkspace 的三栏结构正好就是 `TOY_PRODUCTIZER_INTERACTION_SPEC.md` 要的 "Sidebar + Advisor + Proposal Workspace"。问题在语言和入口：一个贸易商打开看到 "skills / plugins / design systems / agents / community" 会立刻流失。

**"实体化" 如何体现：** 不是 3D 渲染，而是让 UI 对象长得像生意对象——Direction Card 上有品类、目标价格带（标 unconfirmed）、渠道契合、与参考的差异点、风险 badge；Proposal 里有 SKU / lineup 表；Feedback 条目有强度 indicator；Handoff Tab 有 readiness label。这些是**信息设计**，不是视觉重绘。

**第一屏：** 按 `BRANCH_BRIEF.md` §9 执行即可——顶栏 + 居中大 composer +「粘贴客户需求、描述现有产品，或上传参考图」placeholder + 2-3 个行业示例 prompt。**右侧工作区在首个 artifact 出现前不渲染。** 不出现 plugin / skill / agent 任何字样。

**生成后主工作区视觉层级：** Proposal 是主角（右侧，占最大面积，默认 Tab）；Directions 是第二主角（卡片，可触发 Lock Direction Action Card）；Chat 是驾驶舱（中栏，advisor 口吻，不叙述内部步骤）；Context / Feedback / Handoff 是工作 Tab；Action Card 出现在 chat 流内（复用 AskUserQuestionCard 的模式——该组件机制现成，**[远端源码事实]**）。

**应隐藏 / 折叠的通用入口：** plugin browser、design system catalog、community、automation center、多 agent picker、video / image / deck 模板入口。注意 `BRANCH_BRIEF.md` 的原则是对的：**hide or bypass, not delete**——用一个 shell 级路由 / 配置开关，而不是动通用代码。

**行业语言替换技术语言：** "Artifact"→"提案"；"Run"→不出现；"Plugin"→不出现；"Version"→"提案版本"；"Handoff"→"交接材料"。

**如何避免被当成图片生成器 / PPT 工具 / chatbot：** 第一个 proposal 出来时，让 Directions 卡片先于精排文档出现（方向先于排版）；proposal 顶部永远带 validation-only 边界标签；composer 示例 prompt 全部是生意语言而非 "生成一张……"。

**新设计组件需求：** 需要 Toy Proposal Design System（这是输出 contract，P0）；需要 DirectionCard、SkuTable、FeedbackStrengthIndicator、ReadinessBadge、ActionCard 五个 React 组件（P1，简单实现即可）；**不需要**新的全局视觉系统。

**明确建议：选 "轻量垂直化入口和工作区" 方案。** 仅预设插件的方案会让用户感知不到垂直价值，第 3 节的竞争力假设 ②③ 无法验证；全站重塑会让 V0 失控且违反 `BRANCH_BRIEF.md` 的 "Reduce UI surface, not architecture primitives"。最小改动 = 一个 Productizer 入口路由 + first-run composer + 五 Tab 右栏 + 五个卡片组件，其余全部复用。

---

## 6. System Boundary Decision

> 本节为 **[架构建议]**；"Open Design 不动" 一行所列能力为 **[远端源码事实]**。

| 层 | 负责 | 不负责 |
|---|---|---|
| **Open Design**（不动） | project / 文件、plugin / skill 发现与执行、CLI agent 池、artifact 渲染 / 导出、design system 加载、daemon / SQLite / 静态服务 | 任何 productization 业务语义 |
| **Productizer Core**（新增，通用） | Project binding、Context Item、Direction、Proposal metadata / Version、Feedback Event、Readiness、Action Card、Audit 的 schema + daemon 校验 + routes + CLI；boundary guard 执行引擎（规则由 domain 提供） | 行业规则内容本身 |
| **Toy Domain**（新增，行业） | taxonomy、direction failure rubric、proposal template 章节、forbidden claims 列表、feedback credibility 参数、UI 文案 | 任何状态机、任何持久化逻辑 |
| **Plugin（toy-productizer）** | agent 任务编排 contract（SKILL.md + pipeline）、把 domain package 注入 prompt | 业务状态（绝不） |
| **Skill** | agent 的产出指令与质量标准 | 校验（校验在 daemon） |
| **Agent Runtime** | 受约束的判断与生成，输出 draft | 写 canonical state（绝不直接写） |
| **Artifact（filesystem）** | Proposal 文件内容、每版本快照 | metadata / 版本链 / 反馈 / readiness |
| **SQLite** | 所有 Productizer 业务事实源行 | 文件内容 |
| **daemon memory** | run 中的临时 draft、SSE 状态 | 任何跨 run 事实 |

**防 Toy 污染 Open Design 的纪律：** Productizer Core 的所有代码进 `apps/daemon/src/productizer/` 和 `packages/contracts/src/productizer/`，toy 内容只能以 domain package 数据文件形式存在于 `apps/daemon/src/productizer/domains/toy/`（或 plugin 目录内），daemon 通用代码中出现字符串 "toy" 即为 review 阻断项。

**防变成重型垂直 SaaS 的纪律：** Productizer 不新建服务、不新建独立 DB、不建用户体系、不建权限模型；它只是 daemon 的一组 routes + 一组表 + web 的一个 shell。任何需要 "后台管理" 的需求一律视为越界。

---

## 7. Extensibility Architecture

> 本节为 **[架构建议]**。

**Productizer Core 概念（稳定 schema）：** ProductizerProject、ContextItem（kind/content/source/confidence）、Direction（title/summary/differentiation/risks/status）、ProposalMeta、ProposalVersion（version/changedSections/artifactSnapshotRef）、FeedbackEvent（source/verbatim/strength/credibilityTier）、ReadinessState、ActionCard（type/payload/status/confirmedBy）、AuditEvent。**这些字段全部不允许出现行业词汇。**

**Domain Package 内容（允许扩展）：** `domain.json`（id、显示名、语言包）、taxonomy、rubric、proposal-template、forbidden-claims（按语言）、credibility-rules 参数、composer placeholder / 示例、可选的 domain 专属 proposal 章节 schema（通过 `extensions` JSON 字段挂在 Core 对象上，不改表结构）。

**新行业接入路径：** 复制 toy domain package → 改数据文件 → 注册到 domain registry → Productizer Shell 自动加载该行业语言 / 卡片 / 模板。零 daemon 主逻辑改动是验收标准（Phase 8 的真正含义）。

**Registry 决策：** **V0 不要新建 domain registry。** V0 把 toy domain 作为 plugin 目录里的静态文件 + daemon 内一个硬编码的 `domains/toy` 加载器。等 Phase 8 验证第二行业时再抽 registry——届时评估复用 plugin registry（domain package 本质上是一种 plugin 资产）还是独立轻量 registry。现在建 registry 就是过早抽象。

**防过早 / 过晚抽象的平衡点：** 现在必须做的抽象只有一条——**Core schema 命名去行业化 + domain 内容文件化**。这条成本极低（就是命名和文件位置纪律），但决定了未来是否可扩展。其余抽象（registry、热加载、domain UI 插槽、多行业 shell 路由）全部延后。

**多行业 UI：** 共用 Productizer Shell（composer、五 Tab、卡片框架），domain 提供文案、placeholder、模板和 SKU 表列定义。V0 只需保证 Shell 组件不 import toy 字面量（从 domain 数据读）。

---

## 8. Open Source Compatibility Strategy

> 本节为 **[架构建议]**；"已存在 / 已是基座" 的判断为 **[远端源码事实]**。

| 类别 | 判断 | 接入层 | 现在 / 未来 |
|---|---|---|---|
| Open Design 自身（project / plugin / artifact / design system / agent pool / SQLite / export / critique / handoff atoms） | **全部复用**，这是本方案的全部杠杆 | — | 现在 |
| Agent Runtime（Codex / Claude / Gemini / Cursor / OpenCode） | 已通过 OD adapter pool 兼容，**不要新做** | 现有 runtime 定义 | 现在（V0 只认证 Claude 一个，因为它支持 stream-json + AskUserQuestion 门禁交互，最匹配 Action Card） |
| assistant-ui / CopilotKit / AG-UI | **不接**。OD 已有 ChatPane / ToolCard 体系，引入会撕裂 UI 边界 | — | 不接 |
| LangGraph / Mastra / 多 agent 编排 | **不接**。OD 的 plugin pipeline 已是编排层，叠加会制造两个状态机 | — | 未来若需要，作 runtime adapter seam |
| Trigger.dev / Temporal / n8n / Flowise / Dify | **不接**。V0 无长时工作流需求；接入会诱使 pipeline 变成业务状态机（明确禁止项） | — | 不接 |
| Langfuse / OpenTelemetry / PostHog | 值得，但 P2 | daemon 观测层，只读 run events | 未来；V0 用 evals fixtures 顶 |
| shadcn/ui / Radix | OD web 已有自己的组件体系和 CSS 所有权规则（`AGENTS.md`），**不引入新 UI 框架**，新卡片按现有 `apps/web/src/components` 模式写 | — | 不接 |
| Tiptap / ProseMirror / Lexical | 诱惑很大（proposal 编辑器），**V0 不接**。V0 的修改路径是 chat patch，不是富文本编辑；引入编辑器会让 artifact 与版本链脱钩 | 未来若做 "手动微调 proposal"，作为受控编辑层，编辑结果仍走 version 提交 | 未来 seam |
| Next.js | 已是 OD 基座 | — | 现在 |

**总原则执行版：** 任何开源组件的接入 PR，必须回答 "它写不写 Productizer 表？"——答案必须是否。它们只能消费 audit / run events 或渲染 UI。

---

## 9. Canonical Business State

> 本节为 **[架构建议]**；SQLite / artifact 现有能力描述为 **[远端源码事实]**（`apps/daemon/src/db.ts` 实际核查）。

| 对象 | V0 必须 | Core/Domain | 存哪 | 谁创建 | 谁可改 | UI 实体化 |
|---|---|---|---|---|---|---|
| Productizer Project | 是 | Core | SQLite（binding 到 OD project id） | 用户首次生成时 daemon 自动建 | daemon | 是（sidebar 项目列表） |
| Domain/Scenario 绑定 | 是（写死 toy） | Core 字段 | Project 行的 `domain_id` | daemon | 不可改 | 否 |
| Working Context Item | 是 | Core schema + Toy 语义 | SQLite | daemon（采纳 agent draft 后） | daemon；用户可通过 chat 触发更新 | 是（Context Tab 摘要） |
| Creative Direction | 是 | Core + Toy rubric 字段入 extensions | SQLite | daemon 采纳 agent draft | 状态变更仅经 Action Card（lock） | 是（Direction Cards） |
| Proposal Artifact 内容 | 是 | — | **OD filesystem artifact**（保持现状） | agent 经 OD artifact store | agent patch | 是（主工作区） |
| Proposal metadata + Version | 是 | Core | **SQLite**，version 行引用 artifact 文件快照路径 | daemon 在每次 patch 完成时 | 只增不改 | 是（版本下拉），diff 藏详情 |
| Feedback Event | 是（4 周版） | Core + Toy credibility 参数 | SQLite | 用户手动录入（UI/CLI） | 只增；strength 由 daemon 按规则定 | 是（Feedback Tab） |
| Readiness Review | 最小版 | Core 规则引擎 + Toy 规则 | SQLite（当前状态 + 历史） | daemon 规则评估 + Action Card 确认 | daemon | label 实体化，规则藏起来 |
| Action Card | 是（3 种） | Core | SQLite | daemon 在守卫点创建 | 用户确认 / 驳回 | 是（chat 流内卡片） |
| Audit Event | 是（被动写） | Core | SQLite append-only | daemon 一切写操作旁路记录 | 不可改 | 否（藏详情 / 导出） |

**四个重点判断，明确回答：**

1. **Proposal 内容继续放 OD artifact filesystem。** 这保留了 live 渲染、导出、git 可审查的全部现有能力。每个 version 在 SQLite 记 metadata 并指向一个不可变文件快照（拷贝或 content hash），防止 "artifact 被覆盖导致版本链空心化"。
2. **metadata / 版本 / 反馈 / readiness / Action Card 全部进 SQLite**，挂在现有 `apps/daemon/src/db.ts` 的 `migrate()` 体系里（critique / media / plugins 已示范了模块化 migration 模式，照抄即可，**[远端源码事实]**）。
3. **Chat transcript 仅是交互记录。** daemon 不得从 messages 表反推业务状态；所有业务写入必须有显式 API / 采纳动作。
4. **Agent run events 仅是执行证据**，可被 audit 引用，但 readiness / credibility 的判定输入只能是 SQLite 里的业务行。

---

## 10. Technical Architecture

> 本节为 **[架构建议]**；目录规范与既有模式来自 `AGENTS.md`、`apps/daemon/src/db.ts`、`apps/daemon/src/cli.ts` 的实际核查（**[远端源码事实]**）。

**建议文件层级（与现有仓库规范逐项对齐过）：**

```text
packages/contracts/src/api/productizer.ts          # DTO：请求/响应/SSE 事件
packages/contracts/src/productizer/
  core.ts                                          # Core 对象类型（去行业化）
  domain.ts                                        # DomainPackage 描述类型
apps/daemon/src/productizer/
  store.ts                                         # SQLite 表 + migration（挂入 db.ts migrate()）
  service.ts                                       # 采纳 draft -> validated record；版本；guard
  guards.ts                                        # forbidden claims / credibility / readiness
  domains/toy/
    domain.json  taxonomy.json  rubric.md
    forbidden-claims.json  credibility-rules.json
    proposal-template.md
apps/daemon/src/productizer-routes.ts              # /api/productizer/*（挂入现有 server 路由注册）
apps/daemon/src/cli.ts                             # 新增 od productizer 子命令入 SUBCOMMAND_MAP
plugins/_official/scenarios/toy-productizer/       # 按 BRANCH_BRIEF §6 原样
design-systems/toy-proposal-trade-desk/DESIGN.md
apps/web/src/components/productizer/
  ProductizerShell.tsx   ProposalWorkspace.tsx
  DirectionCard.tsx      SkuTable.tsx
  FeedbackPanel.tsx      ReadinessBadge.tsx
  ActionCard.tsx         ContextSummary.tsx
```

注意三点修正：

- **不要建 `ToyProductizerStudio.tsx`**。Shell 从 domain package 读文案；建这个文件等于把 toy 写进组件树。
- SQLite migration 不要新建独立 migration 框架，复用 `db.ts` 的 `migrateXxx(db)` 模式（已有 critique / media / plugins 三个先例，**[远端源码事实]**）。
- **[远端源码事实]** pipeline 里的 `file-write`、`live-artifact` atoms 在当前 `plugins/_official/atoms/` 目录不存在，Phase 1 第一件事是核对 plugin-runtime 实际支持的 atom 集并降级 pipeline。

**与现有体系的关系：** Proposal 生成走现有 `/api/chat` + plugin run，不新增生成通道；productizer routes 只做业务状态读写和采纳；artifact 经现有 artifact store；Action Card 的交互复用 AskUserQuestion 的 `tool-result` 回传机制（`POST /api/runs/:id/tool-result` 已存在，**[远端源码事实]**）。

**Domain discovery：** V0 硬编码加载 `domains/toy`，不建 registry（理由见第 7 节）。

**不要做清单（确认并补充）：** 不新建独立后端服务；不绕过 `/api/runs`；web 不 import `apps/daemon/src/**`（`AGENTS.md` 硬边界）；不把业务状态放 markdown 当唯一事实源；行业规则不硬编码进 route；不为开源框架重写 OD 生命周期；不先做大 UI 重构；不让分支变成 toy-only 不可合回的 fork——**所有 Core 代码应以可合回 main 的质量编写，toy 内容隔离在 domain 文件里**。

---

## 11. Agent Contract

> 本节为 **[架构建议]**，与 `TOY_PRODUCTIZER_AGENT_SYSTEM_DESIGN.md` 的对象模型对齐。

**输入侧：** daemon 在组装 prompt 时注入三段——① Working Context 的当前 SQLite 快照（结构化 JSON，不是 chat history 重放）；② domain package 的 taxonomy / rubric / template / forbidden-claims（经 plugin SKILL.md 引用）；③ design system（现有机制）。Agent 不直接读 SQLite，daemon 是唯一供给方。

**输出侧（核心纪律）：** Agent 的一切产出都是 **draft**，分两类：

- **文件类**：proposal markdown/html patch —— 经现有 artifact 写路径落盘，daemon 在 run 完成钩子里执行 guards（forbidden claims 扫描、必备章节检查），通过则创建 ProposalVersion 行，不通过则标记该版本为 blocked 并在 chat 提示。
- **结构类**：directions、context items、修改摘要 —— 以约定的 fenced JSON 块（或 tool call，若 runtime 支持）输出，daemon 解析、schema 校验、写入 SQLite 为 validated record。解析失败不阻断 run，只是不产生业务行（宁缺勿错）。

**daemon 校验职责：** forbidden claims（字符串级，按 domain 语言表）；hard constraints（如 "no plush" 持久在 Context，patch 后复查 directions 是否违反）；feedback credibility（用户录入时按规则定级，agent 无权定级）；readiness（规则评估，agent 只能建议）。

**必须 Action Card 的动作（V0 三个）：** 锁定方向、导出 / 分享客户可见 proposal、标记 handoff-ready。Agent 可以在输出里**建议**这三个动作（生成 Action Card draft），但状态变更只在用户确认后由 daemon 执行。

**多行业与多 runtime：** contract 的 JSON schema 属于 Core（direction / context / proposal-patch 三种 draft 类型），domain 只扩展字段字典；不同 runtime 经现有 adapter 归一为同一 draft 流——能力弱的 runtime（无 tool call）走 fenced JSON 解析路径，这就是 adapter seam，不需要额外框架。

**驱动实体化 UI：** Direction draft 被采纳 → DirectionCard 出现；proposal version 创建 → 版本下拉更新 + changedSections 高亮；feedback 录入 → strength indicator；readiness 变化 → badge。UI 全部从 SQLite 读，绝不从 chat 流解析业务状态。

---

## 12. Implementation Roadmap

> 本节为 **[架构建议]**；fixture A-E 定义见 `docs/toy-productizer/BRANCH_BRIEF.md` §11。

### Phase 1: 跑通 plugin / design system / artifact run（1 周内）

- **范围：** `plugins/_official/scenarios/toy-productizer/*`、`design-systems/toy-proposal-trade-desk/DESIGN.md`。零 daemon / web 代码。
- **第一步：** 核对 plugin-runtime 支持的 atoms，把 `BRANCH_BRIEF.md` pipeline 中不存在的 `file-write` / `live-artifact` 降级为最简可用形态。
- **验收：** fixture A（中文机器人）和 B（英文 buyer brief）经现有 UI 跑出 proposal artifact；forbidden claims 用一个临时脚本扫描产物为零命中。
- **测试：** `pnpm guard`、`pnpm --filter @open-design/plugin-runtime typecheck`、`od plugin validate`（若存在；不存在记为 gap）。
- **不做：** 任何 UI、任何 SQLite。**降级路径：** 若 pipeline stages 不被支持，退到单段 SKILL.md 纯 prompt 驱动，仍可验收。

### Phase 2: 最小 Core 事实源（第 2 周）

- **范围：** `packages/contracts/src/productizer/`、`apps/daemon/src/productizer/store.ts|service.ts`、`productizer-routes.ts`、`cli.ts` 子命令（同 PR，双轨规范）。
- **对象：** Project binding、ContextItem、Direction、ProposalMeta、ProposalVersion、AuditEvent。
- **验收：** 同一 project 二次 patch 后 `od productizer versions --json` 返回 2 个版本且快照文件可打开；fixture C（patch 保持 no-plush）通过。
- **不做：** Feedback / Readiness / Action Card。**降级：** draft 解析失败时业务表为空但 run 不报错。

### Phase 3: Toy Domain Package（第 2-3 周，与 Phase 2 部分并行）

- **范围：** `apps/daemon/src/productizer/domains/toy/*`，guards.ts 读 domain 文件。
- **验收：** fixture E（forbidden claims 被 daemon 拦截而非靠 prompt 自觉）通过；daemon 通用代码 grep 不到 "toy"。
- **不做：** registry、热加载。

### Phase 4: Versioning 完善 + Feedback Ledger（第 3 周）

- **验收：** fixture D（"interesting" 反馈被记为 low 且不推进状态）通过；CLI `od productizer feedback add` 可用。

### Phase 5: Readiness + Action Cards（第 3-4 周）

- **范围：** guards.ts readiness 规则一条 + ActionCard 表 + 复用 tool-result 机制的确认流。
- **验收：** 无 medium+ 反馈时标记 handoff-ready 被拒；三个 Action Card 在 chat 流可确认 / 驳回且写 audit。

### Phase 6: 垂直化 UI（第 4 周）

- **范围：** `apps/web/src/components/productizer/*` + 一个入口路由。隐藏（不删除）通用入口。
- **验收：** 新用户从 composer 到第一份 proposal 全程不见 plugin / skill / agent 字样；五 Tab 数据全部来自 `/api/productizer/*`。
- **不做：** OD 重写、CRM、RFQ、marketplace。**降级：** Tab 砍到 Proposal / Directions / Feedback 三个。

### Phase 7: Adapter 与观测（V0 后）

- evals fixtures 进 CI；评估 Langfuse / OTel 作只读观测；保留 Tiptap 编辑 seam 的设计文档，不实现。

### Phase 8: 第二行业架构验证（V0 后）

- 用 gift-productizer 做纸面 + 数据文件级验证：只新建 domain 文件，daemon / web 零改动即能跑 fixture。届时再决定 registry 形态。

---

## 13. Risks And Open Questions

1. **[远端源码事实] Phase 1 atom 缺口（已证实）：** pipeline 引用的 `file-write` / `live-artifact` atoms 不存在于 `plugins/_official/atoms/` 目录。影响：Phase 1 工期与形态。缓解：第一天核对 plugin-runtime 真实能力。
2. **[远端源码事实] `docs/architecture.md` 陈旧：** 它声称无 SQLite，与 `apps/daemon/src/db.ts` 矛盾。下一位 agent 若按它实现会走错持久化路线。建议顺手提一个 docs PR 修正。
3. **[架构建议] Pack 对象双事实源风险：** `TOY_COMMERCIALIZATION_PACK_SPEC.md` 的 Pack 若被实现为持久对象，会与 Context+Directions+Proposal 形成两套真相。裁决：Pack 降级为运行期组装视图（见第 2 节）。
4. **[架构建议] Action Card 复用 AskUserQuestion 的耦合风险：** 该机制目前仅 Claude（stream-json）完整支持。若 V0 允许其他 runtime，Action Card 需走 run 外的独立确认 API。裁决：V0 锁定 Claude 一个 runtime。
5. **[架构建议] 版本快照空心化：** 若 version 行只指向活 artifact 路径，后续 patch 会让历史版本失真。必须落不可变快照（拷贝 / 哈希），Phase 2 验收项。
6. **[架构建议] 本地优先 vs 目标用户：** 贸易商不会装 daemon。V0 pilot 可以由实施方代为部署，但这是商业化阶段的真实渠道风险，产品文档未正视。
7. **[架构建议] 过早抽象风险：** domain registry、多行业 shell、开源 adapter 都有把 4 周拖成 8 周的引力。本报告已全部压到 P2/P3。
8. **[架构建议] 过晚抽象风险：** 唯一不可推迟的是 Core schema 去行业化命名。错过它，第二行业必然 fork。
9. **[架构建议] Chat / run 被误用为事实源：** UI 工程师最容易从消息流解析 direction。守住 "五 Tab 只读 `/api/productizer/*`" 这条线。
10. **[架构建议] forbidden claims 字符串扫描的局限：** "我们保证不侵权" 这类变体扫不到。V0 接受这个局限并在 UI 永远显示 validation-only 标签兜底；语义检测延后。
11. **[架构建议] 竞争力坍缩为 "ChatGPT+模板" 的风险：** 若 pilot 用户只用一次生成、不回来录反馈，竞争力假设 ② 即告失败——这比任何技术风险都大。4 周 pilot（`TOY_MARKET_VALIDATION_PLAYBOOK.md` 的节奏）必须真实执行。
12. **[架构建议] 优先级错配风险：** 最大的诱惑是先做漂亮 UI（Phase 6 提前）。但没有版本和守卫，垂直 UI 只是皮肤。坚持 Phase 顺序。

---

## 14. Final Verdict

> 本节为 **[架构建议]**，其中实现进度判断为 **[远端源码事实]**。

**直接结论：方案可以进入技术实现，方向正确，但当前分支只有文档、零实现，且需求里有三处必须先裁掉的赘肉（Pack 持久化、完整 maturity model、concept visuals）。**

- **是否先砍 scope：** 是。按第 4 节的 "不做前 7 个" 执行。文档总体克制，但 `TOY_COMMERCIALIZATION_PACK_SPEC.md` 和 maturity model 如果照实现会把 V0 拖垮。
- **UI 策略：** 采用**轻量垂直化入口 + 工作区**。这不是折中，而是唯一同时满足 "感知垂直价值" 和 "4 周可交付" 的选项。
- **"轻量垂直 Productizer shell + Toy domain first" 是否成立：成立**，且 Open Design 现有架构（project / plugin / artifact / design system / agent pool / SQLite / contracts / CLI 双轨）对它的支撑度比文档作者预期的还要好——尤其 `apps/daemon/src/db.ts` 的模块化 migration 和 tool-result 确认机制是现成的（**[远端源码事实]**）。
- **核心竞争力是否成立：** 成立一半。生成质量本身不是护城河；**业务事实源（版本 / 反馈 / credibility / 守卫）+ 行业 domain package** 才是。V0 必须验证的三个假设：敢发客户、会回来、敢给销售用（第 3 节）。
- **必须现在做的抽象：** Core schema 去行业化命名 + domain 内容文件化。**必须延后的抽象：** domain registry、多行业 shell、所有开源 adapter、富文本编辑。
- **Open Design 能否支撑多行业 Productizer：能**，前提是守住 "daemon 通用代码无行业词汇" 和 "domain 是数据不是代码" 两条纪律。
- **下一位 implementation agent 从哪开始：** Phase 1 第一天——核对 plugin-runtime 实际 atom 集，然后写 `plugins/_official/scenarios/toy-productizer/SKILL.md` 和 `design-systems/toy-proposal-trade-desk/DESIGN.md`，用 fixture A/B 跑通。不要从 UI 或 SQLite 开始。
- **只有 2 周：** ① plugin + design system 跑通 fixture A/B/E（守卫用脚本顶）② ProposalVersion 最小表 + 快照 ③ fixture C 的 patch 保真。这三件事证明 "提案不丢、改不坏、不乱承诺"——即对 ChatGPT 的全部差异。
- **只有 4 周的验收标准：** 5 个 fixture 全绿；同一 project 完成 "生成 → patch → 录入低强度反馈被拦 → Action Card 确认导出" 全链路；新用户全程不见技术语言；`od productizer` CLI 与 UI 等价；daemon 通用代码 grep 不到 "toy"。达到这个标准，就可以带着真实贸易商进 4 周 pilot 验证付费假设。

一句不迎合的话收尾：这套文档最大的优点是边界意识，最大的危险是文档完成度造成的 "已经做完了" 错觉——**[远端源码事实] 远端分支目前的实现进度是 0%**，而 Phase 1 的第一个具体障碍（atom 缺口）文档里没有人发现。先让一份 proposal 真实地从 agent 流进 artifact，再谈其他一切。
