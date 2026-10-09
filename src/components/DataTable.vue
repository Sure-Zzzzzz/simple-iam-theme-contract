<script setup lang="ts" generic="TRow extends object">
/**
 * 声明式数据表格。列定义走 columns 配置，特殊单元格用 #cell-{key} 作用域插槽定制；
 * 组件自带横向滚动容器与加载/空态占位行，宿主只提供数据与列声明。
 *
 * 边界约束：滚动容器 overflow-x:auto 使其成为弹层的裁剪祖先——单元格内不要直接放
 * 绝对定位弹层（下拉、菜单须挂传送门或置于表格滚动容器之外）。
 */
export interface DataTableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  nowrap?: boolean;
}

const props = withDefaults(defineProps<{
  columns: DataTableColumn[];
  rows: TRow[];
  rowKey: keyof TRow & string;
  loading?: boolean;
  emptyText?: string;
  selectedKey?: string | number | null;
  scrollMinWidth?: string;
  rowClass?: (row: TRow) => string;
}>(), {
  loading: false,
  emptyText: '暂无数据',
  selectedKey: null,
  scrollMinWidth: '680px'
});

function columnStyle(align?: 'left' | 'center' | 'right', nowrap?: boolean): {
  textAlign: 'left' | 'center' | 'right' | undefined;
  whiteSpace: 'nowrap' | undefined;
} {
  return {
    textAlign: align,
    whiteSpace: nowrap ? 'nowrap' : undefined
  };
}

function cellText(row: TRow, key: string): string {
  const value = (row as Record<string, unknown>)[key];
  return value === null || value === undefined ? '' : String(value);
}

function rowKeyValue(row: TRow): string | number {
  const value = (row as Record<string, unknown>)[props.rowKey];
  return typeof value === 'number' ? value : String(value);
}

function rowClasses(row: TRow): Record<string, boolean> {
  const classes: Record<string, boolean> = {};
  if (props.selectedKey !== null && rowKeyValue(row) === props.selectedKey) {
    classes['data-table-row-selected'] = true;
  }
  const extra = props.rowClass ? props.rowClass(row) : '';
  if (extra) {
    classes[extra] = true;
  }
  return classes;
}
</script>

<template>
  <div class="data-table-scroll">
    <table class="data-table" :style="{ minWidth: scrollMinWidth }">
      <colgroup>
        <col
          v-for="column in columns"
          :key="column.key"
          :style="column.width ? { width: column.width } : undefined"
        >
      </colgroup>
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            :style="columnStyle(column.align, column.nowrap)"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- 加载占位仅在无数据时出现：翻页期间旧数据继续展示，避免闪空 -->
        <tr v-if="loading && rows.length === 0">
          <td :colspan="columns.length" class="data-table-placeholder">加载中…</td>
        </tr>
        <tr v-else-if="rows.length === 0">
          <td :colspan="columns.length" class="data-table-placeholder">{{ emptyText }}</td>
        </tr>
        <template v-for="(row, index) in rows" :key="rowKeyValue(row)">
          <tr :class="rowClasses(row)">
            <td
              v-for="column in columns"
              :key="column.key"
              :style="columnStyle(column.align, column.nowrap)"
            >
              <slot :name="`cell-${column.key}`" :row="row" :index="index">
                {{ cellText(row, column.key) }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
