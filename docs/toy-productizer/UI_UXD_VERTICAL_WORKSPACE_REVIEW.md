# Toy Productizer Studio — Vertical Workspace UI/UXD Review

> Document type: UI/UXD Review & Phase F Implementation Spec
> Status: Control draft — Phase C has passed; do not implement production UI until Phase E passes
> Branch: `swing99527/open-design`, `productizer/toy-productizer-studio`
> Date: 2026-06-11
> Current sync note: Phase C agent-artifact acceptance is recorded in `PHASE1_REVIEW.md` at commit `d38bb90b`.
>
> 事实类型标注：
> - `[源码事实]` — 直接读取分支文件，可浏览器验证
> - `[UXD判断]` — 设计判断和建议
> - `[待验证]` — 需要运行应用后验证

---

## 1. 当前 Open Design UX 对玩具贸易用户的差距

### 1.1 根本错位

`[源码事实]` 当前 Open Design 给任何用户展示的第一屏是：

- 左导航：Home / Projects / Tasks / Design Systems / Plugins / Integrations
- 首页：plugin 卡片走马灯 + skill 快捷入口 + 最近项目
- 聊天起始提示（`DEFAULT_STARTER_KEYS`）：Web 原型 / 数据可视化 / SaaS 落地页

对玩具贸易商或外贸工厂负责人而言，这些词汇和内容**完全陌生**。差距不在于功能缺失，而在于缺少一个领域语言入口层：

> 用户问的是"我有客户参考图，我要什么新品方向"，而不是"我想创建什么"。

### 1.2 通过源码读取发现的 6 个具体差距

| 文件 | 差距描述 | Phase F 处理方式 |
|---|---|---|
| `EntryNavRail.tsx` L16–23 | `EntryView` 硬编码 7 种通用目的地，无 Productizer 入口 | 新路由绕过，不修改此文件 |
| `ChatPane.tsx` L76–100 | `DEFAULT_STARTER_KEYS` 三条提示全为 prototype/dashboard | 垂直 shell 替换为行业示例 |
| `FileWorkspace.tsx` L232–235 | tab 常量为 `__design_files__` / `__design_system__` / `__questions__`，无业务对象 tab | 注入 `productizer` prop，门控 tab 栏 |
| `WorkspaceTabsBar.tsx` | 顶部 chrome 仅识别 `entry`/`project`/`marketplace` tab 类型 | Productizer 为独立路由，不修改此文件 |
| `HandoffButton.tsx` | 已存在但无 Productizer 业务状态 | 复用为 Handoff Tab 导出动作基础 |
| `ToolCard.tsx` → `AskUserQuestionCard` L222–421 | 确认卡片机制完整：选项渲染、`onAnswerToolUse` 优先路由、`onSubmitForm` 降级、reload 后持久化 | 复用渲染层；状态后端由 Productizer daemon 单独拥有（见 §4.4） |

### 1.3 已存在、可直接复用的能力

`[源码事实]` 以下机制已完整实现，Phase F 不重造：

- `ChatPane.tsx` — 完整对话栏（流式、历史、composer）
- `ChatComposer.tsx` — composer（含文件附件上传）
- `FileViewer.tsx` / `LiveArtifactViewer` — artifact 渲染（srcDoc + URL-load 双 iframe）
- `AskUserQuestionCard`（`ToolCard.tsx` L222）— 确认卡片渲染（`onAnswerToolUse` 优先 → `onSubmitForm` 降级）
- `HandoffButton.tsx` — 交接导出基础
- `.accordion-collapsible` + `.accordion-collapsible-inner`（`index.css`）— 折叠动画，必须复用
- CSS token 体系（`styles/tokens.css`）— 不修改，通过 CSS 变量引用

---

## 2. 第一屏：轻量垂直入口和 Composer

### 2.1 设计原则

`[UXD判断]` 第一屏 5 秒内必须回答一个问题：

> "我把客户需求或参考图放进来，接下来会发生什么？"

答案用贸易语言，不出现技术词汇。

### 2.2 布局规格

```
┌─────────────────────────────────────────────────────┐
│  [项目名称 — 可编辑]          [●已保存]   [···]    │  ← 极简顶栏
├─────────────────────────────────────────────────────┤
│                                                      │
│           Toy Productizer Studio                     │
│                                                      │
│   ┌─────────────────────────────────────────────┐   │
│   │  粘贴客户需求、描述现有产品，或上传参考图。  │   │
│   │  I'll turn it into product directions        │   │
│   │  and a customer proposal.                    │   │
│   │                                              │   │
│   │  [📎 Upload reference]  [🌐 URL]  [Send →] │   │
│   └─────────────────────────────────────────────┘   │
│                                                      │
│   快速示例（点击填入，不自动发送）：                │
│   ◆ 博物馆礼品店 / 15美元以内 / 复古机器人          │
│   ◆ US pet store buyer wants eco plush               │
│   ◆ 欧洲超市礼品季 / 亚马逊自营 / 小预算            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 2.3 实现要点

**Composer**：复用 `ChatComposer.tsx`，不新建输入框。文件附件（参考图上传）复用其已有 attachment 逻辑。

**右侧工作区**：第一个 Proposal artifact 出现前，通过 CSS class 切换保持 mounted 但不可见（不 unmount）。

**示例提示**：点击调用现有 composer fill 方法，不自动发送。样式在 `ProductizerShell.module.css`，不加全局类名。

**第一屏不渲染**：`EntryNavRail` 通用目的地（Plugins / Design Systems / Automations / Integrations）、通用起始提示、"Start a new project" 语言。通用 OD 代码一行不动。

---

## 3. 生成后工作区：五 Tab 布局

### 3.1 三栏结构

```
┌────────┬──────────────────────┬──────────────────────────┐
│ SIDEBAR│ ADVISOR              │ PROPOSAL WORKSPACE       │
│        │                      │                          │
│ 新建   │ Advisor 判断文字      │ [提案][方向]             │
│ 提案   │ 约束确认             │ [上下文][反馈]           │
│ ─────  │ 澄清问题             │ [交接材料]               │
│ 最近   │                      │                          │
│ · 机器 │ Action Card          │ < 提案正文 >             │
│   人   │ （仅需要时，在此栏   │                          │
│ · 环保 │  出现，不嵌入 Tab）  │ 版本: v3 ▾   [导出]     │
│   毛绒 │                      │                          │
│        │ [Composer…]          │                          │
└────────┴──────────────────────┴──────────────────────────┘
```

SIDEBAR 和 ADVISOR 复用 `ChatPane.tsx` 现有布局。PROPOSAL WORKSPACE 五 Tab 容器由新建的 `ProposalWorkspace.tsx` 实现，嵌入 `FileWorkspace.tsx` 的现有右栏 slot（通过 `productizer` prop 门控）。

### 3.2 Tab 1：提案（Proposal）

**目的**：客户可读的提案 artifact，项目的主要交付物。

**渲染机制**：使用 `FileViewer.tsx` / `LiveArtifactViewer` 渲染 `toy-proposal-trade-desk` 设计系统输出的提案 HTML artifact。FileViewer 现有双 iframe 机制（URL-load + srcDoc 同时挂载，CSS visibility 切换）原样复用，不因 Productizer 修改。

**版本下拉**：数据源 `GET /api/productizer/projects/:id/versions`（Phase E）。用 `<select>` 原生元素 + CSS Module 样式。

**内容展示约束**（遵守 `DESIGN.md`）：
- 所有价格/SKU/包装/材料/渠道假设带 `Unconfirmed:` / `未确认:` 标签
- 边界声明（boundary box）永远可见，不可隐藏
- 禁止展示 forbidden claims（`supplier-ready` / `可直接量产` / `正式报价` / `无侵权` 等）

### 3.3 Tab 2：方向（Directions）

**目的**：对比并锁定创意方向，展示差异点承诺。

**Direction Card 关键规则**：
- `differentiation`（与参考图差异点）字段**永远可见，不可折叠**——这是非照抄承诺的 UI 落地
- `risks[]` 每条渲染为 `⚠ Unconfirmed` badge，不可隐藏
- "Lock Direction" 按钮**不直接触发状态写入**，而是触发 Advisor 栏中的 Action Card（见 §4.4）

**辅助信息折叠**：买家契合 / 渠道 / 风险细节可折叠。折叠使用 `.accordion-collapsible` + `.accordion-collapsible-inner`（复用 `index.css` 已有模式）。

### 3.4 Tab 3：上下文（Context）

**目的**：展示工作上下文（约束、假设、缺失信息）的当前状态。

**默认视图（chip 条）**：
```
Using:   [机器人盲盒]  [博物馆礼品店]  [$15 上限]
Locked:  [不要毛绒]  [避免近似轮廓抄袭]
Assumed: [成人收藏向]  [6-SKU 系列]
Missing: [目标尺寸]  [材质偏好]
```

chip 只读，修改通过 Advisor 对话进行。

**详情抽屉**：点击展开 accordion（`.accordion-collapsible`），显示每条上下文的来源、信心度、创建时间。数据源：`GET /api/productizer/projects/:id/context`（Phase E）。

### 3.5 Tab 4：反馈（Feedback）

**目的**：在对话之外录入并查看买家/团队反馈，驱动 Readiness Badge 状态。

**录入表单**：来源标签 / 反馈原文 / 强度（weak / medium / confirmed 三个选项）。提交 `POST /api/productizer/projects/:id/feedback`（Phase E）。

**反馈列表**：每条显示强度指示器 + credibility tier + 来源 + 日期。credibility tier 由 daemon 计算，**UI 只读，不允许用户直接修改**。

**空状态**：`"No confirmed feedback yet — handoff readiness is blocked."` 始终显示。

### 3.6 Tab 5：交接材料（Handoff）

**目的**：为下一个人工团队生成证据包。

**内容**（只读摘要）：锁定方向 / 已确认上下文 / 假设列表（含 `Unconfirmed:` 标签）/ 反馈摘要 / 缺失信息 / Readiness Badge / 导出按钮。

**导出门禁**："导出提案"按钮点击后，不直接触发下载，而是在 Advisor 栏弹出 Action Card（见 §4.3 ②）。只有用户在 Action Card 中明确 Confirm 后，daemon 才执行 forbidden claims 扫描并生成导出文件。（对应 `DESIGN.md §7`："Handoff or share actions require explicit user confirmation."）

### 3.7 移动端 / 窄屏布局

`@media (max-width: 768px)` 时：

```
┌──────────────────────────────────────────────┐
│  [提案][方向][上下文][反馈][交接材料]        │  ← 横向滚动 tab 条
├──────────────────────────────────────────────┤
│  < 当前 Tab 内容 >                           │
├──────────────────────────────────────────────┤
│  [Composer…]                                 │  ← sticky composer
└──────────────────────────────────────────────┘
```

Tab 条横向滚动（`overflow-x: auto; scrollbar-width: none`），与 `styles/shell.css` 中 `.workspace-tabs-strip` 已有模式一致。

---

## 4. 实体语言：五个核心 UI 对象

### 4.1 Direction Card

**组件**：`productizer/DirectionCard.tsx` + `DirectionCard.module.css`

```
┌──────────────────────────────────────────────────────┐
│  DIRECTION 1                       [Status: Draft]   │
│  ────────────────────────────────────────────────── │
│  Retro Science Robot Keychain Series                 │
│  ────────────────────────────────────────────────── │
│  摘要：柜台展示收藏品，4 SKU 系列，约 3 英寸高      │
│                                                      │
│  ▸ 与参考图的差异点（永远可见，不可折叠）：          │
│    新几何轮廓；机器人面部用仪表/表盘设计             │
│    代替直接复制的数字面板参考图                      │
│                                                      │
│  ▸ 买家/渠道契合：博物馆礼品店 / $12–15 零售         │
│  ▸ 风险：[⚠ Unconfirmed 零售价格带]                │
│                                                      │
│  [Lock Direction ↗]                                  │
└──────────────────────────────────────────────────────┘
```

**状态变体**：`draft`（默认边框）/ `locked`（`var(--blue)` 边框 + 锁定 badge）/ `rejected`（标题删除线，opacity 0.45）。

### 4.2 SKU 表

**组件**：`productizer/SkuTable.tsx`（薄包装层，读取提案 artifact 结构化内容）

```
┌───────────────────────────────────────────────────────────┐
│ SKU / Lineup                                              │
│ ─────────────────────────────────────────────────────    │
│  SKU   │  Form            │  Target retail    │  Notes   │
│  001   │  Robot Keychain  │  Unconfirmed $12  │  Core    │
│  002   │  Robot Pin       │  Unconfirmed $8   │  Optional│
│  003   │  Gift Box Set    │  Unconfirmed $28  │  Optional│
└───────────────────────────────────────────────────────────┘
```

所有价格/数量格用 `Unconfirmed:` 前缀。MOQ / lead time / sample / tooling 不出现在客户可见行。

### 4.3 Readiness Badge

**组件**：`productizer/ReadinessBadge.tsx` + `ReadinessBadge.module.css`

| 状态 | 显示 | 颜色 token | 触发条件（daemon 判断，UI 只读）|
|---|---|---|---|
| `exploring` | Exploring / 探索中 | `var(--text-muted)` | 无 medium+ 确认反馈 |
| `in_review` | In Review / 审核中 | `var(--blue)` | ≥1 medium 反馈，未 Action Card 确认 |
| `handoff_ready` | Handoff Ready / 可交接 | `var(--green)` | "Mark Handoff Ready" Action Card 确认 |

位置：顶栏项目名称区域右侧，始终可见。Badge 只读显示——**UI 不直接 PATCH readiness 状态**，所有状态写入必须经 Action Card confirm 端点。

### 4.4 Action Card：状态边界与渲染复用

**渲染复用**：Productizer Action Card 使用 `AskUserQuestionCard` 相同的 DOM 结构（`op-card op-ask-question`，选项按钮，Submit 按钮），不新建 UI 组件。

**状态边界（与通用 AskUserQuestion 的关键区别）**：

| 属性 | 通用 AskUserQuestion | Productizer Action Card |
|---|---|---|
| 渲染组件 | `AskUserQuestionCard` | `AskUserQuestionCard`（完全复用） |
| 状态后端 | Claude stream-json run state | Productizer daemon SQLite |
| Confirm 写入路径 | `POST /api/runs/:id/tool-result` | `POST /api/productizer/projects/:id/action-cards/:id/confirm` |
| 创建来源 | Claude 模型调用 `AskUserQuestion` 工具 | Productizer daemon 在业务条件满足时生成 |

**路由分支在哪里处理**：`ProjectView.tsx` 的 wiring 层，根据 Action Card 类型决定 `onAnswerToolUse` prop 指向哪个端点。`ToolCard.tsx` 本身**不改动**。

**去重规则**：使用现有 `dedupeSnapshotToolRetries` 去重同一操作的重试卡片，每个操作只展示最新的卡片。

**三个 V0 Action Card**：

**① Lock Direction（锁定方向）**
```
┌────────────────────────────────────────────┐
│  Lock Direction                            │
│  方向：Retro Science Robot Keychain        │
│  理由：契合博物馆礼品店，$15 上限，         │
│        轮廓差异度低于参考图                  │
│  风险：[⚠ 零售价格带待确认]                │
│                                            │
│  [Confirm Lock]  [Revise First]  [Dismiss] │
└────────────────────────────────────────────┘
```
- Confirm → `POST /api/productizer/.../action-cards/:id/confirm { action: "lock_direction" }`
- 锁定不可逆；Confirm 后卡片立即锁定（`submitted` state 设为 true）

**② Export / Share Proposal（导出提案）**
```
┌────────────────────────────────────────────┐
│  Export Customer Proposal                  │
│  版本：v3（当前）                           │
│  边界检查：✓ 未发现 forbidden claims        │
│  缺失：尚无已确认买家反馈                   │
│                                            │
│  [Export HTML]                  [Cancel]   │
└────────────────────────────────────────────┘
```
- Confirm → daemon 执行 forbidden claims 扫描后生成文件

**③ Mark Handoff Ready（标记可交接）**
```
┌────────────────────────────────────────────┐
│  Mark Handoff Ready                        │
│  就绪审查：                                 │
│  ✓ 方向已锁定                              │
│  ✓ 1 条已确认反馈                          │
│  ⚠ 缺失：目标尺寸规格                      │
│                                            │
│  确认在样品 / 报价前已完成人工审核。         │
│                                            │
│  [Confirm Handoff Ready]       [Cancel]    │
└────────────────────────────────────────────┘
```
- daemon 门禁：无 `credibilityTier = medium | confirmed` 的反馈时，daemon 拒绝 confirm 请求（返回 400），UI 显示 Toast 错误。

### 4.5 FeedbackStrengthIndicator

**组件**：`productizer/FeedbackStrengthIndicator.tsx` + `FeedbackStrengthIndicator.module.css`

| strength | 圆点颜色 token | 含义 |
|---|---|---|
| `weak` | `var(--amber)` | 轶事或第三方 |
| `medium` | `var(--blue)` | 直接渠道联系，未确认意向 |
| `confirmed` | `var(--green)` | 买家表达明确意向（含数量/时间线）|

---

## 5. 通用 OD 术语：隐藏或绕过（不删除）

### 核心原则

> 隐藏或绕过，不删除。通用 OD 代码保持完整，Productizer Shell 是覆盖层路由。

### 在 Productizer Shell 中不渲染的元素

| 通用元素 | 隐藏方式 |
|---|---|
| Plugin / Skill / Run / Agent 词汇 | Shell 路由不挂载对应 UI 节点 |
| `EntryNavRail` Plugins / Automations / Integrations 按钮 | Shell 路由不挂载 `EntryNavRail` |
| Design Systems 导航入口 | 同上；设计系统是输出合同，不是用户选择 |
| 通用起始提示（prototype/deck/dashboard）| 替换为行业示例 |
| "Start a new project" | 替换为 "新建提案 / New Proposal" |

### 重命名映射

| 通用词 | Productizer 显示 |
|---|---|
| Artifact | 提案 / Proposal |
| Version | 提案版本 v3 |
| Handoff | 交接材料 |
| Design Files tab | 隐藏 |
| Run | 不显示 |
| Readiness | Exploring / In Review / Handoff Ready |

### 实现手段（三种，优先级从轻到重）

1. **路由层不挂载**：`ProductizerShell.tsx` 不渲染 `EntryNavRail`、`HomeView` 等通用组件
2. **prop 门控**：`FileWorkspace.tsx` 增加 `productizer?: boolean` prop，门控 tab 栏渲染
3. **data 属性 + CSS Module 隐藏**：对无法通过 prop 控制的极少数元素，在 shell 根元素加 `data-productizer-shell="true"`，CSS Module 作用域内隐藏

---

## 6. 组件复用地图与 Phase F 文件列表

### 6.1 直接复用（不改动，13 个文件）

| 组件 | 文件 | Phase F 用途 |
|---|---|---|
| `ChatPane` | `components/ChatPane.tsx` | Advisor 对话栏 |
| `ChatComposer` | `components/ChatComposer.tsx` | 第一屏 composer 和工作区 composer |
| `FileViewer` / `LiveArtifactViewer` | `components/FileViewer.tsx` | 提案 Tab artifact 渲染 |
| `AskUserQuestionCard` | `components/ToolCard.tsx` L222 | Action Card 渲染（状态后端由 Productizer 拥有）|
| `HandoffButton` | `components/HandoffButton.tsx` | Handoff Tab 导出动作基础 |
| `Button` | `@open-design/components` | 所有新组件的操作按钮 |
| `VisuallyHidden` | `@open-design/components` | 无障碍文字标注 |
| `Toast` | `components/Toast.tsx` | 错误/成功反馈 |
| `Icon` | `components/Icon.tsx` | 图标 |
| `.accordion-collapsible` 类 | `index.css`（已有全局） | Context Tab 抽屉、Direction Card 折叠 |
| CSS tokens | `styles/tokens.css` | 新组件 CSS 变量 |

### 6.2 轻量配置（小改动，保留原有逻辑）

| 组件 | 文件 | 改动内容 |
|---|---|---|
| `FileWorkspace` | `components/FileWorkspace.tsx` | 增加 `productizer?: boolean` prop，门控 tab 栏 |
| `ProjectView` | `components/ProjectView.tsx` | 传入 `productizer` prop；wiring `onAnswerToolUse` 路由到正确端点 |
| `ConversationsMenu` | `components/ConversationsMenu.tsx` | 仅更改显示标签（"Recent Proposals"），通过 prop |

### 6.3 新建文件（全部在 `apps/web/src/components/productizer/`）

所有新组件样式写在 collocated CSS Module，不加全局 selector：

| 组件文件 | CSS Module | 用途 |
|---|---|---|
| `ProductizerShell.tsx` | `ProductizerShell.module.css` | 顶层路由包装器 |
| `ProposalWorkspace.tsx` | `ProposalWorkspace.module.css` | 五 Tab 右栏容器 |
| `DirectionCard.tsx` | `DirectionCard.module.css` | 方向卡片 |
| `FeedbackStrengthIndicator.tsx` | `FeedbackStrengthIndicator.module.css` | 强度圆点 + tier 标签 |
| `ReadinessBadge.tsx` | `ReadinessBadge.module.css` | 就绪状态 badge |
| `ContextSummary.tsx` | — | 上下文 chip 条 + accordion 详情 |
| `FeedbackPanel.tsx` | — | 反馈 Tab 内容 |
| `HandoffPanel.tsx` | — | 交接材料 Tab 内容 |

**测试文件**（放在 `apps/web/tests/components/productizer/`，**不放在 `src/`**）：

```
apps/web/tests/components/productizer/
├── ProductizerShell.test.tsx
├── DirectionCard.test.tsx
├── FeedbackStrengthIndicator.test.tsx
└── ReadinessBadge.test.tsx
```

测试用例覆盖：
- 默认渲染 Proposal 为第一个 Tab
- Direction Card 正确渲染 differentiation 文字
- Feedback 强度标签渲染正确
- Shell 隐藏 plugin/skill/run 词汇

### 6.4 i18n 键（需加入全部 18 个 locale 文件）

先在 `apps/web/src/i18n/types.ts` 添加类型，再在所有 18 个 locale 文件（`ar`, `de`, `en`, `es-ES`, `fa`, `fr`, `hu`, `id`, `ja`, `ko`, `pl`, `pt-BR`, `ru`, `th`, `tr`, `uk`, `zh-CN`, `zh-TW`）补翻译：

```typescript
'productizer.newProposal': string;
'productizer.recentProposals': string;
'productizer.advisorLabel': string;
'productizer.composerPlaceholder': string;
'productizer.tab.proposal': string;
'productizer.tab.directions': string;
'productizer.tab.context': string;
'productizer.tab.feedback': string;
'productizer.tab.handoff': string;
'productizer.readiness.exploring': string;
'productizer.readiness.inReview': string;
'productizer.readiness.handoffReady': string;
'productizer.direction.differentiation': string;
'productizer.direction.lockButton': string;
'productizer.direction.statusDraft': string;
'productizer.direction.statusLocked': string;
'productizer.direction.statusRejected': string;
'productizer.feedback.strengthWeak': string;
'productizer.feedback.strengthMedium': string;
'productizer.feedback.strengthConfirmed': string;
'productizer.feedback.emptyState': string;
'productizer.actionCard.confirmLock': string;
'productizer.actionCard.confirmExport': string;
'productizer.actionCard.confirmHandoff': string;
'productizer.actionCard.humanReviewRequired': string;
```

### 6.5 UI/CLI 双轨闭合表

每个新功能的 HTTP 端点 + Web UI + `od productizer` 子命令必须在同一 PR 落地：

| 功能 | HTTP 端点 | Web UI 入口 | CLI 子命令 |
|---|---|---|---|
| 新建提案 | `POST /api/productizer/projects` | 第一屏 Send 按钮 | `od productizer new` |
| 查看版本列表 | `GET /api/productizer/projects/:id/versions` | 版本下拉 | `od productizer versions list` |
| 查看方向列表 | `GET /api/productizer/projects/:id/directions` | Directions Tab | `od productizer directions list` |
| 查看上下文 | `GET /api/productizer/projects/:id/context` | Context Tab | `od productizer context list` |
| 添加反馈 | `POST /api/productizer/projects/:id/feedback` | Feedback Tab 表单 | `od productizer feedback add` |
| 查看反馈列表 | `GET /api/productizer/projects/:id/feedback` | Feedback Tab 列表 | `od productizer feedback list` |
| 确认 Action Card | `POST /api/productizer/projects/:id/action-cards/:id/confirm` | Action Card Confirm 按钮 | `od productizer action-cards confirm` |
| 查看 Handoff 状态 | `GET /api/productizer/projects/:id` (readiness) | Handoff Tab + ReadinessBadge | `od productizer handoff status` |
| 导出提案 | 同上 confirm，action = export_proposal | Handoff Tab 导出按钮（经 Action Card）| `od productizer handoff export` |

CLI 需支持 `--json` 输出和 `--prompt-file <path|->` 读取长提示。

---

## 7. 浏览器录制说明

### 7.1 验证状态

`[源码事实]` Phase C daemon-backed agent artifact acceptance has passed with the `gemini` adapter and evidence is recorded in `PHASE1_REVIEW.md`.

`[待验证]` 本次 UI/UXD review 未启动浏览器。以下项目仍需要在 Phase F UI 实现前后做截图/交互验证。

### 7.2 后续浏览器验证项目

1. **第一屏（通用 OD）** — 确认 `HomeView.tsx` 当前展示了哪些 plugin 卡片和通用起始提示
2. **通用工作区** — 确认 `FileWorkspace.tsx` 文件 tab 栏的默认渲染
3. **提案 artifact 渲染** — 验证 `LiveArtifactViewer` 是否正确加载 `toy-proposal-trade-desk` CSS tokens
4. **AskUserQuestionCard** — 验证选项按钮渲染、`onAnswerToolUse` 路由、reload 后 chip 持久化
5. **双 iframe 行为** — 验证 `FileViewer.tsx` 的 URL-load / srcDoc 切换逻辑（CSS visibility，不 unmount）

### 7.3 需验证的关键问题

- [ ] `LiveArtifactViewer` 是否带 `toy-proposal-trade-desk` tokens 渲染提案 HTML？
- [ ] `AskUserQuestionCard` 的 `onAnswerToolUse` 优先路由是否正常？
- [ ] `ChatComposer.tsx` 的文件附件逻辑是否支持图片上传（参考图）？
- [ ] `FileWorkspace.tsx` 的 tab 栏是否可接受 non-file tab id 注入（通过 prop）？

---

## 8. Phase E 通过前，哪些必须等待

### 8.1 Phase C 已通过，但 UI 仍需消费其验收事实

已验证事实：

1. `od run start` 已通过真实 agent run 生成 proposal artifact
2. 生成文件包括 `index.html`、`index.html.artifact.json`、`WORKING_CONTEXT.md`
3. `PHASE1_REVIEW.md` 已记录 forbidden claims 扫描、no-plush 约束、10 段 Proposal 结构、validation-only boundary
4. unsafe `IP Unique` 客户可见声明已通过后续 `gemini` patch run 修正为 `Reference Differentiation`

Phase F UI 仍必须消费这些事实，而不是重新定义 artifact 格式或边界声明。

### 8.2 Phase E 是门禁

五个 Tab 的数据全部来自 Phase E 路由，目前均不存在：

```
Directions Tab → GET /api/productizer/projects/:id/directions
Context Tab    → GET /api/productizer/projects/:id/context
Feedback Tab   → GET /api/productizer/projects/:id/feedback
Handoff Tab    → GET /api/productizer/projects/:id（readiness）
版本下拉       → GET /api/productizer/projects/:id/versions
```

`AGENTS.md` 还要求 UI 功能和 CLI 子命令必须在同一 PR 落地，Phase F UI 不能在 Phase E CLI 之前合并。

### 8.3 允许提前开始的有限工作（Phase B 静态检查通过后）

- CSS Module 骨架（无真实数据）
- TypeScript interface 定义（从 `packages/contracts` 预先定义类型）
- i18n key stubs（空字符串占位）
- 用 mock 数据的组件测试（放在 `apps/web/tests/components/productizer/`）

**限制**：这些文件不能从 `App.tsx` 或任何路由入口 import，直到 Phase E 的 HTTP + CLI 双轨闭合通过。

---

## 9. Phase F 裁决：HOLD

### 9.1 当前实现进度

| 阶段 | 状态 |
|---|---|
| Phase A 分支清理 + 架构修正 | ✅ 完成 |
| Phase B 静态验证（plugin/设计系统）| ✅ 本地存在 |
| Phase C 真实 agent run + 验收证据 | ✅ 完成（`PHASE1_REVIEW.md`） |
| Phase D 干净提交 | ✅ 完成（`d38bb90b`） |
| Phase E contracts 类型 | ❌ 未开始 |
| Phase E daemon 路由 + SQLite | ❌ 未开始 |
| Phase E CLI `od productizer` | ❌ 未开始 |

### 9.2 裁决

> **HOLD — Phase F 生产 UI 现在不能开始。**

**阻断条件：**

1. Phase E 未开始 — 五个 Tab 的所有 API 端点不存在
2. `packages/contracts` 类型未定义 — `ProductizerDirection`、`ProductizerFeedbackEvent`、`ProposalReadiness` 等类型不在 contracts 中，新组件无法 import
3. CLI 子命令未实现 — `SUBCOMMAND_MAP` 无 `productizer` 条目；Phase F UI 不能在 CLI 之前合并
4. 浏览器视觉验证尚未执行 — 可在 Phase E 后按 §7 截图验证

### 9.3 解锁 Phase F 的最小步骤

```
1. Phase B 静态检查通过（已完成）
2. Phase C: od run start → artifact 生成 → 全验收检查通过，证据写入 PHASE1_REVIEW.md（已完成）
3. Phase D: 干净提交推送（含 Phase C 证据）（已完成）
4. Phase E:
   a. packages/contracts/src/productizer/types.ts + api.ts
   b. apps/daemon/src/productizer-routes.ts + db.ts migrate()
   c. apps/daemon/src/cli.ts SUBCOMMAND_MAP 注册 productizer
   d. apps/daemon/tests/productizer-routes.test.ts
   e. apps/daemon/tests/cli-productizer.test.ts
   f. pnpm --filter @open-design/daemon typecheck 通过
5. Phase F: UI 实现（每个 capability 的 HTTP + UI + CLI 同一 PR 落地）
```

---

## 附录 A：文件地图

| 文件 | 状态 | Phase F 操作 |
|---|---|---|
| `apps/web/src/components/EntryShell.tsx` | 存在，通用 | 不修改；Shell 路由绕过 |
| `apps/web/src/components/EntryNavRail.tsx` | 存在，通用 | 不修改；Shell 路由不渲染 |
| `apps/web/src/components/HomeView.tsx` | 存在，通用 | 不修改；Shell 路由不渲染 |
| `apps/web/src/components/ChatPane.tsx` | 存在，复用 | 不修改 |
| `apps/web/src/components/ChatComposer.tsx` | 存在，复用 | 不修改 |
| `apps/web/src/components/FileWorkspace.tsx` | 存在，小改 | 增加 `productizer?: boolean` prop |
| `apps/web/src/components/FileViewer.tsx` | 存在，复用 | 不修改；双 iframe 机制原样复用 |
| `apps/web/src/components/ToolCard.tsx` | 存在，复用 | 不修改；wiring 在 `ProjectView.tsx` 层 |
| `apps/web/src/components/HandoffButton.tsx` | 存在，复用 | 基础复用，不修改 |
| `apps/web/src/index.css` | 存在 | **不加新 selector** |
| `apps/web/src/i18n/types.ts` | 存在，扩展 | 添加 `productizer.*` 键 |
| `apps/web/src/components/productizer/` | 不存在 | 创建所有 Phase F 新组件 |
| `apps/web/tests/components/productizer/` | 不存在 | 创建所有 Phase F 测试 |
| `packages/contracts/src/productizer/` | 不存在 | Phase E 创建类型 |
| `apps/daemon/src/productizer-routes.ts` | 不存在 | Phase E 创建 |
| `design-systems/toy-proposal-trade-desk/DESIGN.md` | ✅ 存在 | 提案 artifact 设计合同 |

---

## 附录 B：Design Token 快速参考（Phase F Shell 组件）

Phase F **shell 组件**（非 artifact 内容）使用 OD 标准 token（`styles/tokens.css`）：

```css
var(--blue)        /* #2348b8 — locked direction, in_review badge, medium feedback */
var(--green)       /* #1f7a3a — handoff_ready badge, confirmed feedback */
var(--amber)       /* #b26200 — weak feedback dot */
var(--text-muted)  /* #74716b — exploring badge, muted text */
var(--border)      /* #e1e5eb — default card border */
var(--bg-subtle)   /* #f4f5f7 — card hover background */
var(--shadow-md)   /* card shadow */
```

提案 artifact 内部（HTML 输出）使用 `toy-proposal-trade-desk/DESIGN.md` 的 `--accent: #2157A8` 等专属 token，由设计系统控制，**不在 shell 组件中引用**。

---

## 附录 C：项目规则合规说明

> 本附录汇总本文档交互设计决策所依据的 `AGENTS.md` 规则。

### C.1 须在同一 PR 落地的三步闭合（最重要）

> *"Adding a new capability is a three-step closure: HTTP endpoint... UI surface... and `od <capability>` subcommand... Land all three in the same PR."*

落地方式见 §6.5 双轨闭合表。Phase F 每个 PR 的 Surface area checklist 必须同时勾选 UI 和 CLI。

### C.2 CSS 所有权

> *"New component-owned UI styles should default to CSS Modules next to the component."*
> *"`apps/web/src/index.css` is an import-only cascade entrypoint. Do not add selectors or declarations there."*
> *"Do not add new raw primitive classes such as `primary`, `primary-ghost`, `ghost`, `subtle`, `icon-btn`, or `sr-only` for new UI."*

- 所有新组件样式：collocated CSS Module
- `index.css`：只做 import，不加 selector
- `primitives.css`：不加新全局类名

### C.3 组件复用

> *"New `apps/web` UI should reuse shared primitives from `@open-design/components` when one exists."*

- 所有按钮用 `Button`（`@open-design/components`）
- 屏幕阅读器文字用 `VisuallyHidden`（`@open-design/components`）

### C.4 动画规则

> *"Default ease-out: `cubic-bezier(0.23, 1, 0.32, 1)`. Enter ~200ms, exit ~140ms."*
> *"Accordion expand and collapse uses `grid-template-rows: 0fr → 1fr`. The shared `.accordion-collapsible` + `.accordion-collapsible-inner` class pair is the canonical implementation; reuse it."*
> *"Never animate from `transform: scale(0)`. Start from `scale(0.9)` or higher with `opacity: 0`."*
> *"For elements that show conditionally, keep them mounted and toggle a CSS class."*

- 新组件进入动画：200ms，`cubic-bezier(0.23,1,0.32,1)`，从 `scale(0.96)` 开始
- 折叠/展开：复用 `.accordion-collapsible` 类，不另写 grid 动画
- 条件显示：挂载保持，CSS class 切换（五个 Tab 内容、提案版本 chip、空状态文字均不 unmount）
- 必须加 `@media (prefers-reduced-motion: reduce)` 关闭动画

### C.5 FileViewer 双 iframe

> *"Host keeps both iframes mounted simultaneously and swaps CSS visibility. Bridges can ONLY inject through the srcDoc path."*

`FileViewer.tsx` 双 iframe 机制不因 Productizer 修改。当前提案渲染无桥接需求，使用 URL-load 模式。若未来需要 palette/edit 桥接，须走 srcDoc 路径（提前记录，防止误做）。

### C.6 AskUserQuestion 状态路由

> *"`AskUserQuestionCard` prefers the live `onAnswerToolUse` route... and falls back to `onSubmitForm` when the run has already terminated."*

Productizer Action Card 复用 `AskUserQuestionCard` 渲染，但 `onAnswerToolUse` 指向 Productizer 专属端点（`/api/productizer/.../action-cards/:id/confirm`），不指向 `/api/runs/:id/tool-result`。路由分支在 `ProjectView.tsx` wiring 层处理，`ToolCard.tsx` 不改动。

### C.7 跨应用边界

> *"`apps/web/**` must not import `apps/daemon/src/**`."*
> *"Keep shared API DTOs... in `packages/contracts`."*

所有 Productizer 类型从 `@open-design/contracts/productizer` 读取。新组件不直接 import daemon src。

### C.8 测试目录

> *"Tests under `apps/`... live in a package/app/tool-level `tests/` directory sibling to `src/`. Do not add new `*.test.ts` or `*.test.tsx` files under `src/`."*

Phase F 测试放在 `apps/web/tests/components/productizer/`，不放在 `src/`。

### C.9 i18n

> *"Every key must be defined in all 18 locale files. Add the key to `types.ts` first; missing translations produce a typecheck error."*

新 key 先加 `types.ts`，再在所有 18 个 locale 文件中填充翻译。见 §6.4。
