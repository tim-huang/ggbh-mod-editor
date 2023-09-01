<template>
  <div class="max-w-[calc(100%)] overflow-x-scroll">
    <a-table :columns="columns" :data-source="dataSource" row-key="id" v-bind="$attrs">
      <!-- @resize-column="handleResizeColumn"> -->
      <template #bodyCell="{ column, text, record }">
        <field-display v-if="column.dataIndex !== '$action'" :data-key="dataKey" :field="fieldMap[column.dataIndex]"
          :field-value="text"></field-display>
        <a-space v-else>
          <a @click="showDetailDialog(record)" class="mr-1">
            <info-circle-outlined title="Detail"></info-circle-outlined>
          </a>
          <a v-if="editable" @click="showEditorDialog(record.id)">
            <edit-outlined title="Edit"></edit-outlined>
          </a>
        </a-space>
      </template>
    </a-table>
    <!-- detail dialog -->
    <a-modal v-model:open="detailDialogVisible" width="800px" :title="dataKey + ' - ' + detailObject?.id"
      @ok="detailDialogVisible = false">
      <div class='w-full h-[680px] overflow-y-scroll'>
        <game-data-viewer :data-key="dataKey" :data="detailObject!"></game-data-viewer>
      </div>
    </a-modal>
    <!-- editor dialog -->
    <a-modal v-model:open="editorDialogVisible" width="800px" :title="dataKey + ' - ' + editingObject?.id"
      @ok="onSaveEditing">
      <div class='w-full h-[680px] overflow-y-scroll'>
        <object-editor v-if="editingObject" :data-key="dataKey" v-model:value="editingObject"></object-editor>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">

import { GameDataKey } from '@/common/ggbh-meta';
import { useGameObject } from "@/data/app-config";
import FieldDisplay from './field-display.vue';
import GameDataViewer from './game-data-viewer.vue';
import ObjectEditor from './object-editor.vue';
import { computed, ref } from 'vue';
import { InfoCircleOutlined, EditOutlined } from '@ant-design/icons-vue';
import { useGameData } from '@/data/customized-game-data';

const props = defineProps<{
  dataKey: GameDataKey,
  dataSource: GameObjectData[],
  selectable?: boolean,
  editable?: boolean,
}>();

const { gameData } = useGameData()

const { mergedInlineFields } = useGameObject(() => props.dataKey);

const fieldMap = computed(() => {
  return mergedInlineFields.value.reduce((m, e) => {
    m[e.code] = e;
    return m;
  }, {} as Record<string, AppConfig.IFieldConfig>)
})


// column definition
const columns = computed(() => {
  const arr: any[] = mergedInlineFields.value.map(field => {
    return {
      title: field.alias?.trim() || field.label?.trim() || field.code,
      dataIndex: field.code,
      key: field.code,
      sorter: (a: GameObjectData, b: GameObjectData) => {
        if (a[field.code] === b[field.code]) return 0;
        if (!a[field.code]) return -1;
        if (!b[field.code]) return 1;
        return a[field.code] > b[field.code] ? 1 : -1;
      },
      sortDirections: ['descend', 'ascend'],
      // resizable: true,
      minWidth: 80,
      width: 100,
      // maxWidth: 300,
      // ellipsis: true,
    }
  }) || [];
  arr.push({
    title: "Action",
    dataIndex: '$action',
    key: '$action',
    fixed: 'right',
    width: 75,
  });
  return arr;
})

// resize column
// const handleResizeColumn = (w: number, col: { width: number }) => {
//   col.width = w;
// }
// show detail dialog
const detailDialogVisible = ref<boolean>(false);
const detailObject = ref<GameObjectData>();
const showDetailDialog = (data: GameObjectData) => {
  detailObject.value = data;
  detailDialogVisible.value = true;
}
// show editor dialog
const editorDialogVisible = ref<boolean>(false);
const editingObject = ref<GameObjectData>();
const showEditorDialog = (id: string) => {
  editingObject.value = Object.assign({}, gameData.combined[props.dataKey]?.find(o => o.id === id));
  editorDialogVisible.value = true;
}
// save  editing
const onSaveEditing = () => {
  if (editingObject.value) gameData.updateObject(props.dataKey, editingObject.value)
  editorDialogVisible.value = false;
}

</script>


<style scoped></style>
