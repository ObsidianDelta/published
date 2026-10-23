// EXP-4c scene checks: each scene's index.ts and fallback.ts must bundle with
// esbuild, come in under 60 KB, and contain "setProgress"; each folder must
// carry a README.md. node --test, no deps beyond esbuild (fetched via npx).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, statSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..'); // views/daxfoundation
const scenesDir = join(root, 'src', 'scenes');

const SCENES = ['swinging-leads', 'record', 'five-to-always'];
const MAX_BYTES = 60 * 1024;

const out = mkdtempSync(join(tmpdir(), 'scenes-4c-'));

function bundle(entry, outfile) {
  execFileSync(
    'npx',
    ['-y', 'esbuild', entry, '--bundle', '--format=esm', `--outfile=${outfile}`],
    { cwd: root, stdio: 'pipe' },
  );
  return readFileSync(outfile, 'utf8');
}

for (const scene of SCENES) {
  const dir = join(scenesDir, scene);

  test(`${scene}: has README.md`, () => {
    assert.ok(existsSync(join(dir, 'README.md')), `${scene}/README.md missing`);
  });

  for (const file of ['index.ts', 'fallback.ts']) {
    test(`${scene}/${file}: bundles, < 60 KB, has setProgress`, () => {
      const entry = join(dir, file);
      assert.ok(existsSync(entry), `${scene}/${file} missing`);
      const outfile = join(out, `${scene}-${file}.js`);
      const code = bundle(entry, outfile);
      const bytes = statSync(outfile).size;
      assert.ok(bytes < MAX_BYTES, `${scene}/${file} is ${bytes} bytes (>= ${MAX_BYTES})`);
      assert.ok(code.includes('setProgress'), `${scene}/${file} bundle lacks "setProgress"`);
    });
  }
}
