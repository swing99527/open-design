# Toy Productizer Open Design Branch Handoff

> 文档类型: Engineering / Product Handoff
> 状态: draft for copy into Open Design branch
> 最后更新: 2026-06-08
> 源项目: `/Users/chenshangwei/code/toyDesignAgent`
> 目标项目: `/Users/chenshangwei/code/open-design`
> 建议目标分支: `productizer/toy-productizer-studio`
> 建议复制目标: `docs/toy-productizer/BRANCH_BRIEF.md`

---

## 1. Goal

在 Open Design 上拉一个收敛分支，把通用 Open Design Studio 做减法，先跑通 Toy Productizer 的一条主路径:

```text
buyer brief / existing product / reference image
  -> Productizer Advisor understands context
  -> 2-4 non-copy creative product directions
  -> Chinese or English customer Proposal Artifact
  -> chat-based revisions
  -> versioned artifact updates
  -> manual buyer/team feedback
  -> evidence / handoff review
```

第一版目标不是完整改造 Open Design，也不是做通用玩具设计工具。第一版只验证:

> Open Design 的 Project / Plugin / Skill / Artifact / CLI Agent Runtime / Design System Template 体系，能否承载 Toy Productizer Studio。

---

## 2. Product Position

Toy Productizer 的当前定义:

> Chat-driven, artifact-backed Productization Workspace powered by a Creative Productization Agent.

用户感知:

> 我在和一位专业玩具产品经理 / 提案设计师聊天；他理解客户需求，快速整理新品方向，并在旁边生成可持续修改的客户提案。

系统内部事实来源:

```text
Productizer Project
  + Working Context
  + Creative Directions
  + Proposal Artifact
  + Proposal Versions
  + Feedback Ledger
  + Evidence / Handoff
  + Action Cards
```

聊天不是事实来源。聊天只是驾驶入口。

V0 首发 wedge:

> 已有产品或客户参考图 -> 3 个非照抄产品改造方向 -> 一份可发老客户的中文或英文 Proposal -> 手动记录买家反馈和交接证据。

不要把产品改名成 `Toy Design`。`Toy Design` 太宽，会把范围拉回 AI 设计/图片生成工具。分支和 UI 可使用 `Toy Productizer Studio`。

---

## 3. Why Open Design

Open Design 最值得复用的不是完整 UI，而是这些核心抽象:

| Open Design 能力 | 对 Toy Productizer 的价值 |
|---|---|
| Project | 承载一次客户 brief / 产品方向 / proposal / feedback 的业务边界 |
| Plugin / Skill | 把 Toy Productizer 的垂直能力打包成可执行 agent contract |
| Artifact | 承载客户可读 Proposal，不让价值留在 chat transcript 里 |
| Design System | 把 Proposal 结构、语言、边界和呈现规范固化为可复用 contract |
| CLI Agent Runtime | 调用 Codex / Claude / Gemini 等 CLI，不绑定单一模型或 SDK |
| Local-first daemon + files | 让项目文件、产物、模板和运行记录可检查、可版本化 |

Open Design 号称 Claude Design 的开源替代，其核心不是「画布」，而是:

```text
brief
  -> bind plugin / skill / design system
  -> run local CLI agent
  -> stream artifact
  -> critique / revise
  -> export / handoff
```

Toy Productizer 应复用这个理念，但把输出从泛 prototype / deck / image 收敛成:

```text
Customer Proposal Artifact
Creative Direction Comparison
Working Context Summary
Feedback / Handoff Evidence
```

---

## 4. Architecture Split

### Open Design Owns

- Project shell and project files.
- Plugin / Skill discovery and execution.
- CLI agent invocation, including Codex and other local CLIs.
- Artifact rendering, saving, preview, export surfaces.
- Design system loading.
- Local daemon, SQLite, file storage, and run logs.

### Toy Productizer Owns

- Productization business rules.
- Working Context structure.
- Creative Direction quality rules.
- Proposal Artifact schema and bilingual requirements.
- Feedback credibility tiers.
- Evidence / Handoff readiness rules.
- Action Card policy for human-confirmed decisions.
- Boundary language: no supplier-ready, quotation-ready, production-ready, final design, or infringement-safe claims.

### CLI Agent Role

CLI agents provide constrained judgment and generation. They do not own business state.

```text
Open Design runtime executes agent
Toy Productizer plugin constrains task and output
Productizer records authoritative project state
User confirms high-risk actions through Action Cards
```

---

## 5. First Version Scope

### Keep

| Keep | Reason |
|---|---|
| Project | Natural unit for each productization task |
| Artifact workspace | Main visible value is Proposal, not chat |
| CLI agent runtime | Codex and other CLI adapters are core leverage |
| Plugin / Skill mechanism | Encapsulates Toy Productizer as a vertical capability |
| One Toy Proposal design system | Constrains proposal structure and customer-visible language |
| Minimal version history | User must see proposal changes are durable |
| Minimal Action Cards | Only real decisions and high-risk handoffs need confirmation |

### Hide Or Defer

| Hide / Defer | Reason |
|---|---|
| Community / marketplace | Distracts from V0 task |
| Generic plugin browser | First version should default to Toy Productizer plugin |
| Large design system catalog | One proposal system is enough |
| Automation center | Later, after the manual proposal path works |
| Broad connector marketplace | V0 only needs manual input, upload, link, and later read-only sources |
| Multi-agent switching UI | Runtime can support it, but user should see one advisor |
| Video / image / deck / prototype modes | Do not make Toy Productizer look like a generic creator tool |
| Supplier RFQ / quote / sample workflow | Productizer only prepares evidence / handoff, not closure |

Principle:

> Reduce UI surface, not architecture primitives.

---

## 6. Suggested Target File Map In Open Design

Create these first:

```text
docs/toy-productizer/BRANCH_BRIEF.md
plugins/_official/scenarios/toy-productizer/SKILL.md
plugins/_official/scenarios/toy-productizer/open-design.json
plugins/_official/scenarios/toy-productizer/README.md
plugins/_official/scenarios/toy-productizer/examples/robot-museum-keychain/brief.zh.md
plugins/_official/scenarios/toy-productizer/examples/robot-museum-keychain/expected.zh.md
plugins/_official/scenarios/toy-productizer/examples/english-buyer-brief/brief.en.md
plugins/_official/scenarios/toy-productizer/examples/english-buyer-brief/expected.en.md
plugins/_official/scenarios/toy-productizer/evals/evals.json
plugins/_official/scenarios/toy-productizer/evals/trigger-queries.json
design-systems/toy-proposal-trade-desk/DESIGN.md
```

Only after the plugin and examples are stable, inspect Open Design's current entry / Studio routing and make the smallest UI change needed to expose:

```text
Toy Productizer Studio
  -> large first-run composer
  -> fixed toy-productizer plugin
  -> proposal artifact workspace
```

Do not start by refactoring Open Design navigation or removing features from the codebase. Hide or bypass them for this branch.

---

## 7. Plugin Contract

### `open-design.json` Direction

Use this as the starting shape, then adapt to the current Open Design schema if needed:

```json
{
  "$schema": "https://open-design.ai/schemas/plugin.v1.json",
  "specVersion": "1.0.0",
  "name": "toy-productizer",
  "title": "Toy Productizer",
  "version": "0.1.0",
  "description": "Turn toy buyer briefs, existing products, and references into non-copy creative product directions and a customer proposal.",
  "license": "MIT",
  "tags": ["create", "product", "proposal", "toy"],
  "compat": {
    "agentSkills": [{ "path": "./SKILL.md" }]
  },
  "od": {
    "kind": "skill",
    "taskKind": "new-generation",
    "mode": "live-artifact",
    "scenario": "product",
    "useCase": {
      "query": "Turn this toy buyer brief, existing product, or reference into creative product directions and a customer proposal: {{brief}}"
    },
    "pipeline": {
      "stages": [
        { "id": "context", "atoms": ["discovery-question-form"] },
        { "id": "directions", "atoms": ["direction-picker"] },
        { "id": "proposal", "atoms": ["file-write", "live-artifact"] },
        { "id": "critique", "atoms": ["critique-theater"], "repeat": true, "until": "critique.score>=4 || iterations>=2" },
        { "id": "handoff", "atoms": ["handoff"] }
      ]
    },
    "inputs": [
      { "name": "brief", "type": "string", "required": true },
      { "name": "proposal_language", "type": "string", "required": false },
      { "name": "target_channel", "type": "string", "required": false },
      { "name": "target_price", "type": "string", "required": false }
    ],
    "capabilities": ["prompt:inject", "fs:read", "fs:write"]
  }
}
```

If a listed atom does not exist in the current Open Design build, do not invent broad runtime work. Replace it with the nearest existing first-party atom, or keep the pipeline simpler for V0.

### `SKILL.md` Requirements

The skill must instruct the agent to:

1. Accept messy business input: buyer brief, existing product, reference image, competitor link, market signal, or one-sentence product goal.
2. Build a Working Context with facts, hard constraints, soft preferences, assumptions, evidence, risks, missing info, and conflicts.
3. Ask only 1-3 focused questions when the answer materially changes product direction, risk, cost, customer claim, or language.
4. Generate 2-4 Creative Directions.
5. Avoid fixed category drift. If the input is robot blind box or robot keychain, do not output plush unless user asks for plush.
6. Produce a Chinese, English, or bilingual Proposal Artifact according to user/customer context.
7. Support language switching as a patch to the same proposal, not a context reset.
8. Keep validation-only boundaries visible.
9. Never claim AI output is supplier-ready, quotation-ready, production-ready, final design, or infringement-safe.
10. Use Action Cards only for locking direction, sharing/exporting, recording feedback that changes readiness, and handoff state changes.

---

## 8. Toy Proposal Design System

Create `design-systems/toy-proposal-trade-desk/DESIGN.md`.

This is not a visual theme catalog. It is a proposal output contract.

It should define:

- Proposal structure.
- Chinese / English / bilingual tone.
- Customer-visible vs internal-only content.
- Direction comparison format.
- SKU / lineup format.
- CMF / packaging language.
- Commercial assumption labels.
- Feedback question limits.
- Validation-only boundary labels.
- Forbidden claims.

Required Proposal sections:

```text
1. Customer / task recap
2. Creative direction comparison
3. Recommended direction and rationale
4. Product story
5. SKU / lineup
6. CMF / packaging direction
7. Customer-facing selling points
8. Commercial assumptions with unconfirmed labels
9. Feedback questions
10. Validation-only boundary
```

Default boundary label:

```text
AI draft. For market validation only. Requires human review before sample, quotation, public listing, or production. Similarity risk screen only, not legal clearance.
```

---

## 9. First-Run Interaction

The first screen should not look like Open Design's full generic workspace.

Default first-run surface:

```text
Top Bar
Centered large composer
Small example prompts
No right workspace until first artifact exists
```

Composer placeholder:

```text
粘贴客户需求、描述现有产品，或上传参考图。我会帮你整理新品方向和客户提案。
```

English placeholder:

```text
Paste a buyer brief, describe an existing toy, or upload references. I will turn it into product directions and a customer proposal.
```

After first Proposal:

```text
Sidebar: projects / recent / search
Middle: Advisor conversation
Right: Proposal workspace
Tabs: Proposal / Directions / Context / Feedback / Handoff
```

Advisor behavior:

- Explain product judgment.
- Mention assumptions and risks when relevant.
- Do not narrate internal steps like "Analyze Signal -> Generate Pack -> Render Proposal".
- Do not expose Pack / Ledger / Readiness as default primary UI.

---

## 10. Action Card Policy

No Action Card for internal generation steps.

Action Cards are required for:

- selecting or locking a product direction,
- sharing / exporting customer-visible proposal,
- recording confirmed buyer feedback that changes maturity,
- marking handoff ready for sample review,
- marking handoff ready for quote review,
- any external, costed, customer-facing, supplier-facing, RFQ, sample, quote, or production action.

Example:

```text
Action Card: Lock Direction
Direction: Retro Science Robot Keychain Series
Why: matches museum gift shop, price cap, lower similarity risk
Risk: target retail under $15 still depends on material, size, and packaging

[Confirm] [Revise] [Dismiss]
```

---

## 11. Acceptance Fixtures

### Fixture A: Chinese Robot Museum Gift

Input:

```text
我们有一款普通机器人钥匙扣，老客户发来一张复古航天机器人参考图，想做博物馆礼品店可卖的新品，零售价 15 美元以内，但不要太像原图。不要毛绒。
```

Expected:

- Output language is Chinese unless user asks otherwise.
- Generates 2-4 directions.
- Does not output plush.
- Includes museum gift shop fit.
- Includes target retail under USD 15 as unconfirmed commercial assumption.
- Includes non-copy differentiation from reference.
- Produces customer-readable Proposal Artifact.
- Includes 3-5 customer feedback questions.
- Includes validation-only boundary.

### Fixture B: English Buyer Brief

Input:

```text
A US museum buyer wants a retro space robot collectible for the gift shop. It should feel educational, be easy to display near the checkout counter, and stay under a $15 retail price. Please avoid copying the reference robot silhouette.
```

Expected:

- Output language is English.
- Generates a customer proposal, not an internal-only analysis.
- Recommends one direction with rationale.
- Includes SKU or lineup logic.
- Includes assumptions and missing information.
- Includes validation-only boundary.

### Fixture C: Category Constraint

Input:

```text
不要毛绒，改成机器人手办。适合博物馆礼品店。
```

Expected:

- Existing proposal is patched, not regenerated from scratch.
- Hard constraint "no plush" is preserved.
- Proposal version history records changed sections.

### Fixture D: Feedback Credibility

Input:

```text
销售说客户觉得 interesting，但没有问价格、数量、样品或时间。
```

Expected:

- Feedback can be recorded.
- Feedback strength is low.
- System must not advance to validated_interest or handoff-ready.

### Fixture E: Forbidden Claims

Scan generated customer-visible proposal for these forbidden phrases:

```text
supplier-ready
quotation-ready
production-ready
final design
infringement-safe
无侵权
可直接量产
正式报价
```

Expected:

- No forbidden promise appears.
- If any risky phrase is needed for explanation, it must appear only as a warning or forbidden example, not as a claim.

---

## 12. Product Doc Bundle To Copy

The branch brief is not enough for implementation agents. It explains the Open Design adaptation, but it is not the full product source of truth.

Do not move the original Toy Productizer docs out of `toyDesignAgent`. Copy a dated snapshot into the Open Design branch so implementation agents can work locally and cite the product requirements without depending on another repository.

Recommended target structure in Open Design:

```text
docs/toy-productizer/
  README.md
  BRANCH_BRIEF.md
  product/
    TOY_MARKET_PRODUCTIZER_MRD.md
    TOY_MARKET_PRODUCTIZER_PRD.md
    TOY_PRODUCTIZER_INTERACTION_SPEC.md
    TOY_COMMERCIALIZATION_PACK_SPEC.md
    TOY_MARKET_VALIDATION_PLAYBOOK.md
    TOY_PRODUCTIZER_AGENT_SYSTEM_DESIGN.md
    TOY_PRODUCTIZER_OPEN_SYSTEM_MODEL.md
    TOY_PRODUCTIZER_POSITIONING_BRIEF.md
```

Minimum required copy set:

| Source doc | Why it must travel with the Open Design branch |
|---|---|
| `TOY_MARKET_PRODUCTIZER_MRD.md` | user, market, wedge, demand strength, non-goals |
| `TOY_MARKET_PRODUCTIZER_PRD.md` | core product objects, MVP path, functional requirements |
| `TOY_PRODUCTIZER_INTERACTION_SPEC.md` | chat + proposal artifact interaction model |
| `TOY_COMMERCIALIZATION_PACK_SPEC.md` | internal business aggregate and proposal artifact contract |
| `TOY_MARKET_VALIDATION_PLAYBOOK.md` | feedback credibility, validation asset, handoff rules |

Strongly recommended copy set:

| Source doc | Why it helps |
|---|---|
| `TOY_PRODUCTIZER_AGENT_SYSTEM_DESIGN.md` | agent definition, context/tools/artifact responsibilities |
| `TOY_PRODUCTIZER_OPEN_SYSTEM_MODEL.md` | external input and system-boundary model |
| `TOY_PRODUCTIZER_POSITIONING_BRIEF.md` | concise positioning and narrative reference |

Use this copy command after creating `docs/toy-productizer/product/` in Open Design:

```bash
cp /Users/chenshangwei/code/toyDesignAgent/docs/00-product-planning/TOY_MARKET_PRODUCTIZER_MRD.md \
  /Users/chenshangwei/code/open-design/docs/toy-productizer/product/
cp /Users/chenshangwei/code/toyDesignAgent/docs/00-product-planning/TOY_MARKET_PRODUCTIZER_PRD.md \
  /Users/chenshangwei/code/open-design/docs/toy-productizer/product/
cp /Users/chenshangwei/code/toyDesignAgent/docs/01-product/TOY_PRODUCTIZER_INTERACTION_SPEC.md \
  /Users/chenshangwei/code/open-design/docs/toy-productizer/product/
cp /Users/chenshangwei/code/toyDesignAgent/docs/01-product/TOY_COMMERCIALIZATION_PACK_SPEC.md \
  /Users/chenshangwei/code/open-design/docs/toy-productizer/product/
cp /Users/chenshangwei/code/toyDesignAgent/docs/01-product/TOY_MARKET_VALIDATION_PLAYBOOK.md \
  /Users/chenshangwei/code/open-design/docs/toy-productizer/product/
cp /Users/chenshangwei/code/toyDesignAgent/docs/00-product-planning/TOY_PRODUCTIZER_AGENT_SYSTEM_DESIGN.md \
  /Users/chenshangwei/code/open-design/docs/toy-productizer/product/
cp /Users/chenshangwei/code/toyDesignAgent/docs/00-product-planning/TOY_PRODUCTIZER_OPEN_SYSTEM_MODEL.md \
  /Users/chenshangwei/code/open-design/docs/toy-productizer/product/
cp /Users/chenshangwei/code/toyDesignAgent/docs/00-product-planning/TOY_PRODUCTIZER_POSITIONING_BRIEF.md \
  /Users/chenshangwei/code/open-design/docs/toy-productizer/product/
```

Then create a short Open Design-local doc index:

```text
docs/toy-productizer/README.md
```

Suggested contents:

```markdown
# Toy Productizer Docs

This folder is a product-definition snapshot copied from `/Users/chenshangwei/code/toyDesignAgent`.

Use `BRANCH_BRIEF.md` for the Open Design adaptation scope.
Use `product/TOY_MARKET_PRODUCTIZER_MRD.md` and `product/TOY_MARKET_PRODUCTIZER_PRD.md` for product source of truth.
Use `product/TOY_PRODUCTIZER_INTERACTION_SPEC.md` for the first-run and chat/artifact interaction model.
Use `product/TOY_COMMERCIALIZATION_PACK_SPEC.md` and `product/TOY_MARKET_VALIDATION_PLAYBOOK.md` for business objects, feedback, and handoff boundaries.

Do not treat these copied docs as a replacement for the upstream product-definition repository unless the team explicitly changes the source-of-truth process.
```

Commit the doc snapshot separately before plugin or UI work:

```bash
git add docs/toy-productizer
git commit -m "docs: add Toy Productizer product definition snapshot"
```

---

## 13. Implementation Sequence

### Step 1: Branch

```bash
cd /Users/chenshangwei/code/open-design
git switch main
git pull --ff-only
git switch -c productizer/toy-productizer-studio
```

### Step 2: Copy this handoff and product doc bundle

Create:

```text
docs/toy-productizer/BRANCH_BRIEF.md
docs/toy-productizer/product/
```

Copy this document into `BRANCH_BRIEF.md`, then copy the product doc bundle from section 12.

Commit:

```bash
git add docs/toy-productizer
git commit -m "docs: add Toy Productizer branch brief and product snapshot"
```

### Step 3: Add plugin skeleton

Create the plugin files listed in section 6.

Commit:

```bash
git add plugins/_official/scenarios/toy-productizer
git commit -m "feat: add Toy Productizer plugin skeleton"
```

### Step 4: Add proposal design system

Create:

```text
design-systems/toy-proposal-trade-desk/DESIGN.md
```

Commit:

```bash
git add design-systems/toy-proposal-trade-desk
git commit -m "feat: add Toy Proposal design system"
```

### Step 5: Wire default entry

Inspect current Open Design Home / Studio entry points first. Prefer config or registry changes over broad React rewrites.

Goal:

```text
Toy Productizer Studio opens with toy-productizer plugin and toy-proposal-trade-desk design system preselected.
```

Commit:

```bash
git add <changed-entry-files>
git commit -m "feat: add Toy Productizer studio entry"
```

### Step 6: Add evals / fixtures

Add fixture files and plugin evals for section 11.

Run the closest available checks:

```bash
pnpm guard
pnpm --filter @open-design/plugin-runtime typecheck
od plugin validate ./plugins/_official/scenarios/toy-productizer
```

If `od plugin validate` is not available in the local checkout, record that as a verification gap and run the available JSON/type checks.

---

## 14. Non-Goals

Do not implement in first version:

- full CRM,
- supplier outreach,
- RFQ automation,
- formal quote generation,
- sample request automation,
- legal/IP clearance,
- production feasibility guarantee,
- marketplace publishing,
- broad connector automation,
- dashboard analytics,
- general toy image generator.

Toy Productizer can prepare evidence for sample or quote review. It must not decide that sample or quote is complete.

---

## 15. Handoff Checklist

Before handing the Open Design branch back:

- [ ] Branch is based on current `main`.
- [ ] `docs/toy-productizer/BRANCH_BRIEF.md` exists.
- [ ] `docs/toy-productizer/product/` includes MRD, PRD, interaction spec, pack spec, and validation playbook.
- [ ] Toy Productizer plugin exists and has `SKILL.md`.
- [ ] Plugin manifest is valid JSON.
- [ ] Toy Proposal design system exists.
- [ ] First-run entry defaults to Toy Productizer, not generic Open Design marketplace.
- [ ] Proposal artifact can be generated from a Chinese brief.
- [ ] Proposal artifact can be generated from an English brief.
- [ ] "No plush" and similar hard constraints are honored.
- [ ] Forbidden promise phrases do not appear as customer-visible claims.
- [ ] Feedback does not advance readiness without credible buyer evidence.
- [ ] Any verification gaps are written in the handoff notes.

---

## 16. Reference Source Docs In Toy Productizer

Use these as source of truth when the Open Design branch needs product clarification:

```text
/Users/chenshangwei/code/toyDesignAgent/docs/00-product-planning/TOY_MARKET_PRODUCTIZER_MRD.md
/Users/chenshangwei/code/toyDesignAgent/docs/00-product-planning/TOY_MARKET_PRODUCTIZER_PRD.md
/Users/chenshangwei/code/toyDesignAgent/docs/01-product/TOY_PRODUCTIZER_INTERACTION_SPEC.md
/Users/chenshangwei/code/toyDesignAgent/docs/01-product/TOY_COMMERCIALIZATION_PACK_SPEC.md
/Users/chenshangwei/code/toyDesignAgent/docs/01-product/TOY_MARKET_VALIDATION_PLAYBOOK.md
```

Core rule when documents conflict:

> Proposal-first user experience wins over internal procedure visibility, but Productizer business records and Action Card gates remain the source of truth.
