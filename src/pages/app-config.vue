<template>
  <div>
    <a-page-header title="App Config" @back="() => null">
      <template #extra>
        <div>test</div>
      </template>
    </a-page-header>
    <div class="m-1">
      <a-tabs v-model:activeKey="activeKey">
        <!-- Fields config -->
        <a-tab-pane key="1" tab="Fields">
          <fields-config :data-key="dataKey"></fields-config>
        </a-tab-pane>
        <!-- Display config -->
        <a-tab-pane key="2" tab="Display">
          <!-- Brief display -->
          <h4>Brief Display</h4>
          <a-descriptions bordered size="small" :column="1">
            <a-descriptions-item label="Display Fields">
              <brief-viewer-config :data-key="dataKey" />
            </a-descriptions-item>
            <a-descriptions-item label="Display Sample">
              <brief-viewer v-if="randomData" :data-key="dataKey" :data="randomData" />
            </a-descriptions-item>
          </a-descriptions>
          <!-- Inline display -->
          <h4>Inline Display</h4>
          <a-descriptions bordered size="small" :column="1">
            <a-descriptions-item label="Display Fields">
              <inline-viewer-config :data-key="dataKey" />
            </a-descriptions-item>
            <a-descriptions-item label="Display Sample">
              <inline-viewer v-if="randomData" :data-key="dataKey" :data="randomData" />
            </a-descriptions-item>
          </a-descriptions>
        </a-tab-pane>
        <a-tab-pane key="3" tab="Editor"></a-tab-pane>
        <template #rightExtra>
          <a-select v-model:value="dataKey" :options="options" style="width: 200px; text-align: left;"
            show-search></a-select>
        </template>
      </a-tabs>
    </div>
    <div class="flex flex-row-reverse m-2 gap-2">
      <a-button @click="resetConfig" :disabled="ioBusy">Reset</a-button>
      <a-button type="primary" @click="saveConfig" :disabled="ioBusy">Save</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GameDataKey, gameMetaInfo } from "@/common/ggbh-meta";
import { computed, onMounted, ref } from 'vue';
import { useGameData } from '@/data/customized-game-data';
import InlineViewerConfig from '@/components/app-config/inline-viewer-config.vue'
import InlineViewer from '@/components/inline-viewer.vue';
import BriefViewerConfig from '@/components/app-config/brief-viewer-config.vue'
import BriefViewer from '@/components/brief-viewer.vue';
import FieldsConfig from "@/components/app-config/fields-config.vue";
import { useAppConfig } from "@/data/app-config";
import { message } from "ant-design-vue";

const activeKey = ref("1")
const { gameData } = useGameData()
const appConfig = useAppConfig()

const dataKey = ref<GameDataKey>(Object.keys(gameMetaInfo)[0] as GameDataKey)

const options = Object.keys(gameMetaInfo).map((k) => ({ value: k, label: k }))

const randomData = computed<GameConfigDataType | undefined>(() => {
  const arr = gameData.combined[dataKey.value];
  if (arr?.length) {
    const idx = Math.floor(Math.random() * arr.length);
    return arr[idx]
  }
})

const ioBusy = ref<boolean>(false);
const saveConfig = async () => {
  if (!ioBusy.value) {
    ioBusy.value = true;
    await appConfig.save();
    message.success("App config saved!")
  }
  ioBusy.value = false;
}
const resetConfig = async () => {
  if (!ioBusy.value) {
    ioBusy.value = true;
    await appConfig.init();
    message.success("App config reset!")
  }
  ioBusy.value = false;
}

onMounted(appConfig.init)


</script>


<style scoped></style>
