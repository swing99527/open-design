# Toy Productizer Studio Phase 1 Review

> Review date: 2026-06-09
> Acceptance update: 2026-06-11
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

Verdict: PASS with adapter notes. The file-level Phase 1 content, dependency-backed checks, daemon-backed project-create path, and one real agent-backed proposal artifact path now pass.

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
- Tightened the customer-visible forbidden-claim boundary after runtime output exposed an unsafe `IP Unique` line. The plugin instructions, eval fixture forbidden terms, daemon contract test, and repeatable scan command now cover capitalization variants and `copyright conflicts` wording.

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

## Agent Artifact Acceptance Evidence

Verdict: PASS for Phase 1 launch-path proof using the locally available `gemini` adapter. `claude` is intentionally excluded from the current acceptance scope.

Runtime target:

- Branch: `productizer/toy-productizer-studio`
- Local daemon: `http://127.0.0.1:17456`
- Local web: `http://127.0.0.1:17573`
- Project id: `8314e195-2745-4132-b792-184fcf68fdb2`
- Conversation id: `02f289fa-f5d7-4159-b84a-f41969d2815b`
- Design system: `toy-proposal-trade-desk`
- Plugin: `toy-productizer`

Agent runs:

- `codex`: attempted run `4f6ac6c1-ccd3-4230-b5f0-2a3fb33e5687`; blocked by local Codex CLI config, `service_tier` value `default` is invalid for this installed CLI (`fast` or `flex` expected). This is an adapter/config issue, not a Toy Productizer plugin failure.
- `gemini`: discovery run `523b2d06-e051-4db3-9742-472f64bcb8ef`; succeeded and emitted the Toy-specific discovery form.
- `gemini`: artifact run `6e7ad41e-eecb-4b4f-b157-28f0fb6845a1`; succeeded and generated `index.html`, `index.html.artifact.json`, and `WORKING_CONTEXT.md`.
- `gemini`: patch run `699cc8b3-659e-4cbf-8268-4401a564f50e`; succeeded and replaced the unsafe `IP Unique` customer-visible claim with validation-only `Reference Differentiation` wording.

Generated files:

- `.od/projects/8314e195-2745-4132-b792-184fcf68fdb2/index.html`
- `.od/projects/8314e195-2745-4132-b792-184fcf68fdb2/index.html.artifact.json`
- `.od/projects/8314e195-2745-4132-b792-184fcf68fdb2/WORKING_CONTEXT.md`

Final customer-visible artifact checks:

```bash
rg -ni "production-ready|quotation-ready|sample-ready|legally cleared|IP safe|IP-safe|IP unique|copyright-safe|copyright cleared|copyright conflicts|character-copyright conflicts|正式报价|可直接量产|无侵权|可打样|可生产" .od/projects/8314e195-2745-4132-b792-184fcf68fdb2/index.html .od/artifacts
```

Result: no output.

```bash
rg -ni "plush|毛绒" .od/projects/8314e195-2745-4132-b792-184fcf68fdb2/index.html .od/artifacts
```

Result: one expected customer constraint line, `No Plush. No direct copy of reference silhouettes.`

```bash
rg -n "Reference Differentiation|Validation-Only Boundary|AI draft|market validation|v2.0-DRAFT|<h2>" .od/projects/8314e195-2745-4132-b792-184fcf68fdb2/index.html
```

Result: confirms `v2.0-DRAFT`, all 10 proposal sections, `Reference Differentiation`, and validation-only boundary.

Artifact manifest:

- `kind`: `html`
- `renderer`: `html`
- `status`: `complete`
- `exports`: `html`, `pdf`, `zip`

Important runtime notes:

- Default shell Node was `v23.7.0`; all validation used `PATH="/opt/homebrew/opt/node@24/bin:$PATH"` to satisfy the repo Node `~24` requirement.
- Sandbox restrictions required escalated execution for `pnpm guard`, `pnpm tools-dev run web`, and localhost daemon CLI calls.
- The earlier plan command `od project show` is stale for this repo shape; the working command is `od project info`.
- The earlier plan command `od agent list` is stale; available agents were verified through `/api/agents`.

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

Status: PASS using the `gemini` adapter.

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

Tasks 1-4 now pass. The next implementation step may add a small UI entry, but should stay narrowly scoped.

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

Do not expand scope. Phase 1 is `TECHNICAL PASS` for plugin/design-system/agent-artifact launch-path proof.

Human acceptance status: `USER_REJECTED`.

Human review result on 2026-06-11: the generated proposal is too simple and does not yet show a meaningful Productizer advantage over asking a general-purpose model such as Doubao to output a proposal. The current artifact proves the generation pipeline, but it does not prove product value.

Reasons:

- The proposal reads like a generic concept brief rather than a vertical toy-trade productization artifact.
- It lacks enough buyer-facing commercial depth: target buyer objections, SKU rationale, margin/price logic, display constraints, packaging tradeoffs, and decision options are shallow.
- It does not expose the durable Productizer advantages yet: versioned facts, feedback credibility, readiness gates, action cards, and reusable business state.
- It does not create a strong enough "why not ChatGPT/Doubao + template" distinction for a user.

Revised acceptance rule: Phase 1 remains `TECHNICAL PASS` for pipeline proof, but product/output acceptance is `FAIL` until a regenerated proposal demonstrates clear vertical depth and Productizer-specific value beyond generic model copy.

The next useful step is a small verticalized UI entry/workspace pass, not CRM, RFQ, supplier outreach, marketplace, legal clearance, or generic toy-design expansion.
