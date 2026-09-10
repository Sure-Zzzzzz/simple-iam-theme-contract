# simple-iam-theme-contract v1.0.1 CHANGELOG

## 修复

- theme.css 组件样式段此前引用 `--iam-border`、`--iam-primary`、`--iam-surface`、`--iam-muted`、`--iam-text` 等 12 个短名 CSS 变量，但主题定义段只定义 `--iam-color-*` 长名，两者从未对上：在未自行桥接短名的消费方（如门户）里，契约组件的边框、背景等样式解析失败。本版将组件样式段的全部短名引用改为定义段真实存在的长名（`--iam-muted` 语义映射 `--iam-color-text-secondary`，`--iam-text` 语义映射 `--iam-color-text-primary`，`--iam-scrim` 映射 `--iam-color-overlay-scrim`），契约样式自此自洽，消费方无需再桥接短名。
- `--iam-radius-control`、`--iam-radius-card`、`--iam-shadow-overlay` 的引用名与定义名本就一致，未改动。
