<template>
  <a-modal v-bind="$attrs" @ok="doReplicate" :okButtonProps="{ disabled: !replicatedObjects.length, loading: pending }">
    <div class="w-full flex flex-row gap-1">
      <div class="w-[550px] flex flex-col gap-3 border border-solid border-gray-200 rounded-lg p-1">
        <h3 class="text-blue-500 underline">Filters:</h3>
        <object-selector v-if="selectedObjectType" v-model:open="objectSelectorVisible" :width="`${width - 64}px`"
          placement="left" :data-key-restrict="[selectedObjectType]" @select="onObjectSelected"></object-selector>
        <!-- form for filter -->
        <a-form size="small" :label-col="{ style: { width: '120px' } }">
          <a-form-item label="Object Type">
            <a-select :options="options" v-model:value="selectedObjectType" @change="objectTypeChanged"
              show-search></a-select>
          </a-form-item>
          <a-form-item v-for="filter of filtersModel" :key="filter.code">
            <template #label>
              <a-space>
                <CloseCircleOutlined class="text-red-500" @click="removeFilter(filter.code)"></CloseCircleOutlined>
                <span>{{ filter.label }}</span>
              </a-space>
            </template>
            <a-input v-model:value="filter.value">
              <template #addonAfter>
                <a @click="selectObject(filter)">...</a>
              </template>
            </a-input>
          </a-form-item>
          <a-dropdown>
            <a-button class="w-full" type="primary">
              <template #icon>
                <PlusOutlined></PlusOutlined>
              </template>
              Add Filter
            </a-button>
            <template #overlay>
              <a-menu :items="fieldMenuItems" @click="newFilter"></a-menu>
            </template>
          </a-dropdown>
        </a-form>
        <h3 class="text-blue-500 underline">Replacements:</h3>
        <!-- form for replacement -->
        <a-form size="small" :label-col="{ style: { width: '120px' } }">
          <a-form-item label="Base ID" :rules="[{ required: true }]">
            <a-input v-model:value="replacementBaseId">
            </a-input>
          </a-form-item>
          <a-form-item v-for="replacement of replacementsModel" :key="replacement.code">
            <template #label>
              <a-space>
                <CloseCircleOutlined class="text-red-500" @click="removeReplacement(replacement.code)">
                </CloseCircleOutlined>
                <span>{{ replacement.label }}</span>
              </a-space>
            </template>
            <a-input v-model:value="replacement.value">
              <template #addonBefore>
                <a-select v-model:value="replacement.strategy" :options="strategyOptions" style="width: 100px"></a-select>
              </template>
            </a-input>
          </a-form-item>
          <a-dropdown>
            <a-button class="w-full" type="primary">
              <template #icon>
                <PlusOutlined></PlusOutlined>
              </template>
              Add Replacement
            </a-button>
            <template #overlay>
              <a-menu :items="replacementMenuItems" @click="newReplacement"></a-menu>
            </template>
          </a-dropdown>
        </a-form>
        <div class="text-right">Preview Mode:
          <a-switch v-model:checked="previewReplaced">
            <template #checkedChildren>After Replacement</template>
            <template #unCheckedChildren>Before Replacement</template>
          </a-switch>
        </div>
      </div>
      <div class="w-[calc(100%-250px)] max-h-[750px] overflow-y-scroll">
        <TableViewer v-if="selectedObjectType" :data-key="selectedObjectType" :data-source="previewData" size="small"
          :scroll="{ x: 800 }" bordered>
        </TableViewer>
      </div>
    </div>
  </a-modal>
</template>
<script setup lang="ts">
import { GameDataKey, gameMetaInfo } from '@/common/ggbh-meta';
import { useGameObject } from '@/data/app-config';
import { computed, ref } from 'vue';
import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { ItemType } from 'ant-design-vue';
import { useGameData } from '@/data/customized-game-data';
import TableViewer from '../viewer/table-viewer.vue';
import { useWindowSize } from '@vueuse/core';
import ObjectSelector from '../object-browser/object-selector.vue';
import { usePending } from '@/utils/use';

const emits = defineEmits<{
  (e: 'ok'): void;
}>()
const { gameData } = useGameData()

const options = Object.keys(gameMetaInfo).map((key) => ({ label: key, value: key }));
const selectedObjectType = ref<GameDataKey>();
const objectTypeChanged = () => {
  filtersModel.value = [];
  replacementsModel.value = [];
}

// options for object type selector
const { mergedObjectConfig } = useGameObject(() => selectedObjectType.value!);
// how to build menu item for 'add' dropdown
const buildMenuItems = (excluded?: { code: string }[]) => {
  if (!mergedObjectConfig.value) return [];
  return Object.values(mergedObjectConfig.value.fields || {})
    .filter(field => !excluded?.some(filter => filter.code === field.code))
    .map(field => {
      return {
        label: field.alias?.trim() || field.label?.trim() || field.code,
        key: field.code,
      }
    })
}

// model for filters
const filtersModel = ref<{ label: string, code: string, value: string }[]>([]);

// options for field selector
const fieldMenuItems = computed<ItemType[]>(() => {
  return buildMenuItems(filtersModel.value)
})


// remove from list if field code is empty
const removeFilter = (value: string) => {
  filtersModel.value = filtersModel.value.filter(filter => filter.code !== value)
}

// new filter
const newFilter = ({ item }: { item: { originItemValue: { label: string, key: string } } }) => {
  if (item) {
    filtersModel.value.push({
      label: item.originItemValue.label,
      code: item.originItemValue.key,
      value: ''
    });
  }
}

// select object for code
const objectSelectorVisible = ref<boolean>(false);
const { width } = useWindowSize();
let toBeFilled: { code: string, value: string } = { code: '', value: '' };
const selectObject = (obj: { code: string, value: string }) => {
  toBeFilled = obj;
  objectSelectorVisible.value = true;
}

const onObjectSelected = ({ items }: { items: GameObjectData[] }) => {
  if (items.length) {
    toBeFilled.value = items[0][toBeFilled.code]
  }
  objectSelectorVisible.value = false;
}
// replacements model
type ReplacementModel = {
  label: string;
  code: string;
  value: string;
  strategy: 'value' | 'increment';
}
const replacementsModel = ref<ReplacementModel[]>([])
const replacementMenuItems = computed<ItemType[]>(() => buildMenuItems(replacementsModel.value));

// remove replacement
const removeReplacement = (code: string) => {
  replacementsModel.value = replacementsModel.value.filter(r => r.code !== code);
}

// options for replacement strategy
const strategyOptions = [
  { label: 'Directly', value: 'value' },
  { label: 'Auto Inc.', value: 'increment' }
]
// new replacement
const newReplacement = ({ item }: { item: { originItemValue: { label: string, key: string } } }) => {
  if (item) {
    replacementsModel.value.push({
      label: item.originItemValue.label,
      code: item.originItemValue.key,
      value: '',
      strategy: 'value',
    });
  }
}
// id replacement
const previewReplaced = ref<boolean>(true);
const replacementBaseId = ref<string>('');

const getEffectedData = (beforeReplaced?: boolean) => {
  if (!selectedObjectType.value || !replacementBaseId.value) return [];
  const sourceData = gameData.combined[selectedObjectType.value]?.filter(o => {
    return filtersModel.value.every(filter => o[filter.code] === filter.value);
  });
  if (beforeReplaced) return sourceData;
  const autoInc = (code: string, initValue: number) => (obj: GameObjectData) => obj[code] = (initValue++).toString();
  const directly = (code: string, value: string) => (obj: GameObjectData) => obj[code] = value;

  const replacementFunc: ((obj: GameObjectData) => void)[] = replacementsModel.value.map(r => {
    return r.strategy === 'value' ? directly(r.code, r.value) : autoInc(r.code, +r.value);
  })
  replacementFunc.push(autoInc('id', +replacementBaseId.value))
  return sourceData.map(src => {
    const dst = { ...src };
    replacementFunc.forEach(fn => fn(dst));
    return dst;
  })
}
const previewData = computed<GameObjectData[]>(() => {
  return getEffectedData(!previewReplaced.value)
})

const replicatedObjects = computed<GameObjectData[]>(() => {
  return getEffectedData();
})

// on ok
const { fn: doReplicate, pending } = usePending(async () => {
  if (selectedObjectType.value) {

    replicatedObjects.value.forEach(newObj => {
      if (!gameData.combined[selectedObjectType.value!]?.find(o => o.id === newObj.id)) {
        gameData.updateObject(selectedObjectType.value!, newObj);
      } else {
        console.warn(`ID conflict [${selectedObjectType.value}][${newObj.id}]`)
      }
    })
  }
  emits('ok');
})
</script>
