
<template>
  <div class="w-full h-full">
    <a-descriptions :column="1" bordered size="small" v-bind="$attrs" :label-style="{ width: '280px' }">
      <template #extra v-if="isNewObject">
        <a-button @click="objectSelectorVisible = true">
          <template #icon>
            <copy-outlined></copy-outlined>
          </template>
          Copy from
        </a-button>

        <object-selector v-model:open="objectSelectorVisible" :width="`${width - 64}px`" placement="left"
          :data-key-restrict="[dataKey]" @select="onTemplateSelected"></object-selector>
      </template>
      <a-descriptions-item v-for="field of fields" :key="field.code">
        <template #label>
          <a-space>
            <span>{{ field.alias?.trim() || field.label?.trim() || field.code }}</span>
            <a-dropdown v-if="field.code !== 'id' && !field.dictionary && !field.refer?.length" trigger="click">
              <a title="Example">
                <unordered-list-outlined></unordered-list-outlined>
              </a>
              <template #overlay>
                <a-menu :items="samples[field.code]" @click="setFieldValue(field.code, $event)"></a-menu>
              </template>
            </a-dropdown>
            <a @click="paste((text: string) => model[field.code] = text)" title="Paste">
              <SnippetsOutlined class="text-blue-500"></SnippetsOutlined>
            </a>
          </a-space>
        </template>
        <!-- <a-select v-if="field.dictionary" size="small" style="width:400px;" show-search :filterOption="commonFilter" -->
        <!--   :options="appConfig.getSelectOptions(field.dictionary)" v-model:value="model[field.code]"></a-select> -->
        <customized-select v-if="field.dictionary" style="width:400px;" show-search :filterOption="commonFilter"
          :options="appConfig.getSelectOptions(field.dictionary)" v-model:value="model[field.code]"></customized-select>
        <span v-else-if="field.refer?.length">
          <reference-field-editor :data-key="dataKey" :field="field"
            v-model:field-value="model[field.code]"></reference-field-editor>
        </span>
        <a-textarea v-else-if="field.multiLines" :rows="5" v-model:value="model[field.code]">
        </a-textarea>
        <a-input v-else size="small" v-model:value="model[field.code]">
          <template #addonAfter>
            <FunctionOutlined title="Reference a value" @click="openSkillValueSelector(field.code)"></FunctionOutlined>
          </template>
        </a-input>
      </a-descriptions-item>
    </a-descriptions>
    <object-selector v-model:open="skillValueSelectorVisible" :width="`${width - 64}px`" placement="left"
      :data-key-restrict="[GameDataKey.BattleSkillValue]" @select="fillWithSkillValue($event)"></object-selector>
  </div>
</template>
<script lang="ts" setup>
import { GameDataKey } from '@/common/ggbh-meta';
import { useGameObject } from '@/data/app-config';
import { useGameData } from '@/data/customized-game-data';
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import ReferenceFieldEditor from './form/reference-field-editor.vue';
import { UnorderedListOutlined, CopyOutlined, SnippetsOutlined, FunctionOutlined } from '@ant-design/icons-vue';
import { useWindowSize } from '@vueuse/core';
import ObjectSelector from './object-browser/object-selector.vue';
import CustomizedSelect from './form/customized-select.vue';
import { paste } from '@/utils/clipboard';
import { ItemType } from 'ant-design-vue';
import { getObjectFieldsModifier } from '@/data/object-fields-plugin';
import { useLastUpdate } from '@/data/last-update';

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

const isNewObject = computed<boolean>(() => {
  return !gameData.combined[props.dataKey]?.find(o => o.id === props.value.id)
});

// Find a template and copy it's value to model
const objectSelectorVisible = ref<boolean>(false);
const { width } = useWindowSize();
const onTemplateSelected = ({ type, items }: { type: GameDataKey, items: GameObjectData[] }) => {
  if (type === props.dataKey && items.length) {
    // copy values from template, except id
    Object.assign(model.value, model.value, items[0], { id: model.value.id });
    delete model.value.customized
  }
  objectSelectorVisible.value = false;
}

// construct form by object metadata
const { mergedObjectConfig, appConfig } = useGameObject(() => props.dataKey);
const fields = computed<AppConfig.IFieldConfig[]>(() => {
  const fn = getObjectFieldsModifier(props.dataKey);
  if (!fn) return Object.values(mergedObjectConfig.value.fields || {})
  return fn(model.value)
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

//common filter
const commonFilter = (input: string, option: { label: string, value: string }) => {
  if (!input?.trim()) return true
  return option.label.indexOf(input.trim()) >= 0 || option.value.indexOf(input.trim()) >= 0;
}

// select sample value to fill field value
const setFieldValue = (fieldCode: string, { key }: { key: string }) => {
  model.value[fieldCode] = key;
}

// fill with skill value
const skillValueSelectorVisible = ref<boolean>(false);
let fieldCodeToFill = '';
const openSkillValueSelector = (fieldCode: string) => {
  fieldCodeToFill = fieldCode;
  skillValueSelectorVisible.value = true;
}
const fillWithSkillValue = ({ items }: { items: GameObjectData[] }) => {
  skillValueSelectorVisible.value = false;
  if (!items?.length) return;
  model.value[fieldCodeToFill] = (items[0] as BattleSkillValue).key
}

const log = () => useLastUpdate().log(props.dataKey, props.value?.id, 'V')

// log once
log();
const stopWatch = watch([() => props.dataKey, () => props.value?.id], log);

onUnmounted(stopWatch)
onUnmounted(stopWatchingProps)

// save
const save = () => {
  emits('update:value', model.value)
}

defineExpose({
  save
})
</script>
