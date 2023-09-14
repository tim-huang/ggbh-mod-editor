<template>
  <div class="app-header flex flex-col justify-center">
    <div class="flex flex-row place-items-center mx-2 gap-4">
      <!-- go back arrow -->
      <a @click="router.back()" class="cursor-pointer" title="Go back">
        <arrow-left-outlined></arrow-left-outlined>
      </a>
      <div class="flex flex-col place-items-start gap-0.5 font-sans">
        <!-- title  -->
        <div class="text-lg bold">
          <span>{{ title }}</span>
        </div>
        <!-- sub title -->
        <div class="text-sm text-gray-500 flex flex-row">
          <!-- data integrity checked -->
          <DataIntegrity></DataIntegrity>
          <!-- project path -->
          <path-selector></path-selector>
          <a-tag @click="gameData.readonly = !gameData.readonly" class="cursor-pointer"
            :color="gameData.readonly ? 'red' : 'green'">
            <template #icon>
              <lock-outlined v-if="gameData.readonly"></lock-outlined>
              <unlock-outlined v-else></unlock-outlined>
            </template>
            <span>{{ gameData.readonly ? "Readonly" : "Writable" }}</span>
          </a-tag>
          <!-- dirty -->
          <a-tag @click="onSaveProject" v-if="gameData.dirty" color="red" class="cursor-pointer">
            <save-outlined></save-outlined>
            Dirty
          </a-tag>
          <!-- <path-selector></path-selector> -->
        </div>
      </div>
      <!-- <path-selector></path-selector> -->
    </div>
    <div class="absolute right-4 top-1/2 -translate-y-1/2 flex flex-row place-items-center gap-4 z-10">
      <a class="menu-icon cursor-pointer" title="Create an object (CTRL+N)" @click="openTypeSelectorDialog">
        <plus-circle-outlined class="text-green-500"></plus-circle-outlined>
      </a>
      <a class="menu-icon cursor-pointer" title="History (CTRL+H)" @click="historyBrowserVisibile = true">
        <history-outlined class="text-blue-500"></history-outlined>
      </a>
      <a class="menu-icon cursor-pointer" title="Search (CTRL+S)" @click="searchDialogVisible = true">
        <search-outlined class="text-blue-500"></search-outlined>
      </a>
      <a class="menu-icon cursor-pointer" title="Console (CTRL+L)" @click="consoleDialogVisible = true">
        <code-outlined class="text-blue-500"></code-outlined>
      </a>
      <a class="menu-icon cursor-pointer" title="Replicate Objects (CTRL+R)" @click="replicateDialogVisible = true">
        <copy-outlined class="text-blue-500"></copy-outlined>
      </a>
      <a-dropdown>
        <a class="menu-icon cursor-pointer">
          <menu-outlined class="text-blue-500"></menu-outlined>
        </a>
        <template #overlay>
          <a-menu v-model:selectedKeys="selectedKeys" :items="computedMenuItem" @click="gotoLink">
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <!-- history -->
    <a-modal :closable="false" width="800px" :footer="null" v-model:open="historyBrowserVisibile" destroy-on-close
      :body-style="{ padding: '5px', height: '600px' }">
      <history-browser @select="gotoBrowser"></history-browser>
    </a-modal>
    <!-- search -->
    <a-modal :closable="false" width="1280px" :footer="null" v-model:open="searchDialogVisible" destroy-on-close
      :body-style="{ padding: '5px', height: '680px' }">
      <search-panel @select="gotoBrowser"></search-panel>
    </a-modal>
    <!-- create new object -->
    <a-drawer v-model:open="editorDrawerVisible" :title="`New ${newObjectType}`" :width="`${width - 180}px`"
      placement="left" destroy-on-close>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="onSaveNewObject">Save</a-button>
          <a-button @click="editorDrawerVisible = false">Cancel</a-button>
        </a-space>
      </template>
      <object-editor v-if="newObjectType && newObject" :data-key="newObjectType" v-model:value="newObject"
        :labelStyle="{ 'max-width': '300px' }"></object-editor>
    </a-drawer>
    <!-- new object type selection dialog -->
    <ObjectTypeSelectorDialog v-if="objectTypeSelectorVisible" v-model:open="objectTypeSelectorVisible"
      v-model:value="newObjectType" @ok="onNewObjectTypeSelected"></ObjectTypeSelectorDialog>
    <!-- console dialog -->
    <a-modal v-model:open="consoleDialogVisible" :footer="null" :closable="false" width="850px">
      <Console></Console>
    </a-modal>
    <!-- replicate dialog -->
    <replicate-objects v-model:open="replicateDialogVisible" @ok="replicateDialogVisible = false" :closable="false"
      width="1024px" title="Replicate Objects">
    </replicate-objects>
  </div>
</template>

<script setup lang="ts">

import { Ref, computed, onMounted, onUnmounted, ref } from 'vue';
import { menuItems } from '@/router'
import { useRoute, useRouter } from 'vue-router'
import { MenuOutlined, ArrowLeftOutlined, LockOutlined, UnlockOutlined, SaveOutlined, HistoryOutlined, SearchOutlined, PlusCircleOutlined, CodeOutlined, CopyOutlined } from '@ant-design/icons-vue';
import { ItemType } from 'ant-design-vue';
import { useGameData } from '@/data/customized-game-data';
import { usePending } from '@/utils/use';
import PathSelector from './path-selector.vue';
import HistoryBrowser from './history/history-browser.vue';
import SearchPanel from './search/search-panel.vue'
import { GameDataKey } from '@/common/ggbh-meta';
import { useWindowSize } from '@vueuse/core';
import ObjectEditor from './editor/object-editor.vue';
import ObjectTypeSelectorDialog from './editor/object-type-selector-dialog.vue';
import Console from './script-console/console.vue';
import ReplicateObjects from './editor/replicate-objects.vue';
import DataIntegrity from './viewer/data-integrity.vue';

const route = useRoute();
const { width } = useWindowSize();
const { gameData, createObject } = useGameData();

const title = computed<string>(() => {
  return (menuItems.find(item => item?.key === route.path) as { label?: string })?.label || route.path;
})

const computedMenuItem = computed<ItemType[]>(() => {
  return menuItems.filter(item => item && item.key != route.path)
})

const selectedKeys = ref([])

const router = useRouter()

const gotoLink = ({ key }: { key: string }) => {
  if (key) {
    router.push(key)
  }
}

// save project
const { fn: onSaveProject } = usePending(gameData.save)

// history browser
const historyBrowserVisibile = ref<boolean>(false);
const gotoBrowser = (item: { type: GameDataKey, id: string }) => {
  historyBrowserVisibile.value = false;
  searchDialogVisible.value = false;
  router.push({ path: '/object-browser', query: { type: item.type, id: item.id } })
}

// search ...
const searchDialogVisible = ref<boolean>(false);

// create new object
// select the type of new object
const newObjectType = ref<GameDataKey>();
const objectTypeSelectorVisible = ref<boolean>(false);
const openTypeSelectorDialog = () => {
  newObjectType.value = undefined;
  objectTypeSelectorVisible.value = true;
}
// create empty object and show editor
const newObject = ref<GameObjectData>({ id: '' });
const editorDrawerVisible = ref<boolean>(false);
const onNewObjectTypeSelected = () => {
  if (newObjectType.value) {
    newObject.value = createObject(newObjectType.value)
    objectTypeSelectorVisible.value = false;
    editorDrawerVisible.value = true;
  }
}
// save new object
const onSaveNewObject = () => {
  editorDrawerVisible.value = false;
  if (newObject.value && newObjectType.value) {
    gameData.updateObject(newObjectType.value, newObject.value);
    gotoBrowser({ type: newObjectType.value, id: newObject.value.id });
  }
}

// console
const consoleDialogVisible = ref<boolean>(false);

// replicate
const replicateDialogVisible = ref<boolean>(false);

// hotkey
const toggleUIShowHide = (visible: Ref<boolean>, fn?: () => void) => {
  fn = fn || (() => visible.value = !visible.value)
  const arr = [historyBrowserVisibile, searchDialogVisible, consoleDialogVisible, objectTypeSelectorVisible, replicateDialogVisible];
  if (arr.every(e => !e.value) || arr.some(e => e === visible && e.value)) {
    fn()
  }
}
const hotkeyHandler = (e: KeyboardEvent) => {
  if (e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
    if (['h', 'H'].includes(e.key)) {
      toggleUIShowHide(historyBrowserVisibile)
    } else if (['s', 'S'].includes(e.key)) {
      toggleUIShowHide(searchDialogVisible)
    } else if (['n', 'N'].includes(e.key)) {
      toggleUIShowHide(objectTypeSelectorVisible, openTypeSelectorDialog)
    } else if (['l', 'L'].includes(e.key)) {
      toggleUIShowHide(consoleDialogVisible)
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', hotkeyHandler);
})

onUnmounted(() => {
  window.removeEventListener('keydown', hotkeyHandler);
})
</script>

<style scoped>
.app-header {
  width: 100vw;
  height: 64px;
  position: relative;
}

.menu-icon {
  font-size: 1.2em;
}
</style>

