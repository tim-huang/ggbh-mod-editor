<template>
  <div>
    <div class="m-1">
      <object-config :data-key="dataKey" data-key-changable></object-config>
    </div>
    <div class="flex flex-row-reverse m-2 gap-2">
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
import { usePending } from "@/utils/use";

const appConfig = useAppConfig()

const dataKey = ref<GameDataKey>(Object.keys(gameMetaInfo)[0] as GameDataKey)

const { fn: saveConfig, pending } = usePending(appConfig.save);
const { fn: resetConfig } = usePending(appConfig.save, pending);
</script>

<style scoped></style>
