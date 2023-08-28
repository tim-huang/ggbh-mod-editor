<template>
  <div class="h-full flex flex-col text-center">
    <div class="h-[36px]">
      <a-button type="primary" @click="objectSelectorVisible = true">
        <template #icon>
          <aim-outlined></aim-outlined>
        </template>
        Select an Object
      </a-button>
    </div>
    <div class="h-[calc(100%-36px)] overflow-x-scroll">
      <a-tree v-model:selected-keys="selectedKeys" :tree-data="treeData" :load-data="loadData" @select="onNodeSelected"
        show-line>
      </a-tree>
    </div>
    <object-selector v-model:open="objectSelectorVisible" :width="`${width - 64}px`" placement="left"
      @select="onRootSelected"></object-selector>
  </div>
</template>
<script setup lang="ts">
import { AimOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';
import ObjectSelector from './object-selector.vue';
import { useWindowSize } from '@vueuse/core';
import { GameDataKey } from '@/common/ggbh-meta';
import { DataNode } from 'ant-design-vue/es/tree';
import { useGameData } from '@/data/customized-game-data';
import { useGameObject } from '@/data/app-config';

type NodeData = {
  type: GameDataKey,
  item: GameObjectData,
}

type TreeData = DataNode & ({
  type: 'field',
  field: AppConfig.IFieldConfig,
  data: string,
} | {
  type: 'object',
  data: NodeData
} | {
  type: 'reference',
  reference: {
    type: GameDataKey,
    fieldCode: string,
  },
  data: string,
})

const emits = defineEmits<{
  (e: 'nodeSelected', item: NodeData): void;
}>()

const root = ref<NodeData>()
const treeData = ref<TreeData[]>([]);
const selectedKeys = ref<(string | number)[]>([]);
// object selector
const objectSelectorVisible = ref<boolean>(false);

const { width } = useWindowSize();

const onRootSelected = (selectedItem: NodeData) => {
  root.value = selectedItem;
  objectSelectorVisible.value = false;
  // re-initialize tree
  initializeTreeData(selectedItem);
  selectedKeys.value = treeData.value?.map(item => item.key) || [];
  // onNodeSelected(selectedItem)
  emits('nodeSelected', selectedItem);
}

// initialize tree
const loadData = async (parent: TreeData) => {
  return new Promise<void>(resolve => {
    if (parent.dataRef.children) {
      resolve();
      return;
    }
    if (parent.type === 'field') {
      const { gameData } = useGameData();
      parent.dataRef.children = parent.field.refer?.map(refer => {
        let arr = [parent.data];
        if (parent.field.multiple) {
          arr = parent.data?.split('|')
        }
        return (gameData.combined[refer.object as GameDataKey]?.filter(obj => arr.includes(obj[refer.field])) || []).map(obj => {
          return {
            type: refer.object as GameDataKey,
            item: obj,
          }
        })
      }).flatMap(e => e).filter(e => e).map(obj => {
        return {
          type: 'object',
          title: `${obj.type}-${obj.item.id}`,
          key: `${parent.key}/${obj.type}-${obj.item.id}`,
          data: obj,
        }
      });
    } else if (parent.type === 'object') {
      // add field as children
      const { mergedObjectConfig } = useGameObject(() => parent.data!.type);
      parent.dataRef.children = Object.values(mergedObjectConfig.value.fields || {}).filter(field => field.refer).map(field => {
        return {
          type: 'field',
          title: field.alias?.trim() || field.label?.trim() || field.code,
          key: `${parent.key}/${field.code}`,
          field,
          data: parent.data!.item[field.code]
        }
      })
    }
    treeData.value = [...treeData.value];
    resolve()
  })

}
const initializeTreeData = (root: NodeData) => {
  const key = `${root.type}-${root.item.id}`;
  treeData.value = [{
    title: key,
    key,
    data: root,
    type: 'object',
  }] as TreeData[];
}
// node selected
const onNodeSelected = (_: (string | number)[], { selected, node: { type, data } }: { selected: boolean, node: { type: string, data: NodeData } }) => {
  if (selected && type === 'object' && data) {
    emits('nodeSelected', data);
  }
}
</script>
