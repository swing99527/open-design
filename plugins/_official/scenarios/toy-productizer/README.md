# Toy Productizer Studio Plugin

Toy Productizer Studio is a first-party Open Design scenario for turning messy toy-business inputs into non-copy creative product directions and a customer proposal artifact.

It preserves Open Design's existing primitives:

- Project as the productization task boundary
- Plugin / Skill as the vertical agent contract
- Artifact as the durable customer proposal surface
- Design System as the proposal output contract
- CLI Agent Runtime for Codex and other local adapters
- local-first files and project storage

## Launch Path

Phase 1 uses the existing Open Design plugin and design-system mechanisms rather than a broad navigation refactor.

Use the scenario plugin:

```text
plugins/_official/scenarios/toy-productizer
```

Use the proposal design system:

```text
design-systems/toy-proposal-trade-desk/DESIGN.md
```

Headless or agent-driven usage should apply `toy-productizer` with the user brief as `prompt` and keep `proposalLanguage` on `auto` unless the customer context requires `zh`, `en`, or `bilingual`.

The intended Studio default for this branch is:

```text
Toy Productizer Studio
  -> toy-productizer scenario plugin
  -> toy-proposal-trade-desk design system
  -> Proposal Artifact workspace
```

## Scope

This plugin handles:

- buyer briefs, existing products, references, competitor links, market signals, and one-sentence product goals
- Working Context classification
- 2-4 creative product directions
- Chinese, English, or bilingual customer proposals
- chat-based proposal patches
- low/medium/high feedback strength recording
- validation-only handoff boundaries

It does not handle:

- CRM
- supplier outreach
- RFQ automation
- formal quotes
- sample request automation
- legal/IP clearance
- production feasibility guarantees
- marketplace publishing
- broad connector automation
- dashboard analytics
- general toy image generation

## Fixtures

The examples and evals cover:

- Chinese robot museum keychain happy path
- English US museum buyer happy path
- no-plush patch continuity
- weak feedback that must not advance readiness

Run plugin validation when the `od` CLI is available:

```bash
od plugin validate ./plugins/_official/scenarios/toy-productizer
```
