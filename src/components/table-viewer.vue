<template>
  <div>
    <a-table :columns="columns" :data-source="dataSource" v-bind="$attrs">
      <template #bodyCell="{ column, text, record }">
        <field-display v-if="column.dataIndex !== '$action'" :data-key="dataKey" :field="fieldMap[column.dataIndex]"
          :field-value="text"></field-display>
        <span v-else>
          <a @click="showDetailDialog(record)" class="mr-1">
            <info-circle-outlined title="Detail"></info-circle-outlined>
          </a>
          <a @click="showEditorDialog(record.id)">
            <edit-outlined title="Edit"></edit-outlined>
          </a>
        </span>
      </template>
    </a-table>
    <!-- detail dialog -->
    <a-modal v-model:open="detailDialogVisible" width="650px" :title="dataKey + ' - ' + detailObject?.id">
      <game-data-viewer :data-key="dataKey" :data="detailObject!"></game-data-viewer>
    </a-modal>
    <!-- editor dialog -->
    <a-modal v-model:open="editorDialogVisible" width="800px" :title="dataKey + ' - ' + editingId">
      <object-editor :data-key="dataKey" :object-id="editingId"></object-editor>
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

const props = defineProps<{
  dataKey: GameDataKey,
  dataSource: GameConfigDataType[]
}>();

const { mergedInlineFields } = useGameObject(() => props.dataKey);

const fieldMap = computed(() => {
  return mergedInlineFields.value.reduce((m, e) => {
    m[e.code] = e;
    return m;
  }, {} as Record<string, AppConfig.IFieldConfig>)
})

const columns = computed(() => {
  const arr: any[] = mergedInlineFields.value.map(field => {
    return {
      title: field.alias?.trim() || field.label?.trim() || field.code,
      dataIndex: field.code,
      key: field.code,
      ellipsis: true,
    }
  }) || [];
  arr.push({
    title: "Action",
    dataIndex: '$action',
    key: '$action',
    ellipsis: true,
    width: 120,
  });
  return arr;
})

// show detail dialog
const detailDialogVisible = ref<boolean>(false);
const detailObject = ref<GameConfigDataType>();
const showDetailDialog = (data: GameConfigDataType) => {
  detailObject.value = data;
  detailDialogVisible.value = true;
}
// show editor dialog
const editorDialogVisible = ref<boolean>(false);
const editingId = ref<string>('');
const showEditorDialog = (id: string) => {
  editingId.value = id;
  editorDialogVisible.value = true;
}
</script>


<style scoped></style>
