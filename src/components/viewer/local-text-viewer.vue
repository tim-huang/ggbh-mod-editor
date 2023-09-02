<template>
  <a-descriptions bordered v-if="data" size="small" :column="1" :label-style="{ width: '210px' }">
    <a-descriptions-item v-for="field of computedFields" :key="field.code">
      <template #label>
        <a-space>
          <span>{{ field.alias?.trim() || field.label?.trim() || field.code }}</span>
          <a @click="() => copy(data[field.code])" title="Copy Value">
            <CopyOutlined class="text-blue-500"></CopyOutlined>
          </a>
        </a-space>
      </template>
      <span>{{ data[field.code] }}</span>
    </a-descriptions-item>
  </a-descriptions>
</template>

<script lang="ts" setup>
import { GameDataKey } from "@/common/ggbh-meta";
import { CopyOutlined } from "@ant-design/icons-vue";
import { useGameObject } from "@/data/app-config";
import { copy } from "@/utils/clipboard";
import { computed, onUnmounted, watch } from "vue";
import { getObjectFieldsModifier } from "@/data/object-fields-plugin";
import { useLastUpdate } from "@/data/last-update";

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

const log = () => useLastUpdate().log(props.dataKey, props.data?.id, 'V')

// log once
log();
const stopWatch = watch([() => props.dataKey, () => props.data?.id], log);

onUnmounted(stopWatch)
</script>

<style scoped></style>

