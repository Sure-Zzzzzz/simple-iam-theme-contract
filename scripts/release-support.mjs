import { execFileSync } from 'node:child_process';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const REGISTRY = 'https://registry.npmjs.org';

export function command(commandName, args, options = {}) {
  const output = execFileSync(commandName, args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options
  });
  return typeof output === 'string' ? output.trim() : '';
}

export async function packageMetadata() {
  return JSON.parse(await readFile(resolve(ROOT, 'package.json'), 'utf8'));
}

export function fail(message) {
  throw new Error(`发布校验失败：${message}`);
}

export function semver(version) {
  return /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(version);
}

export function versionAtLeast(actual, expected) {
  const actualParts = actual.split('.').map(Number);
  const expectedParts = expected.split('.').map(Number);
  for (let index = 0; index < expectedParts.length; index += 1) {
    if (actualParts[index] > expectedParts[index]) {
      return true;
    }
    if (actualParts[index] < expectedParts[index]) {
      return false;
    }
  }
  return true;
}

export async function exists(path) {
  try {
    await access(resolve(ROOT, path));
    return true;
  } catch {
    return false;
  }
}

export function git(args, options) {
  return command('git', args, options);
}

export function npm(args, options = {}) {
  return command(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    [...args, '--registry', REGISTRY],
    { shell: process.platform === 'win32', ...options }
  );
}

export function pnpm(args, options = {}) {
  return process.platform === 'win32'
    ? command('corepack.cmd', ['pnpm', ...args], { shell: true, ...options })
    : command('pnpm', args, options);
}

export async function registryPackageExists(name) {
  try {
    npm(['view', name, 'version', '--json']);
    return true;
  } catch (error) {
    const output = `${error.stdout || ''}${error.stderr || ''}`;
    if (output.includes('E404') || output.includes('404 Not Found')) {
      return false;
    }
    fail(`无法查询 npm 官方仓库中的 ${name}。`);
  }
}

export async function registryVersionExists(name, version) {
  try {
    npm(['view', `${name}@${version}`, 'version', '--json']);
    return true;
  } catch (error) {
    const output = `${error.stdout || ''}${error.stderr || ''}`;
    if (output.includes('E404') || output.includes('404 Not Found')) {
      return false;
    }
    fail(`无法查询 npm 官方仓库中的 ${name}@${version}。`);
  }
}

export function exportedPaths(exportsValue) {
  if (typeof exportsValue === 'string') {
    return [exportsValue];
  }
  if (!exportsValue || typeof exportsValue !== 'object') {
    return [];
  }
  return Object.values(exportsValue).flatMap(exportedPaths);
}

export function packagePaths(metadata) {
  const paths = [metadata.main, metadata.types, ...exportedPaths(metadata.exports)]
    .filter((value, index, values) => typeof value === 'string' && values.indexOf(value) === index)
    .map(value => value.replace(/^\.\//, ''));
  return paths;
}

export async function verifyTarballConsumer(metadata) {
  const tempDir = await mkdtemp(join(tmpdir(), 'simple-iam-theme-contract-consumer-'));
  let tarball;
  try {
    const output = npm(['pack', '--json']);
    const packages = JSON.parse(output);
    if (!Array.isArray(packages) || packages.length !== 1 || typeof packages[0].filename !== 'string') {
      fail('无法生成 npm 消费者验证压缩包。');
    }
    tarball = resolve(ROOT, packages[0].filename);
    await writeFile(join(tempDir, 'package.json'), JSON.stringify({ type: 'module' }));
    npm(['install', '--ignore-scripts', '--no-package-lock', tarball], { cwd: tempDir, stdio: 'inherit' });
    await writeFile(join(tempDir, 'consumer.ts'), `import { createLightThemePreference } from '${metadata.name}';\nconst preference = createLightThemePreference();\nconst mode: 'light' = preference.mode;\nvoid mode;\n`);
    command(process.execPath, [
      resolve(ROOT, 'node_modules/typescript/bin/tsc'),
      '--noEmit',
      '--module', 'NodeNext',
      '--moduleResolution', 'NodeNext',
      '--target', 'ES2022',
      'consumer.ts'
    ], { cwd: tempDir, stdio: 'inherit' });
    await writeFile(join(tempDir, 'consumer.mjs'), `import { readFile } from 'node:fs/promises';\nimport { createLightThemePreference } from '${metadata.name}';\nconst preference = createLightThemePreference();\nconst css = await readFile(new URL(import.meta.resolve('${metadata.name}/theme.css')), 'utf8');\nif (preference.mode !== 'light' || preference.contractVersion !== 1 || !css.includes('--iam-color-canvas')) {\n  throw new Error('npm 消费者验证失败：公开入口不符合预期。');\n}\n`);
    command(process.execPath, ['consumer.mjs'], { cwd: tempDir, stdio: 'inherit' });
  } finally {
    if (tarball) {
      await rm(tarball, { force: true });
    }
    await rm(tempDir, { recursive: true, force: true });
  }
}

export async function verifyPublishedFiles(metadata) {
  if (typeof metadata.main !== 'string' || typeof metadata.types !== 'string' || !metadata.exports) {
    fail('package.json 必须声明 main、types 和 exports。');
  }

  const output = npm(['pack', '--dry-run', '--json']);
  const packages = JSON.parse(output);
  if (!Array.isArray(packages) || packages.length !== 1 || !Array.isArray(packages[0].files)) {
    fail('无法读取 npm 制品文件清单。');
  }

  const names = packages[0].files.map(file => file.path).sort();
  const required = [...packagePaths(metadata), 'README.md', 'LICENSE', 'NOTICE', 'package.json'];
  for (const file of required) {
    if (!names.includes(file)) {
      fail(`npm 制品缺少 ${file}。`);
    }
  }

  const invalid = names.filter(file => !(
    file === 'README.md'
    || file === 'LICENSE'
    || file === 'NOTICE'
    || file === 'package.json'
    || file === 'src/theme.css'
    || /^dist\/.+/.test(file)
  ));
  if (invalid.length > 0) {
    fail(`npm 制品包含白名单外文件：${invalid.join('、')}。`);
  }
}
