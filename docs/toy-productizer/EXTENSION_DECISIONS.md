# Productizer Studio — Post-V0 Extension Decisions

> Status: extension rulings appendix. This document records architecture rulings for **post-V0 extension surfaces** discussed after `PRODUCTIZER_CORE_ARCHITECTURE_DECISION.md` was frozen. It does **not** modify any V0 scope, gate, or schema decision in that document. All V0 implementation work continues to be governed solely by `PRODUCTIZER_CORE_ARCHITECTURE_DECISION.md`.
>
> Label conventions (same as the core decision document):
> - **[SOURCE]** — verified against files in this branch of `swing99527/open-design`.
> - **[DECISION]** — binding architecture ruling for the extension, effective when that extension is started.
> - **[DEFERRED]** — explicitly out of V0 scope; do not implement until the stated trigger appears.

Referenced source files for this document:

- `apps/daemon/src/plugins/installer.ts`, `marketplaces.ts`, `publish.ts`, `trust.ts`, `registry.ts`, `bundled.ts`, `atoms.ts`
- `apps/daemon/src/db.ts` (media task migrations, `installed_plugins`, `plugin_marketplaces`)
- `plugins/_official/` (`scenarios/toy-productizer/`, `image-templates/`, `video-templates/`)
- `docs/plans/plugin-registry.md`
- `docs/toy-productizer/PRODUCTIZER_CORE_ARCHITECTURE_DECISION.md` (§3 object model, §5 domain contract, §7 scope violations)

---

## 1. Output-Side Extension: 3D Models and Product Explainer Videos

### 1.1 Ruling: media are version-pinned attachments, never new business objects

- **[DECISION]** 3D concept models and explainer videos attach to existing Core objects via the `extensions` JSON field — e.g. `extensions.assets: [{ kind: "model3d" | "video", ref: "<immutable snapshot ref>" }]` on `Direction` or `ProposalVersion`. No new tables, no new Core columns, no parallel asset object model.
- **[DECISION]** Version snapshots MUST include media references. "Which video shipped with the v1 proposal sent to customer A" must remain answerable after later patches; a version row pointing at a live media path is the same hollowing failure mode the core document forbids for proposal files.

### 1.2 Pipeline placement

- **[SOURCE]** The daemon already carries media-task migrations in `apps/daemon/src/db.ts`, and `plugins/_official/` ships `image-templates/` and `video-templates/`. Media generation infrastructure exists; nothing new is required at the Open Design layer.
- **[DECISION]** Layer impact when this extension starts:
  - Layer 1 (Open Design): no change beyond confirming live-artifact rendering of `<model-viewer>` / `<video>` embeds.
  - Layer 2 (Core): one additional guard — customer-visible exports containing media must carry the validation-only declaration on/alongside the media.
  - Layer 3 (Toy domain): new data files only (e.g. `visual-style.json` — toy renders must not look like photographed finished goods, which would imply production readiness; video script template).
  - Layer 4 (plugin): optional pipeline stages (`concept-visual`, `explainer-video`) after the proposal stage.
  - Layer 5 (runtime): no change. Agents draft prompts/scripts; media generation runs through the daemon media-task channel.
- **[DECISION]** Guard ordering is mandatory: **scripts and generation prompts pass forbidden-claims scanning as drafts before rendering**, not after. Text-level interception before expensive media generation; no agent may call a media provider directly to land a final asset.

### 1.3 Trigger and sequencing

- **[DEFERRED]** Do not build until pilot users produce a real signal ("buyers want to see it in 3D / a video would help the pitch"). When triggered, ship 3D before video (more direct deal-making value). Estimated shape: one pipeline stage + one domain data file + one guard rule + one viewer embed. Nothing in the V0 rulings needs to be reopened.

---

## 2. Input-Side Extension: External Data Sources (E-commerce Data, Market Research)

### 2.1 Ruling: external data normalizes into ContextItem, never a new source-of-truth

- **[DECISION]** All external data (marketplace sales data, research reports, trend signals) enters the system as `ContextItem` rows with `source` and `confidence` populated — e.g. `{ kind: "fact", source: "amazon-bsr", confidence: "high" }`. These two fields exist in the V0 schema precisely for this; no schema change is needed.
- **[DECISION]** Connectors live in Layer 2 as `apps/daemon/src/productizer/sources/` importers that emit ContextItem **drafts** through the same adoption pipeline (schema validation → SQLite → audit). No bypass path.
- **[DECISION]** `confidence` is assigned by daemon rules from domain data (e.g. `source-mapping.json`: official platform API = high, third-party scrape = medium), never self-declared by the payload — same discipline as feedback `credibilityTier`.
- **[DECISION]** External data never drives state transitions directly. A strong sales signal is context; locking a direction still requires the Action Card path.
- **[DECISION]** Agents never call external APIs. Data acquisition is a daemon connector concern; agents consume only the adopted context snapshot injected by the daemon (prompt-injection and provenance integrity both depend on this).

### 2.2 Three intake forms, in cost order

1. **Manual paste (V0, zero build).** User pastes data/conclusions into chat; agent drafts ContextItems; `source: "user-provided"`. Covers the pilot phase.
2. **File import (first connector worth building).** CSV/Excel upload (shop exports, customs data) → connector parses, normalizes per `source-mapping.json`, batch-drafts ContextItems, user confirms adoption. Trigger: a pilot user asks to feed in their own spreadsheet data.
3. **API pull (last).** Platform APIs (Amazon SP-API, 1688, Google Trends). Introduces credentials, quotas, freshness. **[DEFERRED]** until after pilot validation.

---

## 3. Community Surface

### 3.1 V0 ruling: hide by routing, change nothing

- **[DECISION]** The Productizer shell route renders no community/skills/plugins navigation. This is a shell-level routing switch — community code is neither deleted nor conditionally compiled. The generic Open Design entry keeps the full surface. ("Hide or bypass, not delete.")

### 3.2 Long-term ruling: community distributes domain packages, not forums

- **[DECISION]** The community-facing role for Productizer is distribution of three asset classes that are pure data/declaration: domain packages (taxonomy/rubric/forbidden-claims/templates), proposal design systems (`DESIGN.md`), and plugin scenarios (SKILL.md + pipeline + evals). All three already flow through existing plugin/design-system mechanisms.
- **[DECISION]** Community assets enter Layers 3–4 only (data and prompt). They may define rule **content** (e.g. a forbidden-claims list) but can never alter guard **execution** in Layer 2, add tables, or add routes. This is the security boundary that keeps community content from becoming an arbitrary-code channel.
- **[DECISION]** Compliance floor enforced by Core regardless of package origin: forbidden-claims list non-empty, validation-only declaration present. A community "industry pack" with an emptied claims file must fail loading.
- **[DEFERRED]** No Productizer-specific forum/comments/social system — that is the heavyweight-vertical-SaaS violation listed in the core document §7.

---

## 4. Distribution: Plugin Registry (verified mechanism)

This section upgrades the core document's "evaluate reusing the plugin registry later" stance to a confirmed ruling, based on direct source verification.

### 4.1 What exists today

- **[SOURCE]** `apps/daemon/src/plugins/installer.ts`: `od plugin install` accepts three source forms — local path, `github:owner/repo[@ref][/subpath]` (codeload tarball → unpack → local install path), and `https://…tar.gz`. Hard safety constraints: path-traversal rejection, symlink rejection, 50 MiB cap, no overwriting a different plugin id.
- **[SOURCE]** `registry.ts` + `db.ts`: installed plugins are rows in SQLite `installed_plugins` with `source_kind` and `trust`. `bundled.ts` pre-registers `plugins/_official/` content (including `scenarios/toy-productizer/`) as `source_kind='bundled'`, `trust='bundled'` — official packs are pre-installed cache, not user-root installs, and are not uninstallable.
- **[SOURCE]** `marketplaces.ts` + `trust.ts`: federated marketplace catalogs in `plugin_marketplaces`, three trust tiers (`official` / `trusted` / `restricted`); user-added catalogs default to `restricted` (discoverable, not directly installable) unless explicitly trusted.
- **[SOURCE]** `publish.ts`: `od plugin publish --to <catalog>` generates a PR deep link against the target catalog — publishing never writes a catalog directly; authors go through upstream review. Current open-design catalog target is the monorepo `plugins/community/<plugin-name>/`; a standalone `open-design/plugin-registry` repo is the planned long-term home (`docs/plans/plugin-registry.md` §1.2).

### 4.2 Ruling for domain package distribution

- **[DECISION]** Domain packages distribute **as plugin assets through this existing registry**, full stop. No new distribution infrastructure, no separate domain registry service. Mapping:
  - Official industry packs (toy, and any first-party additions) → `bundled` via `plugins/_official/`.
  - Partner/community industry packs → `github:`/tarball install or marketplace catalogs, defaulting to `restricted` trust.
  - Publishing → existing PR-reviewed `publish.ts` path; the upstream review step is where forbidden-claims/compliance review happens for community packs, layered on top of the Core loading floor in §3.2.
- **[DECISION]** The V0 hardcoded `domains/toy` loader remains untouched until a second real industry pack exists. The migration path at that point: domain loader resolves packages from the installed-plugin registry by asset type, with the §3.2 compliance floor as a load-time gate. No Core schema change is implied.

---

## 5. Relationship to the Core Decision Document

| Topic | Core document status | This document |
| --- | --- | --- |
| `extensions` JSON on Core objects | Defined as the only domain extension point (§3, §5) | Confirmed as the attachment point for media assets (§1) |
| `ContextItem.source` / `confidence` | Defined in the V0 schema (§3) | Confirmed as the intake contract for external data (§2) |
| Domain registry | Deferred; "evaluate reusing plugin registry" (§5) | Upgraded to confirmed: reuse plugin registry, mechanism verified in source (§4) |
| Community | Out of scope | Routing-level hide in V0; domain-package distribution long-term (§3) |
| V0 gates and Phase E scope | Governing | Unchanged; nothing here permits new V0 work |

None of the rulings above require reopening any §3 schema, §6 implementation checklist item, or §9 gate in `PRODUCTIZER_CORE_ARCHITECTURE_DECISION.md`.
