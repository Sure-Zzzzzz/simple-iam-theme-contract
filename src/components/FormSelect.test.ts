import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import FormSelect from './FormSelect.vue';

const fruitOptions = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '樱桃', value: 'cherry', disabled: true }
];

async function openMenu(wrapper: ReturnType<typeof mount>) {
  await wrapper.get('.form-select-toggle').trigger('click');
}

async function pickOption(wrapper: ReturnType<typeof mount>, label: string) {
  await openMenu(wrapper);
  const option = wrapper.findAll('.form-select-option').find(node => node.text() === label);
  expect(option, `option ${label} should exist`).toBeTruthy();
  await option!.trigger('click');
}

function setViewportHeight(height: number) {
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
}

describe('FormSelect', () => {
  it('renders selected option label and marks it active in menu', async () => {
    const wrapper = mount(FormSelect, {
      props: { modelValue: 'banana', options: fruitOptions, ariaLabel: '水果' }
    });
    expect(wrapper.get('.form-select-value').text()).toBe('香蕉');
    await openMenu(wrapper);
    const options = wrapper.findAll('.form-select-option');
    expect(options.map(node => node.text())).toEqual(['苹果', '香蕉', '樱桃']);
    expect(options[1].classes()).toContain('form-select-option--active');
    expect(options[1].attributes('aria-selected')).toBe('true');
    expect(options[2].attributes('aria-disabled')).toBe('true');
    expect(wrapper.get('.form-select-toggle').attributes('aria-expanded')).toBe('true');
    expect(wrapper.get('.form-select-toggle').attributes('aria-label')).toBe('水果');
  });

  it('shows placeholder styling when modelValue matches no option', () => {
    const wrapper = mount(FormSelect, {
      props: { modelValue: null, options: fruitOptions, placeholder: '请选择' }
    });
    expect(wrapper.get('.form-select-value').text()).toBe('请选择');
    expect(wrapper.get('.form-select-value').classes()).toContain('form-select-value--placeholder');
  });

  it('falls back to empty label without placeholder', () => {
    const wrapper = mount(FormSelect, {
      props: { modelValue: 'missing', options: fruitOptions }
    });
    expect(wrapper.get('.form-select-value').text()).toBe('');
  });

  it('emits update:modelValue and change when an option is chosen', async () => {
    const wrapper = mount(FormSelect, {
      props: { modelValue: 'apple', options: fruitOptions }
    });
    await pickOption(wrapper, '香蕉');
    expect(wrapper.emitted('update:modelValue')).toEqual([['banana']]);
    expect(wrapper.emitted('change')).toEqual([['banana']]);
    expect(wrapper.find('.form-select-menu').exists()).toBe(false);
  });

  it('ignores clicks on disabled options', async () => {
    const wrapper = mount(FormSelect, {
      props: { modelValue: 'apple', options: fruitOptions }
    });
    await openMenu(wrapper);
    const disabled = wrapper.findAll('.form-select-option').find(node => node.text() === '樱桃');
    await disabled!.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.find('.form-select-menu').exists()).toBe(true);
  });

  it('toggles menu closed on second toggle click', async () => {
    const wrapper = mount(FormSelect, {
      props: { modelValue: 'apple', options: fruitOptions }
    });
    await openMenu(wrapper);
    expect(wrapper.find('.form-select-menu').exists()).toBe(true);
    await wrapper.get('.form-select-toggle').trigger('click');
    expect(wrapper.find('.form-select-menu').exists()).toBe(false);
  });

  it('does not open when disabled', async () => {
    const wrapper = mount(FormSelect, {
      props: { modelValue: 'apple', options: fruitOptions, disabled: true }
    });
    await openMenu(wrapper);
    expect(wrapper.find('.form-select-menu').exists()).toBe(false);
    expect(wrapper.get('.form-select-toggle').attributes('disabled')).toBeDefined();
  });

  it('opens with Enter and selects with ArrowDown + Enter, skipping disabled options', async () => {
    const wrapper = mount(FormSelect, {
      props: { modelValue: null, options: fruitOptions }
    });
    const toggle = wrapper.get('.form-select-toggle');
    await toggle.trigger('keydown', { key: 'Enter' });
    expect(wrapper.find('.form-select-menu').exists()).toBe(true);
    await toggle.trigger('keydown', { key: 'ArrowDown' });
    await toggle.trigger('keydown', { key: 'ArrowDown' });
    await toggle.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')).toEqual([['banana']]);
  });

  it('moves focus back with ArrowUp and keeps selection within bounds', async () => {
    const wrapper = mount(FormSelect, {
      props: { modelValue: 'banana', options: fruitOptions }
    });
    const toggle = wrapper.get('.form-select-toggle');
    await toggle.trigger('keydown', { key: 'ArrowUp' });
    let options = wrapper.findAll('.form-select-option');
    expect(options[1].classes()).toContain('form-select-option--focused');
    await toggle.trigger('keydown', { key: 'ArrowUp' });
    options = wrapper.findAll('.form-select-option');
    expect(options[0].classes()).toContain('form-select-option--focused');
    await toggle.trigger('keydown', { key: 'ArrowUp' });
    options = wrapper.findAll('.form-select-option');
    expect(options[0].classes()).toContain('form-select-option--focused');
    await toggle.trigger('keydown', { key: 'ArrowDown' });
    options = wrapper.findAll('.form-select-option');
    expect(options[1].classes()).toContain('form-select-option--focused');
  });

  it('closes on Escape and stops propagation, on Tab, on outside mousedown and on scroll', async () => {
    const wrapper = mount(FormSelect, {
      props: { modelValue: 'apple', options: fruitOptions }
    });
    const toggle = wrapper.get('.form-select-toggle');
    await openMenu(wrapper);

    const escapedSpy = vi.fn();
    document.addEventListener('keydown', escapedSpy);
    await toggle.trigger('keydown', { key: 'Escape' });
    expect(wrapper.find('.form-select-menu').exists()).toBe(false);
    expect(escapedSpy).not.toHaveBeenCalled();
    document.removeEventListener('keydown', escapedSpy);

    await openMenu(wrapper);
    await toggle.trigger('keydown', { key: 'Tab' });
    expect(wrapper.find('.form-select-menu').exists()).toBe(false);

    await openMenu(wrapper);
    document.dispatchEvent(new MouseEvent('mousedown'));
    await nextTick();
    expect(wrapper.find('.form-select-menu').exists()).toBe(false);

    await openMenu(wrapper);
    window.dispatchEvent(new Event('scroll'));
    await nextTick();
    expect(wrapper.find('.form-select-menu').exists()).toBe(false);

    await openMenu(wrapper);
    await wrapper.get('.form-select-toggle').trigger('mousedown');
    expect(wrapper.find('.form-select-menu').exists()).toBe(true);
  });

  it('opens upward when space below is insufficient', async () => {
    setViewportHeight(768);
    const wrapper = mount(FormSelect, {
      props: { modelValue: 'apple', options: fruitOptions }
    });
    wrapper.element.getBoundingClientRect = () => ({ top: 700, bottom: 720 }) as DOMRect;
    await openMenu(wrapper);
    expect(wrapper.get('.form-select').classes()).toContain('form-select--up');
  });

  it('opens downward when space below is sufficient', async () => {
    setViewportHeight(768);
    const wrapper = mount(FormSelect, {
      props: { modelValue: 'apple', options: fruitOptions }
    });
    wrapper.element.getBoundingClientRect = () => ({ top: 100, bottom: 140 }) as DOMRect;
    await openMenu(wrapper);
    expect(wrapper.get('.form-select').classes()).not.toContain('form-select--up');
  });

  it('opens upward when the nearest clipping ancestor leaves no room below even if the viewport does', async () => {
    setViewportHeight(768);
    // 模拟圆角卡片 overflow:hidden 的祖先：底边贴着触发器，视口虽有空间但弹层会被裁
    const clipping = document.createElement('div');
    clipping.style.overflow = 'hidden';
    clipping.getBoundingClientRect = () => ({ top: 0, bottom: 200, height: 200 }) as DOMRect;
    document.body.appendChild(clipping);
    const wrapper = mount(FormSelect, {
      props: { modelValue: 'apple', options: fruitOptions },
      attachTo: clipping
    });
    wrapper.element.getBoundingClientRect = () => ({ top: 100, bottom: 140 }) as DOMRect;
    await openMenu(wrapper);
    expect(wrapper.get('.form-select').classes()).toContain('form-select--up');
    wrapper.unmount();
    clipping.remove();
  });

  it('renders an empty menu without crash when options is empty', async () => {
    const wrapper = mount(FormSelect, {
      props: { modelValue: null, options: [] }
    });
    await openMenu(wrapper);
    expect(wrapper.findAll('.form-select-option')).toEqual([]);
    await wrapper.get('.form-select-toggle').trigger('keydown', { key: 'ArrowDown' });
    await wrapper.get('.form-select-toggle').trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('supports numeric option values', async () => {
    const wrapper = mount(FormSelect, {
      props: {
        modelValue: 1,
        options: [
          { label: '启用', value: 1 },
          { label: '停用', value: 0 }
        ]
      }
    });
    expect(wrapper.get('.form-select-value').text()).toBe('启用');
    await pickOption(wrapper, '停用');
    expect(wrapper.emitted('update:modelValue')).toEqual([[0]]);
  });

  it('moves focus on option mousemove', async () => {
    const wrapper = mount(FormSelect, {
      props: { modelValue: 'apple', options: fruitOptions }
    });
    await openMenu(wrapper);
    const option = wrapper.findAll('.form-select-option')[1];
    await option.trigger('mousemove');
    expect(option.classes()).toContain('form-select-option--focused');
  });

  it('removes document listeners on unmount', async () => {
    const wrapper = mount(FormSelect, {
      attachTo: document.body,
      props: { modelValue: 'apple', options: fruitOptions }
    });
    await openMenu(wrapper);
    expect(document.querySelectorAll('.form-select-menu').length).toBe(1);
    wrapper.unmount();
    expect(document.querySelectorAll('.form-select-menu').length).toBe(0);
    document.dispatchEvent(new MouseEvent('mousedown'));
    window.dispatchEvent(new Event('scroll'));
  });
});
