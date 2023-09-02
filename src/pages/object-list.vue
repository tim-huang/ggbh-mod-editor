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
          <a-select :options="appConfig.getSelectOptions(field.dictionary!)" v-model:value="searchModel[field.code]"
            :placeholder="field.alias?.trim() || field.label?.trim() || field.code" style="width: 150px" show-search
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
    <a-modal v-model:open="fieldsConfigDialogVisibile" :title="`Customization - ${dataKey}`" width="800px"
      @ok="onConfigOk" :okButtonProps="{ disabled: pending }" destroy-on-close>
      <div class="overflow-scroll h-[600px]">
        <object-config :data-key="dataKey"></object-config>
      </div>
    </a-modal>

  </div>
</template>
<script setup lang="ts">
import { GameDataKey, gameMetaInfo } from '@/common/ggbh-meta';
import { useGameData } from '@/data/customized-game-data';
import { computed, h, ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import TableViewer from '@/components/viewer/table-viewer.vue';
import { useGameObject } from '@/data/app-config';
import { SettingOutlined } from '@ant-design/icons-vue';
import ObjectConfig from '@/components/app-config/object-config.vue';
import { usePending } from '@/utils/use';
import { watchDebounced } from '@vueuse/core';


// select an object type
const router = useRouter();
// const dataKey = computed<GameDataKey>(() => (router.currentRoute.value.query?.dataKey || GameDataKey.ArtifactShape) as GameDataKey);
const dataKey = computed<GameDataKey>(() => {
  return (router.currentRoute.value.query?.dataKey || GameDataKey.ArtifactShape) as GameDataKey;
})
const options = Object.keys(gameMetaInfo).map((k) => ({ value: k, label: k }))

const dataKeySelected = (value: string) => {
  if (value && value !== router.currentRoute.value.query?.dataKey) {
    searchModel.value = {};
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
const searchModel = ref<Record<string, string>>({})
const dictionaryField = computed(() => Object.values(mergedObjectConfig.value.fields || {}).filter(field => field.dictionary));
// datasource for table
const { search } = useGameData()

// search
const keyword = ref<string>('');
const debounceKeyword = ref<string>('');
const dataSource = computed<GameObjectData[]>(() => {
  if (!dataKey.value) return [];
  return search({ key: dataKey.value, keyword: debounceKeyword.value, customizedOnly: customizedOnly.value }, (row: GameObjectData) => {
    return !Object.entries(searchModel.value).some(([k, v]) => {
      if (!v) return false;
      if (row[k] !== v) return true;
    });
  })[dataKey.value] || [];
})

const stopWatchKeyword = watchDebounced([keyword], () => debounceKeyword.value = keyword.value, { debounce: 300 });


onUnmounted(stopWatchKeyword);

</script>
