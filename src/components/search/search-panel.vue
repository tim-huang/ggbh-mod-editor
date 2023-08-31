<template>
  <div class="w-full h-full">
    <div class="w-full h-[42px]">
      <a-input size="large" ref="inputRef" v-model:value="keyword" @keypress="onKeyPress"
        placeholder="Type anything to search"></a-input>
    </div>
    <div v-if="!resultSummary.length" class="h-full flex flex-col justify-center">
      <a-empty></a-empty>
    </div>
    <div v-else class="w-full h-[calc(100%-42px)] border border-black flex flex-row ">
      <div class="w-[250px] h-[calc(100%)] overflow-y-scroll p-1 flex flex-col gap-1">
        <div v-for="(item, idx) in resultSummary" :key="item.key" @click="summaryIndexCounter = idx"
          :class="{ 'p-1 border border-solid rounded border-gray-200': true, 'bg-blue-200 border-blue-400': summaryIndex === idx }">
          <span class="mr-2">{{ item.key }}</span>
          <a-badge :count="item.count" :overflow-count="999"></a-badge>
        </div>
      </div>
      <div class="w-[250px] h-[calc(100%)] overflow-y-scroll p-1 flex flex-col gap-1">
        <div v-for="(item, idx) in objectDataSource" :key="item.key" @click="objectIndexCounter = idx"
          :class="{ 'p-1 border border-solid rounded border-gray-200': true, 'bg-blue-200 border-blue-400': objectIndex === idx }">
          <span class="mr-2">{{ item.id }}</span>
        </div>
      </div>
      <div class="w-[calc(100%-504px)] h-[calc(100%)] overflow-y-scroll p-1">
        <game-data-viewer v-if="selectedSummary && selectedObject" :data-key="selectedSummary.key" :data="selectedObject">
        </game-data-viewer>
        <a-empty v-else></a-empty>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import GameDataViewer from '../game-data-viewer.vue';
import { useGameData } from '@/data/customized-game-data';
import { GameDataKey } from '@/common/ggbh-meta';
import { useDebounceFn } from '@vueuse/core';

const emits = defineEmits<{
  (e: 'select', item: { type: GameDataKey, id: string }): void;
}>()

const { search } = useGameData();
const inputRef = ref();
const keyword = ref<string>('');

// debounce search
const dataSource = ref<Partial<Record<GameDataKey, GameObjectData[]>>>({})
const debounceSearch = useDebounceFn(() => {
  dataSource.value = search({ keyword: keyword.value })
}, 300);

const stopWatchKeyword = watch(keyword, () => {
  debounceSearch();
})

// summarize result
const resultSummary = computed(() => {
  return Object.entries(dataSource.value).map(([k, v]) => {
    return {
      key: k as GameDataKey,
      count: v.length,
    };
  })
})

// search result summary navigation
const summaryIndexCounter = ref<number>(0);

const summaryIndex = computed<number>(() => {
  if (!resultSummary.value.length) return 0;
  const mod = summaryIndexCounter.value % resultSummary.value.length;
  return mod < 0 ? (resultSummary.value.length + mod) : mod;
})

const selectedSummary = computed<{ key: GameDataKey, count: number } | undefined>(() => {
  if (resultSummary.value.length) {
    return resultSummary.value[summaryIndex.value]
  }
})

// object list navigation
const objectIndexCounter = ref<number>(0);
const objectDataSource = computed<GameObjectData[]>(() => {
  if (selectedSummary.value) {
    return dataSource.value[selectedSummary.value.key] || [];
  }
  return [];
})

const objectIndex = computed(() => {
  if (!objectDataSource.value.length) return 0;
  const mod = objectIndexCounter.value % objectDataSource.value.length;
  return mod < 0 ? (objectDataSource.value.length + mod) : mod;
})

// object viewer
const selectedObject = computed(() => {
  if (objectDataSource.value.length)
    return objectDataSource.value[objectIndex.value]
})

// hotkey
const onKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    if (e.shiftKey) {
      summaryIndexCounter.value++;
      objectIndexCounter.value = 0;
      e.stopPropagation();
    } else {
      objectIndexCounter.value++
      e.stopPropagation()
    }
  } else if (e.key === 'ArrowUp') {
    if (e.shiftKey) {
      summaryIndexCounter.value--;
      objectIndexCounter.value = 0;
      e.stopPropagation();
    } else {
      objectIndexCounter.value--
      e.stopPropagation();
    }
  } else if (e.key === 'Enter') {
    if (selectedObject.value && selectedSummary.value) {
      emits('select', { type: selectedSummary.value.key, id: selectedObject.value.id })
    }
    e.stopPropagation();
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyPress);
  inputRef.value?.focus();
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyPress);
  stopWatchKeyword();
})
</script>

<style scoped>
.sub-title {
  font-size: 0.8em;
}
</style>
