import { fail, git, npm, packageMetadata, pnpm } from './release-support.mjs';

const metadata = await packageMetadata();
const tag = `v${metadata.version}`;

pnpm(['release:verify'], { stdio: 'inherit' });
try {
  npm(['whoami']);
} catch {
  fail('尚未登录 npm，请先执行 npm login --registry=https://registry.npmjs.org 后重试。');
}

npm(['publish', '--access', 'public'], { stdio: 'inherit' });

try {
  git(['tag', '-a', tag, '-m', `发布 ${metadata.name}@${metadata.version}`]);
} catch {
  throw new Error(`npm 已发布 ${metadata.name}@${metadata.version}，但本地 tag 创建失败。请勿重新发布；确认本地 tag 状态后执行：git tag -a ${tag} -m "发布 ${metadata.name}@${metadata.version}" && git push origin main && git push origin ${tag}`);
}

try {
  git(['push', 'origin', 'main']);
} catch {
  throw new Error(`npm 已发布 ${metadata.name}@${metadata.version}，本地 ${tag} 已创建，但 main 推送失败。请勿重新发布；处理 Git 连接后执行：git push origin main && git push origin ${tag}`);
}

try {
  git(['push', 'origin', tag]);
} catch {
  throw new Error(`npm 已发布 ${metadata.name}@${metadata.version}，本地 ${tag} 已创建，但 tag 推送失败。请勿重新发布；处理 Git 连接后执行：git push origin ${tag}`);
}

console.log(`发布完成：${metadata.name}@${metadata.version}`);
