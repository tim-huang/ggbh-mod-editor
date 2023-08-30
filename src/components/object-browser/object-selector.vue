<template>
  <a-drawer v-bind="$attrs">
    <template #title>
      <a-space>
        <a-button type="primary" :icon="h(SettingOutlined)" @click="fieldsConfigDialogVisibile = true" shape="circle">
        </a-button>
        <span>{{ dataKey }}</span>
      </a-space>
    </template>
    <template #footer>
      <a-button type="primary" @click="onConfirmBtnClick()" :disabled="!selectedRowKeys.length">Confirm</a-button>
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
      <table-viewer :data-key="dataKey" :data-source="dataSource" :row-selection="rowSelection" :custom-row="customRow"
        size="small" bordered></table-viewer>
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
import { TableProps } from 'ant-design-vue';

const props = defineProps<{
  dataKeyRestrict?: GameDataKey[],
  // multiple selection
  multiple?: boolean;
}>();

const emits = defineEmits<{
  (e: 'select', item: { type: GameDataKey, items: GameObjectData[] }): void;
}>();

const customizedOnly = ref<boolean>(false);

const options = computed(() => {
  return (props.dataKeyRestrict?.length ? props.dataKeyRestrict : Object.keys(gameMetaInfo))
    .filter(k => !customizedOnly.value || gameData.combined[k as GameDataKey]?.some(o => o.customized))
    .map((k) => {
      return {
        value: k,
        label: k + ' (' + gameData.combined[k as GameDataKey]?.filter(o => !customizedOnly.value || o.customized).length + ')'
      }
    })
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
const { gameData, getText } = useGameData()
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
      if (!keyword) return true;
      if (Object.values(row).some(v => v && v.toString().indexOf(keyword) >= 0)) {
        return true;
      }
      // deep search if it's related to LocalText or RoleLogLocal
      return Object.values(mergedObjectConfig.value.fields || {})
        .filter(field => field.refer?.some(r => [GameDataKey.LocalText, GameDataKey.RoleLogLocal].includes(r.object as GameDataKey)))
        .some(field => getText(row[field.code]).some(text => text.indexOf(keyword) > 0))
    })
  // return gameData.combined[dataKey.value as GameDataKey] || []
})

const selectedRowKeys = ref<string[]>([]);
const rowSelection = computed<TableProps['rowSelection']>(() => {
  return {
    selectedRowKeys: selectedRowKeys.value,
    // onChange: (selectedKeys, selectedRows: GameObjectData[]) => {
    //   selectedRowKeys.value = selectedKeys as string[];
    // },
    type: props.multiple ? 'checkbox' : 'radio',
    fixed: true,
  }
})

const selectRow = (record: GameObjectData) => {
  let keys = [...selectedRowKeys.value];
  if (keys.includes(record.id)) {
    keys = keys.filter(k => k !== record.id);
  } else {
    if (props.multiple) {
      keys.push(record.id)
    } else {
      keys = [record.id]
    }
  }
  selectedRowKeys.value = keys;
}

const customRow = (record: GameObjectData) => {
  return {
    onClick: () => {
      selectRow(record)
    },
    ondblclick: () => {
      if (!props.multiple) {
        onConfirm([record])
      }
    }
  }
}
// on item selected
const onConfirmBtnClick = () => {
  const selectedObjects = gameData.combined[dataKey.value]?.filter(o => selectedRowKeys.value.includes(o.id)) || [];
  onConfirm(selectedObjects)
}
const onConfirm = (items: GameObjectData[]) => {
  emits('select', { type: dataKey.value, items });
} 
</script>
