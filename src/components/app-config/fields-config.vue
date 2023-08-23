<template>
  <div>
    <a-table :columns="columns" :data-source="fields" size="small">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'refer'">
          <div class="flex flex-row gap-1">
            <span v-if="record.refer?.length">
              <a-tag v-for="refer of record.refer">
                {{ refer.object }}.{{ refer.field }}
              </a-tag>
            </span>
            <a-tag v-else-if="record.dictionary">
              {{ record.dictionary }}
            </a-tag>
            <span v-else>None</span>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <a @click="openFieldEditDialog(record.code)">
            <edit-outlined class="mr-0.5"></edit-outlined>
            Edit
          </a>
        </template>
      </template>
    </a-table>
    <field-edit-dialog v-model:open="editingReference" :data-key="dataKey" :code="editingFieldCode" />
  </div>
</template>

<script lang="ts" setup>

import { GameDataKey } from '@/common/ggbh-meta';
import { useGameObject } from '@/data/app-config';
import { computed, ref } from 'vue';
import { EditOutlined } from '@ant-design/icons-vue';
import FieldEditDialog from './field-edit-dialog.vue'

const props = defineProps<{
  dataKey: GameDataKey
}>();

const { mergedObjectConfig } = useGameObject(() => props.dataKey)

const fields = computed<AppConfig.IFieldConfig[]>(() => Object.values(mergedObjectConfig.value.fields!));
// edit field
const editingReference = ref<boolean>(false);
const editingFieldCode = ref<string>("");

const openFieldEditDialog = (code: string) => {
  editingFieldCode.value = code;
  editingReference.value = true
}

const columns = [
  {
    title: "Code",
    dataIndex: "code",
    key: "code",
  },
  {
    title: "Original Name",
    dataIndex: "label",
    key: "label",
  },
  {
    title: "Alias",
    dataIndex: "alias",
    key: "alias",
  },
  {
    title: "Reference",
    dataIndex: "refer",
    key: "refer",
  },
  {
    title: "Action",
    dataIndex: "action",
    key: "action"
  }
]
</script>
