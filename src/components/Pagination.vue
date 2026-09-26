<script setup lang="ts">
import { computed } from 'vue';
import FormSelect, { type FormSelectOption } from './FormSelect.vue';

const props = defineProps<{
  current: number;
  total: number;
  pageSize: number;
  pageSizeOptions?: number[];
}>();

const emit = defineEmits<{
  'update:current': [page: number];
  'update:pageSize': [size: number];
}>();

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / props.pageSize))
);

const pageSizeOpts = computed(() =>
  props.pageSizeOptions || [10, 20, 50, 100]
);

const pageSizeSelectOptions = computed<FormSelectOption[]>(() =>
  pageSizeOpts.value.map(size => ({ label: `${size} 条/页`, value: size }))
);

const showSizeSelector = computed(() =>
  props.pageSizeOptions === undefined || props.pageSizeOptions.length > 0
);

const pageList = computed(() => {
  const current = props.current;
  const total = totalPages.value;
  const delta = 2;
  const range: (number | string)[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push('...');
  for (let i = left; i <= right; i++) {
    if (i > 1 && i < total) range.push(i);
  }
  if (right < total - 1) range.push('...');
  if (total > 1) range.push(total);

  return range;
});

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === props.current) return;
  emit('update:current', page);
}

function changePageSize(value: string | number) {
  const newSize = Number(value);
  emit('update:pageSize', newSize);
  if (props.current > Math.ceil(props.total / newSize)) {
    emit('update:current', 1);
  }
}
</script>

<template>
  <nav class="pagination">
    <div v-if="showSizeSelector" class="pagination-size-selector">
      <FormSelect
        :model-value="pageSize"
        :options="pageSizeSelectOptions"
        aria-label="每页条数"
        @change="changePageSize"
      />
    </div>

    <div class="pagination-pages">
      <button
        class="pagination-step"
        :disabled="current === 1"
        @click="goToPage(current - 1)"
      >
        上一页
      </button>
      <template v-for="(page, index) in pageList" :key="index">
        <button
          v-if="typeof page === 'number'"
          :class="{ active: page === current }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <span v-else>…</span>
      </template>
      <button
        class="pagination-step"
        :disabled="current === totalPages"
        @click="goToPage(current + 1)"
      >
        下一页
      </button>
    </div>
  </nav>
</template>
