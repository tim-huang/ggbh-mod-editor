
<template>
  <span v-if="fieldValue" class="mx-0.5 border border-solid border-transparent rounded-sm hover:border-b-purple-300">
    <span v-if="field.dictionary">{{ getDictionary(field.dictionary)[fieldValue] || fieldValue }}</span>
    <span v-else-if="field.refer?.length && Object.keys(referObjects || {}).length">
      <template v-for="(objs, key) in referObjects">
        <brief-viewer v-for="obj of objs" :data-key="key" :data="obj" :key="key + obj.id"></brief-viewer>
      </template>
    </span>
    <span v-else :title="fieldValue">{{ limitText(fieldValue) }}</span>
  </span>
</template>

<script setup lang="ts">

import { GameDataKey } from '@/common/ggbh-meta';
import { useGameData } from '@/data/customized-game-data';
import { computed } from 'vue';
import { getDictionary } from '@/data/dict';
import BriefViewer from './brief-viewer.vue';

const props = defineProps<{
  dataKey: GameDataKey,
  field: AppConfig.IFieldConfig,
  fieldValue?: string
}>();

const { getReferenceObjectsByField } = useGameData();
const referObjects = computed(() => {
  return getReferenceObjectsByField(props.field, props.fieldValue)
})

const limitText = computed(() => {
  return (s: string, length: number = 80) => {
    if ((s?.length ?? 0) <= length) {
      return s;
    }
    return s.substring(0, length) + '...';
  }
})
</script>

<style scoped></style>
