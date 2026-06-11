# Productizer Core Phase E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Productizer Core contracts, daemon persistence/routes/guards, and CLI parity without leaking toy-specific fields into Core.

**Architecture:** Productizer Core records validated business state in the existing daemon SQLite database while Open Design continues to generate/render/export artifacts. Core routes validate and record facts; they do not generate proposals. Domain-specific toy rules live in data files under a domain package and are consumed by Core guards.

**Tech Stack:** TypeScript, `@open-design/contracts`, Express routes in `apps/daemon`, `better-sqlite3`, Vitest, existing `od` CLI command map.

---

## Current Gate Status

- Phase A/B/C/D are complete on `productizer/toy-productizer-studio`.
- Current accepted evidence is in `docs/toy-productizer/PHASE1_REVIEW.md`.
- Phase C passed with the `gemini` adapter; `claude` is intentionally excluded from current acceptance.
- Phase F production UI remains blocked until Phase E HTTP + CLI parity exists.

## Important Dual-Track Constraint

`AGENTS.md` requires user-facing capabilities to land through HTTP, Web UI, and `od` CLI in the same PR. Phase E may be implemented in ordered branch commits, but the final merge-ready branch must not expose a user-facing `od productizer` capability without either:

- a minimal Productizer UI surface in the same PR, or
- an explicit PR explanation that a specific route is internal-only and not user-facing.

For this branch, treat E1/E2/E3 as implementation checkpoints. Do not call the work merge-ready until the dual-track checklist is satisfied.

## File Map

Create:

- `packages/contracts/src/productizer/types.ts` — domain-neutral Productizer Core object types.
- `packages/contracts/src/productizer/api.ts` — request/response DTOs for `/api/productizer/*`.
- `packages/contracts/tests/productizer-contract.test.ts` — contract shape and toy-leakage tests.
- `apps/daemon/src/productizer/persistence.ts` — `migrateProductizer(db)` plus row mapping helpers.
- `apps/daemon/src/productizer/store.ts` — SQLite write/read functions for Productizer Core.
- `apps/daemon/src/productizer/guards.ts` — differentiation, forbidden-claim, readiness, and snapshot guards.
- `apps/daemon/src/productizer/routes.ts` — Express route registration.
- `apps/daemon/src/productizer/domains/toy/*.json` and `*.md` — V0 toy domain data only.
- `apps/daemon/tests/productizer-routes.test.ts` — HTTP route and guard coverage.
- `apps/daemon/tests/cli-productizer.test.ts` — CLI JSON parity.

Modify:

- `packages/contracts/src/index.ts` — export Productizer contracts.
- `apps/daemon/src/db.ts` — import and invoke `migrateProductizer(db)` inside existing `migrate(db)`.
- `apps/daemon/src/server.ts` — import and register Productizer routes.
- `apps/daemon/src/cli.ts` — register `productizer` in `SUBCOMMAND_MAP` and add CLI runner.
- `docs/toy-productizer/PRODUCTIZER_CORE_ARCHITECTURE_DECISION.md` — keep gate status current if implementation changes decisions.

Do not modify yet:

- `apps/web/src/**` except for a later F0/F1 UI checkpoint.
- `plugins/_official/scenarios/toy-productizer/**` unless a guard/test proves the prompt contract is wrong.
- `design-systems/toy-proposal-trade-desk/**` unless artifact acceptance proves a render contract bug.

---

## Task E1: Contracts

**Files:**
- Create: `packages/contracts/src/productizer/types.ts`
- Create: `packages/contracts/src/productizer/api.ts`
- Modify: `packages/contracts/src/index.ts`
- Test: `packages/contracts/tests/productizer-contract.test.ts`

- [ ] **Step 1: Write the failing contract test**

Create `packages/contracts/tests/productizer-contract.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type {
  ProductizerActionCard,
  ProductizerDirection,
  ProductizerFeedbackEvent,
  ProductizerProjectSummaryResponse,
} from '../src/index.js';

describe('productizer contracts', () => {
  it('keeps core direction fields domain-neutral', () => {
    const direction: ProductizerDirection = {
      id: 'dir_1',
      projectId: 'proj_1',
      title: 'Checkout collectible',
      summary: 'Small counter-display product line.',
      differentiation: 'Uses a new story and silhouette instead of copying the reference.',
      risks: ['Unconfirmed price band'],
      status: 'draft',
      extensions: { domainSpecific: true },
      createdAt: '2026-06-11T00:00:00.000Z',
      updatedAt: '2026-06-11T00:00:00.000Z',
    };

    expect(Object.keys(direction).join(' ')).not.toMatch(/toy|玩具/i);
    expect(direction.extensions).toEqual({ domainSpecific: true });
  });

  it('models feedback credibility as daemon-assigned state', () => {
    const feedback: ProductizerFeedbackEvent = {
      id: 'fb_1',
      projectId: 'proj_1',
      sourceLabel: 'buyer email',
      verbatim: 'Can you send the revised proposal?',
      strength: 'medium',
      credibilityTier: 'medium',
      createdAt: '2026-06-11T00:00:00.000Z',
    };

    expect(feedback.credibilityTier).toBe('medium');
  });

  it('models action cards as Productizer state, not run tool results', () => {
    const card: ProductizerActionCard = {
      id: 'card_1',
      projectId: 'proj_1',
      type: 'lock_direction',
      status: 'open',
      payload: { directionId: 'dir_1' },
      createdAt: '2026-06-11T00:00:00.000Z',
    };

    expect(card).not.toHaveProperty('toolUseId');
    expect(card).not.toHaveProperty('runId');
  });

  it('exports API response types from the contracts barrel', () => {
    const response: ProductizerProjectSummaryResponse = {
      projectId: 'proj_1',
      binding: null,
      counts: {
        contextItems: 0,
        directions: 0,
        proposals: 0,
        feedbackEvents: 0,
        openActionCards: 0,
      },
      readiness: 'exploring',
    };

    expect(response.readiness).toBe('exploring');
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
PATH="/opt/homebrew/opt/node@24/bin:$PATH" pnpm --filter @open-design/contracts exec vitest run tests/productizer-contract.test.ts
```

Expected: FAIL because the Productizer contract files do not exist.

- [ ] **Step 3: Add `types.ts`**

Create `packages/contracts/src/productizer/types.ts`:

```ts
export type ProductizerReadiness = 'exploring' | 'in_review' | 'handoff_ready';

export interface ProductizerProjectBinding {
  id: string;
  projectId: string;
  domainId: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductizerContextKind = 'fact' | 'constraint' | 'assumption' | 'risk' | 'missing';
export type ProductizerContextSource = 'user' | 'agent' | 'feedback' | 'import' | 'unknown';
export type ProductizerConfidence = 'low' | 'medium' | 'high';

export interface ProductizerContextItem {
  id: string;
  projectId: string;
  kind: ProductizerContextKind;
  source: ProductizerContextSource;
  content: string;
  confidence: ProductizerConfidence;
  createdAt: string;
}

export interface ProductizerDirection {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  differentiation: string;
  risks: string[];
  status: 'draft' | 'locked' | 'rejected';
  extensions?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductizerProposal {
  id: string;
  projectId: string;
  title: string;
  language: string;
  artifactPath: string;
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
  guardStatus: 'passed' | 'blocked';
  guardMessages: string[];
  createdAt: string;
}

export interface ProductizerFeedbackEvent {
  id: string;
  projectId: string;
  sourceLabel: string;
  verbatim: string;
  strength: 'weak' | 'medium' | 'strong';
  credibilityTier: 'low' | 'medium' | 'confirmed';
  createdAt: string;
}

export interface ProductizerActionCard {
  id: string;
  projectId: string;
  type: 'lock_direction' | 'export_proposal' | 'mark_handoff_ready';
  status: 'open' | 'confirmed' | 'dismissed';
  payload: Record<string, unknown>;
  createdAt: string;
  resolvedAt?: string;
}

export interface ProductizerAuditEvent {
  id: string;
  projectId: string;
  actor: 'user' | 'daemon' | 'agent';
  action: string;
  subjectKind: string;
  subjectId: string;
  detail: Record<string, unknown>;
  createdAt: string;
}
```

- [ ] **Step 4: Add `api.ts`**

Create `packages/contracts/src/productizer/api.ts`:

```ts
import type {
  ProductizerActionCard,
  ProductizerContextItem,
  ProductizerDirection,
  ProductizerFeedbackEvent,
  ProductizerProjectBinding,
  ProductizerProposalVersion,
  ProductizerReadiness,
} from './types.js';

export interface ProductizerProjectSummaryResponse {
  projectId: string;
  binding: ProductizerProjectBinding | null;
  counts: {
    contextItems: number;
    directions: number;
    proposals: number;
    feedbackEvents: number;
    openActionCards: number;
  };
  readiness: ProductizerReadiness;
}

export interface BindProductizerProjectRequest {
  domainId: string;
}

export interface BindProductizerProjectResponse {
  binding: ProductizerProjectBinding;
}

export interface CreateProductizerDirectionRequest {
  title: string;
  summary: string;
  differentiation: string;
  risks?: string[];
  extensions?: Record<string, unknown>;
}

export interface ProductizerDirectionsResponse {
  directions: ProductizerDirection[];
}

export interface ProductizerContextResponse {
  contextItems: ProductizerContextItem[];
}

export interface CreateProductizerFeedbackRequest {
  sourceLabel: string;
  verbatim: string;
  strength: 'weak' | 'medium' | 'strong';
}

export interface ProductizerFeedbackResponse {
  feedbackEvents: ProductizerFeedbackEvent[];
}

export interface ProductizerActionCardsResponse {
  actionCards: ProductizerActionCard[];
}

export interface ConfirmProductizerActionCardRequest {
  action?: ProductizerActionCard['type'];
}

export interface ProductizerActionCardResponse {
  actionCard: ProductizerActionCard;
  readiness: ProductizerReadiness;
}

export interface ProductizerProposalVersionsResponse {
  versions: ProductizerProposalVersion[];
}
```

- [ ] **Step 5: Export from the barrel**

Modify `packages/contracts/src/index.ts`:

```ts
export * from './productizer/types.js';
export * from './productizer/api.js';
```

- [ ] **Step 6: Run contract checks**

Run:

```bash
PATH="/opt/homebrew/opt/node@24/bin:$PATH" pnpm --filter @open-design/contracts exec vitest run tests/productizer-contract.test.ts
PATH="/opt/homebrew/opt/node@24/bin:$PATH" pnpm --filter @open-design/contracts typecheck
```

Expected: both commands pass.

---

## Task E2: Daemon Persistence, Domain Data, and Guards

**Files:**
- Create: `apps/daemon/src/productizer/persistence.ts`
- Create: `apps/daemon/src/productizer/store.ts`
- Create: `apps/daemon/src/productizer/guards.ts`
- Create: `apps/daemon/src/productizer/domains/toy/domain.json`
- Create: `apps/daemon/src/productizer/domains/toy/forbidden-claims.json`
- Create: `apps/daemon/src/productizer/domains/toy/credibility-rules.json`
- Modify: `apps/daemon/src/db.ts`
- Test: `apps/daemon/tests/productizer-routes.test.ts`

- [ ] **Step 1: Write persistence/guard tests first**

Create `apps/daemon/tests/productizer-routes.test.ts` with at least these cases:

```ts
import express from 'express';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { closeDatabase, insertProject, openDatabase } from '../src/db.js';
import { registerProductizerRoutes } from '../src/productizer/routes.js';

describe('productizer routes', () => {
  let tempDir: string;

  async function listen(app: express.Express) {
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>((resolve, reject) => {
      server.once('listening', () => resolve());
      server.once('error', reject);
    });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('no port');
    return { server, port: address.port };
  }

  beforeEach(() => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'od-productizer-'));
  });

  afterEach(() => {
    closeDatabase();
    rmSync(tempDir, { recursive: true, force: true });
  });

  function buildApp() {
    const db = openDatabase(tempDir, { dataDir: tempDir });
    insertProject(db, {
      id: 'proj_1',
      name: 'Productizer QA',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    const app = express();
    app.use(express.json());
    registerProductizerRoutes(app, { db, paths: { RUNTIME_DATA_DIR: tempDir } } as any);
    return { app, db };
  }

  it('binds a project exactly once', async () => {
    const { app } = buildApp();
    const { server, port } = await listen(app);
    try {
      const first = await fetch(`http://127.0.0.1:${port}/api/productizer/projects/proj_1/bind`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ domainId: 'toy' }),
      });
      expect(first.status).toBe(201);

      const second = await fetch(`http://127.0.0.1:${port}/api/productizer/projects/proj_1/bind`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ domainId: 'toy' }),
      });
      expect(second.status).toBe(200);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('rejects directions without differentiation', async () => {
    const { app } = buildApp();
    const { server, port } = await listen(app);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/productizer/projects/proj_1/directions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: 'Direction', summary: 'Summary', differentiation: '' }),
      });
      expect(res.status).toBe(422);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
```

- [ ] **Step 2: Run the failing route test**

Run:

```bash
PATH="/opt/homebrew/opt/node@24/bin:$PATH" pnpm --filter @open-design/daemon exec vitest run -c vitest.config.ts tests/productizer-routes.test.ts
```

Expected: FAIL because `registerProductizerRoutes` does not exist.

- [ ] **Step 3: Add migration entry point**

Create `apps/daemon/src/productizer/persistence.ts` with `migrateProductizer(db)` and eight `CREATE TABLE IF NOT EXISTS` statements matching `PRODUCTIZER_CORE_ARCHITECTURE_DECISION.md` §6.2. Include indexes on `project_id` for all project-scoped tables.

Modify `apps/daemon/src/db.ts`:

```ts
import { migrateProductizer } from './productizer/persistence.js';
```

and inside `migrate(db)` after `migratePlugins(db)`:

```ts
migrateProductizer(db);
```

- [ ] **Step 4: Add store functions**

Create `apps/daemon/src/productizer/store.ts` with focused functions:

```ts
export function bindProductizerProject(db, input): ProductizerProjectBinding;
export function getProductizerProjectSummary(db, projectId: string): ProductizerProjectSummaryResponse;
export function createProductizerDirection(db, input): ProductizerDirection;
export function listProductizerDirections(db, projectId: string): ProductizerDirection[];
export function createProductizerFeedback(db, input): ProductizerFeedbackEvent;
export function listProductizerFeedback(db, projectId: string): ProductizerFeedbackEvent[];
export function listProductizerActionCards(db, projectId: string): ProductizerActionCard[];
export function confirmProductizerActionCard(db, input): ProductizerActionCard;
```

Do not parse chat messages or artifact files as a fact source in these functions.

- [ ] **Step 5: Add guards**

Create `apps/daemon/src/productizer/guards.ts`:

```ts
export function assertDifferentiation(value: string): void;
export function mapFeedbackCredibility(strength: 'weak' | 'medium' | 'strong'): 'low' | 'medium' | 'confirmed';
export function scanForbiddenClaims(content: string, claims: string[]): string[];
export function canMarkHandoffReady(events: ProductizerFeedbackEvent[]): boolean;
```

Required behavior:

- empty or whitespace-only differentiation throws a 422-shaped error;
- `weak -> low`, `medium -> medium`, `strong -> confirmed`;
- forbidden-claims scan is case-insensitive;
- handoff-ready requires at least one `medium` or `confirmed` credibility event.

- [ ] **Step 6: Run daemon tests**

Run:

```bash
PATH="/opt/homebrew/opt/node@24/bin:$PATH" pnpm --filter @open-design/daemon exec vitest run -c vitest.config.ts tests/productizer-routes.test.ts
```

Expected: route tests pass.

---

## Task E3: HTTP Routes

**Files:**
- Create/modify: `apps/daemon/src/productizer/routes.ts`
- Modify: `apps/daemon/src/server.ts`
- Test: `apps/daemon/tests/productizer-routes.test.ts`

- [ ] **Step 1: Register minimal routes**

Routes for the first pass:

```text
GET  /api/productizer/projects/:projectId
POST /api/productizer/projects/:projectId/bind
GET  /api/productizer/projects/:projectId/directions
POST /api/productizer/projects/:projectId/directions
GET  /api/productizer/projects/:projectId/feedback
POST /api/productizer/projects/:projectId/feedback
GET  /api/productizer/projects/:projectId/action-cards
POST /api/productizer/projects/:projectId/action-cards/:id/confirm
POST /api/productizer/projects/:projectId/action-cards/:id/dismiss
```

Keep proposal version routes in the same module if snapshot implementation is ready; otherwise leave them out of the first implementation commit and do not expose a CLI command for versions yet.

- [ ] **Step 2: Wire into `server.ts`**

Follow existing route registration style:

```ts
import { registerProductizerRoutes } from './productizer/routes.js';
```

Call it with the same dependency object pattern used by `registerRoutineRoutes`.

- [ ] **Step 3: Extend route tests**

Add cases:

```text
GET summary returns binding null and zero counts before bind
POST feedback maps strength to daemon-assigned credibilityTier
GET feedback returns appended feedback events
POST action-card confirm rejects handoff readiness without medium/confirmed feedback
each write appends an audit event
```

- [ ] **Step 4: Run route and build checks**

Run:

```bash
PATH="/opt/homebrew/opt/node@24/bin:$PATH" pnpm --filter @open-design/daemon exec vitest run -c vitest.config.ts tests/productizer-routes.test.ts
PATH="/opt/homebrew/opt/node@24/bin:$PATH" pnpm --filter @open-design/daemon build
```

Expected: both commands pass.

---

## Task E4: CLI Parity

**Files:**
- Modify: `apps/daemon/src/cli.ts`
- Test: `apps/daemon/tests/cli-productizer.test.ts`

- [ ] **Step 1: Write CLI tests with mocked `fetch`**

Create `apps/daemon/tests/cli-productizer.test.ts` following the style in `apps/daemon/tests/artifacts-cli.test.ts`. Test at minimum:

```text
od productizer bind --project proj_1 --domain toy --json
od productizer status --project proj_1 --json
od productizer directions list --project proj_1 --json
od productizer feedback add --project proj_1 --source buyer --strength medium --text "Asked for revision" --json
od productizer action-cards list --project proj_1 --json
od productizer action-cards confirm --project proj_1 --id card_1 --json
```

- [ ] **Step 2: Run failing CLI tests**

Run:

```bash
PATH="/opt/homebrew/opt/node@24/bin:$PATH" pnpm --filter @open-design/daemon exec vitest run -c vitest.config.ts tests/cli-productizer.test.ts
```

Expected: FAIL because `productizer` is not in `SUBCOMMAND_MAP`.

- [ ] **Step 3: Register `productizer` in `SUBCOMMAND_MAP`**

Modify `apps/daemon/src/cli.ts`:

```ts
productizer: runProductizer,
```

Implement `runProductizer(args)` near other command runners. Every command must support `--daemon-url` and `--json`. For long user text, `feedback add` should also accept `--text-file <path|->` if implementation scope allows; otherwise document it as the next CLI enhancement and do not claim `--prompt-file` support for feedback.

- [ ] **Step 4: Run CLI tests**

Run:

```bash
PATH="/opt/homebrew/opt/node@24/bin:$PATH" pnpm --filter @open-design/daemon exec vitest run -c vitest.config.ts tests/cli-productizer.test.ts tests/productizer-routes.test.ts
```

Expected: both files pass.

---

## Task E5: Merge-Ready Verification

**Files:**
- Modify if needed: `docs/toy-productizer/PHASE1_REVIEW.md`
- Modify if needed: `docs/toy-productizer/PRODUCTIZER_CORE_ARCHITECTURE_DECISION.md`

- [ ] **Step 1: Run focused checks**

Run:

```bash
PATH="/opt/homebrew/opt/node@24/bin:$PATH" pnpm --filter @open-design/contracts exec vitest run tests/productizer-contract.test.ts
PATH="/opt/homebrew/opt/node@24/bin:$PATH" pnpm --filter @open-design/daemon exec vitest run -c vitest.config.ts tests/productizer-routes.test.ts tests/cli-productizer.test.ts
PATH="/opt/homebrew/opt/node@24/bin:$PATH" pnpm --filter @open-design/daemon build
PATH="/opt/homebrew/opt/node@24/bin:$PATH" pnpm guard
```

Expected: all commands pass.

- [ ] **Step 2: Check domain-neutral Core**

Run:

```bash
rg -ni "toy|玩具|plush|毛绒" packages/contracts/src/productizer apps/daemon/src/productizer --glob '!**/domains/**'
```

Expected: no output.

- [ ] **Step 3: Check Phase F remains blocked**

Run:

```bash
test ! -d apps/web/src/components/productizer
```

Expected: exit 0 unless this branch intentionally includes the F0 minimal UI in the same merge-ready PR.

- [ ] **Step 4: Commit**

Commit checkpoints:

```bash
git add packages/contracts/src/productizer packages/contracts/src/index.ts packages/contracts/tests/productizer-contract.test.ts
git commit -m "feat: add Productizer core contracts"

git add apps/daemon/src/db.ts apps/daemon/src/productizer apps/daemon/src/server.ts apps/daemon/tests/productizer-routes.test.ts
git commit -m "feat: add Productizer daemon state routes"

git add apps/daemon/src/cli.ts apps/daemon/tests/cli-productizer.test.ts
git commit -m "feat: add Productizer CLI parity"
```

Expected: commits contain no co-author trailers.

---

## Agent Assignment

- **Architect Agent:** Review this plan against `PRODUCTIZER_CORE_ARCHITECTURE_DECISION.md`; block if Core schema or routes contain toy-specific fields.
- **Codex:** Implement E1-E4 in order, with tests before implementation.
- **Antigravity / UI Agent:** Do not implement production UI yet. It may refine `UI_UXD_VERTICAL_WORKSPACE_REVIEW.md` or prepare mock-only component notes, but must not wire Productizer UI into app routes before Phase E route + CLI parity passes.

## Stop Conditions

Stop and report instead of continuing if:

- a route or CLI command needs to generate proposals rather than record validated state;
- Productizer Core needs an industry-specific column;
- action-card confirmation requires `/api/runs/:id/tool-result`;
- implementation needs a new database/service/process;
- a test requires importing `apps/daemon/src/**` from `apps/web/**`;
- Phase F UI wiring is requested before Phase E passes.
