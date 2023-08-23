<template>
  <span>
    <span v-for="field of mergedInlineFields">
      <a-tag>{{ field.alias?.trim() || field.label?.trim() || field.code }}</a-tag>
      <field-display :data-key="dataKey" :field="field" :field-value="data[field.code]"></field-display>
    </span>
  </span>
</template>

<script setup lang="ts">

import { GameDataKey } from '@/common/ggbh-meta';
import { useGameObject } from "@/data/app-config";
import FieldDisplay from './field-display.vue';

const props = defineProps<{
  dataKey: GameDataKey
  data: GameConfigDataType
}>();

const { mergedInlineFields } = useGameObject(() => props.dataKey);

</script>


<style scoped></style>
