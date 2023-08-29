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
      <a-tree v-model:selected-keys="selectedKeys" v-model:expanded-keys="expandedKeys" :tree-data="treeData"
        :load-data="loadData" @select="onNodeSelected" show-line>
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

const treeData = ref<TreeData[]>([]);
const selectedKeys = ref<(string | number)[]>([]);
const expandedKeys = ref<(string | number)[]>([])

const { gameData } = useGameData();

// object selector
const objectSelectorVisible = ref<boolean>(false);

const { width } = useWindowSize();

const onRootSelected = ({ type, items }: { type: GameDataKey, items: GameObjectData[] }) => {
  const root = { type, item: items[0] };
  objectSelectorVisible.value = false;
  // re-initialize tree
  initializeTreeData(root);
  selectedKeys.value = treeData.value?.map(item => item.key) || [];
  // onNodeSelected(selectedItem)
  emits('nodeSelected', root);
}

// initialize tree
const loadData = async ({ dataRef }: { dataRef: TreeData }) => {
  return new Promise<void>(resolve => {
    if (dataRef.children) {
      resolve();
      return;
    }
    if (dataRef.type === 'field') {
      dataRef.children = dataRef.field.refer?.map(refer => {
        let arr = [dataRef.data];
        if (dataRef.field.multiple) {
          arr = dataRef.data?.split('|')
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
          key: `${dataRef.key}/${obj.type}-${obj.item.id}`,
          data: obj,
        }
      });
    } else if (dataRef.type === 'object') {
      // add field as children
      const { mergedObjectConfig } = useGameObject(() => dataRef.data!.type);
      dataRef.children = Object.values(mergedObjectConfig.value.fields || {}).filter(field => field.refer).map(field => {
        return {
          type: 'field',
          title: field.alias?.trim() || field.label?.trim() || field.code,
          key: `${dataRef.key}/${field.code}`,
          field,
          data: dataRef.data!.item[field.code]
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
// refresh tree
const refreshTree = async (arg?: { type: GameDataKey, id: string }) => {
  if (arg) {
    const obj = gameData.combined[arg.type]?.find(o => o.id === arg.id)
    if (obj) {
      initializeTreeData({ type: arg.type, item: obj })
    }
  } else {
    if (!treeData.value?.length) return;
    const keys = [...expandedKeys.value]
    const root = treeData.value[0];
    if (root.type === 'object') {
      const obj = gameData.combined[root.data.type]?.find(o => o.id === root.data.item.id);
      if (obj) {
        root.data.item = obj;
        const todo = [...treeData.value];
        while (todo.length) {
          const node = todo.pop();
          if (node && keys.includes(node.key)) {
            delete node.children;
            await loadData({ dataRef: node });
            if (node.children) {
              todo.push(...(node.children as TreeData[]));
            }
          }
        }
        treeData.value = [...treeData.value];
      } else {
        treeData.value = [];
      }
    } else {
      treeData.value = [];
    }
  }
}

defineExpose({
  refreshTree
})
</script>
