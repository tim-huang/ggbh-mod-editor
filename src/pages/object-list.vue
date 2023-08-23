<template>
  <div class="w-full h-full">
    <!-- page header -->
    <a-page-header :title="dataKey">
      <template #extra>
        <a-checkbox v-model:checked="customizedOnly">Customized Only</a-checkbox>
        <a-select :value="dataKey" :options="options" style="width: 300px; text-align: left;" show-search
          @select="dataKeySelected"></a-select>
        <a-button type="primary" :icon="h(SettingOutlined)" @click="fieldsConfigDialogVisibile = true">
          Customize
        </a-button>
      </template>
    </a-page-header>
    <!-- search form -->
    <div class="my-2">
      <a-form layout="inline" :model="searchModel" size="small" class="mx-10">
        <a-form-item v-for="field of dictionaryField" :key="field.code">
          <a-select :options="getSelectOptions(field.dictionary!)" v-model:value="searchModel[field.code]"
            :placeholder="field.alias?.trim() || field.label?.trim() || field.code" style="width: 150px"
            allowClear></a-select>
        </a-form-item>
        <a-form-item>
          <a-input v-model:value="searchModel[keywordSymbol]" allowClear placeholder="keyword"></a-input>
        </a-form-item>
      </a-form>

    </div>

    <!-- table  -->
    <table-viewer :data-key="dataKey" :data-source="dataSource" size="small" bordered></table-viewer>

    <!-- field config -->
    <a-modal v-model:open="fieldsConfigDialogVisibile" title="Customization" width="800px" @ok="onConfigOk"
      :okButtonProps="{ disabled: pending }">
      <div class="overflow-scroll h-[600px]">
        <object-config :data-key="dataKey"></object-config>
      </div>
    </a-modal>

  </div>
</template>
<script setup lang="ts">
import { GameDataKey, gameMetaInfo } from '@/common/ggbh-meta';
import { useGameData } from '@/data/customized-game-data';
import { computed, reactive, h, ref } from 'vue';
import { useRouter } from 'vue-router';
import TableViewer from '@/components/table-viewer.vue';
import { useGameObject } from '@/data/app-config';
import { SettingOutlined } from '@ant-design/icons-vue';
import ObjectConfig from '@/components/app-config/object-config.vue';
import { getSelectOptions } from '@/data/dict';
import { usePending } from '@/utils/use';


// select an object type
const router = useRouter();
const dataKey = computed<GameDataKey>(() => (router.currentRoute.value.query?.dataKey || GameDataKey.ArtifactShape) as GameDataKey);
const options = Object.keys(gameMetaInfo).map((k) => ({ value: k, label: k }))

const dataKeySelected = (value: string) => {
  if (value && value !== router.currentRoute.value.query?.dataKey) {
    router.push({ path: '/object-list', query: { dataKey: value } })
  }
}

const customizedOnly = ref<boolean>(false);

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
  return gameData.combined[dataKey.value as GameDataKey] || []
})

</script>
