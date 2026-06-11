# Toy Productizer Docs

This folder is a product-definition snapshot copied from `/Users/chenshangwei/code/toyDesignAgent`.

Use `BRANCH_BRIEF.md` for the Open Design adaptation scope.
Use `AGENT_WORK_SPLIT.md` for the Architect Agent, Antigravity, and Codex handoff prompts.
Use `NEXT_TASKS_PLAN.md` for the executable Phase A-F plan.
Use `product/TOY_MARKET_PRODUCTIZER_MRD.md` and `product/TOY_MARKET_PRODUCTIZER_PRD.md` for product source of truth.
Use `product/TOY_PRODUCTIZER_INTERACTION_SPEC.md` for the first-run and chat/artifact interaction model.
Use `product/TOY_COMMERCIALIZATION_PACK_SPEC.md` and `product/TOY_MARKET_VALIDATION_PLAYBOOK.md` for business objects, feedback, and handoff boundaries.

Do not treat these copied docs as a replacement for the upstream product-definition repository unless the team explicitly changes the source-of-truth process.

## Open Design Phase 1 Binding

Phase 1 adapts Open Design through existing plugin and design-system primitives instead of a broad navigation refactor.

- Scenario plugin: `plugins/_official/scenarios/toy-productizer`
- Proposal output contract: `design-systems/toy-proposal-trade-desk/DESIGN.md`
- Intended branch entry: `Toy Productizer Studio -> toy-productizer plugin -> toy-proposal-trade-desk design system -> Proposal Artifact workspace`

The branch should keep Open Design's Project, Plugin / Skill, Artifact, Design System, CLI Agent Runtime, and local-first storage primitives. It should not rename the product to Toy Design or expand V0 into CRM, RFQ, supplier outreach, legal/IP clearance, production feasibility, marketplace publishing, dashboard analytics, or general toy image generation.
