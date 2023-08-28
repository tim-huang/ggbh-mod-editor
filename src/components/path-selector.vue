<template>
  <div v-if="gameData.path" class="flex flex-row w-full text-sm text-left place-items-center ">
    <!-- <div class="flex flex-row w-full h-full"> -->
    <!-- context menu  -->
    <a-dropdown :trigger="['hover']">
      <a><a-tag color="blue" class="cursor-pointer text-xs">
          <template #icon>
            <folder-open-outlined></folder-open-outlined>
          </template>
          <span>{{ gameData.path }}</span>
          <span class="text-red-600" v-if="gameData.dirty">*</span>
        </a-tag></a>
      <template #overlay>
        <a-menu class="text-sm" :items="contextMenuItems" @click="menuItemClicked">
        </a-menu>
      </template>
    </a-dropdown>
  </div>
  <!-- </div> -->
  <div v-else>
    <!-- select path -->
    <div class="flex flex-col justify-center h-full place-items-center">
      <p>Project path is not specified, please select a MOD path.</p>
      <a-button type="primary" @click="onSelectPath">Select ...</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, computed } from 'vue';
import { ItemType, Modal } from 'ant-design-vue';
import { useGameData } from '@/data/customized-game-data';
import { FolderOpenOutlined, ReloadOutlined, SaveOutlined, FolderViewOutlined } from '@ant-design/icons-vue'
import { usePending } from '@/utils/use';

const emits = defineEmits<{
  (e: 'selected', path: string): void;
}>();

const { gameData } = useGameData()

const { fn: onSelectPath } = usePending(async () => {
  const path = await window.api.selectPath();
  if (path && path !== gameData.path) {
    await gameData.init(path);
    path && emits("selected", path)
  }
});

const menuItemClicked = ({ item }: { item: { action?: () => void } }) => {
  if (item.action) {
    item.action()
  }
}

const openInSysApp = async () => {
  window.api.openProjectInSysApp();
}

const { fn: saveProject, pending } = usePending(gameData.save);
const { fn: reloadProject } = usePending(() => gameData.init(gameData.path));

const reload = () => {
  if (gameData.dirty) {
    Modal.confirm({
      title: 'Reload project',
      content: 'Unsaved changes will be discarded, are you sure?',
      onOk() {
        reloadProject()
      }
    })
  }
}

const save = () => {
  saveProject()
}

const contextMenuItems = computed<ItemType[]>(() => {
  return [
    {
      key: '0',
      icon: h(FolderOpenOutlined),
      label: "Open project...",
      disabled: pending.value,
      action: onSelectPath
    },
    {
      id: '4',
      icon: h(SaveOutlined),
      label: "Save",
      disabled: gameData.readonly || pending.value || !gameData.dirty,
      action: save
    },
    {
      id: '3',
      icon: h(ReloadOutlined),
      label: "Reload",
      disabled: pending.value || !gameData.dirty,
      action: reload
    },
    {
      type: 'divider'
    },
    {
      id: '2',
      icon: h(FolderViewOutlined),
      label: "Open folder by system App.",
      action: openInSysApp
    },
  ] as ItemType[]
})

// const pathSelected = (evt: MessageEvent<any>): void => {
//   if (evt.data.type == EditorEvent.PATH_SELECTED) {
//     if (evt.data.data?.length) {
//       editorContext.path = evt.data.data[0]
//     }
//   }
// };
// onMounted(() => {
//   window.addEventListener(EditorEvent.WINDOW_MESSAGE, pathSelected)
// })
//
// onUnmounted(() => {
//   window.removeEventListener(EditorEvent.WINDOW_MESSAGE, pathSelected)
// })
</script>
