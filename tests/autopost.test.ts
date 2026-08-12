import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const AUTOPOST = resolve(ROOT, 'tools', 'autopost.mjs');

function runAutopost(args: string[], env: Record<string, string> = {}) {
  return execFileSync(process.execPath, [AUTOPOST, ...args], {
    cwd: ROOT,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    timeout: 120000,
  });
}

describe('blog auto-poster (offline deterministic path)', () => {
  let output: string;

  beforeAll(() => {
    // Deterministic: no AI, no image fetch, no live topic fetch.
    output = runAutopost(
      ['--date', '2026-08-11', '--dry-run', '--no-image', '--no-fetch'],
      { AUTO_POST_NO_AI: '1' }
    );
  });

  it('completes and validates a post', () => {
    expect(output).toContain('[validate] OK');
    expect(output).toContain('[DRY RUN]');
  });

  it('picks the seasonally-relevant UTI topic for Varsha / Independence Day', () => {
    expect(output).toContain('UTI & burning urine (Mootrakrichhra)');
    expect(output).toContain('Ritu Varsha');
    expect(output).toContain('Independence Day');
  });

  it('writes valid YAML frontmatter', () => {
    const fm = output.match(/---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '';
    expect(fm).toMatch(/slug: [a-z0-9-]+/);
    expect(fm).toMatch(/title: .+/);
    expect(fm).toMatch(/excerpt: .+/);
    expect(fm).toMatch(/category: (Ayurveda|Yoga|Nutrition|Lifestyle|Wellness)/);
    expect(fm).toMatch(/authorId: (dr-gor|dr-sharma)/);
    expect(fm).toMatch(/date: \d{4}-\d{2}-\d{2}/);
    expect(fm).toMatch(/readTime: \d+ min read/);
    expect(fm).toMatch(/image: \/images\/blog\/(posts\/.+\.(webp|jpg|png)|ayurveda\.svg)/);
  });

  it('includes the required safety sections', () => {
    expect(output).toMatch(/^## Who Should Use Care$/m);
    expect(output).toMatch(/^## The Bottom Line$/m);
  });

  it('uses at least 5 top-level ## sections', () => {
    const h2 = output.match(/^## /gm) || [];
    expect(h2.length).toBeGreaterThanOrEqual(5);
  });

  it('uses bold-led bullets (renderer requirement, no tables/links/italics)', () => {
    const body = output.split('---')[2] || '';
    expect(/^\s*\|/.test(body)).toBe(false);
    expect(/\[[^\]]+\]\(https?:/.test(body)).toBe(false);
  });

  it('writes at least 350 words (comparable to existing posts)', () => {
    const body = output.split('---')[2] || '';
    expect(body.split(/\s+/).filter(Boolean).length).toBeGreaterThanOrEqual(350);
  });
});