<template>
  <a-descriptions bordered v-if="data" size="small" :column="1" :label-style="{ width: '120px' }">
    <a-descriptions-item v-for="field of mergedObjectConfig.fields"
      :label="field.alias?.trim() || field.label?.trim() || field.code" :key="field.code">
      <field-display :data-key="dataKey" :field-value="data[field.code]" :field="field"></field-display>
    </a-descriptions-item>
  </a-descriptions>
</template>

<script lang="ts" setup>
import { GameDataKey } from "@/common/ggbh-meta";
import FieldDisplay from './field-display.vue';
import { useGameObject } from "@/data/app-config";

const props = defineProps<{
  dataKey: GameDataKey,
  data: GameConfigDataType
}>()

const { mergedObjectConfig } = useGameObject(() => props.dataKey)

</script>

<style scoped></style>
