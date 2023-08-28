<template>
  <span>
    <a-tag v-for="(fv, idx) in model" :closable="field.multiple">
      <a @click="moveLeft(fv)" v-if="idx > 0">
        <caret-left-outlined class="text-blue-600"></caret-left-outlined>
      </a>
      <field-display :data-key="dataKey" :field="field" :field-value="fv" @close="onClose(fv)"></field-display>
      <a @click="moveRight(fv)" v-if="idx < model.length - 1">
        <caret-right-outlined class="text-blue-600"></caret-right-outlined>
      </a>
      <a @click="onReplace(fv)" title="Select another">
        <swap-outlined class="text-orange-600"></swap-outlined>
      </a>
    </a-tag>
    <a-tag color="processing" v-if="field.multiple" class="cursor-pointer" @click="onAdd">
      <plus-outlined></plus-outlined>
    </a-tag>
    <object-selector :data-key-restrict="dataKeyRestrict" v-model:open="objectSelectorVisible" :width="`${width - 100}px`"
      @select="onSelect"></object-selector>
  </span>
</template>
<script setup lang="ts">
import { GameDataKey } from '@/common/ggbh-meta';
import { computed, ref } from 'vue';
import FieldDisplay from '../field-display.vue';
import { PlusOutlined, CaretLeftOutlined, CaretRightOutlined, SwapOutlined } from '@ant-design/icons-vue';
import ObjectSelector from '../object-browser/object-selector.vue';
import { useWindowSize } from '@vueuse/core';


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
    console.log(props.field)
    if (!props.fieldValue || props.fieldValue === '0') {
      return [] as string[]
    }
    return props.fieldValue?.split('|') || []
  },
  set: (values: string[]): void => {
    emits('update:fieldValue', values?.length ? values.join('|') : '0')
  }
})

const dataKeyRestrict = computed<GameDataKey[]>(() => (props.field.refer?.map(r => r.object) || []) as GameDataKey[]);

// remove one
const onClose = (fv: string) => {
  model.value = model.value.filter(s => s === fv)
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
// value for replace
let replacing = '';
const onReplace = (fv: string) => {
  replacing = fv;
  objectSelectorVisible.value = true;
}
const onAdd = () => {
  objectSelectorVisible.value = true;
}
const onSelect = ({ type, item }: { type: GameDataKey, item: GameObjectData }) => {
  const refer = props.field.refer?.find(r => r.object == type);
  objectSelectorVisible.value = false;
  if (!refer) return;
  if (!replacing) {
    model.value = [...model.value, item[refer.field]]
  } else {
    const idx = model.value.indexOf(replacing)
    if (idx >= 0) {
      const arr = [...model.value];
      arr[idx] = item[refer.field];
      model.value = arr;
    }
  }
}
</script>
