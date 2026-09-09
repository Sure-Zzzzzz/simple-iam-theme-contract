import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PageHeader from './PageHeader.vue';

describe('PageHeader', () => {
  it('renders title and description', () => {
    const wrapper = mount(PageHeader, {
      props: { title: '用户管理', description: '管理系统内所有用户账号' }
    });
    expect(wrapper.text()).toContain('用户管理');
    expect(wrapper.text()).toContain('管理系统内所有用户账号');
  });

  it('renders primary button when primaryLabel provided', () => {
    const wrapper = mount(PageHeader, {
      props: { title: '用户管理', description: '描述', primaryLabel: '创建用户' }
    });
    const button = wrapper.find('.button-primary');
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe('创建用户');
  });

  it('does not render primary button when primaryLabel not provided', () => {
    const wrapper = mount(PageHeader, {
      props: { title: '用户管理', description: '描述' }
    });
    expect(wrapper.find('.button-primary').exists()).toBe(false);
  });

  it('emits primary event when button clicked', async () => {
    const wrapper = mount(PageHeader, {
      props: { title: '用户管理', description: '描述', primaryLabel: '创建用户' }
    });
    const button = wrapper.find('.button-primary');
    await button.trigger('click');
    expect(wrapper.emitted('primary')).toHaveLength(1);
  });

  it('renders custom actions slot', () => {
    const wrapper = mount(PageHeader, {
      props: { title: '用户管理', description: '描述' },
      slots: { actions: '<button class="custom">自定义按钮</button>' }
    });
    expect(wrapper.html()).toContain('自定义按钮');
    expect(wrapper.find('.button-primary').exists()).toBe(false);
  });
});
