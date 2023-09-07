<template>
  <div class="w-full h-full flex flex-row">
    <div class="w-[300px] h-full p-1">
      <object-tree @node-selected="onNodeSelected" ref="objectTree"></object-tree>
    </div>
    <div class="w-[2px] h-full shadow"></div>
    <div class="w-[calc(100%-302px)] h-full">
      <div v-if="!dataKey || !dataForViewer" class="h-full flex flex-col justify-center">
        <a-empty></a-empty>
      </div>
      <div v-else class="w-full h-full">
        <a-page-header :title="title" :backIcon="false" class="shadow">
          <!-- sub title -->
          <template #subTitle v-if="dataForViewer.customized">
            <a-tag color="red">Customized</a-tag>
          </template>
          <template #extra>
            <a-button v-if="dataForViewer?.customized" type="primary" @click="onRemove" danger>
              <delete-outlined></delete-outlined>
              Remove Customization
            </a-button>
            <a-button type="primary" @click="onEdit">
              <edit-outlined></edit-outlined>
              Edit
            </a-button>
            <a-button @click="onCopy">
              <CopyOutlined></CopyOutlined>
              Copy
            </a-button>
          </template>
        </a-page-header>
        <div class="h-[calc(100%-85px)] overflow-y-scroll mt-[5px]">
          <game-data-viewer :data-key="dataKey" :data="dataForViewer"></game-data-viewer>
        </div>
      </div>
    </div>
    <a-drawer v-model:open="editorDrawerVisible" :title="title" :width="`${width - 180}px`" destroy-on-close>
      <template #title>
        <span>{{ title }}</span>
        <a-tag color="red" v-if="dataForViewer?.customized">Customized</a-tag>
      </template>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="onSave">Save</a-button>
          <a-button @click="editorDrawerVisible = false">Cancel</a-button>
        </a-space>
      </template>
      <object-editor v-if="dataKey && editingData" :data-key="dataKey" v-model:value="editingData"
        :labelStyle="{ 'max-width': '300px' }"></object-editor>
    </a-drawer>
  </div>
</template>
<script setup lang="ts">

import ObjectTree from '@/components/object-browser/object-tree.vue'
import GameDataViewer from '@/components/viewer/game-data-viewer.vue';
import ObjectEditor from '@/components/editor/object-editor.vue';
import { GameDataKey } from '@/common/ggbh-meta';
import { computed, nextTick, onUnmounted, ref, watchEffect } from 'vue';
import { EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons-vue';
import { useWindowSize } from '@vueuse/core';
import { Modal } from 'ant-design-vue';
import { useGameData } from '@/data/customized-game-data';
import { useRoute, useRouter } from 'vue-router';


const route = useRoute();
const router = useRouter();

const dataKey = ref<GameDataKey>()
const dataId = ref<string>()
const onNodeSelected = ({ type, item }: { type: GameDataKey, item: GameObjectData }) => {
  dataKey.value = type;
  dataId.value = item.id;
}

const { gameData, createObject } = useGameData();
const dataForViewer = computed(() => {
  if (!dataKey.value || !dataId.value) return;
  return gameData.combined[dataKey.value]?.find(o => o.id === dataId.value);
})

const { width } = useWindowSize();

const title = computed(() => `${dataKey.value} - ${dataForViewer.value?.id}`)
// edit object
const editorDrawerVisible = ref<boolean>(false)
const editingData = ref<GameObjectData>();
const onEdit = () => {
  // create model
  editingData.value = Object.assign({}, dataForViewer.value)
  editorDrawerVisible.value = true;
}
// copy
const onCopy = () => {
  if (dataKey.value && dataId.value) {
    const obj = createObject(dataKey.value, dataId.value)
    editingData.value = obj;
    editorDrawerVisible.value = true;
  }
}
// save
const onSave = async () => {
  if (!dataKey.value || !editingData.value) return;
  // save data
  gameData.updateObject(dataKey.value, editingData.value)
  if (dataId.value == editingData.value.id) { //edit

    // refresh left tree
    if (objectTree.value) {
      await objectTree.value.refreshTree();
    }
  } else { // copy
    router.push({ path: route.path, query: { type: dataKey.value, id: editingData.value.id } })
  }
  // close drawer
  editorDrawerVisible.value = false;
}

// remove customization
const onRemove = () => {
  if (!dataKey.value || !dataId.value) return
  Modal.confirm({
    title: 'Remove Customization',
    content: `You are about to remove customization on ${title.value}, are you sure?`,
    onOk: async () => {
      if (dataKey.value && dataForViewer.value) {
        gameData.remove(dataKey.value, dataForViewer.value.id)
        if (objectTree.value) {
          await objectTree.value?.refreshTree()
        }
      }
    }
  })
}

// refresh tree
const objectTree = ref<{
  refreshTree: (arg?: { type: GameDataKey, id: string }) => Promise<any>,
}>();

const stopWatch = watchEffect(() => {
  if (route.query.type && route.query.id) {
    dataKey.value = route.query.type as GameDataKey;
    dataId.value = route.query.id as string;
    // refreshTree
    nextTick(() => {
      objectTree.value?.refreshTree({ type: route.query.type as GameDataKey, id: route.query.id as string })
    })
  }
})

onUnmounted(stopWatch)

</script>
