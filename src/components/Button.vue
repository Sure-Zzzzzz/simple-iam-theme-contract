<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}>();

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const computedClass = computed(() => {
  const base = props.variant || 'primary';
  return `button-${base}`;
});
</script>

<template>
  <button
    :class="computedClass"
    :disabled="disabled"
    type="button"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>
