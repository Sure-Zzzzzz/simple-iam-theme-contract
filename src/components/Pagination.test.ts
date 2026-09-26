import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Pagination from './Pagination.vue';

async function pickPageSize(wrapper: ReturnType<typeof mount>, label: string) {
  await wrapper.get('.pagination-size-selector .form-select-toggle').trigger('click');
  const option = wrapper
    .findAll('.pagination-size-selector .form-select-option')
    .find(node => node.text() === label);
  expect(option, `page size option ${label} should exist`).toBeTruthy();
  await option!.trigger('click');
}

describe('Pagination', () => {
  it('displays correct page range for total 100 items, pageSize 10, current page 1', () => {
    const wrapper = mount(Pagination, {
      props: { current: 1, total: 100, pageSize: 10 }
    });
    const buttons = wrapper.findAll('.pagination-pages button');
    expect(buttons[0].attributes('disabled')).toBeDefined();
    expect(buttons.length).toBeGreaterThan(2);
  });

  it('emits update:current when page button clicked', async () => {
    const wrapper = mount(Pagination, {
      props: { current: 1, total: 100, pageSize: 10 }
    });
    const pageButtons = wrapper.findAll('.pagination-pages button');
    const secondPageButton = pageButtons.find(btn => btn.text() === '2');
    if (secondPageButton) {
      await secondPageButton.trigger('click');
      expect(wrapper.emitted('update:current')).toEqual([[2]]);
    }
  });

  it('emits update:pageSize when selector changed', async () => {
    const wrapper = mount(Pagination, {
      props: { current: 1, total: 100, pageSize: 10 }
    });
    await pickPageSize(wrapper, '50 条/页');
    expect(wrapper.emitted('update:pageSize')).toEqual([[50]]);
  });

  it('resets to page 1 when pageSize increases beyond current page', async () => {
    const wrapper = mount(Pagination, {
      props: { current: 5, total: 100, pageSize: 10 }
    });
    await pickPageSize(wrapper, '100 条/页');
    const emitted = wrapper.emitted('update:current') as number[][];
    expect(emitted[emitted.length - 1]).toEqual([1]);
  });

  it('emits update:current when next-page button clicked', async () => {
    const wrapper = mount(Pagination, {
      props: { current: 1, total: 100, pageSize: 10 }
    });
    const nextButton = wrapper.findAll('.pagination-step').find(btn => btn.text() === '下一页');
    await nextButton!.trigger('click');
    expect(wrapper.emitted('update:current')).toEqual([[2]]);
  });

  it('emits update:current when prev-page button clicked', async () => {
    const wrapper = mount(Pagination, {
      props: { current: 2, total: 100, pageSize: 10 }
    });
    const prevButton = wrapper.findAll('.pagination-step').find(btn => btn.text() === '上一页');
    await prevButton!.trigger('click');
    expect(wrapper.emitted('update:current')).toEqual([[1]]);
  });

  it('renders leading and trailing ellipsis for long page lists', () => {
    const wrapper = mount(Pagination, {
      props: { current: 50, total: 1000, pageSize: 10 }
    });
    const labels = wrapper.findAll('.pagination-pages button, .pagination-pages span')
      .map(node => node.text());
    expect(labels).toEqual(['上一页', '1', '…', '48', '49', '50', '51', '52', '…', '100', '下一页']);
    const activeButton = wrapper.get('.pagination-pages button.active');
    expect(activeButton.text()).toBe('50');
  });

  it('renders single page without steps enabled when total fits one page', () => {
    const wrapper = mount(Pagination, {
      props: { current: 1, total: 5, pageSize: 10 }
    });
    const stepButtons = wrapper.findAll('.pagination-step');
    expect(stepButtons.every(btn => btn.attributes('disabled') !== undefined)).toBe(true);
    expect(wrapper.find('.pagination-pages span').exists()).toBe(false);
    const numberButtons = wrapper.findAll('.pagination-pages button').filter(btn => btn.text() !== '上一页' && btn.text() !== '下一页');
    expect(numberButtons.map(btn => btn.text())).toEqual(['1']);
  });

  it('does not emit when clicking the current page number', async () => {
    const wrapper = mount(Pagination, {
      props: { current: 2, total: 100, pageSize: 10 }
    });
    await wrapper.get('.pagination-pages button.active').trigger('click');
    expect(wrapper.emitted('update:current')).toBeUndefined();
  });

  it('supports custom pageSizeOptions and hides selector when empty', async () => {
    const custom = mount(Pagination, {
      props: { current: 1, total: 60, pageSize: 5, pageSizeOptions: [5, 25] }
    });
    await custom.get('.pagination-size-selector .form-select-toggle').trigger('click');
    expect(custom.findAll('.form-select-option').map(option => option.text())).toEqual(['5 条/页', '25 条/页']);

    const hidden = mount(Pagination, {
      props: { current: 1, total: 5, pageSize: 10, pageSizeOptions: [] }
    });
    expect(hidden.find('.pagination-size-selector').exists()).toBe(false);
  });
});
