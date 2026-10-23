import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const tokensPath = join(root, 'src/styles/tokens.json');
const cssPath = join(root, 'src/styles/tokens.css');

const tokens = JSON.parse(readFileSync(tokensPath, 'utf8'));

function resolveAlias(value) {
  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    return `var(--${value.slice(1, -1)})`;
  }
  return value;
}

const lines = [];
lines.push('/* DAX Foundation tokens, generated from src/styles/tokens.json; do not edit by hand */');
lines.push(':root {');

for (const token of tokens.color.tokens) {
  if (typeof token.value === 'string') {
    lines.push(`  --${token.name}: ${resolveAlias(token.value)};`);
  } else {
    lines.push(`  --${token.name}: ${resolveAlias(token.value.dark)};`);
  }
}

const { families, groups } = tokens.type;
lines.push(`  --font-display: ${families.display};`);
lines.push(`  --font-sans: ${families.sans};`);
lines.push(`  --font-mono: ${families.mono};`);

for (const group of groups) {
  for (const style of group.styles) {
    lines.push(`  --text-${style.name}-size: ${style.fontSize};`);
    lines.push(`  --text-${style.name}-line: ${style.lineHeight};`);
    lines.push(`  --text-${style.name}-weight: ${style.fontWeight};`);
    if (style.letterSpacing !== undefined) lines.push(`  --text-${style.name}-tracking: ${style.letterSpacing};`);
    if (style.textTransform !== undefined) lines.push(`  --text-${style.name}-transform: ${style.textTransform};`);
  }
}

for (const token of tokens.spacing.tokens) {
  lines.push(`  --${token.name}: ${token.value};`);
}

for (const token of tokens.radius.tokens) {
  lines.push(`  --${token.name}: ${token.value};`);
}

for (const token of tokens.size.tokens) {
  lines.push(`  --${token.name}: ${token.value};`);
}

for (const token of tokens.shadow.tokens) {
  lines.push(`  --${token.name}: ${token.value};`);
}

lines.push('  --bg: var(--ground);');
lines.push('  --fg: var(--ink);');
lines.push('  --muted: var(--ink-muted);');
lines.push('  --faint: var(--ink-faint);');
lines.push('}');

lines.push('[data-theme="light"] {');
for (const token of tokens.color.tokens) {
  if (typeof token.value === 'object' && token.value.light !== undefined) {
    lines.push(`  --${token.name}: ${resolveAlias(token.value.light)};`);
  }
}
lines.push('}');

writeFileSync(cssPath, lines.join('\n') + '\n');
console.log(`tokens.css written (${lines.length} lines)`);
