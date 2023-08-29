
<template>
  <a-descriptions :column="1" bordered size="small" v-bind="$attrs">
    <a-descriptions-item v-for="field of fields" :key="field.code">
      <template #label>
        <span class="mr-1">{{ field.alias?.trim() || field.label?.trim() || field.code }}</span>
        <a-dropdown v-if="field.code !== 'id' && !field.dictionary && !field.refer?.length" trigger="click">
          <a title="Example">
            <unordered-list-outlined></unordered-list-outlined>
          </a>
          <template #overlay>
            <a-menu :items="samples[field.code]" @click="setFieldValue(field.code, $event)"></a-menu>
          </template>
        </a-dropdown>
      </template>
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
import { computed, onUnmounted, ref, watchEffect } from 'vue';
import ReferenceFieldEditor from './form/reference-field-editor.vue';
import { UnorderedListOutlined } from '@ant-design/icons-vue';

const props = defineProps<{
  dataKey: GameDataKey,
  // objectId: string,
  value: GameObjectData,
}>()

const emits = defineEmits<{
  (e: 'update:value', value: GameObjectData): void;
}>();

// model
const model = ref<GameObjectData>({ id: '' });

const { gameData } = useGameData();
const stopWatchingProps = watchEffect(() => {
  model.value = props.value
});

// construct form
const { mergedObjectConfig } = useGameObject(() => props.dataKey);
const fields = computed<AppConfig.IFieldConfig[]>(() => {
  return Object.values(mergedObjectConfig.value.fields || {})
})

// compute field sample
const samples = computed<Record<string, ItemType[]>>(() => {
  const setMap: Record<string, Set<string>> = {};
  gameData.combined[props.dataKey]?.forEach(o => {
    Object.entries(o).forEach(([k, v]) => {
      setMap[k] = setMap[k] || new Set<string>();
      setMap[k].add(v)
    })
  })
  const result: Record<string, ItemType[]> = {};
  Object.entries(setMap).forEach(([k, v]) => {
    result[k] = Array.from(v).slice(0, 20).map(s => {
      return {
        label: s,
        key: s,
      } as unknown as ItemType;
    });
  })
  return result;
})

// select sample value to fill field value
const setFieldValue = (fieldCode: string, { key }: { key: string }) => {
  model.value[fieldCode] = key;
}

onUnmounted(stopWatchingProps)

// save
const save = () => {
  gameData.updateObject(props.dataKey, model.value)
}

defineExpose({
  save
})
</script>
