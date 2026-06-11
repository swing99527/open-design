# Toy Productizer Studio Agent Work Split

> Coordination file for splitting the next work across Architect Agent, Antigravity, and Codex.

## Source Branch

- Repository: `swing99527/open-design`
- Base branch: `productizer/toy-productizer-studio`
- Product name: `Toy Productizer Studio`
- Current plan: `docs/toy-productizer/NEXT_TASKS_PLAN.md`
- Architecture review: `docs/toy-productizer/ARCHITECTURE_REVIEW.md`

All agents must work from the GitHub branch above after the coordinator pushes the latest local commits.

## Shared Product Boundary

Keep this boundary stable:

```text
Productizer validates and records business state.
Open Design generates, renders, previews, and exports artifacts.
```

Do not rename the product to Toy Design. Do not expand V0 into CRM, RFQ, supplier outreach, formal quotation, sample automation, legal/IP clearance, marketplace publishing, or generic toy image generation.

## Coordination Rules

- Each agent works on a separate branch. Do not commit directly to `productizer/toy-productizer-studio` unless acting as the coordinator.
- Do not rewrite another agent's branch.
- Do not touch another agent's owned files unless the coordinator explicitly asks.
- Every agent must return: branch name, commit ids, changed files, commands run, PASS / PARTIAL / FAIL result, and blockers.
- Critical product validation and customer-visible output validation require explicit human acceptance by the coordinator/user. Agents may report `TECHNICAL PASS` with evidence, but must not mark the product/output as finally accepted without that human sign-off.
- Runtime artifacts under `.od/`, `.tmp/`, Playwright reports, screenshots, videos, and local logs must not be committed unless explicitly requested and placed under docs as reviewed evidence.
- Destructive shell commands require explicit human approval.

## Parallelization Decision

The work can split into three lanes:

| Agent | Primary role | Can start now? | Writes code? | Blocks whom? |
|---|---|---:|---:|---|
| Architect Agent | Review architecture decisions and prepare Productizer Core implementation guardrails | Yes | Docs only | Blocks Phase E |
| Antigravity | UI/UXD, browser-driven product workspace audit, and visual interaction spec | Yes, read/design first | Not until Phase C passes | Blocks Phase F |
| Codex | Repo implementation, Phase B/C verification, fixes, commits, and push | Yes | Yes | Blocks all later implementation |

## Lane 1: Architect Agent

### Mission

Act as the total-system architect. Review the current GitHub branch and produce the implementation guardrails for Productizer Core before daemon/contracts work begins.

### Owned Files

Preferred output:

- Create: `docs/toy-productizer/PRODUCTIZER_CORE_ARCHITECTURE_DECISION.md`

Allowed read context:

- `AGENTS.md`
- `docs/toy-productizer/ARCHITECTURE_REVIEW.md`
- `docs/toy-productizer/NEXT_TASKS_PLAN.md`
- `docs/toy-productizer/BRANCH_BRIEF.md`
- `docs/toy-productizer/product/*.md`
- `docs/current-architecture-and-secondary-development.md`
- `apps/daemon/src/db.ts`
- `apps/daemon/src/plugins/atoms.ts`
- `apps/daemon/src/plugins/apply.ts`
- `apps/daemon/src/plugins/resolve-snapshot.ts`
- `packages/contracts/src/`

Do not edit implementation files.

### Required Decisions

Return clear decisions on:

- Productizer Core object model: Project binding, Working Context, Direction, Proposal Version, Feedback Event, Readiness, Action Card, Audit.
- Which facts belong in SQLite vs artifact filesystem vs daemon memory.
- How Toy Domain Package should plug into Productizer Core without leaking `toy` fields into core contracts.
- Whether `Toy Commercialization Pack` stays non-persistent in V0.
- Action Card state boundary: daemon/API state, not Claude-specific `AskUserQuestion`.
- Minimal Phase E table and route list.
- Expansion path for future verticals: gift, homeware, fashion accessories, consumer electronics accessories.
- Compatibility with existing Open Design plugin, skill, artifact, design-system, and CLI primitives.

### Architect Agent Prompt

```text
You are the Total System Architect for Toy Productizer Studio.

Work from GitHub branch:
  swing99527/open-design
  productizer/toy-productizer-studio

Goal:
Review the current branch and produce the Productizer Core architecture decision document that the implementation agent can follow.

Read first:
- AGENTS.md
- docs/toy-productizer/ARCHITECTURE_REVIEW.md
- docs/toy-productizer/NEXT_TASKS_PLAN.md
- docs/toy-productizer/BRANCH_BRIEF.md
- docs/toy-productizer/product/*.md
- docs/current-architecture-and-secondary-development.md
- apps/daemon/src/db.ts
- apps/daemon/src/plugins/atoms.ts
- apps/daemon/src/plugins/apply.ts
- apps/daemon/src/plugins/resolve-snapshot.ts
- packages/contracts/src/

Important correction:
- plugins/_official/scenarios/ exists. The original remote review only correctly meant that toy-productizer was absent on that baseline.
- file-write and live-artifact are implemented atom ids in apps/daemon/src/plugins/atoms.ts.
- Productizer Action Cards must be daemon/API state, not Claude-specific AskUserQuestion state.

Output:
Create docs/toy-productizer/PRODUCTIZER_CORE_ARCHITECTURE_DECISION.md.

The document must include:
1. Source audit summary.
2. Final product boundary.
3. Productizer Core object model.
4. SQLite vs filesystem vs memory ownership.
5. Domain Package contract for Toy and future verticals.
6. Minimal Phase E daemon/contracts/CLI route plan.
7. What is explicitly not in V0.
8. Risks and acceptance criteria.
9. A PASS / PARTIAL / FAIL verdict on readiness to start Phase E.

Constraints:
- Do not edit implementation files.
- Do not create broad UI plans.
- Keep Toy Productizer Studio as the product name.
- Preserve the split: Productizer validates and records; Open Design generates artifacts.
```

## Lane 2: Antigravity

### Mission

Use Antigravity for what it is best suited for here: visual/product-workspace inspection, browser-driven evidence, interaction critique, and UI/UXD specification. Antigravity can use editor, terminal, and browser access and can produce artifacts such as task plans, screenshots, and browser recordings, so it should focus on visible product experience and verifiable UX artifacts.

Because autonomous IDE agents can execute terminal commands, keep Antigravity on approval-required mode for destructive commands. Do not use any turbo or skip-confirmation mode.

### Owned Files

Preferred output:

- Create: `docs/toy-productizer/UI_UXD_VERTICAL_WORKSPACE_REVIEW.md`

Allowed read context:

- `AGENTS.md`
- `apps/AGENTS.md`
- `apps/web/src/components/`
- `apps/web/src/styles/`
- `packages/components/`
- `docs/toy-productizer/ARCHITECTURE_REVIEW.md`
- `docs/toy-productizer/NEXT_TASKS_PLAN.md`
- `docs/toy-productizer/product/TOY_PRODUCTIZER_INTERACTION_SPEC.md`
- `design-systems/toy-proposal-trade-desk/DESIGN.md`

Do not edit daemon, contracts, plugin manifests, or Productizer Core files.

### Required Output

The review must answer:

- What should the first screen look like for a vertical Toy Productizer entry?
- Which Open Design terms must be hidden or translated: Plugin, Skill, Artifact, Run, Agent, Design System.
- What are the minimum UI objects for "实体化": Direction Card, SKU table, CMF/packaging, feedback strength, readiness badge, handoff evidence.
- What current components can be reused: ChatPane, FileViewer, FileWorkspace, AskUserQuestionCard pattern, plugin picker, shared components.
- What should not be implemented before Phase C passes.
- What screenshots or browser recordings prove the current UX gap.
- What exact files should Phase F touch after Phase E routes exist.

### Antigravity Prompt

```text
You are the UI/UXD and browser-validation agent for Toy Productizer Studio.

Work from GitHub branch:
  swing99527/open-design
  productizer/toy-productizer-studio

Your job:
Produce a vertical workspace UI/UXD review and implementation spec for Toy Productizer Studio. Focus on visible product experience, information architecture, and browser-verifiable evidence.

Read first:
- AGENTS.md
- apps/AGENTS.md
- apps/web/src/components/
- apps/web/src/styles/
- packages/components/
- docs/toy-productizer/ARCHITECTURE_REVIEW.md
- docs/toy-productizer/NEXT_TASKS_PLAN.md
- docs/toy-productizer/product/TOY_PRODUCTIZER_INTERACTION_SPEC.md
- design-systems/toy-proposal-trade-desk/DESIGN.md

Output:
Create docs/toy-productizer/UI_UXD_VERTICAL_WORKSPACE_REVIEW.md.

Include:
1. Current Open Design UX gap for a toy trading/factory user.
2. First screen proposal: lightweight vertical entry and composer.
3. Generated workspace proposal: tabs or layout for Proposal, Directions, Context, Feedback, Handoff.
4. Entity language: Direction Card, SKU table, CMF/packaging, feedback strength, readiness badge, handoff evidence.
5. What generic Open Design terms should be hidden or renamed.
6. Component reuse map and exact likely files for Phase F.
7. Screenshots or browser-recording notes if you run the app.
8. What must wait until Phase C and Phase E pass.
9. PASS / PARTIAL / FAIL verdict for starting Phase F.

Constraints:
- Do not implement production UI yet unless explicitly approved after Phase C passes.
- Do not edit daemon, contracts, plugin manifests, or Productizer Core files.
- Keep the product name Toy Productizer Studio.
- Do not delete generic Open Design surfaces; propose hiding or bypassing them for the vertical shell.
- Use approval-required mode for destructive commands.
```

## Lane 3: Codex

### Mission

Codex owns the repo-critical path: Phase B static validation, Phase C real agent artifact generation, evidence recording, and push. Codex may make focused fixes to plugin, design system, prompt contract, tests, and Phase 1 docs.

### Owned Files

May modify:

- `plugins/_official/scenarios/toy-productizer/**`
- `design-systems/toy-proposal-trade-desk/**`
- `apps/daemon/src/prompts/discovery.ts`
- `packages/contracts/src/prompts/discovery.ts`
- `apps/daemon/tests/plugins-toy-productizer-contract.test.ts`
- `apps/daemon/tests/prompts/discovery-plugin-inputs.test.ts`
- `packages/contracts/tests/system-prompt.test.ts`
- `apps/web/src/components/PluginsView.tsx`
- `apps/web/tests/components/PluginsView.test.tsx`
- `docs/toy-productizer/PHASE1_REVIEW.md`
- `docs/toy-productizer/PHASE1_TECHNICAL_ANALYSIS.md`
- `docs/toy-productizer/PHASE1_WORK_PLAN.md`
- `docs/toy-productizer/NEXT_TASKS_PLAN.md`
- `docs/toy-productizer/README.md`

Do not begin Productizer Core tables/routes or vertical UI shell until Phase C passes.

### Required Work

Execute:

- Phase B from `docs/toy-productizer/NEXT_TASKS_PLAN.md`
- Phase C from `docs/toy-productizer/NEXT_TASKS_PLAN.md`
- Record real evidence in `docs/toy-productizer/PHASE1_REVIEW.md`
- Commit and push the validated branch

### Codex Prompt

```text
You are the implementation and verification agent for Toy Productizer Studio Phase B/C.

Work from GitHub branch:
  swing99527/open-design
  productizer/toy-productizer-studio

Goal:
Validate and complete Phase B/C from docs/toy-productizer/NEXT_TASKS_PLAN.md.

Start by reading:
- AGENTS.md
- docs/toy-productizer/NEXT_TASKS_PLAN.md
- docs/toy-productizer/PHASE1_REVIEW.md
- docs/toy-productizer/PHASE1_TECHNICAL_ANALYSIS.md
- plugins/_official/scenarios/toy-productizer/open-design.json
- plugins/_official/scenarios/toy-productizer/SKILL.md
- design-systems/toy-proposal-trade-desk/DESIGN.md

Current known state:
- Phase A is complete.
- The branch includes the remote architecture review plus a correction note.
- The branch includes Toy Productizer Phase 1 scaffold.
- Real agent artifact generation is still the critical missing proof.

Tasks:
1. Run Phase B static plugin/design-system checks.
2. Run focused daemon/contracts/web tests listed in NEXT_TASKS_PLAN.md.
3. Start the daemon/web through pnpm tools-dev.
4. Create a Toy Productizer project through node apps/daemon/bin/od.mjs project create.
5. Pick an available local agent adapter.
6. Run node apps/daemon/bin/od.mjs run start with toy-productizer and --follow.
7. Inspect generated artifacts for required proposal structure, validation-only boundary, no-plush constraint, and forbidden customer-visible claims.
8. Record exact commands, adapter, project id, run id, artifact paths, and result in docs/toy-productizer/PHASE1_REVIEW.md.
9. Commit focused fixes and evidence.
10. Push the branch.

Constraints:
- Do not start Productizer Core tables/routes yet.
- Do not start vertical UI shell work yet.
- Do not rewrite the architecture report beyond correction notes.
- Do not commit .od, .tmp, logs, Playwright reports, or local runtime files.
- Preserve Toy Productizer Studio naming and the product boundary.

Return:
- PASS / PARTIAL / FAIL.
- Branch and commit ids.
- Commands run.
- Evidence paths.
- Any blockers.
```

## Recommended Execution Order

1. Coordinator pushes the current Phase A branch and this work-split document.
2. Architect Agent starts Lane 1 from GitHub and returns Productizer Core decisions.
3. Antigravity starts Lane 2 from GitHub and returns UI/UXD review artifacts, but does not implement production UI yet.
4. Codex starts Lane 3 immediately and owns Phase B/C verification.
5. Phase E starts only after Codex returns Phase C PASS and Architect returns Core architecture PASS or acceptable PARTIAL.
6. Phase F starts only after Phase E routes/contracts exist and Antigravity's UI/UXD review is accepted.

## Integration Gate

Do not merge implementation from multiple agents blindly.

Before integration:

```bash
git status --short --branch
git log --oneline --decorate -8
pnpm guard
pnpm --filter @open-design/daemon exec vitest run -c vitest.config.ts tests/plugins-toy-productizer-contract.test.ts tests/prompts/discovery-plugin-inputs.test.ts
pnpm --filter @open-design/contracts exec vitest run tests/system-prompt.test.ts
pnpm --filter @open-design/web exec vitest run tests/components/PluginsView.test.tsx
```

Then decide whether to proceed to:

- Phase E: Productizer Core contracts, SQLite, daemon routes, CLI
- Phase F: lightweight vertical Productizer workspace UI
