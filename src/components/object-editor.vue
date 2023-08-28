
<template>
  <a-descriptions :column="1" bordered size="small" v-bind="$attrs">
    <a-descriptions-item v-for="field of fields" :key="field.code"
      :label="field.alias?.trim() || field.label?.trim() || field.code">
      <a-select v-if="field.dictionary" size="small" width="200px" :options="getSelectOptions(field.dictionary)"
        v-model:value="model[field.code]"></a-select>
      <span v-else-if="field.refer?.length">
        <reference-field-editor :data-key="dataKey" :field="field"
          v-model:field-value="model[field.code]"></reference-field-editor>
      </span>
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
import ReferenceFieldEditor from './form/reference-field-editor.vue';

const props = defineProps<{
  dataKey: GameDataKey,
  objectId: string,
}>()

// model
const model = ref<GameObjectData>({ id: props.objectId });

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
  console.log("save", model.value)
  gameData.updateObject(props.dataKey, model.value)
}

defineExpose({
  save
})
</script>
