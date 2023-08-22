<template>
  <span class="mx-0.5">
    <span v-for="field of mergedBriefFields">
      <a-tag v-if="!field.refer?.object">{{ data[field.code] }}</a-tag>
      <span v-else-if="referObjects[field.code]?.length">
        <BriefViewer :data-key="field.refer.object as GameDataKey" :data="referObjects[field.code]![0]!" />
      </span>
    </span>
  </span>
</template>

<script setup lang="ts">

import { GameDataKey } from '@/common/ggbh-meta';
import { useGameObject } from "@/data/app-config";
import { useGameData } from '@/data/customized-game-data';
import { computed } from 'vue';

const props = defineProps<{
  dataKey: GameDataKey
  data: GameConfigDataType
}>();

const { mergedBriefFields } = useGameObject(() => props.dataKey);
const { gameData } = useGameData();

const referObjects = computed(() => {
  const result: Record<string, GameConfigDataType[] | undefined> = {}
  mergedBriefFields.value.filter(field => field.refer?.object)
    .forEach(field => {
      result[field.code] = gameData.combined[field.refer!.object as GameDataKey]
        .filter(data => data[field.refer!.field] === props.data[field.code])
    })
  return result
})

</script>

<script lang="ts">
export default {
  name: 'BriefViewer'
}
</script>


<style scoped></style>
