<template>
  <span class="mx-0.5">
    <span v-for="field of mergedBriefFields">
      <field-display :data-key="props.dataKey" :field="field" :field-value="data[field.code]" />
    </span>
    <a-tooltip :title="`${dataKey} - ${data.id}`">
      <a @click="showDetailModal = true">
        <info-circle-outlined></info-circle-outlined>
      </a>
    </a-tooltip>
    <a-modal v-model:open="showDetailModal" :title="`${dataKey} - ${data.id}`" width="800px">
      <div class="overflow-y-scroll w-full" style="max-height: 500px">
        <game-data-viewer :data-key="dataKey" :data="data"></game-data-viewer>
      </div>
    </a-modal>
  </span>
</template>

<script setup lang="ts">

import { GameDataKey } from '@/common/ggbh-meta';
import { useGameObject } from "@/data/app-config";
import { ref } from 'vue';
import { InfoCircleOutlined } from '@ant-design/icons-vue';
import FieldDisplay from './field-display.vue';
import GameDataViewer from './game-data-viewer.vue';

const props = defineProps<{
  dataKey: GameDataKey
  data: GameConfigDataType
}>();

const { mergedBriefFields } = useGameObject(() => props.dataKey);

const showDetailModal = ref<boolean>(false)
</script>

<style scoped></style>
