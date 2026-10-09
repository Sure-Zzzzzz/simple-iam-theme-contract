import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * 通用样式族守护测试：断言 theme.css 持续提供已收录的样式族选择器。
 * 收编清单见 CHANGELOG.1.0.5.md；新增样式族时同步在此登记。
 */
const themeCss = readFileSync(resolve(__dirname, 'theme.css'), 'utf-8');

describe('theme.css 通用样式族', () => {
  it('状态徽章四态齐全', () => {
    expect(themeCss).toContain('.status-badge {');
    for (const tone of ['success', 'warning', 'danger', 'neutral']) {
      expect(themeCss).toContain(`.status-badge.${tone} {`);
    }
  });

  it('表格行内动作钮含 hover 与禁用态', () => {
    expect(themeCss).toContain('.table-action {');
    expect(themeCss).toContain('.table-action:hover:not(:disabled)');
    expect(themeCss).toContain('.table-action:disabled');
  });

  it('提示条 success/error 配色段在位', () => {
    expect(themeCss).toContain('.admin-message {');
    expect(themeCss).toContain('.admin-message.success');
    expect(themeCss).toContain('.admin-message.error');
  });

  it('数据卡双形态（surface/panel）在位', () => {
    expect(themeCss).toContain('.admin-data-surface {');
    expect(themeCss).toContain('.panel {');
  });

  it('空态卡容器在位', () => {
    expect(themeCss).toContain('.admin-empty-state {');
  });

  it('键值详情 dl 形态在位', () => {
    expect(themeCss).toContain('.detail-list {');
    expect(themeCss).toContain('.detail-list dt');
    expect(themeCss).toContain('.detail-list dd');
  });

  it('指标卡与网格在位', () => {
    expect(themeCss).toContain('.metric-cards {');
    expect(themeCss).toContain('.metric-card {');
    expect(themeCss).toContain('.metric-card .metric-label');
  });
});
