import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const dir = fileURLToPath(new URL('../dist/components/', import.meta.url));
for (const file of readdirSync(dir)) {
  if (!file.endsWith('.vue.d.ts')) {
    continue;
  }
  const path = join(dir, file);
  const source = readFileSync(path, 'utf8');
  writeFileSync(path, source.replaceAll('"@vue/runtime-core"', '"vue"'));
}
