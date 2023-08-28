<template>
  <a-drawer v-bind="$attrs">
    <template #title>
      <a-space>
        <a-button type="primary" :icon="h(SettingOutlined)" @click="fieldsConfigDialogVisibile = true" shape="circle">
        </a-button>
        <span>{{ dataKey }}</span>
      </a-space>
    </template>
    <template #extra>
      <a-form layout="inline" :model="searchModel" size="small" class="mx-10">
        <a-form-item>
          <a-checkbox v-model:checked="customizedOnly">Customized Only</a-checkbox>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="dataKey" :options="options" style="width: 250px; text-align: left;"
            show-search></a-select>
        </a-form-item>
        <a-form-item>
          <a-input-search v-model:value="searchModel[keywordSymbol]" allowClear placeholder="keyword"
            width="120px"></a-input-search>
        </a-form-item>
      </a-form>
    </template>
    <div class="w-full h-full">
      <!-- search form -->
      <div class="my-2">
        <a-form layout="inline" :model="searchModel" size="small" class="mx-10">
          <a-form-item v-for="field of dictionaryField" :key="field.code">
            <a-select :options="getSelectOptions(field.dictionary!)" v-model:value="searchModel[field.code]"
              :placeholder="field.alias?.trim() || field.label?.trim() || field.code" style="width: 150px"
              allowClear></a-select>
          </a-form-item>
        </a-form>

      </div>

      <!-- table  -->
      <table-viewer :data-key="dataKey" :data-source="dataSource" size="small" @select="onSelect" bordered></table-viewer>
      <!-- field config -->
      <a-modal v-model:open="fieldsConfigDialogVisibile" title="Customization" width="800px" @ok="onConfigOk"
        :okButtonProps="{ disabled: pending }" destroy-on-close>
        <div class="overflow-scroll h-[600px]">
          <object-config :data-key="dataKey"></object-config>
        </div>
      </a-modal>
    </div>
  </a-drawer>
</template>
<script setup lang="ts">
import { ref, h, reactive, computed } from 'vue';
import { GameDataKey, gameMetaInfo } from '@/common/ggbh-meta';
import { SettingOutlined } from '@ant-design/icons-vue';
import { useGameObject } from '@/data/app-config';
import { usePending } from '@/utils/use';
import { useGameData } from '@/data/customized-game-data';
import { getSelectOptions } from '@/data/dict';
import TableViewer from '../table-viewer.vue';
import ObjectConfig from '../app-config/object-config.vue';

const props = defineProps<{
  dataKeyRestrict?: GameDataKey[],
}>();

const emits = defineEmits<{
  (e: 'select', item: { type: GameDataKey, item: GameObjectData }): void;
}>();

const customizedOnly = ref<boolean>(false);

const options = computed(() => {
  return (props.dataKeyRestrict?.length ? props.dataKeyRestrict : Object.keys(gameMetaInfo))
    .map((k) => ({ value: k, label: k }))
});

const dataKey = ref<GameDataKey>(props.dataKeyRestrict?.length ? props.dataKeyRestrict[0] : GameDataKey.ArtifactShape);

// customize
const { appConfig, mergedObjectConfig } = useGameObject(() => dataKey.value)
const fieldsConfigDialogVisibile = ref<boolean>(false)
const { pending, fn: saveConfig } = usePending(appConfig.save)
const onConfigOk = async () => {
  await saveConfig();
  fieldsConfigDialogVisibile.value = false;
}
// search form
const keywordSymbol = '$$keyword4search$$';
const searchModel = reactive<Record<string, string>>({})
const dictionaryField = computed(() => Object.values(mergedObjectConfig.value.fields || {}).filter(field => field.dictionary));
// datasource for table
const { gameData } = useGameData()
const dataSource = computed(() => {
  if (!dataKey.value) return [];
  return gameData.combined[dataKey.value].filter(row => !customizedOnly.value || row.customized)
    .filter((row) => {
      // filter out by selected dictionary
      if (Object.entries(searchModel).some(([k, v]) => {
        if (!v) return false;
        if (k === keywordSymbol) return false;
        if (row[k] !== v) return true;
      })) {
        return false;
      }
      // filter out by keyword
      const keyword = searchModel[keywordSymbol];
      return !keyword || Object.keys(mergedObjectConfig.value.fields || {}).some(key => row[key] && row[key].indexOf(keyword) >= 0)
    })
  // return gameData.combined[dataKey.value as GameDataKey] || []
})

// on item selected
const onSelect = (item: GameObjectData) => {
  emits('select', { type: dataKey.value, item });
} 
</script>
