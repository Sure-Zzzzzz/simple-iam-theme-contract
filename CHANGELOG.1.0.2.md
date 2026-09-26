# simple-iam-theme-contract v1.0.2 CHANGELOG

## 新增

- 新增 `FormSelect` 自绘下拉选择组件（子路径 `@sure-zzzzzz/simple-iam-theme-contract/FormSelect`）：以按钮 + 绝对定位列表自绘，替代原生 `select`。宿主环境（内嵌 webview）中原生 select 弹层坐标不可靠，下拉会"飞"到错误位置；该组件统一交互（点击开合、键盘上下/回车/Esc、点击外部与页面滚动关闭、底部空间不足时向上弹），并在 theme.css 中提供 `.form-select*` 样式（消费 `--iam-color-*` 长名令牌，自动适配明暗主题）。
- 组件 API：`v-model`（string | number | null）+ `options`（label/value/disabled）+ `ariaLabel`/`placeholder`/`disabled`，值变更同时发出 `update:modelValue` 与 `change`。

## 变更

- `Pagination` 每页条数选择器由原生 `select` 改为内置 `FormSelect`，消除分页条在 webview 宿主中的弹层错位；对外 props/事件不变。
- theme.css 的 `.pagination-size-selector` 尺寸规则改为作用于 `.form-select-toggle`，保持原紧凑尺寸。
