# Toy Productizer Studio Phase 1 Technical Analysis

> Date: 2026-06-09
> Skills used: `gstack-plan-eng-review`, `superpowers:writing-plans`
> Status: DEPENDENCY AND DAEMON SMOKE PASS; AGENT ARTIFACT RUN PENDING

## Executive Summary

Phase 1 should continue as a plugin-first Open Design adaptation. The smallest correct path is:

```text
Toy buyer/productization prompt
  -> apply bundled toy-productizer scenario plugin
  -> bind toy-proposal-trade-desk design system
  -> inject plugin-local SKILL.md into the agent prompt
  -> run the existing CLI-agent artifact loop
  -> persist proposal files and feedback/handoff notes as project artifacts
```

Do not implement a new business backend, a broad UI shell, CRM, RFQ, supplier workflow, image generator, or formal quote/sample flow in Phase 1.

The main technical issue found during review was fixed in the manifest: `compat.agentSkills` alone records portable skill compatibility, but daemon prompt composition reads plugin-local skill instructions from `od.context.skills[{ path: "./SKILL.md" }]`. Without this binding, the plugin can be applied while the agent misses the Toy Productizer-specific instruction body.

## Step 0: Scope Challenge

### Existing Code That Already Solves The Subproblems

- Plugin discovery and validation already exist through `plugins/_official/**`, `apps/daemon/src/plugins/bundled.ts`, `apps/daemon/src/plugins/validate.ts`, and `apps/daemon/src/plugins/doctor.ts`.
- Plugin apply, input validation, project metadata patching, pipeline snapshotting, and local skill prompt loading already exist in `apps/daemon/src/plugins/apply.ts`, `apps/daemon/src/plugins/resolve-snapshot.ts`, and `apps/daemon/src/plugins/local-skill.ts`.
- Design system discovery already scans `design-systems/<id>/DESIGN.md`; the Toy proposal design system fits this shape.
- Agent execution should stay on the existing Open Design daemon/CLI run path.

### Minimum Change Set

Phase 1 only needs:

- a bundled scenario plugin under `plugins/_official/scenarios/toy-productizer/`
- a bundled proposal design system under `design-systems/toy-proposal-trade-desk/`
- fixtures and eval metadata for happy path and safety boundaries
- a documented headless launch path
- a UI entry only after daemon-backed smoke passes

### Scope Reduction Decision

No extra scope reduction is needed now. The file count is higher than a trivial patch because Phase 1 intentionally adds one plugin package, one design system package, fixtures, and docs. It does not introduce new services, new classes, new runtime subsystems, or broad UI changes.

## Architecture Review

Verdict: PARTIAL PASS.

### Data Flow

```text
User / QA command
  -> project create or run start with pluginId=toy-productizer
  -> resolve installed bundled plugin
  -> validate od.inputs.prompt
  -> resolve context refs
      - od.context.skills path -> plugin-local SKILL.md
      - od.context.designSystem.ref -> registry id
      - od.pipeline.stages -> first-party atoms
  -> create AppliedPluginSnapshot
  -> project metadata patch sets designSystemId=toy-proposal-trade-desk
  -> compose run system prompt
      - plugin-local SKILL.md body
      - active DESIGN.md body
      - active plugin block and inputs
  -> CLI agent writes proposal artifacts
```

### Finding A1: Plugin-local Skill Binding Was Missing

`[P1] (confidence: 9/10) plugins/_official/scenarios/toy-productizer/open-design.json — The manifest previously declared only compat.agentSkills, but daemon prompt composition loads plugin-local SKILL.md through od.context.skills[].path.`

Impact:

- The plugin could validate as a package.
- The plugin could apply as a project snapshot.
- The run prompt could still miss the Toy Productizer-specific instructions.

Resolution applied:

- Added `od.context.skills: [{ "path": "./SKILL.md" }]`.

Verification:

```bash
node -e "const fs=require('fs'); const m=JSON.parse(fs.readFileSync('plugins/_official/scenarios/toy-productizer/open-design.json','utf8')); if (m.od.context.skills?.[0]?.path !== './SKILL.md') throw new Error('missing plugin-local skill path'); console.log('local skill path ok')"
```

Expected:

```text
local skill path ok
```

### Finding A2: Design System Resolution Required Daemon Proof

`[P2] (confidence: 8/10) design-systems/toy-proposal-trade-desk/DESIGN.md — The directory shape matches built-in design-system scanning, but registry resolution is runtime-owned and needed daemon startup proof.`

Current static evidence:

- Built-in design systems use `design-systems/<id>/DESIGN.md`.
- `listDesignSystems()` scans directories and derives id from the directory name.
- The Toy design system directory matches that convention.

Runtime proof completed:

```bash
pnpm tools-dev run web --daemon-port 17456 --web-port 17573
curl -s http://127.0.0.1:17456/api/design-systems
```

Result:

- `/api/design-systems` returned HTTP 200.
- Response included `toy-proposal-trade-desk` with source `built-in` and status `published`.

### Finding A3: UI Entry Must Stay Deferred

`[P2] (confidence: 8/10) docs/toy-productizer/PHASE1_WORK_PLAN.md — UI entry before daemon-backed plugin smoke would hide runtime gaps behind a product shell.`

Recommendation:

- Validate plugin and design-system resolution first.
- Add UI entry only if existing project/plugin entry cannot satisfy the first Toy Productizer Studio path.

## Code Quality Review

Verdict: PASS with one applied fix.

### What Is Good

- The implementation uses existing Open Design extension points rather than a new subsystem.
- The plugin package is self-contained and portable.
- The design system is a proposal contract, not a generic theme.
- The plan explicitly forbids adjacent CRM/RFQ/supplier/legal/production surfaces.

### Code Quality Finding C1: Runtime-binding Field Needed To Match Existing Local-skill Contract

This is the same underlying issue as A1. The correct local-skill contract is:

```json
{
  "compat": {
    "agentSkills": [{ "path": "./SKILL.md" }]
  },
  "od": {
    "context": {
      "skills": [{ "path": "./SKILL.md" }]
    }
  }
}
```

`compat.agentSkills` preserves packaging compatibility. `od.context.skills` makes the runtime prompt path explicit.

No broader refactor is needed.

## Test Review

Verdict: STATIC TESTS PASS, DEPENDENCY-BACKED TESTS BLOCKED.

### Static Checks Already Passing

```bash
node -e "const fs=require('fs'); for (const f of ['plugins/_official/scenarios/toy-productizer/open-design.json','plugins/_official/scenarios/toy-productizer/evals/evals.json','plugins/_official/scenarios/toy-productizer/evals/trigger-queries.json']) JSON.parse(fs.readFileSync(f,'utf8')); console.log('json ok')"
```

```text
json ok
```

```bash
node -e "const fs=require('fs'), path=require('path'); const manifestPath='plugins/_official/scenarios/toy-productizer/open-design.json'; const m=JSON.parse(fs.readFileSync(manifestPath,'utf8')); const base=path.dirname(manifestPath); for (const ref of m.compat.agentSkills) { const p=path.normalize(path.join(base, ref.path)); if (!fs.existsSync(p)) throw new Error('missing compat '+p); } for (const ref of m.od.context.skills) { const p=path.normalize(path.join(base, ref.path)); if (!fs.existsSync(p)) throw new Error('missing context skill '+p); } const ds=path.normalize(path.join(base,m.od.context.designSystem.path)); if (!fs.existsSync(ds)) throw new Error('missing '+ds); console.log('manifest references ok')"
```

```text
manifest references ok
```

```bash
node -e "const fs=require('fs'); const t=fs.readFileSync('design-systems/toy-proposal-trade-desk/DESIGN.md','utf8'); for (let i=1;i<=9;i++) if (!t.includes('## '+i+'.')) throw new Error('missing heading '+i); for (const label of ['Display:','Body:','Mono:']) if (!t.includes(label)) throw new Error('missing '+label); console.log('design system ok')"
```

```text
design system ok
```

```bash
node -e "const fs=require('fs'); const e=JSON.parse(fs.readFileSync('plugins/_official/scenarios/toy-productizer/evals/evals.json','utf8')); for (const item of e.evals) { if (!item.id) throw new Error('missing id'); if (!item.prompt) throw new Error(item.id+' missing prompt'); if (!item.expected_output) throw new Error(item.id+' missing expected_output'); if (!Array.isArray(item.assertions) || item.assertions.length===0) throw new Error(item.id+' missing assertions'); } console.log('eval structure ok')"
```

```text
eval structure ok
```

### Coverage Diagram

```text
CODE / CONTRACT PATHS                                  STATUS
[+] open-design.json
  ├── JSON parse                                      [STATIC PASS]
  ├── compat.agentSkills ./SKILL.md                   [STATIC PASS]
  ├── od.context.skills ./SKILL.md                    [STATIC PASS]
  ├── od.context.designSystem ref/path                [STATIC + DAEMON PASS]
  └── od.pipeline atom ids                            [STATIC PASS]

[+] SKILL.md
  ├── product boundary                                [STATIC PASS]
  ├── proposal structure                              [STATIC PASS]
  └── forbidden claims                                [STATIC PASS]

[+] DESIGN.md
  ├── 9 numbered sections                             [STATIC PASS]
  ├── font labels                                     [STATIC PASS]
  ├── proposal section contract                       [STATIC PASS]
  └── validation-only boundary                        [STATIC PASS]

[+] Daemon runtime
  ├── bundled plugin install/discovery                [DAEMON PASS]
  ├── plugin validate --no-daemon                     [PASS]
  ├── design-system registry listing                  [DAEMON PASS]
  ├── project create with plugin/design-system         [DAEMON PASS]
  └── agent artifact run with local SKILL + DESIGN.md [PENDING: needs selected agent]
```

### Dependency-backed Checks

Verified environment for this branch:

```text
node: v24.16.0 through /opt/homebrew/opt/node@24/bin
pnpm: 10.33.2
node_modules: installed with --frozen-lockfile
```

Repo requirement:

```text
node: ~24
pnpm: 10.33.2
```

Commands run:

```bash
pnpm guard
pnpm --filter @open-design/plugin-runtime typecheck
pnpm --filter @open-design/daemon build
node apps/daemon/bin/od.mjs plugin validate ./plugins/_official/scenarios/toy-productizer --no-daemon
```

Result:

- `pnpm guard` passed after adding the required structured design-system wrapper files.
- `pnpm --filter @open-design/plugin-runtime typecheck` passed.
- `pnpm --filter @open-design/daemon build` passed.
- `od plugin validate ... --no-daemon` passed with `ok=true` and no issues.

Daemon-backed checks run:

```bash
pnpm tools-dev run web --daemon-port 17456 --web-port 17573
```

With daemon running:

```bash
curl -s http://127.0.0.1:17456/api/plugins
curl -s http://127.0.0.1:17456/api/design-systems
node apps/daemon/bin/od.mjs project create \
  --daemon-url http://127.0.0.1:17456 \
  --name "Toy Productizer QA" \
  --plugin toy-productizer \
  --design-system toy-proposal-trade-desk \
  --inputs '{"prompt":"Create a concise RFQ-ready proposal for a STEM plush toy concept.","proposalLanguage":"auto"}' \
  --json
```

Result:

- `toy-productizer` appeared in plugins as `bundled`, `taskKind: new-generation`, `mode: live-artifact`, with `od.context.skills[{ path: "./SKILL.md" }]`.
- `toy-proposal-trade-desk` appeared in design systems as `built-in`, `published`.
- Project creation succeeded with project id `5da3c3cd-b264-474a-9acf-b5103e5fd508` and applied plugin snapshot `d0edb80d-043c-4a74-8454-8917057bfe9f`.

## Performance Review

Verdict: PASS for Phase 1.

Phase 1 adds static files and one plugin manifest. There are no new database queries, long-running loops, schedulers, background jobs, or network calls. Performance risk belongs to the existing agent run path and is not increased by this scope.

The only runtime cost added is extra prompt context:

- plugin-local `SKILL.md`
- active `DESIGN.md`
- plugin inputs and pipeline block

This is acceptable for Phase 1 because the value surface is proposal generation and the context is intentionally bounded.

## Work Breakdown

### Sequential Tasks

1. Static contract hardening
   - Goal: prove files are structurally correct and scope-safe.
   - Acceptance: JSON/design/eval/local-skill checks pass.

2. Dependency recovery
   - Goal: make repo checks executable.
   - Acceptance: Node `~24`, `pnpm@10.33.2`, `node_modules` present.

3. Package-level validation
   - Goal: prove TypeScript/runtime contracts compile.
   - Acceptance: `pnpm guard`, plugin-runtime typecheck, daemon build, plugin validate pass.

4. Daemon-backed launch smoke
   - Goal: prove plugin, design system, local skill, and artifact run path resolve together.
   - Acceptance: daemon lists plugin/design system, project create succeeds, `od run start` starts.

5. UI entry decision
   - Goal: decide if a minimal Studio entry is actually needed.
   - Acceptance: either no UI change required, or one small entry path with web typecheck and browser smoke.

### Parallelizable Tasks

Can run in parallel before dependency recovery:

- Product boundary audit across docs, SKILL, fixtures, and DESIGN.md.
- Manifest/eval static validation.
- Fixture quality and forbidden-claim audit.

Can run in parallel after dependency recovery:

- Plugin runtime typecheck / daemon build triage.
- Fixture/eval expansion if runtime validation exposes gaps.
- UI entry assessment in read-only mode.

Must remain sequential:

- daemon launch smoke after package validation.
- UI entry implementation after daemon smoke.
- final acceptance after all checks.

## NOT In Scope

- CRM: Phase 1 validates proposal generation, not customer pipeline management.
- RFQ/supplier outreach: Phase 1 prepares human-reviewed handoff notes only.
- Formal quotes/samples: forbidden because commercial facts are unverified.
- Legal/IP clearance: only similarity-risk screening language is allowed.
- Production feasibility guarantees: forbidden customer-visible claim.
- Marketplace publishing: not needed for bundled first-party scenario validation.
- Broad UI/navigation refactor: defer until runtime path is proven.
- General toy image generation: not part of Productizer Studio Phase 1.

## Final Technical Recommendation

Proceed to one real agent-backed artifact run next. The file-level architecture, dependency-backed checks, daemon plugin/design-system registry, and project-create path now pass. Phase 1 should not add UI scope until a selected local agent adapter proves:

- the run prompt includes the plugin-local SKILL.md and active DESIGN.md,
- the generated proposal respects no-plush, non-copy, validation-only, and forbidden-claim boundaries,
- generated proposal files persist as project artifacts.
