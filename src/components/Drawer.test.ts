import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Drawer from './Drawer.vue';

describe('Drawer', () => {
  it('renders when open is true', () => {
    const wrapper = mount(Drawer, {
      props: { open: true, title: '编辑用户' }
    });
    expect(wrapper.find('.entity-drawer').exists()).toBe(true);
    expect(wrapper.text()).toContain('编辑用户');
  });

  it('does not render when open is false', () => {
    const wrapper = mount(Drawer, {
      props: { open: false, title: '编辑用户' }
    });
    expect(wrapper.find('.entity-drawer').exists()).toBe(false);
  });

  it('renders description when provided', () => {
    const wrapper = mount(Drawer, {
      props: { open: true, title: '编辑用户', description: '用户 ID: 12345' }
    });
    expect(wrapper.text()).toContain('用户 ID: 12345');
  });

  it('emits close when close button clicked', async () => {
    const wrapper = mount(Drawer, {
      props: { open: true, title: '编辑用户' }
    });
    const closeButton = wrapper.find('.icon-button');
    await closeButton.trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('renders slot content', () => {
    const wrapper = mount(Drawer, {
      props: { open: true, title: '编辑用户' },
      slots: { default: '<form>表单内容</form>' }
    });
    expect(wrapper.html()).toContain('表单内容');
  });

  it('does not emit close when pending', async () => {
    const wrapper = mount(Drawer, {
      props: { open: true, title: '编辑用户', pending: true }
    });
    const closeButton = wrapper.find('.icon-button');
    await closeButton.trigger('click');
    expect(wrapper.emitted('close')).toBeUndefined();
  });

  it('marks the panel busy while pending', () => {
    const wrapper = mount(Drawer, {
      props: { open: true, title: '编辑用户', pending: true }
    });
    expect(wrapper.get('.entity-drawer').attributes('aria-busy')).toBe('true');
  });

  it('focuses the panel when open becomes true and restores focus on close', async () => {
    const wrapper = mount(Drawer, {
      props: { open: false, title: '编辑用户' },
      attachTo: document.body
    });
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    await wrapper.setProps({ open: true });
    await new Promise(resolve => setTimeout(resolve, 0));
    const panel = wrapper.get('.entity-drawer');
    expect(document.activeElement).toBe(panel.element);

    await wrapper.get('.icon-button').trigger('click');
    expect(document.activeElement).toBe(trigger);
    await wrapper.setProps({ open: false });
    trigger.remove();
    wrapper.unmount();
  });

  it('emits close on Escape key when not pending', async () => {
    const wrapper = mount(Drawer, {
      props: { open: true, title: '编辑用户' }
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('does not close on Escape when pending', async () => {
    const wrapper = mount(Drawer, {
      props: { open: true, title: '编辑用户', pending: true }
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(wrapper.emitted('close')).toBeUndefined();
  });

  it('emits close on backdrop click', async () => {
    const wrapper = mount(Drawer, {
      props: { open: true, title: '编辑用户' }
    });
    await wrapper.find('.drawer-backdrop').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
