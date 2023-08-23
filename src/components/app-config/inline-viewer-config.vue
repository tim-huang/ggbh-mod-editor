<template>
  <a-space direction="vertical">
    <div>
      <a-tag v-for="field of inlineFields" :key="field.code" closable @close="onClose(field.code)">
        {{ field.alias?.trim() || field.label?.trim() || field.code }}
      </a-tag>
      <!-- add button -->
      <a-dropdown>
        <a-tag class="cursor-pointer" color="blue">
          <template #icon>
            <PlusOutlined />
          </template>
          Add
        </a-tag>
        <template #overlay>
          <a-menu :items="unlistedFields" @click="onMenuClick"></a-menu>
        </template>
      </a-dropdown>
    </div>
  </a-space>
</template>

<script setup lang="ts">
import { GameDataKey } from '@/common/ggbh-meta';
import { useGameObject } from "@/data/app-config";
import { computed } from "vue";
import { PlusOutlined } from '@ant-design/icons-vue';
import { ItemType } from 'ant-design-vue';

const props = defineProps<{
  dataKey: GameDataKey
}>();

const { appConfig, objectConfig, mergedObjectConfig, inlineFields } = useGameObject(() => props.dataKey);

const unlistedFields = computed<ItemType[]>(() => {
  return Object.values(mergedObjectConfig.value.fields!).filter((field) => !objectConfig.value.inline?.includes(field.code))
    .map(field => {
      return {
        key: field.code,
        label: field.label,
      }
    })
})

const onClose = (code: string) => {
  appConfig.removeInlineField(props.dataKey, code)
}

const onMenuClick = ({ key }: { key: string }) => {
  key && appConfig.addInlineField(props.dataKey, key as string)
}

</script>

<style scoped></style>
