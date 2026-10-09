# simple-iam-theme-contract

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

面向 IAM 统一应用门户和业务微前端的版本化主题契约。业务前端注册到 IAM 后，统一使用本包提供的主题模式、语义化 CSS 令牌和主题快照处理方式。

## 安装

```bash
pnpm add @sure-zzzzzz/simple-iam-theme-contract
```

在应用入口加载主题令牌：

```ts
import '@sure-zzzzzz/simple-iam-theme-contract/theme.css';
```

## 接入边界

统一应用门户是主题状态的唯一管理方，负责读取当前用户主题、预览、保存和向已注册的业务微前端广播主题快照。

- 登录前固定使用 `light`，不读取其他用户的主题缓存。
- 业务微前端只消费 IAM 传入的只读主题快照，不自行保存主题偏好，不创建主题选择器或主题接口。
- 子前端挂载时应用初始主题，主题变化时接收订阅通知，卸载时解除订阅。
- 主题状态按当前用户处理，业务子前端不得建立第二个主题状态源。
- 主题相关资源不得通过任意 CSS、外部样式地址、对象存储或上传文件下发。

## 组件与样式契约

跨仓共享的 UI 组件与样式族随包发布，宿主仓不得本地复制同名实现（按钮、密钥展示、下拉、图标按钮等通用件一律以本包为唯一事实源；仓专属布局类留给宿主）：

| 契约 | 内容 |
| --- | --- |
| `FormSelect`（子路径导入） | 自绘下拉选择组件：宿主 webview 中原生 `select` 弹层坐标不可靠，表单下拉统一用它（键盘 / 外点 / 滚动关闭；弹层方向同时感知视口与最近裁剪祖先，底部空间不足上翻） |
| `Pagination`（子路径导入） | 分页组件，每页条数选择内部使用 `FormSelect` |
| `DataTable`（子路径导入） | 声明式数据表格：`columns` 列配置 + `#cell-{key}` 作用域插槽定制特殊单元格；内置横向滚动容器、空态/加载占位行、`selectedKey` 选中高亮与 `rowClass` 行类透传。边界约束：滚动容器是弹层裁剪祖先，单元格内不得直接放绝对定位弹层 |
| `.button-primary` / `.button-secondary` / `.button-danger` / `.icon-button` | 按钮基线；`.icon-button` 为 32×32 内联居中、hover 浅底、`focus-visible` / `disabled` 完整态 |
| `.form-select*` | FormSelect 的配套样式段 |
| `.secret-reveal` / `.secret-reveal-wide` / `.secret-notice` | 一次性密钥展示卡片族 |
| `.secret-line` / `.secret-copy` | 密钥行内联紧凑复制按钮（hover 主色描边，复制成功态 `--iam-color-success`） |

## 使用主题快照

```ts
import {
  applyTheme,
  type ThemeSnapshot
} from '@sure-zzzzzz/simple-iam-theme-contract';

function receiveTheme(snapshot: ThemeSnapshot) {
  applyTheme(document.documentElement, snapshot);
}
```

`applyTheme` 负责将已接收的主题快照归一化并应用到指定根节点。统一应用门户只能下发已由服务端完整校验的主题快照；主题编辑页面在预览或提交前必须调用 `validateCustomThemeTokens` 校验固定白名单、颜色格式和最终调色板对比度，服务端仍必须独立校验。

微前端接收基座传入的初始快照并订阅变化：

```ts
let unsubscribe = () => undefined;

export function mount(props: {
  themeSnapshot: ThemeSnapshot;
  theme: {
    subscribe: (listener: (snapshot: ThemeSnapshot) => void) => () => void;
  };
}) {
  applyTheme(document.documentElement, props.themeSnapshot);
  unsubscribe();
  unsubscribe = props.theme.subscribe(snapshot => {
    applyTheme(document.documentElement, snapshot);
  });
}

export function unmount() {
  unsubscribe();
  unsubscribe = () => undefined;
}
```

## 主题模式

主题模式只有三种：

- `light`：浅色主题。
- `dark`：深色主题。
- `custom`：用户自定义的受控颜色主题，不是预置蓝色主题。

业务组件只能使用 `--iam-*` 语义令牌，不能按照主题名称编写业务分支，也不能把主题颜色硬编码到组件中。

颜色令牌包括：

```css
--iam-color-canvas
--iam-color-surface
--iam-color-surface-raised
--iam-color-surface-soft
--iam-color-text-primary
--iam-color-text-secondary
--iam-color-text-disabled
--iam-color-border
--iam-color-border-strong
--iam-color-primary
--iam-color-primary-hover
--iam-color-primary-active
--iam-color-primary-weak
--iam-color-primary-text
--iam-color-focus-ring
--iam-color-success
--iam-color-success-bg
--iam-color-warning
--iam-color-warning-bg
--iam-color-danger
--iam-color-danger-bg
--iam-color-info
--iam-color-info-bg
```

布局和动效令牌保持固定，不进入用户自定义范围：

```css
--iam-shadow-card
--iam-shadow-overlay
--iam-radius-control
--iam-radius-card
--iam-motion-duration-fast
```

示例：

```css
.primary-button {
  background: var(--iam-color-primary);
  border-radius: var(--iam-radius-control);
  transition-duration: var(--iam-motion-duration-fast);
}

.primary-button:focus-visible {
  outline: 2px solid var(--iam-color-focus-ring);
}
```

## 自定义主题

`custom` 只允许覆盖以下 **23 个**固定语义颜色键；未填写的键使用本包提供的默认 custom 调色板。服务端保存和下发时始终返回完整的 23 键调色板。

```text
primary
primaryHover
primaryActive
primaryWeak
primaryText
canvas
surface
surfaceRaised
surfaceSoft
textPrimary
textSecondary
textDisabled
border
borderStrong
focusRing
success
successBg
warning
warningBg
danger
dangerBg
info
infoBg
```

每个值只能是 `#RRGGBB`。不支持任意 CSS、URL、外部样式、上传文件、字体、布局、圆角、阴影或动画配置。自定义颜色必须满足主文字、辅助文字、主操作和各状态前景/背景的可读性要求，服务端仍会独立校验，不能只依赖前端校验。

## 兼容约束

主题快照、公开类型、公开函数和 `--iam-*` 令牌都属于跨应用契约。删除、改名或改变既有语义时，必须使用不兼容的主版本，并同步说明升级方式。

## 许可证

[Apache License 2.0](LICENSE)。

