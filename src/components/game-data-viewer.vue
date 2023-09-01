<template>
  <a-descriptions bordered v-if="data" size="small" :column="1" :label-style="{ width: '210px' }">
    <a-descriptions-item v-for="field of computedFields" :key="field.code">
      <template #label>
        <a-space>
          <span>{{ field.alias?.trim() || field.label?.trim() || field.code }}</span>
          <a @click="() => copy(data[field.code])" title="Copy Value">
            <CopyOutlined class="text-blue-500"></CopyOutlined>
          </a>
          <a-tooltip :title="`Original value: ${data[field.code]}`">
            <InfoCircleOutlined v-if="field.refer?.length || field.dictionary" class="text-blue-500">
            </InfoCircleOutlined>
          </a-tooltip>
        </a-space>
      </template>
      <field-display :data-key="dataKey" :field-value="data[field.code]" :field="field"></field-display>
    </a-descriptions-item>
  </a-descriptions>
</template>

<script lang="ts" setup>
import { GameDataKey } from "@/common/ggbh-meta";
import FieldDisplay from './field-display.vue';
import { InfoCircleOutlined, CopyOutlined } from "@ant-design/icons-vue";
import { useGameObject } from "@/data/app-config";
import { copy } from "@/utils/clipboard";
import { computed } from "vue";
import { getObjectFieldsModifier } from "@/data/object-fields-plugin";

const props = defineProps<{
  dataKey: GameDataKey,
  data: GameObjectData
}>()

const { mergedObjectConfig } = useGameObject(() => props.dataKey)

const computedFields = computed<AppConfig.IFieldConfig[]>(() => {
  const fn = getObjectFieldsModifier(props.dataKey)
  if (!fn) return Object.values(mergedObjectConfig.value.fields || {})
  return fn(props.data)
})
</script>

<style scoped></style>
