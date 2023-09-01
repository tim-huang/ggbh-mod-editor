<template>
  <span>
    <a-dropdown>
      <a @click="showDetailModal = true" class="peer">
        <menu-outlined class="text-blue-500"></menu-outlined>
      </a>
      <template #overlay>
        <a-menu :items="menuItems"></a-menu>
      </template>
    </a-dropdown>
    <span class="border border-solid border-transparent rounded-sm peer-hover:border-b-purple-300">
      <field-display v-for="field of mergedBriefFields" :data-key="props.dataKey" :field="field"
        :field-value="data[field.code]" />
    </span>
    <a-modal v-model:open="showDetailModal" :title="`${dataKey} - ${data.id}`" width="800px">
      <div class="overflow-y-scroll w-full" style="max-height: 500px">
        <game-data-viewer :data-key="dataKey" :data="data"></game-data-viewer>
      </div>
    </a-modal>
    <a-drawer v-model:open="showEditorModal" :title="`Edit ${dataKey} - ${data.id}`" :width="`${width - 180}px`"
      destroy-on-close>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="onEditingSave">Save</a-button>
          <a-button @click="showEditorModal = false">Cancel</a-button>
        </a-space>
      </template>
      <object-editor v-if="dataKey && editingModel" :data-key="dataKey" v-model:value="editingModel" ref="editorRef"
        :labelStyle="{ 'max-width': '300px' }"></object-editor>
    </a-drawer>
  </span>
</template>

<script setup lang="ts">

import { GameDataKey } from '@/common/ggbh-meta';
import { useGameObject } from "@/data/app-config";
import { computed, ref } from 'vue';
import { MenuOutlined } from '@ant-design/icons-vue';
import FieldDisplay from './field-display.vue';
import GameDataViewer from './game-data-viewer.vue';
import ObjectEditor from './object-editor.vue';
import { useWindowSize } from '@vueuse/core';
import { useGameData } from '@/data/customized-game-data';

const props = defineProps<{
  dataKey: GameDataKey
  data: GameObjectData
}>();

const { mergedBriefFields } = useGameObject(() => props.dataKey);
const { gameData } = useGameData()

const showDetailModal = ref<boolean>(false)
const showEditorModal = ref<boolean>(false);
const editingModel = ref<GameObjectData>();
const { width } = useWindowSize();

const onEditingSave = () => {
  if (editingModel.value) gameData.updateObject(props.dataKey, editingModel.value);
  showEditorModal.value = false;
}

const menuItems = computed(() => [
  {
    label: `${props.dataKey} - ${props.data.id}`,
    key: 'title',
    disabled: true,
  },
  {
    label: 'Show Details',
    key: 'showDetails',
    onClick: () => showDetailModal.value = true,
  },
  {
    label: 'Edit it',
    key: 'editIt',
    onClick: () => {
      editingModel.value = Object.assign({}, props.data);
      showEditorModal.value = true;
    }
  }
]);
</script>

<style scoped></style>
