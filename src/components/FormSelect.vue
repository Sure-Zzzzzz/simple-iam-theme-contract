<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

/**
 * 自绘下拉选择器。宿主环境（内嵌 webview）中原生 select 弹层坐标不可靠，
 * 统一以按钮 + 绝对定位列表自绘；键盘交互对齐原生（上下选择、回车确认、Esc 关闭）。
 */
export interface FormSelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<{
  modelValue: string | number | null;
  options: FormSelectOption[];
  ariaLabel?: string;
  placeholder?: string;
  disabled?: boolean;
}>(), {
  disabled: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  change: [value: string | number];
}>();

const open = ref(false);
const openUp = ref(false);
const focusedIndex = ref(-1);
const root = ref<HTMLElement | null>(null);

const selectedIndex = computed(() => props.options.findIndex(option => option.value === props.modelValue));
const selectedLabel = computed(() => {
  const option = props.options[selectedIndex.value];
  return option ? option.label : (props.placeholder ?? '');
});

function enabledIndices(): number[] {
  return props.options.reduce((acc, option, index) => {
    if (!option.disabled) acc.push(index);
    return acc;
  }, [] as number[]);
}

function toggle() {
  if (props.disabled) return;
  if (open.value) {
    close();
    return;
  }
  openUp.value = shouldOpenUp();
  open.value = true;
  focusedIndex.value = selectedIndex.value >= 0 ? selectedIndex.value : (enabledIndices()[0] ?? -1);
}

/**
 * 弹层方向判定：以“弹层实际需要的空间”为准（菜单高度上限 256px + 间距 6px ≈ 264），
 * 分别对视口与最近的裁剪祖先（overflow 非 visible 的祖先，如圆角卡片 overflow:hidden）
 * 计算下方可用空间——任一场景下方放不下且上方更宽裕即向上弹。
 * 只覆盖真实需要方向的场景，不改变原有“上下都不挤”时向下弹的默认。
 */
function shouldOpenUp(): boolean {
  const element = root.value;
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  const menuHeight = Math.min(256, Math.max(props.options.length, 1) * 36 + 8) + 6;
  const viewportBelow = window.innerHeight - rect.bottom;
  let clippedBelow = viewportBelow;
  // 向上找最近的可裁剪祖先；position:absolute 的弹层会被它的 overflow 裁掉。
  // html/body 不算：视口滚动条不裁 absolute 定位的弹层，jsdom 里 body 的
  // overflow 计算值也不可靠，跳过避免误判。
  let ancestor: HTMLElement | null = element.parentElement;
  while (ancestor && ancestor !== document.body && ancestor !== document.documentElement) {
    const overflowY = getComputedStyle(ancestor).overflowY;
    if (overflowY !== 'visible' && overflowY !== 'clip') {
      const ancestorRect = ancestor.getBoundingClientRect();
      // 零面积 rect（未布局环境）给不出裁剪信息，视为不裁剪继续向上找
      if (ancestorRect.height > 0 || ancestorRect.bottom !== 0) {
        clippedBelow = Math.min(clippedBelow, ancestorRect.bottom - rect.bottom);
        break;
      }
    }
    ancestor = ancestor.parentElement;
  }
  const spaceBelow = Math.min(viewportBelow, clippedBelow);
  const spaceAbove = rect.top;
  return spaceBelow < menuHeight && spaceAbove > spaceBelow;
}

function close() {
  open.value = false;
  focusedIndex.value = -1;
}

function choose(index: number) {
  const option = props.options[index];
  if (!option || option.disabled) return;
  emit('update:modelValue', option.value);
  emit('change', option.value);
  close();
}

function move(step: number) {
  const enabled = enabledIndices();
  if (!enabled.length) return;
  const current = enabled.indexOf(focusedIndex.value);
  const next = current < 0 ? 0 : Math.min(Math.max(current + step, 0), enabled.length - 1);
  focusedIndex.value = enabled[next];
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return;
  if (!open.value && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
    event.preventDefault();
    toggle();
    return;
  }
  if (!open.value) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    close();
    return;
  }
  if (event.key === 'Tab') {
    close();
    return;
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    move(1);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    move(-1);
  } else if (event.key === 'Enter') {
    event.preventDefault();
    choose(focusedIndex.value);
  }
}

function onDocMousedown(event: MouseEvent) {
  if (!open.value) return;
  if (root.value && !root.value.contains(event.target as Node)) close();
}

function onDocScroll() {
  if (open.value) close();
}

onMounted(() => {
  document.addEventListener('mousedown', onDocMousedown);
  window.addEventListener('scroll', onDocScroll, true);
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocMousedown);
  window.removeEventListener('scroll', onDocScroll, true);
});
</script>

<template>
  <span ref="root" class="form-select" :class="{ 'form-select--up': openUp }" @keydown="onKeydown">
    <button
      type="button"
      class="form-select-toggle"
      :disabled="disabled"
      :aria-expanded="open"
      aria-haspopup="listbox"
      :aria-label="ariaLabel"
      @click="toggle"
    >
      <span class="form-select-value" :class="{ 'form-select-value--placeholder': selectedIndex < 0 }">{{ selectedLabel }}</span>
      <svg class="form-select-caret" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <ul v-if="open" class="form-select-menu" role="listbox" :aria-label="ariaLabel ?? '选项列表'">
      <li
        v-for="(option, index) in options"
        :key="String(option.value)"
        role="option"
        :aria-selected="index === selectedIndex"
        :aria-disabled="option.disabled === true"
        :class="[
          'form-select-option',
          {
            'form-select-option--active': index === selectedIndex,
            'form-select-option--focused': index === focusedIndex,
            'form-select-option--disabled': option.disabled === true
          }
        ]"
        @click="choose(index)"
        @mousemove="focusedIndex = index"
      >{{ option.label }}</li>
    </ul>
  </span>
</template>
