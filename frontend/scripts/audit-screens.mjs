import fs from 'node:fs';
import assert from 'node:assert/strict';

const registry = fs.readFileSync(new URL('../src/routes/screenRegistry.ts', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const ids = [...registry.matchAll(/^\s+id: '([^']+)'/gm)].map(m => m[1]);
const paths = [...registry.matchAll(/^\s+path: '([^']+)'/gm)].map(m => m[1]);
assert.equal(ids.length, 30, 'Scholyx should register 30 screens');
assert.equal(new Set(ids).size, 30, 'Screen IDs must be unique');
assert.equal(new Set(paths).size, 30, 'Screen paths must be unique');
for (const id of ids) {
  assert.ok(app.includes(`activeScreenId === '${id}'`), `Missing render condition: ${id}`);
}
console.log(`PASS: ${ids.length} unique screens, unique paths and App.tsx render conditions.`);
console.log('NOTE: This static audit does not verify rendered appearance, user flows or accessibility.');
