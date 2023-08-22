<template>
  <span>
    <span v-for="field of mergedInlineFields">
      <a-tag class="ml-1">{{ field.alias || field.label }}</a-tag>
      <span v-if="field.dictionary">{{ getDictionary(field.dictionary)[data[field.code]] || data[field.code] }}</span>
      <span v-else-if="field.refer?.object && referObjects[field.code]?.length">
        <brief-viewer :data-key="field.refer.object as GameDataKey" :data="referObjects[field.code]![0]!" />
      </span>
      <span v-else>{{ data[field.code] }}</span>
    </span>
  </span>
</template>

<script setup lang="ts">

import { GameDataKey } from '@/common/ggbh-meta';
import { useGameObject } from "@/data/app-config";
import { useGameData } from '@/data/customized-game-data';
import { computed } from 'vue';
import BriefViewer from '@/components/brief-viewer.vue';
import { getDictionary } from '@/data/dict';

const props = defineProps<{
  dataKey: GameDataKey
  data: GameConfigDataType
}>();

const { mergedInlineFields } = useGameObject(() => props.dataKey);
const { gameData } = useGameData();

const referObjects = computed(() => {
  const result: Record<string, GameConfigDataType[] | undefined> = {}
  mergedInlineFields.value.filter(field => field.refer?.object)
    .forEach(field => {
      result[field.code] = gameData.combined[field.refer!.object as GameDataKey]
        .filter(data => data[field.refer!.field] === props.data[field.code])
    })
  return result
})

</script>


<style scoped></style>
