<template>
  <div class="w-full h-full">
    <a-empty v-if="!lastUpdate.history.length"></a-empty>
    <div v-else class="w-full h-full border border-black flex flex-row ">
      <div class="w-[280px] h-[calc(100%)] p-1 flex flex-col gap-1">
        <div class="w-full h-[24px] text-left px-1">
          <a-switch v-model:checked="updatedOnly">
            <template #checkedChildren>Updated</template>
            <template #unCheckedChildren>All</template>
          </a-switch>
          <span class="text-gray-400 mx-1 text-xs">
            <span class="font-bold text-red-300">U</span> to switch,
            <span class="font-bold text-red-300">Up/Down</span> to Nav.
          </span>
        </div>
        <div
          class="w-full h-[calc(100%-24px)] flex flex-col overflow-y-scroll gap-1 border border-solid rounded border-gray-100 p-0.5">
          <div v-for="(item, idx) in history" :key="item.lastUpdate" @click="index = idx"
            :class="{ 'p-1 border border-solid rounded border-gray-200': true, 'bg-blue-200 border-blue-400': index === idx }"
            @dblclick="browseObject">
            <div>
              <span>{{ item.type }} - {{ item.id }}</span>
            </div>
            <div class="sub-title">
              <span :class="'rounded-sm border border-solid p-0.5 mr-1 ' + item.color">{{
                item.actionText
              }}</span>
              <span class="text-gray-400">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="w-[calc(100%-282px)] h-[calc(100%)] overflow-y-scroll p-1">
        <game-data-viewer v-if="selectedHistory && selectedObject" :data-key="selectedHistory.type"
          :data="selectedObject">
        </game-data-viewer>
        <a-empty v-else></a-empty>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { LastUpdate, useLastUpdate } from '@/data/last-update';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import GameDataViewer from '../viewer/game-data-viewer.vue';
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

const updatedOnly = ref<boolean>(false);

const history = computed<HistoryItem[]>(() => {
  const colorMap = {
    'A': 'border-green-500 bg-green-100 text-green-500',
    'M': 'border-blue-500 bg-blue-100 text-blue-500',
    'D': 'border-red-500 bg-red-100 text-red-500',
    'V': 'border-gray-500 bg-gray-100 text-gray-500'
  }
  const actionMap = {
    'A': 'Added',
    'M': 'Modified',
    'D': 'Deleted',
    'V': 'Visited',
  }
  // updated only
  const arr: HistoryItem[] = [];
  const set: Set<string> = new Set(); // keep element unique
  const addItem = (item: LastUpdate) => {
    const key = item.type + item.id;
    if (!set.has(key)) {
      arr.push({
        ...item,
        color: colorMap[item.action],
        actionText: actionMap[item.action],
        time: new Date(item.lastUpdate).toLocaleString()
      })
      set.add(key)
    }
  }
  if (updatedOnly.value) {
    lastUpdate.history.forEach(addItem)
    return arr;
  }
  // both visited and updated
  let [i, j] = [0, 0];
  while (i < lastUpdate.history.length && j < lastUpdate.MRU.length) {
    const [his, mru] = [lastUpdate.history[i], lastUpdate.MRU[j]];
    if (his.lastUpdate > mru.lastUpdate) {
      addItem(his);
      i++;
    } else {
      addItem(mru);
      j++;
    }
  }
  [lastUpdate.history.slice(i), lastUpdate.MRU.slice(j)].forEach(ele => ele.forEach(addItem))
  return arr;
})

const index = ref<number>(0);

const selectedHistory = computed<HistoryItem | undefined>(() => {
  if (history.value) return history.value[index.value];
})

const selectedObject = computed<GameObjectData | undefined>(() => {
  if (selectedHistory.value) {
    return gameData.combined[selectedHistory.value.type]?.find(o => o.id === selectedHistory.value?.id)
  }
})

const next = () => {
  if (history.value.length) {
    index.value = (index.value + 1) % history.value.length
  }
}

const prev = () => {
  if (history.value.length) {
    const i = (index.value - 1) % history.value.length
    index.value = i < 0 ? (history.value.length + i) : i;
  }
}

const browseObject = () => {
  if (selectedObject.value && selectedHistory.value) {
    emits('select', selectedHistory.value)
  }
}
const onKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    next()
  } else if (e.key === 'ArrowUp') {
    prev()
  } else if (e.key === 'Enter') {
    browseObject();
  } else if (['U', 'u'].includes(e.key)) {
    updatedOnly.value = !updatedOnly.value;
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyPress);
  lastUpdate.disabled = true;
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyPress);
  lastUpdate.disabled = false;
})
</script>

<style scoped>
.sub-title {
  font-size: 0.8em;
}
</style>
