import { readFile } from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const toySkillPath = path.join(repoRoot, 'plugins', '_official', 'scenarios', 'toy-productizer', 'SKILL.md');

interface Question {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  options?: Array<string | { label: string; value: string }>;
}

interface QuestionFormBody {
  description: string;
  questions: Question[];
}

function extractQuestionForm(skillBody: string, title: string): QuestionFormBody {
  const openTag = `<question-form id="discovery" title="${title}">`;
  const openIndex = skillBody.indexOf(openTag);
  expect(openIndex).toBeGreaterThanOrEqual(0);
  const bodyStart = openIndex + openTag.length;
  const closeIndex = skillBody.indexOf('</question-form>', bodyStart);
  expect(closeIndex).toBeGreaterThan(bodyStart);
  return JSON.parse(skillBody.slice(bodyStart, closeIndex).trim()) as QuestionFormBody;
}

describe('Toy Productizer bundled scenario prompt contract', () => {
  it('ships a Toy-specific first-turn discovery form instead of generic design fields', async () => {
    const body = await readFile(toySkillPath, 'utf8');

    expect(body).toContain('## First-Turn Discovery Form Contract');
    expect(body).toContain('replace the generic Open Design "Quick brief — 30 seconds" form');

    const form = extractQuestionForm(body, 'Toy Productizer brief — 30 seconds');
    expect(form.questions.map((question) => question.id)).toEqual([
      'buyerBrief',
      'existingProduct',
      'targetChannel',
      'commercialBounds',
      'proposalLanguage',
    ]);
    expect(form.questions.find((question) => question.id === 'buyerBrief')?.required).toBe(true);
    expect(form.questions.find((question) => question.id === 'targetChannel')?.type).toBe('checkbox');

    const serializedForm = JSON.stringify(form);
    expect(serializedForm).not.toContain('What are we making?');
    expect(serializedForm).not.toContain('Target platform');
    expect(serializedForm).not.toContain('Visual tone');
    expect(serializedForm).not.toContain('Brand context');
    expect(serializedForm).not.toContain('Roughly how much?');
  });

  it('keeps the localized Chinese form on the same stable discovery ids', async () => {
    const body = await readFile(toySkillPath, 'utf8');
    const form = extractQuestionForm(body, 'Toy Productizer 快速简报 — 30 秒');

    expect(form.description).toContain('仅用于市场验证的客户提案');
    expect(form.questions.map((question) => question.id)).toEqual([
      'buyerBrief',
      'existingProduct',
      'targetChannel',
      'commercialBounds',
      'proposalLanguage',
    ]);
    expect(form.questions.map((question) => question.label)).toEqual([
      '买家需求 / 产品化任务',
      '已有产品或参考',
      '目标买家 / 渠道',
      '商业边界',
      '提案语言',
    ]);
  });
});
