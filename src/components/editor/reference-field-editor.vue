<template>
  <div class="flex flex-col max-w-[calc(100%)] overflow-x-scroll gap-y-0.5">
    <span v-for="(fv, idx) in model" :key="fv">
      <a-tag @close="removeObject(fv)" closable>
        <a @click="moveLeft(fv)" v-if="idx > 0">
          <caret-up-outlined class="text-blue-600"></caret-up-outlined>
        </a>
        <a @click="moveRight(fv)" v-if="idx < model.length - 1">
          <caret-down-outlined class="text-blue-600"></caret-down-outlined>
        </a>
        <!-- menu for replacing assosiated object -->
        <a-dropdown>
          <swap-outlined class="text-orange-600" title="Replace"></swap-outlined>
          <template #overlay>
            <a-menu :items="menuItems" @click="onMenuItemClick($event, fv)"></a-menu>
          </template>
        </a-dropdown>
        <!-- edit btn -->
        <field-display :data-key="dataKey" :field="field" :field-value="fv"></field-display>
      </a-tag>
    </span>
    <!-- menu for add assosiated object -->
    <div>
      <a-dropdown v-if="field.multiple || !model.length">
        <a-tag color="processing" class="cursor-default">
          <plus-outlined></plus-outlined>
          Add Reference
        </a-tag>
        <template #overlay>
          <a-menu :items="menuItems" @click="onMenuItemClick"></a-menu>
        </template>
      </a-dropdown>
    </div>
    <object-selector :data-key-restrict="dataKeyRestrict" :width="`${width - 100}px`"
      :multiple="field.multiple && !replacing" v-model:open="objectSelectorVisible" @select="onAssosiateWithObject"
      @close="onSelectorClosed"></object-selector>
    <a-drawer v-model:open="objectCreatorVisible" :title="editorTitle" :width="`${width - 180}px`" destroy-on-close>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="onCreateSave">Save</a-button>
          <a-button @click="objectCreatorVisible = false">Cancel</a-button>
        </a-space>
      </template>
      <object-editor v-if="newDataKey && newObject" :data-key="newDataKey" v-model:value="newObject" ref="editorRef"
        :labelStyle="{ 'max-width': '300px' }"></object-editor>
    </a-drawer>
  </div>
</template>
<script setup lang="ts">
import { GameDataKey } from '@/common/ggbh-meta';
import { computed, nextTick, ref } from 'vue';
import FieldDisplay from '../viewer/field-display.vue';
import { PlusOutlined, CaretUpOutlined, CaretDownOutlined, SwapOutlined, EditOutlined } from '@ant-design/icons-vue';
import ObjectSelector from '../object-browser/object-selector.vue';
import { useWindowSize } from '@vueuse/core';
import { useGameData } from '@/data/customized-game-data';
import ObjectEditor from './object-editor.vue';
import { originalGameData } from '@/data/original-game-data';


const props = defineProps<{
  dataKey: GameDataKey;
  field: AppConfig.IFieldConfig;
  fieldValue?: string;
}>();

const emits = defineEmits<{
  (e: 'update:fieldValue', value: string): void;
}>();

const model = computed<string[]>({
  get: () => {
    if (!props.fieldValue || props.fieldValue === '0') {
      return [] as string[]
    }
    return props.fieldValue.split('|') || []
  },
  set: (values: string[]): void => {
    emits('update:fieldValue', values?.length ? values.join('|') : '0')
  }
})

const dataKeyRestrict = computed<GameDataKey[]>(() => (props.field.refer?.map(r => r.object) || []) as GameDataKey[]);

const menuItems = computed<ItemType[]>(() => {
  const arr = [{
    label: 'Existing Object',
    key: '$',
  }];
  dataKeyRestrict.value.forEach(k => {
    arr.push({
      label: 'New ' + k,
      key: k,
    })
  });
  return arr as unknown as ItemType[];
})

// replace or add
const replacing = ref<string>('');
const onMenuItemClick = ({ key }: { key: string }, replaceId?: string) => {
  if (replaceId) {
    replacing.value = replaceId;
  }
  if (key === '$') {
    // select existing
    objectSelectorVisible.value = true
  } else {
    onCreate(key as GameDataKey)
  }
}
// create an object and assosiate with this object
const newObject = ref<GameObjectData>();
const newDataKey = ref<GameDataKey>();
const { gameData, createObject } = useGameData();
const objectCreatorVisible = ref<boolean>(false);
const onCreate = (key: GameDataKey) => {
  editorTitle.value = 'New ' + key;
  newDataKey.value = key;
  newObject.value = createObject(key);
  objectCreatorVisible.value = true; // open drawer
}
const editorTitle = ref<string>('')
const onEdit = (key: GameDataKey, id: string) => {
  newObject.value = gameData.combined[key]?.find(o => o.id === id);
  if (newObject.value) {
    editorTitle.value = 'Edit ' + key + ' - ' + id;
    objectCreatorVisible.value = true;
  }
}

const onCreateSave = () => {
  if (newDataKey.value && newObject.value) {
    gameData.updateObject(newDataKey.value, newObject.value); // update object
    const key = newDataKey.value;
    const id = newObject.value.id;
    // gameData.combined is a computed variable, it will not be recomputed before next tick
    nextTick(() => {
      objectCreatorVisible.value = false;
      const obj = (gameData.combined[key]!).find(o => o.id === id);
      if (obj) {
        onAssosiateWithObject({ type: key, items: [obj] })
      }
    })
  }
}

// remove one
const removeObject = (fv: string) => {
  model.value = model.value.filter(s => s !== fv)
}

// add one
const { width } = useWindowSize();
const objectSelectorVisible = ref<boolean>(false);
// move
const moveLeft = (fv: string) => {
  const idx = model.value.indexOf(fv);
  if (idx > 0) {
    const arr = [...model.value];
    [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]]
    model.value = arr;
  }
}

const moveRight = (fv: string) => {
  const idx = model.value.indexOf(fv);
  if (idx < model.value.length - 1) {
    const arr = [...model.value];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
    model.value = arr;
  }
}

const onAssosiateWithObject = ({ type, items }: { type: GameDataKey, items: GameObjectData[] }) => {
  const refer = props.field.refer?.find(r => r.object == type);
  objectSelectorVisible.value = false;
  if (!refer) return;
  if (!replacing.value) {
    model.value = [...model.value, ...items.map(o => o[refer.field])]
  } else {
    const idx = model.value.indexOf(replacing.value)
    if (idx >= 0) {
      const arr = [...model.value];
      arr[idx] = items[0][refer.field];
      model.value = arr;
    }
  }
}

const onSelectorClosed = () => {
  replacing.value = '';
}
</script>
