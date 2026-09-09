import { describe, expect, it } from 'vitest';
import {
  exists,
  exportedPaths,
  packageMetadata,
  packagePaths,
  semver,
  versionAtLeast
} from './release-support.mjs';

describe('本地发布脚手架基础规则', () => {
  it('识别 npm SemVer 和版本基线', () => {
    expect(semver('1.0.0')).toBe(true);
    expect(semver('1.2.3-beta.1+build.4')).toBe(true);
    expect(semver('1.0')).toBe(false);
    expect(semver('01.0.0')).toBe(false);
    expect(versionAtLeast('20.0.0', '20.0.0')).toBe(true);
    expect(versionAtLeast('22.1.0', '20.0.0')).toBe(true);
    expect(versionAtLeast('18.20.0', '20.0.0')).toBe(false);
  });

  it('递归收集公开 exports 并去重制品入口', () => {
    const metadata = {
      main: './dist/index.js',
      types: './dist/index.d.ts',
      exports: {
        '.': { import: './dist/index.js', types: './dist/index.d.ts' },
        './theme.css': './src/theme.css'
      }
    };

    expect(exportedPaths(metadata.exports)).toEqual([
      './dist/index.js',
      './dist/index.d.ts',
      './src/theme.css'
    ]);
    expect(packagePaths(metadata)).toEqual([
      'dist/index.js',
      'dist/index.d.ts',
      'src/theme.css'
    ]);
    expect(exportedPaths({
      './feature': { node: { import: './dist/feature.js' }, types: './dist/feature.d.ts' }
    })).toEqual(['./dist/feature.js', './dist/feature.d.ts']);
  });

  it('读取当前包元数据并校验文件存在性判断', async () => {
    const metadata = await packageMetadata();
    expect(metadata.name).toBe('@sure-zzzzzz/simple-iam-theme-contract');
    expect(metadata.version).not.toMatch(/-snapshot$/);
    expect(await exists('README.md')).toBe(true);
    expect(await exists('CHANGELOG.missing.md')).toBe(false);
  });
});
