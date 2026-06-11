# Toy Productizer Studio Phase 1 Review

> Review date: 2026-06-09
> Review posture: HOLD SCOPE
> Skills used: `gstack-plan-ceo-review`, `gstack-plan-eng-review`, `superpowers:writing-plans`

## Goal

Review whether the Phase 1 Open Design adaptation keeps Toy Productizer Studio within the intended product boundary and whether the implementation plan is executable and verifiable.

## Product Boundary Review

Verdict: PASS for scope discipline.

The current Phase 1 implementation keeps the product centered on Toy Productizer Studio:

- It preserves Open Design primitives: Project, Plugin / Skill, Artifact, Design System, CLI Agent Runtime, and local-first storage.
- It does not rename the product to Toy Design.
- It does not introduce CRM, RFQ automation, supplier outreach, formal quote generation, sample automation, legal/IP clearance, marketplace publishing, dashboard analytics, or general toy image generation.
- It keeps Proposal Artifact as the visible value surface and treats chat as the driving entry.
- It keeps validation-only boundary language explicit.

Important boundary to preserve in later phases:

```text
Open Design generates and renders artifacts.
Toy Productizer owns business state, feedback credibility, readiness, and human approval gates.
```

## Engineering Review

Verdict: PARTIAL. The file-level Phase 1 content, dependency-backed checks, and daemon-backed project-create path now pass. Full acceptance still needs one selected agent adapter to generate and persist a proposal artifact.

Current implementation covers:

- `plugins/_official/scenarios/toy-productizer/SKILL.md`
- `plugins/_official/scenarios/toy-productizer/open-design.json`
- `plugins/_official/scenarios/toy-productizer/README.md`
- robot museum keychain Chinese fixture
- English museum buyer fixture
- eval and trigger query files
- `design-systems/toy-proposal-trade-desk/DESIGN.md`
- branch README binding in `docs/toy-productizer/README.md`

Review fixes already applied:

- Replaced the manifest `feedback-handoff` pipeline atom from planned `handoff` to implemented `file-write`, so Phase 1 does not depend on a reserved atom.
- Added `prompt` and `expected_output` fields to `evals/evals.json` while preserving file-based fixtures, matching the documented plugin eval shape more closely.
- Added `od.context.skills[{ path: "./SKILL.md" }]` to the plugin manifest. `compat.agentSkills` keeps the package portable, but daemon prompt composition reads plugin-local skill instructions through `od.context.skills`, so both declarations are needed for this Phase 1 plugin.

## Runtime Validation Completed

The local shell originally had Node `v23.7.0` and no dependencies, while the repo requires Node `~24`. Validation was rerun with Homebrew `node@24` through:

```bash
PATH="/opt/homebrew/opt/node@24/bin:$PATH"
```

Completed checks:

```bash
pnpm guard
pnpm --filter @open-design/plugin-runtime typecheck
pnpm --filter @open-design/daemon build
node apps/daemon/bin/od.mjs plugin validate ./plugins/_official/scenarios/toy-productizer --no-daemon
```

Results:

- `pnpm guard` passed.
- `@open-design/plugin-runtime` typecheck passed.
- `@open-design/daemon` build passed.
- plugin validation passed with `ok=true`.

### Gap 1: Full agent artifact output is not yet proven

The daemon-backed project-create path is proven, but a real agent run was not started in this pass to avoid selecting an adapter or spending provider budget without an explicit acceptance target.

Current smoke shape:

```bash
PID=$(node apps/daemon/bin/od.mjs project create \
  --daemon-url http://127.0.0.1:17456 \
  --name "Toy Productizer QA" \
  --plugin toy-productizer \
  --design-system toy-proposal-trade-desk \
  --inputs '{"prompt":"我们有一款普通机器人钥匙扣，老客户发来一张复古航天机器人参考图，想做博物馆礼品店可卖的新品，零售价 15 美元以内，但不要太像原图。不要毛绒。","proposalLanguage":"auto"}' \
  --json | jq -r '.project.id // .projectId')
```

Next acceptance command:

```bash
node apps/daemon/bin/od.mjs run start \
  --daemon-url http://127.0.0.1:17456 \
  --project "$PID" \
  --plugin toy-productizer \
  --inputs '{"prompt":"我们有一款普通机器人钥匙扣，老客户发来一张复古航天机器人参考图，想做博物馆礼品店可卖的新品，零售价 15 美元以内，但不要太像原图。不要毛绒。","proposalLanguage":"auto"}' \
  --agent codex \
  --follow
```

If `codex` is unavailable, use the locally available Open Design agent adapter and record the exact adapter used.

### Gap 2: UI entry should remain deferred until agent artifact smoke passes

Do not add a Studio navigation or routing change before a daemon-backed agent run proves that:

- `toy-productizer` applies cleanly.
- `toy-proposal-trade-desk` resolves as the active design system.
- the generated artifact preserves no-plush and validation-only constraints.
- the fixture outputs avoid forbidden customer-visible claims.

## Revised Phase 1 Plan

### Task 1: Keep product scope locked

Files:

- Read: `docs/toy-productizer/BRANCH_BRIEF.md`
- Read: `docs/toy-productizer/product/*.md`
- Modify only if needed: `docs/toy-productizer/README.md`

Verification:

```bash
rg -n "Toy Design|CRM|RFQ|supplier outreach|production-ready|正式报价" docs/toy-productizer plugins/_official/scenarios/toy-productizer design-systems/toy-proposal-trade-desk
```

Expected:

- `Toy Design` appears only as a prohibited rename.
- forbidden claim strings appear only in boundary or anti-pattern sections, not expected customer proposal fixtures.

### Task 2: Validate plugin and design-system structure

Files:

- `plugins/_official/scenarios/toy-productizer/open-design.json`
- `plugins/_official/scenarios/toy-productizer/SKILL.md`
- `design-systems/toy-proposal-trade-desk/DESIGN.md`

Verification:

```bash
node -e "const fs=require('fs'); for (const f of ['plugins/_official/scenarios/toy-productizer/open-design.json','plugins/_official/scenarios/toy-productizer/evals/evals.json','plugins/_official/scenarios/toy-productizer/evals/trigger-queries.json']) JSON.parse(fs.readFileSync(f,'utf8')); console.log('json ok')"
node -e "const fs=require('fs'); const t=fs.readFileSync('design-systems/toy-proposal-trade-desk/DESIGN.md','utf8'); for (let i=1;i<=9;i++) if (!t.includes('## '+i+'.')) throw new Error('missing heading '+i); console.log('design system ok')"
```

Expected:

- JSON parses.
- design system has all 9 required numbered sections.

### Task 3: Restore dependency-backed verification

Prerequisites:

- Node `~24`
- workspace dependencies installed

Verification:

```bash
pnpm guard
pnpm --filter @open-design/plugin-runtime typecheck
pnpm --filter @open-design/daemon build
node apps/daemon/bin/od.mjs plugin validate ./plugins/_official/scenarios/toy-productizer
```

Expected:

- all commands pass, or failures are recorded with exact output and mapped to a scoped follow-up.

### Task 4: Prove the Toy Productizer Studio launch path

Prerequisites:

- local daemon running
- at least one available agent adapter

Verification:

```bash
node apps/daemon/bin/od.mjs project create \
  --name "Toy Productizer QA" \
  --plugin toy-productizer \
  --design-system toy-proposal-trade-desk \
  --inputs '{"prompt":"A US museum buyer wants a retro space robot collectible for the gift shop. It should feel educational, be easy to display near the checkout counter, and stay under a $15 retail price. Please avoid copying the reference robot silhouette.","proposalLanguage":"auto"}' \
  --json
```

Then start or follow an `od run start` run against that project.

Expected:

- project is created with the toy plugin snapshot.
- design system resolves without unknown-ref warning.
- artifact output follows the Proposal structure.
- no forbidden customer-visible claims appear in generated customer proposal content.

### Task 5: Only then consider a small UI entry

Do this only after Tasks 1-4 pass.

Allowed UI scope:

- a branch-local default selection or entry point that preselects `toy-productizer` and `toy-proposal-trade-desk`
- no broad navigation refactor
- no deletion of generic Open Design subsystems

Required UI verification if this task is taken:

```bash
pnpm --filter @open-design/web typecheck
pnpm tools-dev run web --daemon-port 17456 --web-port 17573
```

Then verify the browser path manually or with Playwright.

## Decision

Do not expand scope. The next useful step is an agent-backed artifact run, not more product surface.

Phase 1 can be called complete only when:

- the already-passing dependency and daemon smoke checks stay green,
- an `od run start --project <id> --plugin toy-productizer` run generates proposal artifact files,
- fixture checks and generated content prove hard constraints and forbidden-claim boundaries hold.
