<template>
  <a-modal v-bind="$attrs" @ok="onOk" :okButtonProps="{ disabled: !entries.length }" width="800px"
    title="Import dictionary values">
    <div class="w-full flex flex-fow gap-1">
      <!-- form -->
      <div class="px-4 py-1 rounded border border-solid border-gray-100"><a-form :model="model" size="small"
          :label-col="{ span: 24 }">
          <a-form-item label="请贴入文本" name="text" :rules="[{ required: true }]">
            <a-textarea :rows="10" v-model:value="model.text"></a-textarea>
          </a-form-item>
          <a-form-item label="行分隔符(默认\n)" name="rowSeparator" :rules="[{ validator: regExprValidator }]">
            <a-input v-model:value="model.rowSeparator"></a-input>
          </a-form-item>
          <a-form-item label="抓取正则" name="captureExpress" :rules="[{ required: true, validator: regExprValidator }]">
            <a-input v-model:value="model.captureExpress">
              <template #addonAfter>
                <a-dropdown>
                  <HistoryOutlined class=""></HistoryOutlined>
                  <template #overlay>
                    <a-menu :items="frequentRegExpressions" @click="onFrequentRegExpressionClick"></a-menu>
                  </template>
                </a-dropdown>
              </template>
            </a-input>
          </a-form-item>
          <a-form-item label="冲突策略" name="conflictStrategy" :rules="[{ required: true }]">
            <a-radio-group v-model:value="model.conflictStrategy">
              <a-radio value='I'>Ignore</a-radio>
              <a-radio value='R'>Replace</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item name="swap">
            <a-checkbox v-model:checked="model.swap">Swap label & key</a-checkbox>
          </a-form-item>
        </a-form></div>
      <!-- preview -->
      <a-table :columns="columns" :data-source="entries" width="300px" height="600px" size="small" bordered>
        <template #header>

        </template>
      </a-table>
    </div>
  </a-modal>
</template>
<script setup lang="ts">

import { ItemType } from 'ant-design-vue';
import { computed, ref } from 'vue';
import { HistoryOutlined } from '@ant-design/icons-vue';

const emits = defineEmits<{
  (e: 'ok', entries: { label: string, key: string }[], conflictStrategy: 'I' | 'R'): void;
}>();

type DictionaryImportModel = {
  text: string;
  rowSeparator: string;
  captureExpress: string;
  conflictStrategy: 'I' | 'R'; // ignore or replace
  swap: boolean;
}

const model = ref<DictionaryImportModel>({
  text: '',
  rowSeparator: '\\n',
  captureExpress: '',
  swap: false,
  conflictStrategy: 'R',
});

// reg expr validator
const regExprValidator = async (_rule: any, value: string) => {
  try {
    RegExp(value)
  } catch (e) {
    return Promise.reject('Invalid regular expression.')
  }
  return Promise.resolve();
}

const frequentRegExpressions: ItemType[] = [
  '\\s*([^\\s]+)\\s+(.+)',
  '\\s*(\\d+)\\s+([^\\s]+)',
  '\\s*([^\\s]+)[\\s-]+([^\\s]+)',
].map(v => ({ label: v, key: v }))

const onFrequentRegExpressionClick = ({ key }: { key: string }) => {
  model.value.captureExpress = key;
}

const entries = computed<{ label: string, key: string }[]>(() => {
  if (!model.value.text || !model.value.captureExpress) return [];
  const rows = model.value.text.split(RegExp(model.value.rowSeparator || '\n'));
  const result: { label: string, key: string }[] = [];
  rows.map(row => row.trim()).filter(r => r).forEach(row => {
    try {
      const expr = RegExp(model.value.captureExpress)
      const groups = expr.exec(row)
      if (groups?.length === 3) {
        result.push({
          key: model.value.swap ? groups[2] : groups[1],
          label: model.value.swap ? groups[1] : groups[2]
        })
      }
    } catch (e) {
      console.debug(e)
    };
  })
  return result;
})

const columns = [
  {
    title: 'Key',
    dataIndex: 'key',
    key: 'key',
    width: 200,
  },
  {
    title: 'Label',
    dataIndex: 'label',
    key: 'label',
    width: 250,
  },
]

const onOk = () => {
  emits('ok', entries.value, model.value.conflictStrategy);
}
</script>
