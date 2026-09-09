# IAM 前端外观规范（APPEARANCE）

本文件是 Login、统一应用门户（Portal）、IAM Admin 及后续微前端共同的唯一视觉规范。三端样式出现争议时以本文档为准；本文档与既有 B 端偏好基准（Tailwind/Ant Design 风 token 体系）冲突时，先提请维护者裁决再改文档。

## 1. 设计原则

- **token 先行**：颜色、阴影、圆角、动效一律走本包 `--iam-*` 变量，禁止在组件样式中硬编码 hex / rgba。唯一例外：Login 品牌色 `--iam-brand-deep`（见 §9）。
- **语义命名**：样式只引用语义 token（surface / border / primary），不引用具体值。
- **dark 可读**：任何新样式必须在 light 与 dark 两主题下走查；用变量即天然满足。
- **4px 网格**：间距、尺寸取 4 的倍数（4/8/12/16/20/24/28/32/40/48）。

## 2. Token 清单（src/theme.css）

| Token | light | dark | 用途 |
|---|---|---|---|
| --iam-color-canvas | #f4f7fb | #111827 | 页面底 |
| --iam-color-surface | #ffffff | #182230 | 卡片/面板面 |
| --iam-color-surface-raised | #ffffff | #202c3d | 浮层（下拉/弹窗）面 |
| --iam-color-surface-soft | #eef3f9 | #273548 | 淡底面板、hover 底 |
| --iam-color-text-primary | #182230 | #f8fafc | 主文字 |
| --iam-color-text-secondary | #5f6b7a | #cbd5e1 | 次要文字 |
| --iam-color-text-disabled | #98a2b3 | #94a3b8 | 禁用文字 |
| --iam-color-border | #d9e1ec | #3b4a60 | 常规边框 |
| --iam-color-border-strong | #b7c4d6 | #54677f | 强边框 |
| --iam-color-primary | #1d4ed8 | #93c5fd | 主色（按钮/链接/选中） |
| --iam-color-primary-hover / -active | #1e40af / #1e3a8a | #bfdbfe / #60a5fa | 主色交互态 |
| --iam-color-primary-weak | #e0eaff | #1e3a5f | 主色淡底（选中行/tag） |
| --iam-color-primary-text | #ffffff | #111827 | 主色底上的文字 |
| --iam-color-focus-ring | #2563eb | #bfdbfe | focus 光环 |
| --iam-color-success / -bg | #157347 / #def7e8 | #86efac / #164e37 | 成功语义 |
| --iam-color-warning / -bg | #9a5b00 / #fff4d6 | #fde68a / #713f12 | 警告语义 |
| --iam-color-danger / -bg | #b42318 / #fee4e2 | #fda4af / #641f2b | 危险语义 |
| --iam-color-info / -bg | #175cd3 / #e8f1ff | #93c5fd / #1e3a5f | 信息语义 |
| --iam-shadow-card | 0 12px 32px rgb(22 34 51 / 10%) | 0 12px 32px rgb(0 0 0 / 28%) | 卡片阴影 |
| --iam-shadow-overlay | 0 24px 64px rgb(22 34 51 / 22%) | 0 24px 64px rgb(0 0 0 / 52%) | 抽屉/弹窗阴影 |
| --iam-radius-control | 9px | 9px | 控件圆角（按钮/输入框/下拉） |
| --iam-radius-card | 16px | 16px | 容器圆角（卡片/抽屉/弹窗/fieldset） |
| --iam-motion-duration-fast | 160ms | 160ms | 过渡时长（reduced-motion 归零） |

各端可在根作用域把长名映射为简名（如 Admin 的 `--iam-surface: var(--iam-color-surface, #ffffff)`），映射必须带 fallback 且命名与契约语义一一对应。

## 3. 字号阶梯

| 档 | 值 | 用途 |
|---|---|---|
| 小字 | 12px | 辅助说明、列头、badge、时间戳 |
| 表格/列表正文 | 13px | 数据表格、复选列表、紧凑表单区 |
| 表单/正文 | 14px | 表单输入、段落正文、按钮 |
| 区块标题 | 15–16px | 卡片标题、抽屉小节标题 |
| 页面标题 | 20px | 页面 h1 |

禁止出现 10/11px；品牌展示性大字（登录页）不超过 32px。

## 4. 间距

4px 基准网格：页面内边距 24–28px、卡片内边距 16–22px、表单项间距 16px、行内 gap 8–12px、区块间距 20–24px。表格行高 `py 10–12px`。

## 5. 圆角三档制

| 档 | 值 | 用途 |
|---|---|---|
| 控件 | `var(--iam-radius-control)` 9px | 按钮、输入框、select、复选列表行、chips 内嵌容器 |
| 容器 | `var(--iam-radius-card)` 16px | 卡片、surface、抽屉、弹窗、fieldset、淡底面板 |
| 胶囊 | 999px | badge、tag、status pill |
| 嵌套小元素 | 6px | 仅限容器内的自绘 checkbox、图标块、代码块等小件 |

禁止其他圆角值（5/7/10/12/14/18/20/24px 一律收口）。

## 6. Focus ring（统一形态）

所有可交互控件（input / select / textarea / button / 可点击行）必须有可见 focus 态：

```css
:focus-visible {
  outline: 2px solid var(--iam-color-focus-ring);
  outline-offset: 2px;
}
```

- 用 `:focus-visible`（鼠标点击不闪环、键盘导航有环）；输入类可直接 `:focus`。
- 颜色必须走 `--iam-color-focus-ring`（dark 自动适配）。
- 禁止 `outline: none` 而不补替代态。

## 7. 状态 Badge（五变体）

统一类名 `.status-badge`，胶囊形态、12px/600、淡底深字：

| 变体 | 底 | 字 | 语义示例 |
|---|---|---|---|
| （默认）info | --iam-color-info-bg | --iam-color-info | 已读、启用 |
| .success | --iam-color-success-bg | --iam-color-success | 在线、成功 |
| .warning | --iam-color-warning-bg | --iam-color-warning | 待审核、即将过期 |
| .danger | --iam-color-danger-bg | --iam-color-danger | 禁用、失败、未读 |
| .neutral | --iam-color-surface-soft | --iam-color-text-secondary | 草稿、未记录 |

表格状态列一律用 badge，不用裸文本。

## 8. 图标规范

- **UI 控件图标**：统一引入 [lucide-vue-next](https://lucide.dev)，**固定版本 `1.0.0`（exact，不带 ^ 范围）**，三端一致；按需 `import { Search, X } from 'lucide-vue-next'`（tree-shakeable）。
- 输入框内嵌的装饰性图标（如搜索放大镜）允许用 CSS `background-image: url("data:image/svg+xml,...")` 直接注入 lucide 的 SVG path（stroke 用中性灰，light/dark 通用），配合 `padding-left` 留位——纯装饰、无交互语义的场景不必包组件。
- 尺寸两档：16px（行内/输入框内嵌）、20px（导航/顶栏/空态）；stroke-width 2；颜色走文字/语义变量。
- **业务应用图标**（后端 icon code 映射，如可信应用）：仍走白名单 code→组件映射，映射表改用 lucide 组件实现（Portal `trustedApplicationIcons.ts`，Admin 同名文件同步）；白名单制安全模型不变。
- 禁止用 Unicode 字形（◎◆⚙✉☰ 等）充当图标。

## 9. 三端组件形态对照

| 件 | Admin | Login | Portal |
|---|---|---|---|
| 主/次按钮 | min-height 38px，圆角 9px，13–14px/700 | 46px 大按钮（登录主操作） | 顶栏 38px、圆角 9px |
| 输入框 | min-height 38–42px，圆角 9px | 46px（移动端友好） | 与 Admin 同 |
| 卡片/surface | 16px 圆角 + shadow-card | 登录卡 16px | 16px 圆角 |
| 抽屉/弹窗 | 右抽屉 620px（详情/列表型加 `entity-drawer-wide` 宽档 780px）/ 居中弹窗 410px | — | 居中 modal |
| 表格 | th 12px 灰、行 hover surface-soft 58%、操作列右对齐 | — | 消息列表卡片式 |
| 遮罩 | rgba(13,25,47,.42) 统一 | 同左 | 同左（收口为一种写法） |

Login 特例：登录页固定 light 主题（未认证阶段不跟随用户偏好）；左侧品牌面板保留 `--iam-brand-deep: #163775`（login 仓本地变量，不入本包——不参与主题切换）。

## 10. 主题贯通链路

Portal 是唯一主题状态源：用户偏好（含 custom 23 键）经后端持久化，Portal `applyTheme` 写 `<html data-iam-theme>`，并经 qiankun mount props 的 `theme` subscription 广播；Admin 等子应用只读消费。Login 固定 light。custom 主题键白名单与 WCAG 4.5:1 对比度校验由本包运行时（src/index.ts）保证，本规范不重复定义。
