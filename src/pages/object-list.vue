<template>
  <div class="w-full h-full">
    <!-- page header -->
    <a-page-header :title="dataKey">
      <template #extra>
        <a-checkbox v-model:checked="customizedOnly">Customized Only</a-checkbox>
        <a-select :value="dataKey" :options="options" style="width: 300px; text-align: left;" show-search
          @select="dataKeySelected"></a-select>
        <a-button type="primary" :icon="h(SettingOutlined)" @click="fieldsConfigDialogVisibile = true" shape="circle">
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
          <a-input v-model:value="keyword" allowClear placeholder="keyword"></a-input>
        </a-form-item>
      </a-form>

    </div>

    <!-- table  -->
    <table-viewer :data-key="dataKey" :data-source="dataSource" size="small" bordered editable></table-viewer>

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
import { computed, reactive, h, ref, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import TableViewer from '@/components/table-viewer.vue';
import { useGameObject } from '@/data/app-config';
import { SettingOutlined } from '@ant-design/icons-vue';
import ObjectConfig from '@/components/app-config/object-config.vue';
import { getSelectOptions } from '@/data/dict';
import { usePending } from '@/utils/use';
import { useDebounceFn } from '@vueuse/core';


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
const searchModel = reactive<Record<string, string>>({})
const dictionaryField = computed(() => Object.values(mergedObjectConfig.value.fields || {}).filter(field => field.dictionary));
// datasource for table
const { gameData, search } = useGameData()

// search
const keyword = ref<string>('');
const dataSource = ref<GameObjectData[]>([])
const doSearch = () => {
  if (!dataKey.value) return;
  const result = search({ key: dataKey.value, keyword: keyword.value, customizedOnly: customizedOnly.value }, (row: GameObjectData) => {
    return !Object.entries(searchModel).some(([k, v]) => {
      if (!v) return false;
      if (row[k] !== v) return true;
    });
  });
  dataSource.value = result[dataKey.value] || [];
}

const debounceSearch = useDebounceFn(doSearch, 300);

const stopWatch = watch([searchModel], doSearch);
const stopWatchKeyword = watch([keyword], debounceSearch);

doSearch();

onUnmounted(() => {
  stopWatch();
  stopWatchKeyword();
});

</script>
