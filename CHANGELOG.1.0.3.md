# simple-iam-theme-contract v1.0.3 CHANGELOG

## theme.css

- 新增一次性密钥展示组件族：`.secret-reveal` / `.secret-reveal-wide` / `.secret-notice`（自两管理台逐字重复的本地定义收编），配合新增 `.secret-line` / `.secret-copy`（密钥行内联紧凑复制按钮：36px 高、hover 主色描边、复制成功态 `--iam-color-success`）。
- `.icon-button` 收敛为统一规格：32×32 内联 flex 居中 + hover 浅底 + `:focus-visible` / `:disabled` 态。此前 simple-aksk-admin-web 本地全局覆盖导致同一 EntityDrawer 关闭按钮在两仓视觉不一致；本地覆盖已删除。

## 动机

两管理台本地 style.css 中 `.secret-reveal` / `.secret-notice` / `.drawer-actions` 为逐字复制粘贴，`.icon-button` 出现两版漂移实现。按钮与密钥展示样式统一进契约，宿主仓只保留各自专属布局类。
