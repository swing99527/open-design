# Toy Productizer Studio Phase 1 Work Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the smallest useful Open Design adaptation for Toy Productizer Studio and prove that the plugin, proposal design system, fixtures, and launch path work together.

**Architecture:** Keep Phase 1 content-first. Open Design remains the local-first runtime, plugin, artifact, design-system, and CLI-agent substrate. Toy Productizer Studio is expressed as a first-party scenario plugin plus a proposal output contract; UI entry work is deferred until the daemon-backed plugin smoke passes.

**Tech Stack:** Open Design plugin manifest v1, portable `SKILL.md`, `DESIGN.md` design system, JSON eval fixtures, Node `~24`, `pnpm@10.33.2`, daemon `od` CLI.

---

## Scope Boundary

Do not expand Phase 1 into:

- broad navigation refactor
- generic toy design app
- Toy Design rename
- CRM
- RFQ or supplier outreach
- formal quote generation
- sample automation
- legal/IP clearance
- production feasibility guarantee
- marketplace publishing
- dashboard analytics
- general toy image generation

Phase 1 is complete only when the existing Open Design primitives can carry the first Toy Productizer Studio path:

```text
buyer brief / existing product / reference image
  -> Productizer Advisor context
  -> 2-4 non-copy creative product directions
  -> customer-readable Proposal Artifact
  -> revision / feedback / handoff boundary
```

## Parallelization Map

### Must Stay Sequential

1. Environment and dependency readiness must happen before any dependency-backed validation.
2. Plugin validation must pass before daemon-backed launch smoke.
3. Daemon-backed launch smoke must pass before any UI entry change.
4. UI entry change, if taken, must be verified after web typecheck and local browser smoke.

### Can Run In Parallel

These tasks can be split across agents once the repo state is stable:

| Parallel Track | Owner Scope | Can Run Before Dependencies? | Notes |
|---|---|---:|---|
| A. Product boundary audit | docs, SKILL, design-system language | Yes | Read-only or small content fixes only |
| B. Manifest/eval structure audit | `open-design.json`, `evals/*.json` | Yes | Static Node checks are enough initially |
| C. Fixture quality audit | example briefs and expected outputs | Yes | Check no-plush, non-copy, language, forbidden claims |
| D. Dependency-backed validation | `pnpm` checks, daemon build, plugin validate | No | Requires Node 24 and installed deps |
| E. Headless launch smoke | daemon project/run path | No | Requires D to pass |
| F. UI entry assessment | current Studio routing and minimal entry option | Only after E | Assessment can start earlier, implementation must wait |

Recommended parallel dispatch after dependencies are restored:

- Agent 1: Run dependency-backed validation and report exact failures.
- Agent 2: Audit fixtures and evals for product acceptance coverage.
- Agent 3: Inspect current Studio/plugin selection path and propose the smallest UI entry only if launch smoke passes.

## Task 1: Product Boundary Lock

**Goal:** Prove the implementation still matches Toy Productizer Studio and has not drifted into a generic app.

**Files:**

- Read: `docs/toy-productizer/BRANCH_BRIEF.md`
- Read: `docs/toy-productizer/product/TOY_MARKET_PRODUCTIZER_MRD.md`
- Read: `docs/toy-productizer/product/TOY_MARKET_PRODUCTIZER_PRD.md`
- Read: `docs/toy-productizer/product/TOY_PRODUCTIZER_INTERACTION_SPEC.md`
- Read: `docs/toy-productizer/product/TOY_COMMERCIALIZATION_PACK_SPEC.md`
- Read: `docs/toy-productizer/product/TOY_MARKET_VALIDATION_PLAYBOOK.md`
- Read: `plugins/_official/scenarios/toy-productizer/SKILL.md`
- Read: `design-systems/toy-proposal-trade-desk/DESIGN.md`

- [ ] **Step 1: Search for scope drift terms**

Run:

```bash
rg -n "Toy Design|CRM|RFQ|supplier outreach|quotation-ready|production-ready|final design|infringement-safe|无侵权|可直接量产|正式报价" \
  docs/toy-productizer \
  plugins/_official/scenarios/toy-productizer \
  design-systems/toy-proposal-trade-desk
```

Expected:

- `Toy Design` appears only as a prohibited rename.
- CRM/RFQ/supplier terms appear only as deferred or forbidden scope.
- forbidden claims appear only in boundary, anti-pattern, or eval forbidden-term sections.

- [ ] **Step 2: Verify Productizer/Open Design ownership split**

Check that the docs and plugin preserve:

```text
Open Design generates/renders artifacts.
Toy Productizer owns business state, feedback credibility, readiness, and approval gates.
```

Expected:

- No text says Open Design owns formal quote, sample, supplier, legal, or production decisions.

- [ ] **Step 3: Fix only boundary-language defects if found**

Allowed edits:

- `docs/toy-productizer/README.md`
- `plugins/_official/scenarios/toy-productizer/SKILL.md`
- `design-systems/toy-proposal-trade-desk/DESIGN.md`

Not allowed:

- app routing
- daemon logic
- broad UI changes

Acceptance:

- Product boundary remains explicit.
- No new Phase 1 scope is introduced.

## Task 2: Plugin Manifest And Eval Structure

**Goal:** Make the Toy Productizer plugin structurally valid against current Open Design plugin conventions before runtime validation.

**Files:**

- Modify if needed: `plugins/_official/scenarios/toy-productizer/open-design.json`
- Modify if needed: `plugins/_official/scenarios/toy-productizer/evals/evals.json`
- Modify if needed: `plugins/_official/scenarios/toy-productizer/evals/trigger-queries.json`

- [ ] **Step 1: Parse JSON**

Run:

```bash
node -e "const fs=require('fs'); for (const f of ['plugins/_official/scenarios/toy-productizer/open-design.json','plugins/_official/scenarios/toy-productizer/evals/evals.json','plugins/_official/scenarios/toy-productizer/evals/trigger-queries.json']) JSON.parse(fs.readFileSync(f,'utf8')); console.log('json ok')"
```

Expected:

```text
json ok
```

- [ ] **Step 2: Check manifest references**

Run:

```bash
node -e "const fs=require('fs'), path=require('path'); const manifestPath='plugins/_official/scenarios/toy-productizer/open-design.json'; const m=JSON.parse(fs.readFileSync(manifestPath,'utf8')); const base=path.dirname(manifestPath); for (const ref of m.compat.agentSkills) { const p=path.normalize(path.join(base, ref.path)); if (!fs.existsSync(p)) throw new Error('missing compat '+p); } for (const ref of m.od.context.skills) { const p=path.normalize(path.join(base, ref.path)); if (!fs.existsSync(p)) throw new Error('missing context skill '+p); } const ds=path.normalize(path.join(base,m.od.context.designSystem.path)); if (!fs.existsSync(ds)) throw new Error('missing '+ds); console.log('manifest references ok')"
```

Expected:

```text
manifest references ok
```

- [ ] **Step 3: Check pipeline atoms are Phase 1-safe**

Run:

```bash
rg -n '"handoff"|"patch-edit"|"diff-review"|"build-test"' plugins/_official/scenarios/toy-productizer/open-design.json
```

Expected:

- No output.

Reason:

- These atoms are planned/reserved in Open Design's plugin spec and should not be required for Phase 1.

- [ ] **Step 4: Check eval fields**

Run:

```bash
node -e "const fs=require('fs'); const e=JSON.parse(fs.readFileSync('plugins/_official/scenarios/toy-productizer/evals/evals.json','utf8')); for (const item of e.evals) { if (!item.id) throw new Error('missing id'); if (!item.prompt) throw new Error(item.id+' missing prompt'); if (!item.expected_output) throw new Error(item.id+' missing expected_output'); if (!Array.isArray(item.assertions) || item.assertions.length===0) throw new Error(item.id+' missing assertions'); } console.log('eval structure ok')"
```

Expected:

```text
eval structure ok
```

Acceptance:

- JSON parses.
- plugin references resolve.
- `compat.agentSkills` and `od.context.skills` both point to the plugin-local `SKILL.md`.
- no planned atoms are required.
- evals have `id`, `prompt`, `expected_output`, and `assertions`.

## Task 3: Proposal Design System Contract

**Goal:** Verify `Toy Proposal Trade Desk` is a proposal output contract and satisfies Open Design design-system structure.

**Files:**

- Modify if needed: `design-systems/toy-proposal-trade-desk/DESIGN.md`

- [ ] **Step 1: Verify 9-section schema and font labels**

Run:

```bash
node -e "const fs=require('fs'); const t=fs.readFileSync('design-systems/toy-proposal-trade-desk/DESIGN.md','utf8'); for (let i=1;i<=9;i++) if (!t.includes('## '+i+'.')) throw new Error('missing heading '+i); for (const label of ['Display:','Body:','Mono:']) if (!t.includes(label)) throw new Error('missing '+label); console.log('design system ok')"
```

Expected:

```text
design system ok
```

- [ ] **Step 2: Verify required proposal sections**

Run:

```bash
rg -n "Customer / task recap|Creative direction comparison|Recommended direction|Product story|SKU / lineup|CMF / packaging|Customer-facing selling points|Commercial assumptions|Feedback questions|Validation-only boundary" design-systems/toy-proposal-trade-desk/DESIGN.md
```

Expected:

- All required proposal sections are present.

- [ ] **Step 3: Verify forbidden claims are labeled as anti-patterns**

Run:

```bash
rg -n "supplier-ready|quotation-ready|production-ready|final design|infringement-safe|无侵权|可直接量产|正式报价" design-systems/toy-proposal-trade-desk/DESIGN.md
```

Expected:

- Hits occur under `## 9. Anti-patterns` or explicit forbidden-claim guidance only.

Acceptance:

- Design system remains a proposal contract, not a general theme catalog.
- It defines customer-visible vs internal-only content.
- It defines required proposal sections and boundary labels.

## Task 4: Fixture Quality And Safety Coverage

**Goal:** Ensure fixtures cover the exact acceptance cases and do not contain prohibited customer-visible claims.

**Files:**

- Modify if needed: `plugins/_official/scenarios/toy-productizer/examples/robot-museum-keychain/brief.zh.md`
- Modify if needed: `plugins/_official/scenarios/toy-productizer/examples/robot-museum-keychain/expected.zh.md`
- Modify if needed: `plugins/_official/scenarios/toy-productizer/examples/english-buyer-brief/brief.en.md`
- Modify if needed: `plugins/_official/scenarios/toy-productizer/examples/english-buyer-brief/expected.en.md`
- Modify if needed: `plugins/_official/scenarios/toy-productizer/evals/evals.json`

- [ ] **Step 1: Check fixture A acceptance coverage**

Run:

```bash
rg -n "不要毛绒|博物馆礼品店|USD 15|15 美元|未确认|反馈问题|AI draft|Similarity risk screen" plugins/_official/scenarios/toy-productizer/examples/robot-museum-keychain/expected.zh.md
```

Expected:

- Chinese expected output preserves no-plush.
- museum gift shop fit is explicit.
- under-USD-15 is labeled unconfirmed.
- feedback questions are present.
- validation-only boundary is present.

- [ ] **Step 2: Check fixture B acceptance coverage**

Run:

```bash
rg -n "Recommended direction|SKU|Unconfirmed|museum gift shop|checkout|reference silhouette|AI draft|Similarity risk screen" plugins/_official/scenarios/toy-productizer/examples/english-buyer-brief/expected.en.md
```

Expected:

- English expected output is a customer proposal.
- recommended direction and SKU/lineup logic are present.
- assumptions are unconfirmed.
- reference-copy risk is handled.
- validation-only boundary is present.

- [ ] **Step 3: Check forbidden customer-visible claims**

Run:

```bash
node -e "const fs=require('fs'); const files=['plugins/_official/scenarios/toy-productizer/examples/robot-museum-keychain/expected.zh.md','plugins/_official/scenarios/toy-productizer/examples/english-buyer-brief/expected.en.md']; const forbidden=['supplier-ready','quotation-ready','production-ready','final design','infringement-safe','无侵权','可直接量产','正式报价']; for (const f of files) { const t=fs.readFileSync(f,'utf8'); const hits=forbidden.filter(x=>t.includes(x)); if (hits.length) throw new Error(f+' forbidden '+hits.join(',')); } console.log('expected fixtures forbidden-claim check ok')"
```

Expected:

```text
expected fixtures forbidden-claim check ok
```

Acceptance:

- Fixture A/B cover happy paths.
- Fixture C covers patch continuity.
- Fixture D covers weak feedback not advancing readiness.
- Expected outputs contain no forbidden customer-visible claims.

## Task 5: Dependency-Backed Validation

**Goal:** Prove the content passes repository checks once the environment is correct.

**Files:**

- No source edits expected unless validation fails.

**Prerequisites:**

- Node `~24`
- workspace dependencies installed
- Open Design daemon dist build available after build

- [ ] **Step 1: Confirm runtime**

Run:

```bash
node --version
pnpm --version
```

Expected:

- Node version matches `~24`.
- pnpm version is `10.33.2` or compatible with repo constraints.

- [ ] **Step 2: Install dependencies if missing**

Run only if `node_modules` is absent or stale:

```bash
pnpm install
```

Expected:

- dependencies install without lockfile drift unless intentionally updated.

- [ ] **Step 3: Run guard**

Run:

```bash
pnpm guard
```

Expected:

- PASS.

- [ ] **Step 4: Run plugin-runtime typecheck**

Run:

```bash
pnpm --filter @open-design/plugin-runtime typecheck
```

Expected:

- PASS.

- [ ] **Step 5: Build daemon CLI**

Run:

```bash
pnpm --filter @open-design/daemon build
```

Expected:

- `apps/daemon/dist/cli.js` exists.

- [ ] **Step 6: Validate plugin folder**

Run:

```bash
node apps/daemon/bin/od.mjs plugin validate ./plugins/_official/scenarios/toy-productizer --no-daemon
```

Expected:

- PASS.
- No planned atom warning for the toy pipeline.

Acceptance:

- All commands pass, or every failure is mapped to a scoped follow-up with exact output.

## Task 6: Daemon-Backed Launch Smoke

**Goal:** Prove Toy Productizer Studio can launch through Open Design's project/plugin/run path.

**Files:**

- No source edits expected unless smoke reveals an implementation mismatch.

**Prerequisites:**

- Task 5 passes.
- local daemon is running.
- at least one agent adapter is available for Step 3.

- [ ] **Step 1: Start local runtime**

Run:

```bash
pnpm tools-dev run web --daemon-port 17456 --web-port 17573
```

Expected:

- daemon and web runtime start.
- daemon URL is available on the selected port.

- [ ] **Step 2: Create project with plugin and design system**

Run:

```bash
PID=$(node apps/daemon/bin/od.mjs project create \
  --name "Toy Productizer QA" \
  --plugin toy-productizer \
  --design-system toy-proposal-trade-desk \
  --inputs '{"prompt":"A US museum buyer wants a retro space robot collectible for the gift shop. It should feel educational, be easy to display near the checkout counter, and stay under a $15 retail price. Please avoid copying the reference robot silhouette.","proposalLanguage":"auto"}' \
  --json | jq -r '.project.id // .projectId')
echo "$PID"
```

Expected:

- A non-empty project id is printed.
- Project metadata includes the applied plugin snapshot.

- [ ] **Step 3: Run plugin**

Run:

```bash
node apps/daemon/bin/od.mjs run start \
  --daemon-url http://127.0.0.1:17456 \
  --project "$PID" \
  --plugin toy-productizer \
  --inputs '{"prompt":"A US museum buyer wants a retro space robot collectible for the gift shop. It should feel educational, be easy to display near the checkout counter, and stay under a $15 retail price. Please avoid copying the reference robot silhouette.","proposalLanguage":"auto"}' \
  --agent codex \
  --follow
```

If `codex` is unavailable, replace it with an available local adapter and record the adapter id.

Expected:

- Run starts.
- plugin snapshot is attached.
- generated content follows the proposal structure.
- output avoids forbidden customer-visible claims.

- [ ] **Step 4: Inspect generated artifact files**

Run:

```bash
node apps/daemon/bin/od.mjs project info "$PID" --json
```

Use the returned project cwd to inspect generated files.

Expected:

- Proposal artifact exists in project storage.
- Artifact includes customer proposal sections.
- Artifact preserves assumptions and validation boundary.

Acceptance:

- Toy Productizer plugin and Toy Proposal design system work together in a real daemon-backed project/run path.

## Task 7: Minimal UI Entry Decision

**Goal:** Decide whether a UI entry is necessary after the headless path is proven.

**Files:**

- Read first: current app entry and Studio routing files under `apps/web`
- Read first: `apps/AGENTS.md`
- Read first: `apps/web` local guidance if present

**Prerequisite:**

- Task 6 passes.

- [ ] **Step 1: Inspect current UI entry points**

Run:

```bash
rg -n "plugin|designSystem|new project|Studio|Home" apps/web/src apps/web/app apps/web -g '*.ts' -g '*.tsx'
```

Expected:

- Identify the smallest existing selection or project-create path.

- [ ] **Step 2: Decide implementation posture**

Choose one:

1. No UI change: existing plugin/design-system selection is enough for Phase 1.
2. Config/default-only change: preselect `toy-productizer` and `toy-proposal-trade-desk`.
3. Minimal visible entry: one branch-local entry point labeled `Toy Productizer Studio`.

Recommendation:

- Choose option 1 or 2 unless users cannot discover the path at all.

- [ ] **Step 3: If UI changes are made, run focused checks**

Run:

```bash
pnpm --filter @open-design/web typecheck
pnpm tools-dev run web --daemon-port 17456 --web-port 17573
```

Expected:

- typecheck passes.
- browser path shows the Toy Productizer entry without hiding unrelated Open Design primitives through destructive code changes.

Acceptance:

- UI entry, if added, is smaller than a navigation refactor.
- No root lifecycle scripts are added.
- No generic subsystem is deleted.

## Task 8: Final Acceptance Report

**Goal:** Produce a clear PASS/PARTIAL/FAIL handoff with evidence.

**Files:**

- Modify: `docs/toy-productizer/PHASE1_REVIEW.md` or create a follow-up report under `docs/toy-productizer/`

- [ ] **Step 1: Summarize changed files**

Include:

- plugin files
- design system
- docs
- any UI file if Task 7 added one

- [ ] **Step 2: Summarize verification**

Include exact command results for:

```bash
pnpm guard
pnpm --filter @open-design/plugin-runtime typecheck
pnpm --filter @open-design/daemon build
node apps/daemon/bin/od.mjs plugin validate ./plugins/_official/scenarios/toy-productizer
```

Include daemon-backed launch smoke evidence.

- [ ] **Step 3: State final status**

Use:

- `PASS`: all required checks and smoke pass.
- `PARTIAL`: content is correct but runtime validation is blocked or incomplete.
- `FAIL`: product boundary or runtime path is broken.

Acceptance:

- Status is evidence-backed.
- Any remaining risk has a scoped next action.

## Execution Recommendation

Run these in order:

1. Task 1, Task 2, Task 3, and Task 4 can run in parallel now.
2. Task 5 runs after Node 24 and dependencies are available.
3. Task 6 runs after Task 5 passes.
4. Task 7 runs only after Task 6 passes.
5. Task 8 closes the branch handoff.

Best parallel split:

- Worker A: Task 1 + Task 4 product/fixture audit.
- Worker B: Task 2 + Task 3 structural validation.
- Worker C: Task 5 dependency-backed validation once environment is ready.
- Worker D: Task 7 UI-entry assessment only after Worker C and Task 6 pass.

Do not dispatch multiple workers to edit the same files at the same time:

- `open-design.json`
- `evals.json`
- `DESIGN.md`
- `SKILL.md`

Those files are shared coordination points.
