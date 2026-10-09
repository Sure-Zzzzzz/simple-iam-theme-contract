# simple-iam-theme-contract v1.0.4 CHANGELOG

## FormSelect

- 修复弹层方向误判：原判定只看视口剩余空间，宿主卡片容器 `overflow: hidden`（如 `.admin-data-surface`）会把向下弹的菜单整段裁掉。现改为视口与最近裁剪祖先（`overflow-y` 非 `visible`/`clip`）双通道取小值判定；`html`/`body` 不参与（视口滚动条不裁绝对定位弹层），零面积 rect（未布局环境）跳过继续向上找。

## DataTable（新组件）

- 声明式数据表格，子路径导入。列定义走 `columns` 配置（`key`/`label`/`width`/`align`/`nowrap`），特殊单元格用 `#cell-{key}` 作用域插槽定制，缺省渲染行数据字段。
- 泛型组件（`TRow extends object`）：宿主传具体行类型数组时，`rowKey` 与插槽 `row` 均按该类型推导，宿主零转型。
- 内置能力：横向滚动容器（`scrollMinWidth` 可配）、空态占位行（`emptyText`，colspan 自动）、加载占位（仅无数据时出现，翻页期间旧数据继续展示避免闪空）、`selectedKey` 选中行高亮、`rowClass` 行类透传。
- 边界约束（固化为组件注释与样式段注释）：滚动容器 `overflow-x: auto` 使其成为弹层的裁剪祖先，单元格内不得直接放绝对定位弹层（下拉、菜单须挂传送门或置于滚动容器之外）。

## 动机

admin-web 七个视图手写 `<table>`，配套 `.responsive-table` / `.table-actions` / `.table-empty` / `.table-primary-action` / `tr.selected` 样式全部散在宿主 style.css；kms / license / limiter / crm 各 web 又各抄一份。表格是分页之后唯一未进契约的重型重复，收编为唯一事实源，宿主只留列声明与单元格内容。FormSelect 方向误判为同轮走查实测缺陷（iam.zs.com 角色页每页条数下拉被卡片容器裁剪）。
