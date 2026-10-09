# simple-iam-theme-contract v1.0.5 CHANGELOG

## DataTable

- 补齐行选择能力断层：`selectedKey` 此前只有显示态（选中高亮），宿主拿不到行触发事件，"点行选中→行内操作"与键盘可达形态无法实现。新增可选 `rowSelectable`（默认 false，不传零变化）：
  - 开启后数据行渲染 `tabindex="0"` 与 `aria-selected`（与 `selectedKey` 对齐），点击/回车/空格发出 `row-select` 事件（载荷为行对象）；
  - `selectedKey` 仍由宿主持有（单向数据流），组件不内嵌选中状态；
  - theme.css 新增 `data-table-row-selectable` 可达段（cursor + `:focus-visible` 焦点环走 `--iam-color-focus-ring` 令牌，自动适配明暗与自定义主题）。

## 动机

kms-admin-web 换装 DataTable 后，"点击行选中显示行内操作"与"业务表格键盘焦点使用自定义 focusRing"两条验收形态失去承载（自绘表格时代行自带 tabindex/click/keydown）。行选择是 selectedKey 语义的触发侧补全，属通用表格能力，收编契约；宿主仓不再需要为行交互自绘表格。

## Dialog

- 新增 `variant` 可选属性（默认 `danger`，向后兼容）：`confirm` 变体为不可逆但正面的业务里程碑动作提供 ✓ 图标与主色确认按钮，`danger` 保持红 ! 与危险按钮不变；兜底文案随变体（danger=确认删除，confirm=确认），`confirmLabel` 仍最优先。

## 通用样式族收编

七类六仓重复的通用样式族进契约为唯一事实源（全部纯 tokens，向后兼容新增，宿主删除本地同名实现即可迁移）：

| 样式族 | 收编形态 | 此前重复 |
| --- | --- | --- |
| `.status-badge` + 四态 | 胶囊徽章（success/warning/danger/neutral，缺省 info） | 全部六仓 |
| `.admin-empty-state` | dashed 空态卡（标题+描述+可选动作） | iam/aksk/crm/kms 四仓（连 min-height 公式都一致） |
| `.table-action` | 行内动作钮（文字/图标通用，hover 主色） | 五仓 |
| `.admin-message` + success/error | 内联提示条基线（布局位差异留宿主覆写） | 四仓 |
| `.admin-data-surface` / `.panel` | 数据卡双形态（一体卡/留白整卡，统一异名同物） | 六仓两套名字 |
| `.detail-list` | dl 键值详情（收编 detail-grid/kms-facts 异名） | 三仓三个名字 |
| `.metric-cards` / `.metric-card` | 数字指标卡与自适应网格（以 AKSK 形态定型） | 三仓已分叉 |

## 样式族动机

与 DataTable 同律：样式在契约（confirm-icon/danger-icon 等早已随包发布）而组件逻辑散在宿主，或六仓逐字复制同一段 tokens 样式；每次走查修一处要同步 N 仓。收编后宿主 style.css 只剩仓专属布局。
