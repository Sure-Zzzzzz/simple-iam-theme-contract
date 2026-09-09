import { describe, expect, it } from 'vitest';
import {
  CUSTOM_THEME_TOKEN_KEYS,
  DEFAULT_THEME_PREFERENCE,
  THEME_CONTRACT_VERSION,
  applyTheme,
  createDefaultCustomThemeTokens,
  createLightThemePreference,
  hasMinimumContrast,
  isCustomThemeTokenKey,
  isHexColor,
  isThemeMode,
  normalizeThemePreference,
  sanitizeCustomThemeTokens,
  validateCustomThemeTokens
} from './index.js';

describe('theme contract', () => {
  it('规范化无效主题为浅色且丢弃非 custom token', () => {
    expect(normalizeThemePreference({ mode: 'blue' as never, customTokens: { primary: '#123456' } }))
      .toEqual({ contractVersion: THEME_CONTRACT_VERSION, mode: 'light', customTokens: {} });
  });

  it('提供独立的完整默认 custom 调色板', () => {
    const first = createDefaultCustomThemeTokens();
    const second = createDefaultCustomThemeTokens();

    expect(CUSTOM_THEME_TOKEN_KEYS).toHaveLength(24);
    expect(isCustomThemeTokenKey('overlayScrim')).toBe(true);
    expect(Object.keys(first).sort()).toEqual([...CUSTOM_THEME_TOKEN_KEYS].sort());
    expect(first).toEqual(second);

    first.primary = '#000000';
    expect(second.primary).toBe('#1D4ED8');
  });

  it('仅保留白名单内的十六进制 custom token', () => {
    expect(sanitizeCustomThemeTokens({
      primary: '#1d4ed8',
      canvas: '#ffffff',
      unknown: '#000000',
      border: 'url(https://example.invalid)',
      textPrimary: '#ffffff; color: red'
    })).toEqual({ primary: '#1D4ED8', canvas: '#FFFFFF' });
  });

  it('允许部分 custom 覆盖，并在根节点应用后清除旧覆盖值', () => {
    const root = document.documentElement;

    applyTheme(root, {
      contractVersion: THEME_CONTRACT_VERSION,
      mode: 'custom',
      customTokens: { primary: '#123456' }
    });

    expect(root.dataset.iamTheme).toBe('custom');
    expect(root.style.getPropertyValue('--iam-color-primary')).toBe('#123456');
    expect(root.style.getPropertyValue('--iam-color-canvas')).toBe('#F4F7FB');

    applyTheme(root, { mode: 'dark', customTokens: {} });
    expect(root.dataset.iamTheme).toBe('dark');
    expect(root.style.getPropertyValue('--iam-color-primary')).toBe('');
    expect(root.style.getPropertyValue('--iam-color-canvas')).toBe('');
  });

  it('识别主题值、token 键和安全颜色格式', () => {
    expect(isThemeMode('light')).toBe(true);
    expect(isThemeMode('blue')).toBe(false);
    expect(isCustomThemeTokenKey('primary')).toBe(true);
    expect(isCustomThemeTokenKey('warningBg')).toBe(true);
    expect(isCustomThemeTokenKey('unknown')).toBe(false);
    expect(isHexColor('#Aa00Ff')).toBe(true);
    expect(isHexColor('#FFFFF')).toBe(false);
    expect(isHexColor(null)).toBe(false);
  });

  it('为已校验的部分 custom 覆盖返回完整快照', () => {
    expect(normalizeThemePreference({
      contractVersion: THEME_CONTRACT_VERSION,
      mode: 'custom',
      customTokens: { primary: '#123456' }
    })).toEqual({
      contractVersion: THEME_CONTRACT_VERSION,
      mode: 'custom',
      customTokens: {
        ...createDefaultCustomThemeTokens(),
        primary: '#123456'
      }
    });
    expect(normalizeThemePreference({ mode: 'dark' })).toEqual({
      contractVersion: THEME_CONTRACT_VERSION,
      mode: 'dark',
      customTokens: {}
    });
    expect(createLightThemePreference()).toEqual(DEFAULT_THEME_PREFERENCE);
    expect(Object.isFrozen(DEFAULT_THEME_PREFERENCE)).toBe(true);
  });

  it('拒绝未知键、非对象、非法颜色和最终调色板中对比度不足的值', () => {
    expect(validateCustomThemeTokens(null).valid).toBe(false);
    expect(validateCustomThemeTokens({ primary: '#123456', unknown: '#FFFFFF' }).errors)
      .toContain('自定义主题只允许使用白名单颜色令牌和 #RRGGBB 颜色值。');
    expect(validateCustomThemeTokens({ primary: ['#123456'] }).valid).toBe(false);
    expect(validateCustomThemeTokens({ textPrimary: '#FFFFFF', canvas: '#FFFFFF' }).errors)
      .toContain('主文本与页面背景的对比度不足。');
    expect(validateCustomThemeTokens({ textSecondary: '#FFFFFF', surface: '#FFFFFF' }).errors)
      .toContain('辅助文本与容器背景的对比度不足。');
    expect(validateCustomThemeTokens({ primaryText: '#FFFFFF', primary: '#FFFFFF' }).errors)
      .toContain('主操作文字与主操作背景的对比度不足。');
    expect(validateCustomThemeTokens({ warning: '#FFFFFF', warningBg: '#FFFFFF' }).errors)
      .toContain('警告状态前景与背景的对比度不足。');
  });

  it('接受空覆盖与符合对比度要求的任意单键覆盖', () => {
    const defaults = createDefaultCustomThemeTokens();

    expect(validateCustomThemeTokens({})).toEqual({
      valid: true,
      tokens: defaults,
      errors: []
    });
    expect(validateCustomThemeTokens({ primary: '#123456' })).toEqual({
      valid: true,
      tokens: { ...defaults, primary: '#123456' },
      errors: []
    });
    expect(hasMinimumContrast('#000000', '#FFFFFF')).toBe(true);
    expect(hasMinimumContrast('#FFFFFF', '#FFFFFF')).toBe(false);
    expect(hasMinimumContrast('invalid', '#FFFFFF')).toBe(false);
  });
});
