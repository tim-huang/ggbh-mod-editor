<template>
  <a-tabs v-model:activeKey="activeKey">
    <!-- Fields config -->
    <a-tab-pane key="1" tab="Fields">
      <fields-config :data-key="selectedDataKey"></fields-config>
    </a-tab-pane>
    <!-- Display config -->
    <a-tab-pane key="2" tab="Display">
      <!-- Brief display -->
      <h4>Brief Display</h4>
      <a-descriptions bordered size="small" :column="1">
        <a-descriptions-item label="Display Fields">
          <display-fields-config :data-key="selectedDataKey" display-mode="brief" />
        </a-descriptions-item>
        <a-descriptions-item label="Display Sample">
          <brief-viewer v-if="randomData" :data-key="selectedDataKey" :data="randomData" />
        </a-descriptions-item>
      </a-descriptions>
      <!-- Inline display -->
      <h4>Inline & Table</h4>
      <a-descriptions bordered size="small" :column="1">
        <a-descriptions-item label="Display Fields">
          <display-fields-config :data-key="selectedDataKey" display-mode="inline" />
        </a-descriptions-item>
        <a-descriptions-item label="Inline Sample">
          <inline-viewer v-if="randomData" :data-key="selectedDataKey" :data="randomData" />
        </a-descriptions-item>
        <a-descriptions-item label="Table Sample">
          <table-viewer :data-key="selectedDataKey" :data-source="randomDataSource" size="small"></table-viewer>
        </a-descriptions-item>
      </a-descriptions>
    </a-tab-pane>
    <a-tab-pane key="3" tab="Editor"></a-tab-pane>
    <template #rightExtra>
      <a-space>
        <a-button type="primary" @click="randomDataTrigger++" v-if="activeKey === '2'">Refresh Random Data</a-button>
        <a-select v-if="dataKeyChangable" v-model:value="selectedDataKey" :options="options"
          style="width: 200px; text-align: left;" show-search></a-select>
      </a-space>
    </template>
  </a-tabs>
</template>
<script setup lang="ts">
import { GameDataKey, gameMetaInfo } from "@/common/ggbh-meta";
import { computed, ref } from 'vue';
import { useGameData } from '@/data/customized-game-data';
import DisplayFieldsConfig from '@/components/app-config/display-fields-config.vue'
import InlineViewer from '@/components/viewer/inline-viewer.vue';
import BriefViewer from '@/components/viewer/brief-viewer.vue';
import FieldsConfig from "@/components/app-config/fields-config.vue";
import TableViewer from "@/components/viewer/table-viewer.vue";

const props = defineProps<{
  dataKey: GameDataKey,
  dataKeyChangable?: boolean,
}>()
const activeKey = ref("1")
const { gameData } = useGameData()

const selectedDataKey = ref<GameDataKey>(props.dataKey);
const options = Object.keys(gameMetaInfo).map((k) => ({ value: k, label: k }))

const randomDataTrigger = ref(0);

const randomData = computed<GameObjectData | undefined>(() => {
  const arr = gameData.combined[selectedDataKey.value];
  if (arr?.length) {
    const idx = Math.floor(Math.random() * arr.length) + randomDataTrigger.value * 0;
    return arr[idx]
  }
})

const randomDataSource = computed<GameObjectData[]>(() => {
  const arr = gameData.combined[selectedDataKey.value];
  const rows = 5;
  if (arr?.length) {
    if (arr.length <= rows) return arr;

    const idx = Math.floor(Math.random() * (arr.length - rows)) + randomDataTrigger.value * 0;
    return arr.slice(idx, idx + rows)
  }
  return []
})

</script>


