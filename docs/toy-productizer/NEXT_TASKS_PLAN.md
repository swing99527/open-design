# Toy Productizer Studio Next Tasks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the Toy Productizer Studio branch from strategy/docs and Phase 1 scaffolding into a verified artifact-generating vertical Productizer path, then prepare the Productizer Core implementation.

**Architecture:** Keep Open Design as the runtime, plugin, design-system, artifact, daemon, CLI, and file preview substrate. Build Productizer as a lightweight vertical shell and durable business fact layer above Open Design, with Toy as the first domain package. Do not make the plugin or chat transcript the system of record.

**Tech Stack:** Open Design bundled scenario plugin, portable `SKILL.md`, `DESIGN.md` design system, daemon SQLite, `packages/contracts`, `od` CLI, Next.js web shell, Node `~24`, `pnpm@10.33.2`.

---

## Current State

- Remote branch `origin/productizer/toy-productizer-studio` is one commit ahead locally with `f658a53e docs: add Productizer Studio architecture review`.
- Local branch has uncommitted Phase 1 work:
  - `plugins/_official/scenarios/toy-productizer/`
  - `design-systems/toy-proposal-trade-desk/`
  - `apps/daemon/tests/plugins-toy-productizer-contract.test.ts`
  - first-turn discovery prompt changes in daemon/contracts/web tests
  - `docs/current-architecture-and-secondary-development.md`
  - `docs/toy-productizer/PHASE1_*.md`
- The remote architecture review is useful, but it has two source-fact corrections:
  - `plugins/_official/scenarios/` exists; only `plugins/_official/scenarios/toy-productizer/` was absent on the remote baseline.
  - `file-write` and `live-artifact` are known atom ids in `apps/daemon/src/plugins/atoms.ts`; lack of folders under `plugins/_official/atoms/` is not proof that the atoms are unavailable.
- Phase 1 local review says dependency-backed checks and daemon smoke passed previously, but the real agent artifact run is still pending.

## NOT In Scope

- Renaming the product to Toy Design.
- Building CRM, RFQ, supplier outreach, quotation, sample, marketplace, or legal/IP clearance flows.
- Turning Open Design into a toy-only application.
- Adding broad navigation rewrites before the daemon-backed artifact path passes.
- Making `Toy Commercialization Pack` a second persistent fact source in V0.
- Binding Productizer Core state to one model provider or one agent runtime.
- Implementing second-industry support before Toy validates the core shape.

## What Already Exists

- Open Design project, plugin, skill, artifact, design-system, daemon, SQLite, CLI, and preview primitives.
- Bundled official scenario convention under `plugins/_official/scenarios/<id>/`.
- Plugin-local skill prompt loading through `od.context.skills[{ "path": "./SKILL.md" }]`.
- Built-in design-system discovery from `design-systems/<id>/DESIGN.md`.
- Existing atom catalog entries for `file-write` and `live-artifact`.
- Local Phase 1 Toy plugin and proposal design-system scaffolding.
- Remote architecture review at `docs/toy-productizer/ARCHITECTURE_REVIEW.md` after syncing `f658a53e`.

## Target Flow

```text
buyer brief / existing product / reference constraints
  -> Toy Productizer bundled scenario plugin
  -> plugin-local SKILL.md and toy-proposal-trade-desk DESIGN.md
  -> Open Design agent run
  -> proposal artifact files
  -> Productizer Core metadata, versions, feedback, readiness, action cards
  -> lightweight vertical workspace
```

## Phase A: Branch Hygiene And Architecture Corrections

### Task A1: Preserve local work before syncing the remote architecture review

**Files:**
- Read: git status
- Later modify only after clean sync: `docs/toy-productizer/ARCHITECTURE_REVIEW.md`

- [ ] **Step 1: Confirm branch and dirty state**

Run:

```bash
git status --short --branch
```

Expected:

```text
## productizer/toy-productizer-studio...origin/productizer/toy-productizer-studio [behind 1]
```

There may be local modified and untracked files. Do not discard them.

- [ ] **Step 2: Fetch remote without merging**

Run:

```bash
git fetch origin productizer/toy-productizer-studio
```

Expected:

```text
origin/productizer/toy-productizer-studio
```

- [ ] **Step 3: Save a local WIP commit or stash before pulling**

Preferred WIP commit if current changes are intended to keep:

```bash
git add apps/daemon/src/prompts/discovery.ts \
  apps/daemon/tests/prompts/discovery-plugin-inputs.test.ts \
  apps/daemon/tests/plugins-toy-productizer-contract.test.ts \
  apps/web/src/components/PluginsView.tsx \
  apps/web/tests/components/PluginsView.test.tsx \
  docs/architecture.md \
  docs/current-architecture-and-secondary-development.md \
  docs/toy-productizer/README.md \
  docs/toy-productizer/PHASE1_REVIEW.md \
  docs/toy-productizer/PHASE1_TECHNICAL_ANALYSIS.md \
  docs/toy-productizer/PHASE1_WORK_PLAN.md \
  packages/contracts/src/prompts/discovery.ts \
  packages/contracts/tests/system-prompt.test.ts \
  plugins/_official/scenarios/toy-productizer \
  design-systems/toy-proposal-trade-desk
git commit -m "feat: add Toy Productizer Studio phase 1 scaffold"
```

Expected:

```text
[productizer/toy-productizer-studio <sha>] feat: add Toy Productizer Studio phase 1 scaffold
```

Use `git stash push -u` only if the user wants the local implementation kept out of history temporarily.

- [ ] **Step 4: Bring in the architecture-review commit**

Run after the worktree is clean:

```bash
git merge --ff-only origin/productizer/toy-productizer-studio
```

Expected:

```text
Fast-forward
 docs/toy-productizer/ARCHITECTURE_REVIEW.md
```

If the WIP commit is already ahead of remote, use:

```bash
git rebase origin/productizer/toy-productizer-studio
```

Expected: rebase completes with no conflict, or conflicts are limited to docs.

### Task A2: Add a correction note to the architecture review

**Files:**
- Modify: `docs/toy-productizer/ARCHITECTURE_REVIEW.md`

- [ ] **Step 1: Add a short correction block near the top**

Insert after the opening "标注约定" block:

```markdown
> Implementation note added after source re-check:
> - `plugins/_official/scenarios/` exists in the repository; the missing path on the review baseline was specifically `plugins/_official/scenarios/toy-productizer/`.
> - `file-write` and `live-artifact` are known atom ids in `apps/daemon/src/plugins/atoms.ts`. Their absence as separate folders under `plugins/_official/atoms/` should not be treated as atom absence.
> - Productizer Action Cards must remain daemon/API state, not Claude-specific `AskUserQuestion` state. Claude stream-json may be used as an interaction convenience only.
```

- [ ] **Step 2: Verify the correction anchors**

Run:

```bash
rg -n "Implementation note|plugins/_official/scenarios|file-write|live-artifact|AskUserQuestion" docs/toy-productizer/ARCHITECTURE_REVIEW.md apps/daemon/src/plugins/atoms.ts
```

Expected:

```text
docs/toy-productizer/ARCHITECTURE_REVIEW.md:<line>:> Implementation note added after source re-check:
apps/daemon/src/plugins/atoms.ts:<line>:  "file-write",
apps/daemon/src/plugins/atoms.ts:<line>:  "live-artifact",
```

## Phase B: Re-validate Phase 1 Plugin And Design System

### Task B1: Static validation of the Toy plugin package

**Files:**
- Read/modify if needed: `plugins/_official/scenarios/toy-productizer/open-design.json`
- Read/modify if needed: `plugins/_official/scenarios/toy-productizer/SKILL.md`
- Read/modify if needed: `plugins/_official/scenarios/toy-productizer/evals/evals.json`
- Read/modify if needed: `plugins/_official/scenarios/toy-productizer/evals/trigger-queries.json`

- [ ] **Step 1: Parse plugin JSON files**

Run:

```bash
node -e "const fs=require('fs'); for (const f of ['plugins/_official/scenarios/toy-productizer/open-design.json','plugins/_official/scenarios/toy-productizer/evals/evals.json','plugins/_official/scenarios/toy-productizer/evals/trigger-queries.json']) JSON.parse(fs.readFileSync(f,'utf8')); console.log('json ok')"
```

Expected:

```text
json ok
```

- [ ] **Step 2: Verify manifest references**

Run:

```bash
node -e "const fs=require('fs'), path=require('path'); const manifestPath='plugins/_official/scenarios/toy-productizer/open-design.json'; const m=JSON.parse(fs.readFileSync(manifestPath,'utf8')); const base=path.dirname(manifestPath); for (const ref of m.compat.agentSkills) { const p=path.normalize(path.join(base, ref.path)); if (!fs.existsSync(p)) throw new Error('missing compat '+p); } for (const ref of m.od.context.skills) { const p=path.normalize(path.join(base, ref.path)); if (!fs.existsSync(p)) throw new Error('missing context skill '+p); } const ds=path.normalize(path.join(base,m.od.context.designSystem.path)); if (!fs.existsSync(ds)) throw new Error('missing '+ds); console.log('manifest references ok')"
```

Expected:

```text
manifest references ok
```

- [ ] **Step 3: Verify Phase 1 does not depend on reserved atoms**

Run:

```bash
rg -n '"handoff"|"patch-edit"|"diff-review"|"build-test"' plugins/_official/scenarios/toy-productizer/open-design.json
```

Expected: no output.

- [ ] **Step 4: Verify implemented atom ids are intentional**

Run:

```bash
rg -n '"file-write"|"live-artifact"' plugins/_official/scenarios/toy-productizer/open-design.json apps/daemon/src/plugins/atoms.ts
```

Expected:

```text
plugins/_official/scenarios/toy-productizer/open-design.json:<line>:            "file-write",
plugins/_official/scenarios/toy-productizer/open-design.json:<line>:            "live-artifact"
apps/daemon/src/plugins/atoms.ts:<line>:  "file-write",
apps/daemon/src/plugins/atoms.ts:<line>:  "live-artifact",
```

### Task B2: Static validation of the proposal design system

**Files:**
- Read/modify if needed: `design-systems/toy-proposal-trade-desk/DESIGN.md`
- Read/modify if needed: `design-systems/toy-proposal-trade-desk/tokens.css`
- Read/modify if needed: `design-systems/toy-proposal-trade-desk/components.html`

- [ ] **Step 1: Verify required numbered sections and font labels**

Run:

```bash
node -e "const fs=require('fs'); const t=fs.readFileSync('design-systems/toy-proposal-trade-desk/DESIGN.md','utf8'); for (let i=1;i<=9;i++) if (!t.includes('## '+i+'.')) throw new Error('missing heading '+i); for (const label of ['Display:','Body:','Mono:']) if (!t.includes(label)) throw new Error('missing '+label); console.log('design system ok')"
```

Expected:

```text
design system ok
```

- [ ] **Step 2: Verify proposal contract sections**

Run:

```bash
rg -n "Customer / task recap|Creative direction comparison|Recommended direction|Product story|SKU / lineup|CMF / packaging|Customer-facing selling points|Commercial assumptions|Feedback questions|Validation-only boundary" design-systems/toy-proposal-trade-desk/DESIGN.md
```

Expected: all required proposal sections are present.

### Task B3: Run focused repo checks for Phase 1

**Files:**
- Test: `apps/daemon/tests/plugins-toy-productizer-contract.test.ts`
- Test: `apps/daemon/tests/prompts/discovery-plugin-inputs.test.ts`
- Test: `apps/web/tests/components/PluginsView.test.tsx`
- Test: `packages/contracts/tests/system-prompt.test.ts`

- [ ] **Step 1: Confirm Node and pnpm versions**

Run:

```bash
node --version
pnpm --version
```

Expected:

```text
v24.x.x
10.33.2
```

- [ ] **Step 2: Run guard**

Run:

```bash
pnpm guard
```

Expected: command exits 0.

- [ ] **Step 3: Run focused daemon tests**

Run:

```bash
pnpm --filter @open-design/daemon exec vitest run -c vitest.config.ts tests/plugins-toy-productizer-contract.test.ts tests/prompts/discovery-plugin-inputs.test.ts
```

Expected: both test files pass.

- [ ] **Step 4: Run focused contracts tests**

Run:

```bash
pnpm --filter @open-design/contracts exec vitest run tests/system-prompt.test.ts
```

Expected: test file passes.

- [ ] **Step 5: Run focused web tests**

Run:

```bash
pnpm --filter @open-design/web exec vitest run tests/components/PluginsView.test.tsx
```

Expected: test file passes.

- [ ] **Step 6: Run typecheck for touched packages**

Run:

```bash
pnpm --filter @open-design/plugin-runtime typecheck
pnpm --filter @open-design/daemon build
pnpm --filter @open-design/web typecheck
```

Expected: all commands exit 0.

## Phase C: Prove Real Agent Artifact Generation

### Task C1: Start daemon/web through the repo lifecycle

**Files:**
- No source changes expected.

- [ ] **Step 1: Start local runtime**

Run:

```bash
pnpm tools-dev run web --daemon-port 17456 --web-port 17573
```

Expected:

```text
daemonUrl: http://127.0.0.1:17456
webUrl: http://127.0.0.1:17573
```

Keep this process running for the next steps.

- [ ] **Step 2: Verify design-system registry**

Run in another shell:

```bash
curl -s http://127.0.0.1:17456/api/design-systems | rg "toy-proposal-trade-desk"
```

Expected: output contains `toy-proposal-trade-desk`.

### Task C2: Create a Toy Productizer project through `od`

**Files:**
- Runtime output under `.od/` only.

- [ ] **Step 1: Create the project**

Run:

```bash
PID=$(node apps/daemon/bin/od.mjs project create \
  --daemon-url http://127.0.0.1:17456 \
  --name "Toy Productizer QA" \
  --plugin toy-productizer \
  --design-system toy-proposal-trade-desk \
  --inputs '{"prompt":"A US museum buyer wants a retro space robot collectible for the gift shop. It should feel educational, be easy to display near the checkout counter, and stay under a $15 retail price. Please avoid copying the reference robot silhouette.","proposalLanguage":"auto"}' \
  --json | jq -r '.project.id // .projectId')
echo "$PID"
```

Expected: prints a non-empty project id.

- [ ] **Step 2: Verify project metadata**

Run:

```bash
node apps/daemon/bin/od.mjs project show --daemon-url http://127.0.0.1:17456 "$PID" --json | rg "toy-productizer|toy-proposal-trade-desk"
```

Expected: output contains both `toy-productizer` and `toy-proposal-trade-desk`.

### Task C3: Run an agent-backed proposal artifact

**Files:**
- Runtime artifacts under `.od/projects/<project-id>/`
- Runtime saved artifacts under `.od/artifacts/`

- [ ] **Step 1: Pick the locally available adapter**

Run:

```bash
node apps/daemon/bin/od.mjs agent list --daemon-url http://127.0.0.1:17456 --json
```

Expected: JSON lists at least one available agent. Prefer the lowest-cost local configured adapter. Record the adapter name in `docs/toy-productizer/PHASE1_REVIEW.md`.

- [ ] **Step 2: Start the run**

Replace `<agent>` with the chosen adapter:

```bash
node apps/daemon/bin/od.mjs run start \
  --daemon-url http://127.0.0.1:17456 \
  --project "$PID" \
  --plugin toy-productizer \
  --inputs '{"prompt":"A US museum buyer wants a retro space robot collectible for the gift shop. It should feel educational, be easy to display near the checkout counter, and stay under a $15 retail price. Please avoid copying the reference robot silhouette.","proposalLanguage":"auto"}' \
  --agent <agent> \
  --follow
```

Expected:

- run starts successfully
- plugin-local `SKILL.md` is active in the prompt
- `toy-proposal-trade-desk` design system is active
- at least one proposal artifact file is written

- [ ] **Step 3: Inspect generated proposal content**

Run:

```bash
rg -n "Customer / task recap|Creative direction comparison|Recommended direction|Product story|SKU / lineup|CMF / packaging|Feedback questions|Validation-only boundary|AI draft|market validation" .od/projects "$PWD/.od/artifacts"
```

Expected: generated proposal content includes the required proposal structure and validation boundary.

- [ ] **Step 4: Check forbidden customer-visible claims**

Run:

```bash
rg -n "production-ready|quotation-ready|sample-ready|legally cleared|IP safe|正式报价|可直接量产|无侵权|可打样|可生产" .od/projects "$PWD/.od/artifacts"
```

Expected: no output in generated customer proposal files. If any match appears only in internal instructions or docs, record the path and confirm it is not customer-visible.

- [ ] **Step 5: Check no-plush constraint**

Run:

```bash
rg -n "plush|毛绒" .od/projects "$PWD/.od/artifacts"
```

Expected: no generated direction suggests plush unless the artifact is explaining that plush is excluded.

### Task C4: Update Phase 1 review with actual evidence

**Files:**
- Modify: `docs/toy-productizer/PHASE1_REVIEW.md`
- Modify if needed: `docs/toy-productizer/README.md`

- [ ] **Step 1: Add an acceptance evidence section**

Append:

```markdown
## Agent Artifact Acceptance Evidence

- Date:
- Branch:
- Commit:
- Agent adapter:
- Project id:
- Run id:
- Commands:
  - `pnpm guard`
  - `pnpm --filter @open-design/daemon exec vitest run -c vitest.config.ts tests/plugins-toy-productizer-contract.test.ts tests/prompts/discovery-plugin-inputs.test.ts`
  - `pnpm --filter @open-design/web exec vitest run tests/components/PluginsView.test.tsx`
  - `node apps/daemon/bin/od.mjs run start ... --follow`
- Artifact paths:
- Result: PASS / PARTIAL / FAIL
- Notes:
```

- [ ] **Step 2: Fill every field with real values**

Run:

```bash
git rev-parse --abbrev-ref HEAD
git rev-parse --short HEAD
```

Expected: branch and commit are recorded in the evidence section.

## Phase D: Land Phase 1 Cleanly

### Task D1: Stage and commit only Phase 1 scope

**Files:**
- Commit Phase 1 plugin, design system, focused prompt/discovery changes, tests, docs, and architecture correction.

- [ ] **Step 1: Review changed files**

Run:

```bash
git status --short
git diff --stat
```

Expected:

- no unrelated app or generated cache files
- no `.od/`, `.tmp/`, Playwright report, or runtime artifacts staged

- [ ] **Step 2: Stage scoped files**

Run:

```bash
git add docs/toy-productizer/ARCHITECTURE_REVIEW.md \
  docs/toy-productizer/README.md \
  docs/toy-productizer/PHASE1_REVIEW.md \
  docs/toy-productizer/PHASE1_TECHNICAL_ANALYSIS.md \
  docs/toy-productizer/PHASE1_WORK_PLAN.md \
  docs/current-architecture-and-secondary-development.md \
  docs/architecture.md \
  docs/toy-productizer/NEXT_TASKS_PLAN.md \
  plugins/_official/scenarios/toy-productizer \
  design-systems/toy-proposal-trade-desk \
  apps/daemon/src/prompts/discovery.ts \
  apps/daemon/tests/prompts/discovery-plugin-inputs.test.ts \
  apps/daemon/tests/plugins-toy-productizer-contract.test.ts \
  apps/web/src/components/PluginsView.tsx \
  apps/web/tests/components/PluginsView.test.tsx \
  packages/contracts/src/prompts/discovery.ts \
  packages/contracts/tests/system-prompt.test.ts
```

Expected: only intended files are staged.

- [ ] **Step 3: Commit**

Run:

```bash
git commit -m "feat: add Toy Productizer Studio phase 1 scaffold"
```

Expected: commit succeeds with no co-author trailer.

- [ ] **Step 4: Push**

Run:

```bash
git push origin productizer/toy-productizer-studio
```

Expected: remote branch contains architecture review plus Phase 1 scaffold and evidence.

## Phase E: Productizer Core Technical Design

Start this phase only after Phase C passes.

### Task E1: Add core contracts without toy-specific fields

**Files:**
- Create: `packages/contracts/src/productizer/types.ts`
- Create: `packages/contracts/src/productizer/api.ts`
- Modify: `packages/contracts/src/index.ts`
- Test: `packages/contracts/tests/productizer-contract.test.ts`

- [ ] **Step 1: Define domain-free Productizer types**

Add:

```ts
export type ProductizerProjectKind = "productizer";

export interface ProductizerProjectBinding {
  id: string;
  projectId: string;
  domainId: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductizerContextKind = "fact" | "constraint" | "assumption" | "risk" | "missing";
export type ProductizerContextSource = "user" | "agent" | "feedback" | "import" | "unknown";

export interface ProductizerContextItem {
  id: string;
  projectId: string;
  kind: ProductizerContextKind;
  source: ProductizerContextSource;
  content: string;
  confidence: "low" | "medium" | "high";
  createdAt: string;
}

export interface ProductizerDirection {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  differentiation: string;
  risks: string[];
  status: "draft" | "locked" | "rejected";
  extensions?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductizerProposalVersion {
  id: string;
  projectId: string;
  proposalId: string;
  version: number;
  artifactRef: string;
  changedSections: string[];
  createdAt: string;
}

export interface ProductizerFeedbackEvent {
  id: string;
  projectId: string;
  sourceLabel: string;
  verbatim: string;
  strength: "weak" | "medium" | "strong";
  credibilityTier: "low" | "medium" | "confirmed";
  createdAt: string;
}

export interface ProductizerActionCard {
  id: string;
  projectId: string;
  type: "lock_direction" | "export_proposal" | "mark_handoff_ready";
  status: "open" | "confirmed" | "dismissed";
  payload: Record<string, unknown>;
  createdAt: string;
  resolvedAt?: string;
}
```

- [ ] **Step 2: Write contract tests that reject toy leakage**

Test:

```ts
import { describe, expect, it } from "vitest";
import type { ProductizerDirection } from "../src/productizer/types";

describe("productizer contracts", () => {
  it("keeps core directions domain-neutral", () => {
    const direction: ProductizerDirection = {
      id: "dir_1",
      projectId: "proj_1",
      title: "Checkout collectible",
      summary: "Small counter-display product line.",
      differentiation: "Uses a new story and silhouette instead of copying the reference.",
      risks: ["Unconfirmed price band"],
      status: "draft",
      extensions: { domainSpecific: true },
      createdAt: "2026-06-11T00:00:00.000Z",
      updatedAt: "2026-06-11T00:00:00.000Z",
    };

    expect(direction.extensions).toEqual({ domainSpecific: true });
    expect(Object.keys(direction).join(" ")).not.toMatch(/toy|玩具/i);
  });
});
```

- [ ] **Step 3: Run contract tests**

Run:

```bash
pnpm --filter @open-design/contracts exec vitest run tests/productizer-contract.test.ts
```

Expected: test passes.

### Task E2: Add daemon persistence and routes

**Files:**
- Modify: `apps/daemon/src/db.ts`
- Create: `apps/daemon/src/productizer/store.ts`
- Create: `apps/daemon/src/productizer/routes.ts`
- Modify: `apps/daemon/src/server.ts`
- Test: `apps/daemon/tests/productizer-routes.test.ts`

- [ ] **Step 1: Add SQLite tables in the existing migration flow**

Tables:

```sql
productizer_project_bindings(id text primary key, project_id text not null, domain_id text not null, created_at text not null, updated_at text not null)
productizer_context_items(id text primary key, project_id text not null, kind text not null, source text not null, content text not null, confidence text not null, created_at text not null)
productizer_directions(id text primary key, project_id text not null, title text not null, summary text not null, differentiation text not null, risks_json text not null, status text not null, extensions_json text, created_at text not null, updated_at text not null)
productizer_proposal_versions(id text primary key, project_id text not null, proposal_id text not null, version integer not null, artifact_ref text not null, changed_sections_json text not null, created_at text not null)
productizer_feedback_events(id text primary key, project_id text not null, source_label text not null, verbatim text not null, strength text not null, credibility_tier text not null, created_at text not null)
productizer_action_cards(id text primary key, project_id text not null, type text not null, status text not null, payload_json text not null, created_at text not null, resolved_at text)
```

- [ ] **Step 2: Add minimal routes**

Routes:

```text
GET  /api/productizer/projects/:projectId
POST /api/productizer/projects/:projectId/bind
GET  /api/productizer/projects/:projectId/directions
POST /api/productizer/projects/:projectId/directions
GET  /api/productizer/projects/:projectId/feedback
POST /api/productizer/projects/:projectId/feedback
GET  /api/productizer/projects/:projectId/action-cards
POST /api/productizer/projects/:projectId/action-cards/:id/confirm
```

- [ ] **Step 3: Add daemon route tests**

Test cases:

```text
bind project creates one Productizer binding
direction creation requires non-empty differentiation
feedback strength maps to credibility tier
handoff-ready action cannot be confirmed without medium or confirmed feedback
```

- [ ] **Step 4: Run daemon tests**

Run:

```bash
pnpm --filter @open-design/daemon exec vitest run -c vitest.config.ts tests/productizer-routes.test.ts
```

Expected: test file passes.

### Task E3: Add CLI parity for core state

**Files:**
- Modify: `apps/daemon/src/cli.ts`
- Test: `apps/daemon/tests/cli-productizer.test.ts`

- [ ] **Step 1: Add `od productizer` subcommands**

Subcommands:

```text
od productizer bind --project <id> --domain toy --json
od productizer directions list --project <id> --json
od productizer feedback add --project <id> --source <label> --strength weak|medium|strong --text <text> --json
od productizer action-cards list --project <id> --json
od productizer action-cards confirm --project <id> --id <id> --json
```

- [ ] **Step 2: Verify `--json` output**

Run:

```bash
pnpm --filter @open-design/daemon exec vitest run -c vitest.config.ts tests/cli-productizer.test.ts
```

Expected: command exits 0 and snapshots contain machine-readable JSON.

## Phase F: Lightweight Vertical Workspace

Start this phase only after Phase E has route and CLI coverage.

### Task F1: Add Productizer shell without deleting generic Open Design UI

**Files:**
- Create: `apps/web/src/components/productizer/ProductizerShell.tsx`
- Create: `apps/web/src/components/productizer/ProductizerShell.module.css`
- Create: `apps/web/src/components/productizer/DirectionCard.tsx`
- Create: `apps/web/src/components/productizer/FeedbackStrengthIndicator.tsx`
- Create: `apps/web/src/components/productizer/ReadinessBadge.tsx`
- Modify only if needed: app route file that owns workspace entry
- Test: `apps/web/tests/components/ProductizerShell.test.tsx`

- [ ] **Step 1: Build the shell around existing providers and FileViewer**

UI tabs:

```text
Proposal
Directions
Context
Feedback
Handoff
```

Copy rules:

```text
Artifact -> Proposal
Plugin -> hidden
Skill -> hidden
Run -> hidden
Handoff -> Handoff / 交接材料
```

- [ ] **Step 2: Add component tests**

Test cases:

```text
renders Proposal as the default tab
renders Direction cards with differentiation text
renders Feedback strength labels
hides plugin/skill/run implementation words from the vertical shell
```

- [ ] **Step 3: Run web validation**

Run:

```bash
pnpm --filter @open-design/web typecheck
pnpm --filter @open-design/web exec vitest run tests/components/ProductizerShell.test.tsx
```

Expected: both commands pass.

## Failure Modes To Watch

- The next agent treats `ARCHITECTURE_REVIEW.md` as fully source-accurate and avoids existing scenario/atom infrastructure.
- The plugin validates but the agent prompt misses plugin-local `SKILL.md`.
- The artifact looks polished but violates no-plush, non-copy, or validation-only boundaries.
- UI work starts before `od run start` proves real artifact generation.
- Productizer state gets stored only in chat messages or artifact files, making versions and feedback unreliable.
- Toy-specific fields leak into Productizer Core contracts.
- The product drifts into CRM/RFQ/sample/quote workflow before proposal validation is proven.

## Parallelization Strategy

| Lane | Tasks | Can run in parallel? | Depends on |
|---|---|---:|---|
| 1 | A1-A2 branch sync and architecture correction | No | Current dirty state |
| 2 | B1-B2 static plugin/design-system validation | Yes | Local Phase 1 files |
| 3 | B3 focused tests and typecheck | Yes after B1 | Dependencies installed |
| 4 | C1-C4 real artifact run | No | B1-B3 pass |
| 5 | D1 land Phase 1 | No | C evidence |
| 6 | E1-E3 Productizer Core | Yes by contracts/daemon/CLI once D lands | Phase C pass |
| 7 | F1 vertical workspace | No | Core routes and CLI |

## Completion Criteria

Phase 1 is complete when:

- remote architecture review is synced and corrected
- plugin/design-system static checks pass
- focused daemon/contracts/web tests pass
- one real `od run start` produces a Toy Productizer proposal artifact
- generated artifact passes required-section, no-plush, non-copy, and forbidden-claim checks
- evidence is recorded in `docs/toy-productizer/PHASE1_REVIEW.md`
- branch is pushed to GitHub

Productizer Core planning is complete when:

- contracts are domain-neutral
- daemon owns metadata, versions, feedback, readiness, and action cards
- CLI parity exists for every new core capability
- UI uses vertical language without deleting generic Open Design surfaces
