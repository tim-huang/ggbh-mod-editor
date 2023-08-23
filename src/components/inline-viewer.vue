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
import { computed } from 'vue';

const props = defineProps<{
  dataKey: GameDataKey
  data: GameConfigDataType
}>();

const { mergedInlineFields } = useGameObject(() => props.dataKey);

const columns = computed(() => {
  mergedInlineFields.value.map(field => {
    return {
      label: field.alias?.trim() || field.label?.trim() || field.code,
      dataIndex: field.code,
      key: field.code
    }
  })
})
</script>


<style scoped></style>
