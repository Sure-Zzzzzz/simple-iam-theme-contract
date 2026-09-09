import { readFile } from 'node:fs/promises';
import {
  exists,
  fail,
  git,
  packageMetadata,
  pnpm,
  registryPackageExists,
  registryVersionExists,
  semver,
  verifyPublishedFiles,
  verifyTarballConsumer,
  versionAtLeast
} from './release-support.mjs';

const metadata = await packageMetadata();
const tag = `v${metadata.version}`;
const packageManager = /^pnpm@(\d+\.\d+\.\d+)$/.exec(metadata.packageManager || '');

if (!metadata.name.startsWith('@sure-zzzzzz/') || !semver(metadata.version)) {
  fail('package name 或 version 不符合公开 npm 包规范。');
}
if (metadata.version.endsWith('-snapshot')) {
  fail('snapshot 版本仅用于本地开发，请先改为正式 SemVer 版本后再发布。');
}
if (!versionAtLeast(process.versions.node, '20.0.0')) {
  fail(`Node.js 必须为 20+，当前为 ${process.versions.node}。`);
}
if (!packageManager || !versionAtLeast(packageManager[1], '9.15.4')) {
  fail('packageManager 必须声明 pnpm@9.15.4 或更高版本。');
}
if (git(['branch', '--show-current']) !== 'main') {
  fail('只能从 main 分支发布。');
}
if (git(['status', '--porcelain'])) {
  fail('工作区或暂存区不干净，请先提交或处理当前变更。');
}
try {
  git(['fetch', 'origin', 'main', '--tags']);
} catch {
  fail('无法读取 origin/main，请先确认远端和网络连接。');
}
if (git(['rev-parse', 'HEAD']) !== git(['rev-parse', 'origin/main'])) {
  fail('本地 main 必须与 origin/main 完全一致。');
}
// 首发版本不写 CHANGELOG（README 为唯一事实标准）；后续版本必须携带。
const isFirstRelease = !(await registryPackageExists(metadata.name));
if (!isFirstRelease) {
  if (!await exists(`CHANGELOG.${metadata.version}.md`)) {
    fail(`缺少 CHANGELOG.${metadata.version}.md。`);
  }
  const changelog = await readFile(`CHANGELOG.${metadata.version}.md`, 'utf8');
  if (!changelog.startsWith(`# ${metadata.name.replace('@sure-zzzzzz/', '')} v${metadata.version} CHANGELOG`)) {
    fail('CHANGELOG 标题必须与包名和当前版本一致。');
  }
}
try {
  git(['rev-parse', '--verify', '--quiet', tag]);
  fail(`本地 tag ${tag} 已存在，npm 版本不可覆盖。`);
} catch (error) {
  if (`${error.message}`.startsWith('发布校验失败')) {
    throw error;
  }
}
try {
  git(['ls-remote', '--exit-code', '--tags', 'origin', `refs/tags/${tag}`]);
  fail(`远端 tag ${tag} 已存在，npm 版本不可覆盖。`);
} catch (error) {
  if (`${error.message}`.startsWith('发布校验失败')) {
    throw error;
  }
}
if (await registryVersionExists(metadata.name, metadata.version)) {
  fail(`${metadata.name}@${metadata.version} 已发布，npm 版本不可覆盖。`);
}
pnpm(['check'], { stdio: 'inherit' });
await verifyPublishedFiles(metadata);
await verifyTarballConsumer(metadata);
console.log(`发布预检通过：${metadata.name}@${metadata.version}`);
