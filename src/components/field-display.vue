
<template>
  <span v-if="fieldValue">
    <span v-if="field.dictionary">{{ appConfig.getDictionary(field.dictionary)[fieldValue] || fieldValue }}</span>
    <span v-else-if="field.refer?.length && Object.keys(referObjects || {}).length">
      <template v-for="(objs, key) in referObjects">
        <template v-for="(obj, idx) in objs" :key="key + obj.id">
          <brief-viewer :data-key="key" :data="obj"></brief-viewer>
          <br v-if="idx !== (objs?.length ?? 0) - 1">
        </template>
      </template>
    </span>
    <span v-else :title="fieldValue">{{ limitText(fieldValue) }}</span>
  </span>
</template>

<script setup lang="ts">

import { GameDataKey } from '@/common/ggbh-meta';
import { useGameData } from '@/data/customized-game-data';
import { computed } from 'vue';
import BriefViewer from './brief-viewer.vue';
import { useAppConfig } from '@/data/app-config';

const props = defineProps<{
  dataKey: GameDataKey,
  field: AppConfig.IFieldConfig,
  fieldValue?: string
}>();

const { getReferenceObjectsByField } = useGameData();
const appConfig = useAppConfig()
const referObjects = computed(() => {
  return getReferenceObjectsByField(props.field, props.fieldValue)
})

const limitText = computed(() => {
  return (s: string, length: number = 30) => {
    if ((s?.length ?? 0) <= length) {
      return s;
    }
    return s.substring(0, length) + '...';
  }
})
</script>

<style scoped></style>
