<template>
  <div class="h-full w-full flex flex-row p-1 gap-2">
    <!-- dictionary list container -->
    <div class="relative w-[240px] border rounded border-solid border-gray-100 flex flex-col">
      <h3 class="w-full text-center">Dictionary List</h3>
      <div class="w-full min-h-[400px] max-h-[600px] overflow-y-scroll">
        <a-menu :items="dicts" @select="onMenuSelected"></a-menu>
      </div>
      <a-button @click="addDictionary" class="w-full" type="text">+ Add one</a-button>
    </div>
    <div class="h-full w-[calc(100%-242px)] flex flex-col border rounded border-solid border-gray-100"
      v-if="selectedDict">
      <div class="p-4">
        <a-form size="small">
          <a-form-item label="字典名称">
            <a-input v-model:value="selectedDict.label"></a-input>
          </a-form-item>
        </a-form>
      </div>
      <a-table :columns="columns" :data-source="selectedDictItems" size="small">
        <template #title>
          <h3>Entries</h3>
        </template>
        <template #footer>
          <a-space>
            <a-button @click="addEntry">Add an entry</a-button>
            <a-button @click="importingDialogVisible = true">Import</a-button>
          </a-space>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click="editEntry(record)">Edit</a>
              <a @click="deleteEntry(record.key)">Delete</a>
            </a-space>
          </template>
        </template>
      </a-table>
      <a-modal v-model:open="entryEditorVisible" :okButtonProps="{ disabled: !!formValidationError }" @ok="saveEntry"
        title="New Entry" width="480px">
        <a-form :model="editingEntry" size="small" label-align="right" :label-col="{ style: { width: '90px' } }"
          :wrapper-col="{ span: 14 }" bordered>
          <a-form-item label="Key" name="key" :rules="[{ required: true }]">
            <a-input v-model:value.trim="editingEntry!.key"></a-input>
          </a-form-item>
          <a-form-item label="Label" name="label" :rules="[{ required: true }]">
            <a-input v-model:value.trim="editingEntry!.label"></a-input>
          </a-form-item>
        </a-form>
        <span v-if="formValidationError" class="text-red-600">{{ formValidationError }}</span>
      </a-modal>
      <DictionaryImport v-model:open="importingDialogVisible" @ok="doImport"></DictionaryImport>
    </div>

  </div>
</template>
<script setup lang="ts">
import { useAppConfig } from '@/data/app-config';
import { computed, ref } from 'vue';
import { ItemType, Modal } from 'ant-design-vue';
import DictionaryImport from './dictionary-import.vue';

const appConfig = useAppConfig();

type EditingEntry = {
  oldKey?: string;
  key: string;
  label: string;
}

const dicts = computed<ItemType[]>(() => {
  return Object.values(appConfig.dictionary || {}).map(dict => {
    return {
      key: dict.id,
      label: dict.label,
    } as ItemType;
  })
})

const selectedDictId = ref<string>();

const selectedDict = computed<AppConfig.Dictionary | undefined>(() => {
  if (!selectedDictId.value || !appConfig.dictionary) return;
  return appConfig.dictionary[selectedDictId.value];
})

const selectedDictItems = computed<{ key: string, label: string }[]>(() => {
  if (!selectedDict.value) return [];
  return Object.entries(selectedDict.value.entries).map(([k, v]) => {
    return {
      key: k,
      label: v,
    }
  })
})

const randomDictId = () => {
  return 'D' + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

const addDictionary = () => {
  let id = randomDictId()
  while (appConfig.dictionary && appConfig.dictionary[id]) {
    id = randomDictId()
  }
  appConfig.dictionary = appConfig.dictionary || {};
  appConfig.dictionary[id] = {
    id, label: id,
    entries: {}
  }
  selectedDictId.value = id;
}

// on menu selected
const onMenuSelected = ({ key }: { key: string }) => {
  selectedDictId.value = key;
}

// entry editor
const entryEditorVisible = ref<boolean>(false);
const editingEntry = ref<EditingEntry>();
const addEntry = () => {
  editingEntry.value = {
    key: '',
    label: '',
  }
  entryEditorVisible.value = true;
}

const formValidationError = computed<string | undefined>(() => {
  if (!selectedDict.value) return 'Error';
  if (!editingEntry.value?.label) return 'Empty label';
  if (!editingEntry.value?.key) return 'Empty key';
  if (editingEntry.value?.oldKey) { // modify
    if (editingEntry.value.oldKey !== editingEntry.value.key && selectedDict.value.entries[editingEntry.value.key]) {
      return 'Duplicated key: ' + editingEntry.value.key;
    }
  } else { // create
    if (selectedDict.value.entries[editingEntry.value.key]) {
      return 'Duplicated key: ' + editingEntry.value.key;
    }
  }
})

const saveEntry = () => {
  if (!selectedDict.value || !editingEntry.value) return;
  if (editingEntry.value.oldKey && editingEntry.value.oldKey !== editingEntry.value.key) {
    delete selectedDict.value.entries[editingEntry.value.oldKey]
  }
  selectedDict.value.entries[editingEntry.value.key] = editingEntry.value.label;
  entryEditorVisible.value = false;
}

const deleteEntry = (key: string) => {
  Modal.confirm({
    title: 'Delete Entry',
    content: 'You are about to delete entry[' + key + ']. Are you sure?',
    onOk() {
      if (selectedDict.value)
        delete selectedDict.value.entries[key]
    }
  })
}

const editEntry = (row: { key: string, label: string }) => {
  editingEntry.value = Object.assign({}, row, { oldKey: row.key });
  entryEditorVisible.value = true;
}

// importing
const importingDialogVisible = ref<boolean>(false);

const doImport = (entries: { label: string, key: string }[], conflictStrategy: 'I' | 'R') => {
  if (selectedDict.value) {
    entries.forEach(item => {
      if (conflictStrategy === 'R' || !selectedDict.value?.entries[item.key]) {
        selectedDict.value!.entries[item.key] = item.label;
      }
    })
  }
  importingDialogVisible.value = false;
}
// dictionary entry table
const columns = [
  {
    title: 'Key',
    dataIndex: 'key',
    key: 'key'
  },
  {
    title: 'Label',
    dataIndex: 'label',
    key: 'label'
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
  }
]

</script>
