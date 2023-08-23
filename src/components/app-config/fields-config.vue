<template>
  <div>
    <a-table :columns="columns" :data-source="fields" size="small">
      <template #bodyCell="{ column, record }">
        <!-- reference info -->
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
        <!-- action column -->
        <template v-else-if="column.dataIndex === 'action'">
          <!-- edit action -->
          <a @click="openFieldEditDialog(record.code)">
            <edit-outlined></edit-outlined>
            Edit
          </a>
          <span class="text-gray-400 mx-0.5">|</span>
          <!-- show samples -->
          <a-dropdown @openChange="(open: boolean) => showSamples(open, record.code)" placement="left" arrow>
            <a>
              <info-circle-outlined></info-circle-outlined>
              Sample
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item v-for="item of sampleValues[record.code]">
                  {{ item }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </template>
    </a-table>
    <field-edit-dialog v-model:open="editingReference" :data-key="dataKey" :code="editingFieldCode" />
  </div>
</template>

<script lang="ts" setup>

import { GameDataKey } from '@/common/ggbh-meta';
import { useGameObject } from '@/data/app-config';
import { computed, reactive, ref } from 'vue';
import { EditOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
import FieldEditDialog from './field-edit-dialog.vue'
import { useGameData } from '@/data/customized-game-data';

const props = defineProps<{
  dataKey: GameDataKey
}>();

const { mergedObjectConfig } = useGameObject(() => props.dataKey)
const { gameData } = useGameData()

const fields = computed<AppConfig.IFieldConfig[]>(() => Object.values(mergedObjectConfig.value.fields!));
// edit field
const editingReference = ref<boolean>(false);
const editingFieldCode = ref<string>("");

const openFieldEditDialog = (code: string) => {
  editingFieldCode.value = code;
  editingReference.value = true
}

// sample values
const sampleValues = reactive<Record<string, string[]>>({})
const showSamples = (show: boolean, fieldCode: string) => {
  const [sampleSize, maxTextLength] = [10, 80]
  if (show && !sampleValues[fieldCode]) {
    //generate sample value for field
    const arr = gameData.combined[props.dataKey];
    const samples = new Set<string>()
    for (let item of arr) {
      if (samples.size > sampleSize) {
        break;
      }
      if (item[fieldCode]) {
        if (item[fieldCode].length > maxTextLength) {
          samples.add(item[fieldCode].substring(0, maxTextLength) + '...');
        } else {
          samples.add(item[fieldCode])
        }
      }
      sampleValues[fieldCode] = Array.from(samples).sort()
    }
  }
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
