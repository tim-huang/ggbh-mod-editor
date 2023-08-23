
<template>
  <a-space direction="vertical">
    <div>
      <span v-for="(field, index) in selectedFields" :key="field.code">
        <a-tag closable @close="onClose(field.code)">
          <a v-if="index !== 0" @click="moveField(index, -1)">
            <caret-left-outlined class="text-blue-600"></caret-left-outlined>
          </a>
          {{ field.alias || field.label || field.code }}
          <a v-if="index !== selectedFields.length - 1" @click="moveField(index, 1)">
            <caret-right-outlined class="text-blue-600"></caret-right-outlined>
          </a>
        </a-tag>
      </span>
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
import { PlusOutlined, CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons-vue';
import { ItemType } from 'ant-design-vue';

const props = defineProps<{
  dataKey: GameDataKey,
  displayMode: 'brief' | 'inline'
}>();

const { appConfig, objectConfig, mergedObjectConfig, briefFields, inlineFields } = useGameObject(() => props.dataKey);

const selectedFields = computed(() => props.displayMode === 'brief' ? briefFields.value : inlineFields.value)
const moveField = (index: number, offset: -1 | 1) => {
  if (props.displayMode == 'brief') {
    appConfig.moveBriefField(props.dataKey, index, offset);
  } else {
    appConfig.moveInlineField(props.dataKey, index, offset);
  }
}

const unlistedFields = computed<ItemType[]>(() => {
  return Object.values(mergedObjectConfig.value.fields!).filter((field) => !objectConfig.value[props.displayMode]?.includes(field.code))
    .map(field => {
      return {
        key: field.code,
        label: field.alias?.trim() || field.label?.trim() || field.code,
      }
    })
})

const onClose = (code: string) => {
  if (props.displayMode === 'brief') {
    appConfig.removeBriefField(props.dataKey, code)
  } else {
    appConfig.removeInlineField(props.dataKey, code)
  }
}

const onMenuClick = ({ key }: { key: string }) => {
  if (key) {
    if (props.displayMode === 'brief') {
      appConfig.addBriefField(props.dataKey, key as string)
    } else {
      appConfig.addInlineField(props.dataKey, key as string)
    }
  }
}

</script>

<style scoped></style>
