import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Button from './Button.vue';

describe('Button', () => {
  it('renders with primary variant by default', () => {
    const wrapper = mount(Button, { slots: { default: '提交' } });
    expect(wrapper.classes()).toContain('button-primary');
    expect(wrapper.text()).toBe('提交');
  });

  it('applies correct class for secondary variant', () => {
    const wrapper = mount(Button, { props: { variant: 'secondary' } });
    expect(wrapper.classes()).toContain('button-secondary');
  });

  it('applies correct class for danger variant', () => {
    const wrapper = mount(Button, { props: { variant: 'danger' } });
    expect(wrapper.classes()).toContain('button-danger');
  });

  it('emits click event', async () => {
    const wrapper = mount(Button);
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('disables button when disabled prop is true', () => {
    const wrapper = mount(Button, { props: { disabled: true } });
    expect(wrapper.attributes('disabled')).toBeDefined();
  });
});
