<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{
  open: boolean;
  title: string;
  description?: string;
  pending?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const panel = ref<HTMLElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

async function focusPanel() {
  if (!props.open) return;
  previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  await nextTick();
  panel.value?.focus();
}

function close() {
  if (props.pending) return;
  emit('close');
  previouslyFocused?.focus();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close();
  }
}

watch(() => props.open, focusPanel);
onMounted(() => document.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));
</script>

<template>
  <div v-if="open" class="drawer-backdrop" @click.self="close">
    <aside
      ref="panel"
      class="entity-drawer"
      role="dialog"
      aria-modal="true"
      :aria-busy="pending || undefined"
      :aria-label="title"
      tabindex="-1"
    >
      <header class="drawer-header">
        <div>
          <p v-if="description">{{ description }}</p>
          <h2>{{ title }}</h2>
        </div>
        <button type="button" aria-label="关闭" class="icon-button" @click="close">
          ×
        </button>
      </header>
      <div class="drawer-content">
        <slot />
      </div>
    </aside>
  </div>
</template>
