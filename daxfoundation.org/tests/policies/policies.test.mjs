// The Privacy and Security Policies (v1.0, 2026-11-05): both languages carry the same
// sections, no placeholder survives, no forbidden wording, security.txt is valid and
// not about to expire, and the version in the data matches the changelog.
// Run: node --test views/daxfoundation/tests/policies/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { POLICY, PRIVACY, SECURITY, CHANGELOG } from '../../src/data/policies.js';

const FORBIDDEN = /camera|caméra|vid[ée]o|streaming|charit|incorporat|tax receipt|registered|claude|chatgpt|openai|anthropic|gemini|mediapipe|\{VERSION\}|\{DATE\}|\{NEXT\}/i;
const LEGAL_STATUS = /(non-profit|nonprofit|charity|incorporated|registered) (body|organi[sz]ation|foundation)/i;

for (const [name, doc] of [['privacy', PRIVACY], ['security', SECURITY]]) {
  test(name + ': English and French have the same sections, in the same order', () => {
    assert.deepEqual(doc.en.sections.map((s) => s.id), doc.fr.sections.map((s) => s.id));
    assert.equal(doc.en.short.length, doc.fr.short.length);
    for (const L of [doc.en, doc.fr]) for (const s of L.sections) assert.ok(s.h && s.html.trim().length > 40, name + ' ' + s.id);
  });
  test(name + ': no forbidden wording, no legal-status claim, no leftover placeholder', () => {
    const all = JSON.stringify(doc);
    const m = all.match(FORBIDDEN);
    assert.ok(!m, 'forbidden: ' + (m && m[0]));
    assert.ok(!LEGAL_STATUS.test(all), 'legal-status claim');
  });
  test(name + ': names the contact address and the version', () => {
    const all = JSON.stringify(doc);
    assert.ok(all.includes('dax@daxfoundation.org'));
    assert.ok(all.includes('version ' + POLICY.version) || all.includes('Version ' + POLICY.version) || all.includes('la version ' + POLICY.version));
  });
}

test('the changelog leads with the current version', () => {
  assert.equal(CHANGELOG[0].version, POLICY.version);
  assert.equal(CHANGELOG[0].date, POLICY.date);
  for (const c of CHANGELOG) assert.ok(c.en && c.fr);
});

test('the next review is after the current version, within a quarter', () => {
  const d = (s) => new Date(s + 'T00:00:00Z').getTime();
  const gap = (d(POLICY.nextReview) - d(POLICY.date)) / 86400000;
  assert.ok(gap > 0 && gap <= 93, 'next review ' + gap + ' days out');
});

test('security.txt follows RFC 9116 and is not about to expire', () => {
  const txt = readFileSync(new URL('../../public/.well-known/security.txt', import.meta.url), 'utf8');
  assert.match(txt, /^Contact: mailto:dax@daxfoundation\.org$/m);
  assert.match(txt, /^Canonical: https:\/\/daxfoundation\.org\/\.well-known\/security\.txt$/m);
  assert.match(txt, /^Policy: https:\/\/daxfoundation\.org\/security\/#disclosure$/m);
  const exp = txt.match(/^Expires: (.+)$/m);
  assert.ok(exp, 'Expires is required');
  const days = (Date.parse(exp[1]) - Date.now()) / 86400000;
  assert.ok(days > 30, 'security.txt expires in ' + Math.round(days) + ' days: renew it (POLICY-PROCESS.md)');
  assert.ok(days < 366, 'RFC 9116: Expires should be less than a year away');
});
