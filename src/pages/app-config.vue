<template>
  <div class="w-full h-full flex flex-col">
    <div class="m-1 w-full h-[calc(100%-48px)]">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="dictionary" tab="Dictionary" class="h-full">
          <DictionaryConfig></DictionaryConfig>
        </a-tab-pane>
        <a-tab-pane key="object" tab="Object">
          <object-config :data-key="dataKey" data-key-changable></object-config>
        </a-tab-pane>
      </a-tabs>
    </div>
    <div class="h-[32px] flex flex-row-reverse m-2 gap-2">
      <a-button @click="resetConfig" :disabled="pending">Reset</a-button>
      <a-button type="primary" @click="saveConfig" :disabled="pending">Save</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GameDataKey, gameMetaInfo } from "@/common/ggbh-meta";
import { ref } from 'vue';
import { useAppConfig } from "@/data/app-config";
import ObjectConfig from "@/components/app-config/object-config.vue";
import DictionaryConfig from "@/components/app-config/dictionary/dictionary-config.vue";
import { usePending } from "@/utils/use";

const appConfig = useAppConfig()

const dataKey = ref<GameDataKey>(Object.keys(gameMetaInfo)[0] as GameDataKey)

const { fn: saveConfig, pending } = usePending(appConfig.save);
const { fn: resetConfig } = usePending(appConfig.init, pending);

const activeKey = ref<string>('dictionary');

console.debug(appConfig);

</script>

<style scoped></style>
