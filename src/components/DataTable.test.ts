import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import DataTable, { type DataTableColumn } from './DataTable.vue';

interface TestRow {
  id: number;
  name: string;
  status: string;
}

const columns: DataTableColumn[] = [
  { key: 'name', label: '名称' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作', align: 'right', nowrap: true }
];

const rows: TestRow[] = [
  { id: 1, name: 'KMS 密钥治理员', status: '启用' },
  { id: 2, name: 'CRM 只读', status: '停用' }
];

interface TableOverrideProps {
  rows?: TestRow[];
  loading?: boolean;
  emptyText?: string;
  selectedKey?: string | number | null;
  rowClass?: (row: TestRow) => string;
}

// VTU 的 mount 对 SFC 泛型组件推导受限，用实例化表达式固定行类型
const TestTable = DataTable<TestRow>;

function mountTable(props: TableOverrideProps = {}) {
  return mount(TestTable, {
    props: { columns, rows, rowKey: 'id', ...props }
  });
}

describe('DataTable', () => {
  it('renders one header cell per column', () => {
    const wrapper = mountTable();
    const headers = wrapper.findAll('thead th');
    expect(headers.map(header => header.text())).toEqual(['名称', '状态', '操作']);
    expect(headers[0].attributes('scope')).toBe('col');
  });

  it('renders row cell text via default fallback', () => {
    const wrapper = mountTable();
    const bodyRows = wrapper.findAll('tbody tr');
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[0].text()).toContain('KMS 密钥治理员');
    expect(bodyRows[0].text()).toContain('启用');
  });

  it('renders empty placeholder spanning all columns with default text', () => {
    const wrapper = mountTable({ rows: [] });
    const placeholder = wrapper.get('tbody td.data-table-placeholder');
    expect(placeholder.text()).toBe('暂无数据');
    expect(placeholder.attributes('colspan')).toBe('3');
    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
  });

  it('renders custom empty text when provided', () => {
    const wrapper = mountTable({ rows: [], emptyText: '没有找到匹配的角色。' });
    expect(wrapper.get('tbody td.data-table-placeholder').text()).toBe('没有找到匹配的角色。');
  });

  it('shows loading placeholder only when rows are empty', () => {
    const loadingEmpty = mountTable({ rows: [], loading: true });
    expect(loadingEmpty.get('tbody td.data-table-placeholder').text()).toBe('加载中…');

    const loadingWithRows = mountTable({ loading: true });
    expect(loadingWithRows.findAll('tbody tr')).toHaveLength(2);
    expect(loadingWithRows.text()).not.toContain('加载中…');
  });

  it('marks the row matching selectedKey', () => {
    const wrapper = mountTable({ selectedKey: 2 });
    const bodyRows = wrapper.findAll('tbody tr');
    expect(bodyRows[0].classes()).not.toContain('data-table-row-selected');
    expect(bodyRows[1].classes()).toContain('data-table-row-selected');
  });

  it('appends rowClass result to row classes', () => {
    const wrapper = mountTable({ rowClass: (row: TestRow) => (row.status === '停用' ? 'row-disabled' : '') });
    const bodyRows = wrapper.findAll('tbody tr');
    expect(bodyRows[0].classes()).not.toContain('row-disabled');
    expect(bodyRows[1].classes()).toContain('row-disabled');
  });

  it('renders scoped slot content in place of fallback', () => {
    const wrapper = mount(TestTable, {
      props: { columns, rows, rowKey: 'id' },
      slots: {
        'cell-actions': `<template #cell-actions="{ row, index }">
          <button class="table-action" type="button">{{ row.name }}-{{ index }}</button>
        </template>`
      }
    });
    const actionButtons = wrapper.findAll('tbody .table-action');
    expect(actionButtons).toHaveLength(2);
    expect(actionButtons[0].text()).toBe('KMS 密钥治理员-0');
    expect(actionButtons[1].text()).toBe('CRM 只读-1');
  });

  it('applies scrollMinWidth to table and column width to col', () => {
    const wrapper = mount(TestTable, {
      props: {
        columns: [{ key: 'name', label: '名称', width: '240px' }, { key: 'status', label: '状态' }],
        rows,
        rowKey: 'id',
        scrollMinWidth: '1456px'
      }
    });
    expect(wrapper.get('table.data-table').attributes('style')).toContain('min-width: 1456px');
    const cols = wrapper.findAll('colgroup col');
    expect(cols[0].attributes('style')).toContain('width: 240px');
    expect(cols[1].attributes('style')).toBeUndefined();
  });

  it('aligns header and cell inline style for right-aligned nowrap columns', () => {
    const wrapper = mountTable();
    const headers = wrapper.findAll('thead th');
    expect(headers[2].attributes('style')).toContain('text-align: right');
    expect(headers[2].attributes('style')).toContain('white-space: nowrap');
    const firstRowCells = wrapper.findAll('tbody tr')[0].findAll('td');
    expect(firstRowCells[2].attributes('style')).toContain('text-align: right');
  });
});
