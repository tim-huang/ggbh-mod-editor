<template>
  <div class="w-full h-full">
    <a-empty v-if="!lastUpdate.history.length"></a-empty>
    <div v-else class="w-full h-full border border-black flex flex-row ">
      <div class="w-[280px] h-[calc(100%)] overflow-y-scroll p-1 flex flex-col gap-1">
        <div v-for="(item, idx) in history" :key="item.lastUpdate" @click="index = idx"
          :class="{ 'p-1 border border-solid rounded border-gray-200': true, 'bg-blue-200 border-blue-400': index === idx }">
          <div>
            <span>{{ item.type }} - {{ item.id }}</span>
          </div>
          <div class="sub-title">
            <span class="rounded-sm border border-red-500 bg-red-100 text-red-500 border-solid p-0.5 mr-1">{{
              item.actionText
            }}</span>
            <span class="text-gray-400">{{ item.time }}</span>
          </div>
        </div>
      </div>
      <div class="w-[calc(100%-282px)] h-[calc(100%)] overflow-y-scroll p-1">
        <game-data-viewer v-if="selectedObject" :data-key="selectedHistory.type" :data="selectedObject">
        </game-data-viewer>
        <a-empty v-else></a-empty>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { LastUpdate, useLastUpdate } from '@/data/last-update';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import GameDataViewer from '../game-data-viewer.vue';
import { useGameData } from '@/data/customized-game-data';

const emits = defineEmits<{
  (e: 'select', history: LastUpdate): void;
}>()

const lastUpdate = useLastUpdate();
const { gameData } = useGameData();

type HistoryItem = LastUpdate & {
  active?: boolean;
  color: string;
  actionText: string;
  time: string;
}

const history = computed<HistoryItem[]>(() => {
  const colorMap = {
    'A': 'green',
    'M': 'blue',
    'D': 'red'
  }
  const actionMap = {
    'A': 'Added',
    'M': 'Modified',
    'D': 'Deleted'
  }
  return lastUpdate.history.map(h => {
    return {
      ...h,
      color: colorMap[h.action],
      actionText: actionMap[h.action],
      time: new Date(h.lastUpdate).toLocaleString()
    }
  })
})

const index = ref<number>(0);

const selectedHistory = computed<HistoryItem>(() => {
  return history.value[index.value];
})

const selectedObject = computed<GameObjectData | undefined>(() => {
  if (selectedHistory.value) {
    return gameData.combined[selectedHistory.value.type]?.find(o => o.id === selectedHistory.value.id)
  }
})

const next = () => {
  if (index.value < history.value.length - 1) {
    index.value++;
  } else {
    index.value = 0;
  }
}

const prev = () => {
  if (index.value > 0) {
    index.value--;
  } else {
    index.value = history.value.length - 1;
  }
}

const onKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    next()
  } else if (e.key === 'ArrowUp') {
    prev()
  } else if (e.key === 'Enter') {
    if (selectedObject.value) {
      emits('select', selectedHistory.value)
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyPress);
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyPress);
})
</script>

<style scoped>
.sub-title {
  font-size: 0.8em;
}
</style>
