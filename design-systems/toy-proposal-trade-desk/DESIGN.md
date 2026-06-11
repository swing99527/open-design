# Toy Proposal Trade Desk

> Category: Professional & Corporate
> Customer proposal output contract for Toy Productizer Studio.

This design system is not a visual theme catalog. It is the proposal contract for Toy Productizer Studio artifacts.

## 1. Visual Theme & Atmosphere

Outputs should feel like a trade-desk proposal workspace: practical, structured, buyer-facing, and ready for human review.

- Style: restrained commercial proposal, not a playful toy poster.
- Primary artifact: customer-readable proposal with internal assumptions clearly labeled.
- Main hierarchy: task recap -> direction comparison -> recommendation -> proposal details -> assumptions -> feedback -> boundary.
- Avoid decorative toy styling that makes the proposal look like a consumer marketing page.

## 2. Color

Use neutral proposal colors with sparing commercial status accents.

```css
:root {
  --bg: #F7F8FA;
  --surface: #FFFFFF;
  --surface-warm: #FFF7E6;
  --fg: #15171A;
  --fg-2: #2F3744;
  --muted: #5B6472;
  --border: #D8DDE6;
  --border-soft: #E9EDF3;
  --accent: #2157A8;
  --success: #0F766E;
  --warn: #9A5B00;
  --danger: #B42318;
}
```

- Use `--accent` for selected direction and key headings.
- Use `--warn` and `--surface-warm` for unconfirmed commercial assumptions.
- Use `--border-soft` for validation-only labels.
- Do not use visual treatment that implies quotation, production, or legal approval.

## 3. Typography

Proposal language should be concise, commercial, and easy to scan.

Font labels for catalog extraction:

Display: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif
Body: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif
Mono: "JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace

- Proposal title: clear customer/task title, not a slogan.
- Section headings: literal labels matching the required proposal sections.
- Tables: short phrases; no hidden internal reasoning.
- Assumption labels: prefix with `Unconfirmed:` or `未确认:`.
- Boundary label: use the exact validation-only boundary unless the user needs a faithful translation.

## 4. Spacing

Use a dense but readable 8px rhythm.

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}
```

- Group each required section as a clear block.
- Direction comparison tables should remain compact enough for sales review.
- Keep feedback questions close to assumptions and boundary text.

## 5. Layout & Composition

Required proposal structure:

1. Customer / task recap
2. Creative direction comparison
3. Recommended direction and rationale
4. Product story
5. SKU / lineup
6. CMF / packaging direction
7. Customer-facing selling points
8. Commercial assumptions with unconfirmed labels
9. Feedback questions
10. Validation-only boundary

Direction comparison format:

- Use a table with 2-4 directions.
- Include product form, buyer/channel fit, differentiation, and key risk.
- Highlight one recommended direction only after comparison.

SKU / lineup format:

- State core SKU first.
- Optional variants must explain why they help buyer validation.
- Do not imply MOQ, lead time, tooling, sample, or quote readiness.

Customer-visible vs internal-only:

- Customer-visible: proposal sections, assumptions, feedback questions, validation boundary.
- Internal-only: risk score, handoff maturity, cost speculation, supplier status, internal debate.

## 6. Components

Use simple proposal components:

- Direction comparison table
- Recommendation callout
- Unconfirmed assumption badge
- Feedback question list
- Validation-only boundary box
- Version note

```css
.proposal-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.assumption-badge {
  background: var(--surface-warm);
  color: var(--warn);
  border: 1px solid rgba(154, 91, 0, 0.24);
  border-radius: var(--radius-sm);
  padding: 2px 6px;
  font-weight: 650;
}

.boundary-box {
  background: var(--border-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  color: var(--muted);
}
```

Feedback questions:

- Ask 3-5 questions.
- Prefer buyer-decision questions over long surveys.
- Do not ask for supplier, quote, sample, or production commitment unless the user is explicitly preparing a human-reviewed handoff.

## 7. Motion & Interaction

Proposal artifacts should favor stability over motion.

- Version changes may show a short changed-section summary.
- Direction selection can use a subtle highlight.
- Handoff or share actions require explicit user confirmation.
- Do not animate boundary labels away or hide unconfirmed assumption tags.

```css
@media (prefers-reduced-motion: reduce) {
  .direction-card,
  .proposal-section {
    transition: none;
  }
}
```

## 8. Voice & Brand

Tone rules:

- Chinese: professional, concrete, trade-facing, and customer-readable. Avoid overwrought marketing idioms.
- English: concise buyer proposal language. Use "unconfirmed" for assumptions and "human review" for boundary language.
- Bilingual: preserve the same section structure in both languages; do not add new claims in only one language.

CMF / packaging language:

- Describe material, finish, color, display, and packaging direction as assumptions or directions.
- Use "material assumption", "packaging direction", "target retail assumption", and "human review required" where relevant.

Default boundary label:

```text
AI draft. For market validation only. Requires human review before sample, quotation, public listing, or production. Similarity risk screen only, not legal clearance.
```

Chinese faithful boundary:

```text
AI 草案，仅用于市场验证。打样、报价、公开上架或生产前需要人工审核。仅为相似风险筛查，不构成法律清查。
```

## 9. Anti-patterns

Forbidden customer-visible claims:

- supplier-ready
- quotation-ready
- production-ready
- final design
- infringement-safe
- 无侵权
- 可直接量产
- 正式报价

Do not:

- present the proposal as a quote, RFQ, sample request, legal clearance, or production decision
- hide the validation-only boundary
- hide unconfirmed labels on price, SKU, packaging, material, compliance, or channel assumptions
- show internal cost, supplier, risk-score, or readiness details in customer-visible content
- let category drift violate hard constraints such as "no plush" or "不要毛绒"
- expand feedback questions beyond 5 unless the user asks for an internal worksheet
