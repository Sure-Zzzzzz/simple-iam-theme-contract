import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Dialog from './Dialog.vue';

describe('Dialog', () => {
  it('renders when open is true', () => {
    const wrapper = mount(Dialog, {
      props: { open: true, title: '确认删除', description: '此操作不可撤销' }
    });
    expect(wrapper.find('.confirm-dialog').exists()).toBe(true);
    expect(wrapper.text()).toContain('确认删除');
    expect(wrapper.text()).toContain('此操作不可撤销');
  });

  it('does not render when open is false', () => {
    const wrapper = mount(Dialog, {
      props: { open: false, title: '确认删除', description: '此操作不可撤销' }
    });
    expect(wrapper.find('.confirm-dialog').exists()).toBe(false);
  });

  it('emits close when cancel button clicked', async () => {
    const wrapper = mount(Dialog, {
      props: { open: true, title: '确认删除', description: '此操作不可撤销' }
    });
    const cancelButton = wrapper.find('.button-secondary');
    await cancelButton.trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('emits confirm when confirm button clicked', async () => {
    const wrapper = mount(Dialog, {
      props: { open: true, title: '确认删除', description: '此操作不可撤销' }
    });
    const confirmButton = wrapper.find('.button-danger');
    await confirmButton.trigger('click');
    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });

  it('shows custom confirm label', () => {
    const wrapper = mount(Dialog, {
      props: { open: true, title: '确认', description: '描述', confirmLabel: '立即执行' }
    });
    expect(wrapper.text()).toContain('立即执行');
  });

  it('shows pending state', () => {
    const wrapper = mount(Dialog, {
      props: { open: true, title: '确认', description: '描述', pending: true }
    });
    expect(wrapper.text()).toContain('正在处理…');
  });

  it('focuses the dialog when open becomes true and restores focus on close', async () => {
    const wrapper = mount(Dialog, {
      props: { open: false, title: '确认', description: '描述' },
      attachTo: document.body
    });
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    await wrapper.setProps({ open: true });
    await new Promise(resolve => setTimeout(resolve, 0));
    const dialog = wrapper.get('.confirm-dialog');
    expect(document.activeElement).toBe(dialog.element);

    await wrapper.get('.button-secondary').trigger('click');
    expect(document.activeElement).toBe(trigger);
    await wrapper.setProps({ open: false });
    trigger.remove();
    wrapper.unmount();
  });

  it('emits close on Escape key when open and not pending', async () => {
    const wrapper = mount(Dialog, {
      props: { open: true, title: '确认', description: '描述' }
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('does not close on Escape when pending', async () => {
    const wrapper = mount(Dialog, {
      props: { open: true, title: '确认', description: '描述', pending: true }
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(wrapper.emitted('close')).toBeUndefined();
  });

  it('emits close on backdrop click but not while pending', async () => {
    const normal = mount(Dialog, {
      props: { open: true, title: '确认', description: '描述' }
    });
    await normal.find('.dialog-backdrop').trigger('click');
    expect(normal.emitted('close')).toHaveLength(1);

    const pending = mount(Dialog, {
      props: { open: true, title: '确认', description: '描述', pending: true }
    });
    await pending.find('.dialog-backdrop').trigger('click');
    expect(pending.emitted('close')).toBeUndefined();
  });

  it('defaults to danger variant with danger icon and button', () => {
    const wrapper = mount(Dialog, {
      props: { open: true, title: '确认', description: '描述' }
    });
    expect(wrapper.find('.danger-icon').exists()).toBe(true);
    expect(wrapper.find('.confirm-icon').exists()).toBe(false);
    expect(wrapper.find('.button-danger').exists()).toBe(true);
    expect(wrapper.find('.button-primary').exists()).toBe(false);
    expect(wrapper.text()).toContain('确认删除');
  });

  it('confirm variant shows check icon and primary button', async () => {
    const wrapper = mount(Dialog, {
      props: { open: true, title: '确认成交', description: '描述', variant: 'confirm', confirmLabel: '确认成交' }
    });
    expect(wrapper.find('.confirm-icon').exists()).toBe(true);
    expect(wrapper.find('.danger-icon').exists()).toBe(false);
    expect(wrapper.find('.button-primary').exists()).toBe(true);
    expect(wrapper.find('.button-danger').exists()).toBe(false);
    await wrapper.find('.button-primary').trigger('click');
    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });
});
