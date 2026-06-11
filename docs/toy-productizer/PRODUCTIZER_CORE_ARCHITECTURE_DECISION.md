# Productizer Core Architecture Decision

> Product: **Toy Productizer Studio**
> Branch: `swing99527/open-design` @ `productizer/toy-productizer-studio` (HEAD `3c29ce7e` at review time)
> Author role: Total System Architect (Lane 1, per `docs/toy-productizer/AGENT_WORK_SPLIT.md`)
> Status: **DECISION — binding for Phase E implementation unless superseded by a newer decision doc**
>
> Labeling convention used throughout:
> - **[SOURCE]** — fact verified by reading files on this branch (path cited inline).
> - **[DECISION]** — architecture ruling for the implementation agent to follow.
> - **[DEFERRED]** — explicitly out of V0; do not implement.

Boundary that every section below preserves:

```text
Productizer validates and records business state.
Open Design generates, renders, previews, and exports artifacts.
```

---

## 1. Source Audit Summary

All statements in this section are **[SOURCE]**, verified on this branch.

### 1.1 What exists and is correct

| Area | Evidence |
|---|---|
| Phase 1 plugin scaffold exists | `plugins/_official/scenarios/toy-productizer/` contains `open-design.json`, `SKILL.md`, `README.md`, `evals/evals.json`, `evals/trigger-queries.json`, and two example briefs (`examples/robot-museum-keychain/`, `examples/english-buyer-brief/`). Manifest declares `name: "toy-productizer"`, `title: "Toy Productizer Studio"`. |
| Proposal design system exists | `design-systems/toy-proposal-trade-desk/` is present and registered via the standard `design-systems/<id>/DESIGN.md` discovery convention. |
| `scenarios/` is an established convention | `plugins/_official/scenarios/` contains 12 bundled scenarios besides `toy-productizer` (e.g. `od-default`, `od-new-generation`, `od-plugin-authoring`). |
| `file-write` and `live-artifact` atoms are implemented | `apps/daemon/src/plugins/atoms.ts` lines 21 and 27: both entries carry `status: 'implemented'`. The catalog also implements `discovery-question-form`, `direction-picker`, `file-read`, `file-edit`, `critique-theater`, `patch-edit`, `handoff`, and more, with `isImplementedAtom(id)` as the runtime check. |
| Plugin apply pipeline is pure | `apps/daemon/src/plugins/apply.ts` header invariant: "Pure: no SQLite writes, no FS mutation, no network. Side effects belong to the caller." Inputs validate against `manifest.od.inputs`; missing required fields surface as 422. |
| Snapshot resolution is separate | `apps/daemon/src/plugins/resolve-snapshot.ts` (359 lines) resolves applied plugin snapshots; persistence lives in `apps/daemon/src/plugins/persistence.ts` (`migratePlugins`). |
| SQLite is the daemon's durable store | `apps/daemon/src/db.ts` (2023 lines): better-sqlite3, `openDatabase()`, a central `migrate(db)` plus **modular migration imports** — `migrateCritique` (`critique/persistence.js`), `migrateMediaTasks` (`media-tasks.js`), `migratePlugins` (`plugins/persistence.js`). Existing tables include `projects`, `templates`, `conversations`, `agent_sessions`, `messages`, `preview_comments`, `tabs`, `deployments`, `routines`, `routine_runs`. |
| Contracts package is a barrel of domain modules | `packages/contracts/src/index.ts` re-exports `api/*` DTO modules (projects, chat, artifacts, handoff, live-artifacts, …), `sse/*`, `prompts/*`, `design-systems/*`. Adding a `productizer` module follows the existing pattern exactly. |
| UI/CLI dual-track rule is binding | `AGENTS.md` requires every user-facing capability to land in both the web UI and the `od` CLI in the same change set. |

### 1.2 Corrections to the earlier remote review

`docs/toy-productizer/ARCHITECTURE_REVIEW.md` (written against baseline `dd77abb9`) contained two source-fact errors, already flagged by its correction note and by `docs/toy-productizer/NEXT_TASKS_PLAN.md` ("Current State"). This decision doc supersedes them:

1. **[SOURCE]** `plugins/_official/scenarios/` exists. Only `toy-productizer/` was absent on that baseline; it now exists (commit `f0399c16`).
2. **[SOURCE]** `file-write` and `live-artifact` are implemented atom ids in `apps/daemon/src/plugins/atoms.ts`. The earlier review inferred absence from missing folders under `plugins/_official/atoms/`; the atom catalog is code, not folders. The "Phase 1 atom gap" risk is **closed**.
3. **[DECISION]** Productizer Action Cards are daemon/API state, not Claude-specific `AskUserQuestion` state (see §3.7 and §6). The earlier review's suggestion to reuse the `tool-result` mechanism is downgraded to an optional interaction convenience.

### 1.3 What is still unproven

- **[SOURCE]** `docs/toy-productizer/PHASE1_REVIEW.md` records PARTIAL: `pnpm guard`, plugin-runtime typecheck, daemon build, plugin validation (`ok=true`), and the daemon-backed project-create path all pass — but **no real agent run has produced a proposal artifact yet** (Phase C of `NEXT_TASKS_PLAN.md` is pending).
- This is the single gate condition for the verdict in §9.

---

## 2. Final Product Boundary

**[DECISION]** — consistent with `docs/toy-productizer/AGENT_WORK_SPLIT.md` ("Shared Product Boundary") and `docs/toy-productizer/product/TOY_PRODUCTIZER_POSITIONING_BRIEF.md`.

| Layer | Owns | Never owns |
|---|---|---|
| **Open Design** (unchanged) | Project/files, plugin resolve+apply, agent runtime pool, artifact generation/render/preview/export, design-system discovery, daemon HTTP/SSE, SQLite infrastructure, CLI plumbing | Any productization business semantics |
| **Productizer Core** (new, domain-neutral) | Business fact records: project binding, context items, directions, proposal versions, feedback events, readiness, action cards, audit; validation guards; routes; CLI subcommands | Industry rule **content**; artifact generation; prompt orchestration |
| **Toy Domain Package** (new, data-only) | Taxonomy, non-copy rubric, proposal template sections, forbidden-claims lists, credibility rule parameters, UI copy | State machines, persistence logic, any executable code |
| **toy-productizer plugin** | Agent task contract (`SKILL.md`, manifest, atoms), injecting domain content into prompts | Business state (never) |
| **Agent runtime** | Constrained generation; emits **drafts** | Writing canonical state directly (never) |

Hard rules:

- Product name stays **Toy Productizer Studio**.
- V0 excludes CRM, RFQ, supplier outreach, quotation, sample automation, legal/IP clearance, marketplace publishing, and generic toy image generation (per `AGENT_WORK_SPLIT.md` and `NEXT_TASKS_PLAN.md` "NOT In Scope").
- No string `toy` (or any industry term) may appear in Productizer Core contracts, table schemas, route paths, or daemon shared code. Industry content lives only in domain package data files. Grep-clean is a review gate.

---

## 3. Productizer Core Object Model

**[DECISION]**, refining the draft types in `docs/toy-productizer/NEXT_TASKS_PLAN.md` Phase E (Task E1). Core objects, all domain-neutral:

### 3.1 ProductizerProjectBinding

Binds an existing Open Design project (`projects` table in `apps/daemon/src/db.ts`) to the Productizer domain. One binding per project. Fields: `id, projectId, domainId, createdAt, updatedAt`. **Do not** create a parallel project system.

### 3.2 ContextItem

`id, projectId, kind (fact|constraint|assumption|risk|missing), source (user|agent|feedback|import|unknown), content, confidence (low|medium|high), createdAt`. Append-mostly; superseding an item creates a new row plus an audit event rather than mutating in place (V0 may simply append).

### 3.3 Direction

`id, projectId, title, summary, differentiation, risks (json), status (draft|locked|rejected), extensions (json, optional), createdAt, updatedAt`.

- **Guard (daemon-enforced):** `differentiation` must be non-empty. This is the non-copy invariant's structural anchor — content quality comes from the domain rubric, but the field's existence is Core.
- `status` transitions to `locked` only through a confirmed `lock_direction` Action Card.
- Industry-specific attributes (e.g. age grade, CMF notes) go in `extensions`, populated per the domain package dictionary — never as Core columns.

### 3.4 ProposalMeta and ProposalVersion

The earlier plan's table sketch referenced `proposal_id` without a proposals table. **Ruling:** add a minimal meta row.

- `ProductizerProposal`: `id, projectId, title, language, artifactPath (live artifact root), createdAt, updatedAt`. One or few per project.
- `ProductizerProposalVersion`: `id, projectId, proposalId, version (int, monotonic per proposal), artifactRef, changedSections (json), createdAt`. Append-only.
- **`artifactRef` must point to an immutable snapshot** — a copied file (e.g. under the project's Productizer version directory) or a content-hash-addressed copy — never the live artifact path. This closes the "version hollowing" risk from `ARCHITECTURE_REVIEW.md` (a later patch must not silently rewrite history).

### 3.5 FeedbackEvent

`id, projectId, sourceLabel, verbatim, strength (weak|medium|strong), credibilityTier (low|medium|confirmed), createdAt`. Append-only. `credibilityTier` is assigned by the daemon from domain credibility rule parameters — never by the agent and never directly by the client payload.

### 3.6 ReadinessState

V0 keeps this **computed, not stored as a free-standing editable row**: the daemon evaluates one rule — *handoff-ready requires at least one feedback event with `credibilityTier` medium or confirmed* — at Action Card confirmation time. The confirmed `mark_handoff_ready` Action Card plus its audit event **is** the durable readiness record. A dedicated readiness table is deferred until the maturity model lands (post-V0).

### 3.7 ActionCard

`id, projectId, type (lock_direction | export_proposal | mark_handoff_ready), status (open|confirmed|dismissed), payload (json), createdAt, resolvedAt?`.

**Binding ruling (correction-driven):** Action Cards are **daemon/API state**.

- Created by the daemon at guard points (or on an agent's suggestion parsed from a run draft).
- Confirmed/dismissed only through Productizer routes (§6) or the CLI equivalent.
- The web chat surface may *render* an open Action Card inline (visually similar to the existing `AskUserQuestionCard` pattern), and a runtime that supports interactive tool results may *relay* the user's click — but the state transition is always the daemon route. No runtime-specific message format is part of the contract. This keeps Productizer runnable on any adapter in the agent pool and removes the Claude-only coupling risk recorded in `ARCHITECTURE_REVIEW.md`.

### 3.8 AuditEvent

`id, projectId, actor (user|daemon|agent), action, subjectKind, subjectId, detail (json), createdAt`. Append-only, written by the daemon as a side channel of every Productizer write. Not user-editable, not exposed in V0 UI beyond debugging.

### 3.9 Explicitly not an object

**[DECISION]** `Toy Commercialization Pack` (from `docs/toy-productizer/product/TOY_COMMERCIALIZATION_PACK_SPEC.md`) is **not persisted in V0**. It is a run-time assembly view the agent composes from ContextItems + Directions when drafting a proposal. Persisting it would create a second fact source competing with the objects above. Revisit only if a post-V0 use case needs a frozen pack snapshot.

---

## 4. SQLite vs Filesystem vs Memory Ownership

**[DECISION]**, anchored to the three storage classes documented in `docs/current-architecture-and-secondary-development.md` §4.2 and the actual `apps/daemon/src/db.ts` implementation.

| Fact | Store | Rationale |
|---|---|---|
| Project binding, ContextItems, Directions, ProposalMeta, ProposalVersions, FeedbackEvents, ActionCards, AuditEvents | **SQLite**, via the existing modular migration pattern (a `migrateProductizer(db)` registered in `migrate()` alongside `migrateCritique` / `migrateMediaTasks` / `migratePlugins` — **[SOURCE]** precedent in `db.ts` lines 12–14) | Durable business facts; queryable; survives runs |
| Proposal artifact content (markdown/html files) | **Open Design filesystem artifact store** (unchanged: project files + saved artifacts) | Preserves live preview, export, diff, and the generation pipeline; Productizer never re-implements artifact handling |
| Per-version immutable snapshot | **Filesystem copy referenced by `artifactRef`** in the SQLite version row | Version rows must not hollow out when the live artifact is patched (§3.4) |
| Run-in-progress agent drafts (unparsed direction JSON, unvalidated patches), SSE progress | **Daemon memory only** | Drafts are not facts; only daemon-validated records become rows |
| Chat transcript (`messages` table) | Stays exactly what it is — interaction record | **Never** parsed to reconstruct business state; every business write requires an explicit validated path |
| Domain package content | **Static data files** shipped in the repo (§5) | Data, not state |

Two prohibitions:

- No new database, no new service, no new daemon process. Productizer is routes + tables + guards inside the existing daemon.
- The web app never imports from `apps/daemon/src/**` (existing `AGENTS.md` boundary); it consumes Productizer state only through `/api/productizer/*`.

---

## 5. Domain Package Contract (Toy and Future Verticals)

**[DECISION]**

### 5.1 Shape

A domain package is a directory of data files plus one descriptor. For V0:

```text
apps/daemon/src/productizer/domains/toy/
  domain.json              # id, display names (i18n), composer placeholder/examples
  taxonomy.json            # category vocabulary
  rubric.md                # non-copy differentiation rubric (prompt-injected)
  proposal-template.md     # required proposal section list (mirrors design system contract)
  forbidden-claims.json    # per-language forbidden customer-visible claim strings
  credibility-rules.json   # parameters mapping feedback source/strength -> credibilityTier
```

The proposal section contract must stay consistent with `design-systems/toy-proposal-trade-desk/DESIGN.md` (the design system remains the render-side contract; the domain file is the validation-side contract).

### 5.2 Rules

1. **Domain packages are data.** No executable code, no state machine, no persistence logic. The Core guard engine (`guards.ts`) reads domain files; domain files never read anything.
2. **Core schema is closed; domains extend through `extensions`.** A domain may define a field dictionary for `Direction.extensions` / proposal section metadata, carried as JSON on Core rows. No domain may add columns or routes.
3. **V0 loads `domains/toy` hard-coded.** No domain registry, no hot-reload, no discovery API. The loader is one function with the domain id as input, so a future registry slots in without touching call sites.
4. **Plugin ↔ domain relationship:** the `toy-productizer` plugin (`plugins/_official/scenarios/toy-productizer/`) carries the prompt-facing copies of rubric/template/boundary language in `SKILL.md`; the daemon-side domain package carries the *enforcement* copies. V0 accepts this duplication (small, auditable) rather than building a shared loader; consolidation is a post-V0 refactor.

### 5.3 Future verticals (gift, homeware, fashion accessories, consumer-electronics accessories)

Path: copy `domains/toy/`, replace data, add the domain id to the loader, ship a sibling scenario plugin and design system. Acceptance test for the architecture (post-V0 Phase 8): a second domain requires **zero changes** to Core tables, routes, guards, or web shell components. The only thing that must be done *now* to keep this path open is naming discipline (§2) — everything else is deferred.

---

## 6. Minimal Phase E Daemon / Contracts / CLI Plan

**[DECISION]** — refines `NEXT_TASKS_PLAN.md` Tasks E1–E3. Every item below respects the `AGENTS.md` dual-track rule (route + CLI in the same change set).

### 6.1 Contracts (`packages/contracts`)

```text
packages/contracts/src/productizer/types.ts   # Core object types (§3), domain-neutral
packages/contracts/src/productizer/api.ts     # request/response DTOs for the routes below
packages/contracts/src/index.ts               # add two export lines (existing barrel pattern)
packages/contracts/tests/productizer-contract.test.ts
```

### 6.2 SQLite tables (one `migrateProductizer(db)`)

```sql
productizer_project_bindings(id, project_id, domain_id, created_at, updated_at)
productizer_context_items(id, project_id, kind, source, content, confidence, created_at)
productizer_directions(id, project_id, title, summary, differentiation, risks_json,
                       status, extensions_json, created_at, updated_at)
productizer_proposals(id, project_id, title, language, artifact_path, created_at, updated_at)
productizer_proposal_versions(id, project_id, proposal_id, version, artifact_ref,
                              changed_sections_json, created_at)
productizer_feedback_events(id, project_id, source_label, verbatim, strength,
                            credibility_tier, created_at)
productizer_action_cards(id, project_id, type, status, payload_json, created_at, resolved_at)
productizer_audit_events(id, project_id, actor, action, subject_kind, subject_id,
                         detail_json, created_at)
```

(Adds `productizer_proposals` and `productizer_audit_events` to the earlier sketch, per §3.4 and §3.8.)

### 6.3 Routes (`apps/daemon/src/productizer/routes.ts`, registered in `server.ts`)

```text
GET  /api/productizer/projects/:projectId                    # binding + summary counts
POST /api/productizer/projects/:projectId/bind               # { domainId }
GET  /api/productizer/projects/:projectId/context
GET  /api/productizer/projects/:projectId/directions
POST /api/productizer/projects/:projectId/directions         # validated draft adoption
GET  /api/productizer/projects/:projectId/proposals/:id/versions
POST /api/productizer/projects/:projectId/proposals/:id/versions   # records snapshot + guard result
GET  /api/productizer/projects/:projectId/feedback
POST /api/productizer/projects/:projectId/feedback            # daemon assigns credibilityTier
GET  /api/productizer/projects/:projectId/action-cards
POST /api/productizer/projects/:projectId/action-cards/:id/confirm
POST /api/productizer/projects/:projectId/action-cards/:id/dismiss
```

Guards executed inside these routes (in `apps/daemon/src/productizer/guards.ts`, reading domain files):

- direction creation rejects empty `differentiation`;
- proposal version creation runs the forbidden-claims scan against the snapshot content and records pass/block;
- `mark_handoff_ready` confirmation rejects when no medium/confirmed feedback exists;
- every write appends an audit event.

Notably **absent**: any generation route. Proposal generation continues through the existing run pipeline (`apply.ts` → runtime → artifact store); Productizer routes only validate and record.

### 6.4 CLI (`apps/daemon/src/cli.ts` subcommand map)

```text
od productizer bind          --project <id> --domain toy --json
od productizer status        --project <id> --json
od productizer directions list --project <id> --json
od productizer versions list --project <id> --proposal <id> --json
od productizer feedback add  --project <id> --source <label> --strength weak|medium|strong --text <t> --json
od productizer action-cards list    --project <id> --json
od productizer action-cards confirm --project <id> --id <id> --json
od productizer action-cards dismiss --project <id> --id <id> --json
```

### 6.5 Tests (minimum)

```text
apps/daemon/tests/productizer-routes.test.ts
  - bind creates exactly one binding
  - direction without differentiation -> 422
  - feedback strength maps to credibility tier via domain rules
  - handoff-ready confirm without medium+ feedback -> rejected
  - proposal version snapshot is immutable (re-read after live artifact change)
  - forbidden claim in snapshot -> version recorded as blocked
apps/daemon/tests/cli-productizer.test.ts        # --json parity with routes
packages/contracts/tests/productizer-contract.test.ts  # no industry terms in core type keys
```

---

## 7. Explicitly Not in V0

**[DEFERRED]** — implementing any of these in Phase E is a scope violation:

1. Persistent `Toy Commercialization Pack` object (§3.9).
2. Full readiness maturity model / readiness table (§3.6 — one rule only).
3. Domain registry, domain hot-reload, domain discovery API (§5.2).
4. Second industry implementation (gift/homeware/etc. — naming discipline only).
5. Concept-visual image generation inside proposals.
6. CRM, RFQ, supplier outreach, quotation, sampling, legal/IP clearance, marketplace flows.
7. Rich-text proposal editing (Tiptap/ProseMirror); modification stays chat-patch → new version.
8. Semantic forbidden-claims detection (string scan only; validation-only boundary label is the fallback).
9. Runtime-specific Action Card protocols (any `AskUserQuestion` coupling).
10. Broad UI work: the vertical workspace shell is Phase F, gated behind Phase E routes (per `AGENT_WORK_SPLIT.md` execution order). This document deliberately contains no UI plan.
11. New services, databases, auth systems, or admin backends.

---

## 8. Risks and Acceptance Criteria

### 8.1 Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | **Phase C still unproven** — no real agent run has produced a proposal artifact (**[SOURCE]** `PHASE1_REVIEW.md` PARTIAL). If generation quality or pipeline wiring fails, Core tables would record state for a product that doesn't work. | Phase E daemon/route work starts only after Phase C PASS (§9). Contracts-only work (E1) carries no such risk. |
| R2 | Version hollowing — `artifactRef` pointing at a live path | Immutability is a named test case (§6.5) |
| R3 | Toy leakage into Core | Contract test greps type keys; review gate greps `apps/daemon/src/productizer/*.ts` (excluding `domains/`) for industry terms |
| R4 | Chat/messages parsed as fact source | Routes are the only write path; review checklist item; web reads only `/api/productizer/*` |
| R5 | Action Card drift back to runtime-specific state | Contract states daemon routes are the sole transition mechanism (§3.7); CLI parity test enforces a runtime-free path |
| R6 | SKILL.md prompt copy and daemon domain files diverging (forbidden claims, sections) | Accepted V0 duplication (§5.2.4); add a doc note in both files pointing at each other; consolidate post-V0 |
| R7 | Migration mistakes in shared `db.ts` | New tables only, isolated in `migrateProductizer`; no ALTER on existing tables |

### 8.2 Phase E acceptance criteria

Phase E is complete when all of the following hold:

1. `pnpm --filter @open-design/contracts exec vitest run tests/productizer-contract.test.ts` passes; no industry terms in Core types.
2. `pnpm --filter @open-design/daemon exec vitest run -c vitest.config.ts tests/productizer-routes.test.ts tests/cli-productizer.test.ts` passes, covering every guard in §6.3.
3. On one real project: generate proposal (existing pipeline) → record version 1 → patch → record version 2 → `od productizer versions list --json` returns two versions whose snapshots differ and whose v1 snapshot is byte-identical to its creation-time content.
4. `od productizer feedback add --strength weak` produces a `low` credibility row, and `mark_handoff_ready` confirmation is rejected while it is the only feedback.
5. A seeded forbidden claim in a proposal snapshot causes the version to be recorded as blocked.
6. `grep -ri "toy" apps/daemon/src/productizer --include="*.ts" -l` returns only files under `domains/`.
7. `pnpm guard` and daemon build pass.

---

## 9. Verdict: Readiness to Start Phase E

**PARTIAL.**

- **Architecture readiness: PASS.** The object model, storage ownership, domain contract, route/CLI plan, and guard set above are fully specified, consistent with verified source structures (`db.ts` modular migrations, contracts barrel, pure `apply.ts`, implemented atom catalog), and contain no open design questions blocking implementation.
- **Process gate: NOT YET MET.** Per `AGENT_WORK_SPLIT.md` ("Phase E starts only after Codex returns Phase C PASS") and **[SOURCE]** `PHASE1_REVIEW.md`, the real agent artifact run (Phase C of `NEXT_TASKS_PLAN.md`) is still pending. Until one `od run start` with the `toy-productizer` plugin produces a proposal artifact that passes the required-section, no-plush, non-copy, and forbidden-claims checks, daemon tables and routes must not land.

Permitted to start immediately (no gate dependency, no runtime risk):

- **Task E1 (contracts only)**: `packages/contracts/src/productizer/types.ts`, `api.ts`, barrel exports, and the contract test. Pure types; reversible; unblocks daemon work the moment Phase C passes.

Blocked until Phase C PASS:

- **Task E2** (SQLite tables, routes, guards) and **Task E3** (CLI subcommands).

Single next action for the coordinator: have the implementation agent execute Phase C (Tasks C1–C4 in `NEXT_TASKS_PLAN.md`) and record the evidence block in `PHASE1_REVIEW.md`; then Phase E proceeds against this document without further architecture review.

---

> Post-V0 extension rulings (3D/video assets, external data sources, community surface, registry distribution) are recorded separately in `EXTENSION_DECISIONS.md`. They do not modify any scope, schema, or gate decision in this document.
