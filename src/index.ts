export const THEME_CONTRACT_VERSION = 1;

export const THEME_MODES = ['light', 'dark', 'custom'] as const;
export type ThemeMode = typeof THEME_MODES[number];

export const CUSTOM_THEME_TOKEN_KEYS = [
  'primary',
  'primaryHover',
  'primaryActive',
  'primaryWeak',
  'primaryText',
  'canvas',
  'surface',
  'surfaceRaised',
  'surfaceSoft',
  'textPrimary',
  'textSecondary',
  'textDisabled',
  'border',
  'borderStrong',
  'focusRing',
  'success',
  'successBg',
  'warning',
  'warningBg',
  'danger',
  'dangerBg',
  'info',
  'infoBg',
  'overlayScrim'
] as const;

export type CustomThemeTokenKey = typeof CUSTOM_THEME_TOKEN_KEYS[number];
export type CustomThemeTokens = Partial<Record<CustomThemeTokenKey, string>>;
export type CompleteCustomThemeTokens = Record<CustomThemeTokenKey, string>;

export interface LightThemePreference {
  contractVersion: number;
  mode: 'light';
  customTokens: Record<string, never>;
}

export interface DarkThemePreference {
  contractVersion: number;
  mode: 'dark';
  customTokens: Record<string, never>;
}

export interface CustomThemePreference {
  contractVersion: number;
  mode: 'custom';
  customTokens: CompleteCustomThemeTokens;
}

export type ThemePreference = LightThemePreference | DarkThemePreference | CustomThemePreference;

export interface ThemePreferenceInput {
  contractVersion?: unknown;
  mode?: unknown;
  customTokens?: unknown;
  updatedAt?: unknown;
}

export type ThemeSnapshot = ThemePreference & {
  updatedAt?: string;
};

export type ThemeListener = (snapshot: ThemeSnapshot) => void;

export type ThemeValidationResult =
  | { valid: true; tokens: CompleteCustomThemeTokens; errors: [] }
  | { valid: false; tokens: CompleteCustomThemeTokens; errors: string[] };

export const DEFAULT_THEME_PREFERENCE: LightThemePreference = Object.freeze({
  contractVersion: THEME_CONTRACT_VERSION,
  mode: 'light',
  customTokens: Object.freeze({})
});

const defaultCustomThemeTokens: CompleteCustomThemeTokens = Object.freeze({
  primary: '#1D4ED8',
  primaryHover: '#1E40AF',
  primaryActive: '#1E3A8A',
  primaryWeak: '#E0EAFF',
  primaryText: '#FFFFFF',
  canvas: '#F4F7FB',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceSoft: '#EEF3F9',
  textPrimary: '#182230',
  textSecondary: '#5F6B7A',
  textDisabled: '#98A2B3',
  border: '#D9E1EC',
  borderStrong: '#B7C4D6',
  focusRing: '#2563EB',
  success: '#157347',
  successBg: '#DEF7E8',
  warning: '#9A5B00',
  warningBg: '#FFF4D6',
  danger: '#B42318',
  dangerBg: '#FEE4E2',
  info: '#175CD3',
  infoBg: '#E8F1FF',
  overlayScrim: '#0D192F'
});

const hexColorPattern = /^#[0-9A-Fa-f]{6}$/;

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (THEME_MODES as readonly string[]).includes(value);
}

export function isCustomThemeTokenKey(value: string): value is CustomThemeTokenKey {
  return (CUSTOM_THEME_TOKEN_KEYS as readonly string[]).includes(value);
}

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && hexColorPattern.test(value);
}

export function createDefaultCustomThemeTokens(): CompleteCustomThemeTokens {
  return { ...defaultCustomThemeTokens };
}

export function normalizeThemePreference(value: ThemePreferenceInput | null | undefined): ThemePreference {
  if (value?.mode === 'custom') {
    const validation = validateCustomThemeTokens(value.customTokens);
    if (validation.valid) {
      return {
        contractVersion: THEME_CONTRACT_VERSION,
        mode: 'custom',
        customTokens: validation.tokens
      };
    }
  }
  if (value?.mode === 'dark') {
    return { contractVersion: THEME_CONTRACT_VERSION, mode: 'dark', customTokens: {} };
  }
  return createLightThemePreference();
}

export function sanitizeCustomThemeTokens(value: unknown): CustomThemeTokens {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return Object.entries(value).reduce<CustomThemeTokens>((tokens, [key, color]) => {
    if (isCustomThemeTokenKey(key) && isHexColor(color)) {
      tokens[key] = color.toUpperCase();
    }
    return tokens;
  }, {});
}

export function validateCustomThemeTokens(value: unknown): ThemeValidationResult {
  const rawEntries = value && typeof value === 'object' && !Array.isArray(value)
    ? Object.entries(value)
    : [];
  const tokens = { ...defaultCustomThemeTokens, ...sanitizeCustomThemeTokens(value) };
  const errors: string[] = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push('自定义主题颜色必须是对象。');
  }
  if (rawEntries.some(([key, color]) => !isCustomThemeTokenKey(key) || !isHexColor(color))) {
    errors.push('自定义主题只允许使用白名单颜色令牌和 #RRGGBB 颜色值。');
  }
  if (!hasMinimumContrast(tokens.textPrimary, tokens.canvas)) {
    errors.push('主文本与页面背景的对比度不足。');
  }
  if (!hasMinimumContrast(tokens.textSecondary, tokens.surface)) {
    errors.push('辅助文本与容器背景的对比度不足。');
  }
  if (!hasMinimumContrast(tokens.primaryText, tokens.primary)) {
    errors.push('主操作文字与主操作背景的对比度不足。');
  }
  const statusPairs: Array<[string, string, string]> = [
    [tokens.success, tokens.successBg, '成功状态前景与背景的对比度不足。'],
    [tokens.warning, tokens.warningBg, '警告状态前景与背景的对比度不足。'],
    [tokens.danger, tokens.dangerBg, '错误状态前景与背景的对比度不足。'],
    [tokens.info, tokens.infoBg, '信息状态前景与背景的对比度不足。']
  ];
  for (const [foreground, background, message] of statusPairs) {
    if (!hasMinimumContrast(foreground, background)) {
      errors.push(message);
    }
  }
  if (errors.length > 0) {
    return { valid: false, tokens, errors };
  }
  return { valid: true, tokens, errors: [] };
}

export function hasMinimumContrast(foreground: string, background: string, minimum = 4.5): boolean {
  if (!isHexColor(foreground) || !isHexColor(background)) {
    return false;
  }
  const luminance = (color: string) => {
    const channels = [1, 3, 5].map(index => Number.parseInt(color.slice(index, index + 2), 16) / 255);
    const [red, green, blue] = channels.map(channel => channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4);
    return red * 0.2126 + green * 0.7152 + blue * 0.0722;
  };
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  const ratio = (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
  return ratio >= minimum;
}

const cssVariableByToken: Record<CustomThemeTokenKey, string> = {
  primary: '--iam-color-primary',
  primaryHover: '--iam-color-primary-hover',
  primaryActive: '--iam-color-primary-active',
  primaryWeak: '--iam-color-primary-weak',
  primaryText: '--iam-color-primary-text',
  canvas: '--iam-color-canvas',
  surface: '--iam-color-surface',
  surfaceRaised: '--iam-color-surface-raised',
  surfaceSoft: '--iam-color-surface-soft',
  textPrimary: '--iam-color-text-primary',
  textSecondary: '--iam-color-text-secondary',
  textDisabled: '--iam-color-text-disabled',
  border: '--iam-color-border',
  borderStrong: '--iam-color-border-strong',
  focusRing: '--iam-color-focus-ring',
  success: '--iam-color-success',
  successBg: '--iam-color-success-bg',
  warning: '--iam-color-warning',
  warningBg: '--iam-color-warning-bg',
  danger: '--iam-color-danger',
  dangerBg: '--iam-color-danger-bg',
  info: '--iam-color-info',
  infoBg: '--iam-color-info-bg',
  overlayScrim: '--iam-color-overlay-scrim'
};

export function applyTheme(root: HTMLElement, value: ThemePreferenceInput | null | undefined): ThemePreference {
  const preference = normalizeThemePreference(value);
  root.dataset.iamTheme = preference.mode;
  for (const variable of Object.values(cssVariableByToken)) {
    root.style.removeProperty(variable);
  }
  if (preference.mode === 'custom') {
    for (const [key, color] of Object.entries(preference.customTokens)) {
      if (isCustomThemeTokenKey(key) && isHexColor(color)) {
        root.style.setProperty(cssVariableByToken[key], color.toUpperCase());
      }
    }
  }
  return preference;
}

export function createLightThemePreference(): LightThemePreference {
  return { contractVersion: THEME_CONTRACT_VERSION, mode: 'light', customTokens: {} };
}
