
<template>
  <a-descriptions :column="1" bordered size="small">
    <a-descriptions-item v-for="field of fields" :key="field.code"
      :label="field.alias?.trim() || field.label?.trim() || field.code">
      <a-select v-if="field.dictionary" size="small" width="200px" :options="getSelectOptions(field.dictionary)"
        v-model:value="model[field.code]"></a-select>
      <a-input v-else size="small" v-model:value="model[field.code]">
      </a-input>
    </a-descriptions-item>
  </a-descriptions>
</template>
<script lang="ts" setup>
import { GameDataKey } from '@/common/ggbh-meta';
import { useGameObject } from '@/data/app-config';
import { useGameData } from '@/data/customized-game-data';
import { getSelectOptions } from '@/data/dict';
import { computed, onUnmounted, reactive, ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps<{
  dataKey: GameDataKey,
  objectId: string,
}>()

// model
const model = ref<GameConfigDataType>({ id: props.objectId });

const { gameData } = useGameData();
const stopWatchingProps = watchEffect(() => {
  const objects = gameData.combined[props.dataKey];
  const obj = objects.find(o => o.id === props.objectId);
  model.value = Object.assign({}, obj || { id: props.objectId })
});

// construct form
const { mergedObjectConfig } = useGameObject(() => props.dataKey);
const fields = computed<AppConfig.IFieldConfig[]>(() => {
  return Object.values(mergedObjectConfig.value.fields || {})
})
onUnmounted(stopWatchingProps)

// save
const save = () => {
  gameData.updateObject(props.dataKey, model.value)
}
</script>
