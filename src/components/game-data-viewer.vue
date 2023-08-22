<template>
  <a-descriptions :title="dataKey" bordered v-if="data">
    <a-descriptions-item
        v-for="item of typeMetadata.fields"
        :label="item.label"
        :key="item.code"
    >{{data[item.code]}}</a-descriptions-item>
  </a-descriptions>
</template>

<script lang="ts" setup>
import {GameDataKey, gameMetaInfo} from "@/common/ggbh-meta";

  const props = defineProps<{
    dataKey: GameDataKey,
    data: GameConfigDataType
  }>()

  const typeMetadata = gameMetaInfo[props.dataKey];

</script>

<style scoped>

</style>