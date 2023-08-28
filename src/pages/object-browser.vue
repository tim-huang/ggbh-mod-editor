<template>
  <div class="w-full h-full flex flex-row">
    <div class="w-[300px] h-full p-1">
      <object-tree @node-selected="onNodeSelected"></object-tree>
    </div>
    <div class="w-[2px] h-full shadow"></div>
    <div class="w-[calc(100%-302px)] h-full">
      <div v-if="!dataKey || !data" class="h-full flex flex-col justify-center">
        <a-empty></a-empty>
      </div>
      <div v-else class="w-full h-full">
        <a-page-header :title="title" :backIcon="false" class="shadow">
          <!-- sub title -->
          <template #subTitle v-if="data.customized">
            <a-tag color="red">Customized</a-tag>
          </template>
          <template #extra>
            <a-button v-if="data?.customized" type="primary" @click="onRemove" danger>
              <delete-outlined></delete-outlined>
              Remove Customization
            </a-button>
            <a-button type="primary" @click="onEdit">
              <edit-outlined></edit-outlined>
              Edit
            </a-button>
          </template>
        </a-page-header>
        <div class="h-[calc(100%-85px)] overflow-y-scroll mt-[5px]">
          <game-data-viewer :data-key="dataKey" :data="data"></game-data-viewer>
        </div>
      </div>
    </div>
    <a-drawer v-model:open="editorDrawerVisible" :title="title" :width="`${width - 180}px`" destroy-on-close>
      <template #title>
        <span>{{ title }}</span>
        <a-tag color="red" v-if="data?.customized">Customized</a-tag>
      </template>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="onSave">Save</a-button>
          <a-button @click="editorDrawerVisible = false">Cancel</a-button>
        </a-space>
      </template>
      <object-editor v-if="dataKey && data" :data-key="dataKey" :object-id="data.id" ref="editorRef"
        :labelStyle="{ 'max-width': '300px' }"></object-editor>
    </a-drawer>
  </div>
</template>
<script setup lang="ts">

import ObjectTree from '@/components/object-browser/object-tree.vue'
import GameDataViewer from '@/components/game-data-viewer.vue';
import ObjectEditor from '@/components/object-editor.vue';
import { GameDataKey } from '@/common/ggbh-meta';
import { computed, ref } from 'vue';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { useWindowSize } from '@vueuse/core';
import { Modal } from 'ant-design-vue';
import { useGameData } from '@/data/customized-game-data';

const dataKey = ref<GameDataKey>()
const dataId = ref<string>()
const onNodeSelected = ({ type, item }: { type: GameDataKey, item: GameObjectData }) => {
  dataKey.value = type;
  dataId.value = item.id;
}

const { gameData } = useGameData();
const data = computed(() => {
  if (!dataKey.value || !dataId.value) return;
  return gameData.combined[dataKey.value]?.find(o => o.id === dataId.value);
})

const { width } = useWindowSize();

const title = computed(() => `${dataKey.value} - ${data.value?.id}`)
// edit object
const editorRef = ref()
const editorDrawerVisible = ref<boolean>(false)
const onEdit = () => {
  editorDrawerVisible.value = true;
}
const onSave = () => {
  editorRef.value?.save();
  editorDrawerVisible.value = false;
}
// remove customization
const onRemove = () => {
  if (!dataKey.value || !dataId.value) return
  Modal.confirm({
    title: 'Remove Customization',
    content: `You are about to remove customization on ${title.value}, are you sure?`,
    onOk: () => {
      if (dataKey.value && data.value) {
        gameData.remove(dataKey.value, data.value.id)
      }
    }
  })
}
</script>
