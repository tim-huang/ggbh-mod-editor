<template>
  <a-modal v-bind="$attrs" :okButtonProps="{ disabled: !model }" @ok="onOk" title="Please select the type of object"
    width="340px">
    <a-select :options="options" v-model:value="model" placeholder="Select the type of object" style="width: 280px"
      ref="selectRef" show-search></a-select>
  </a-modal>
</template>
<script setup lang="ts">
import { GameDataKey, gameMetaInfo } from '@/common/ggbh-meta';
import { computed, onMounted, ref } from 'vue';

const props = defineProps<{
  value?: GameDataKey,
}>();

const emits = defineEmits<{
  (e: 'update:value', value?: GameDataKey): void
  (e: 'ok'): void
}>()

const model = computed<GameDataKey | undefined>({
  get: () => {
    return props.value
  },
  set: (v) => {
    emits('update:value', v)
  }
})

const options = Object.keys(gameMetaInfo).map(value => ({ label: value, value }));

const onOk = () => {
  if (model.value) {
    emits('ok')
  }
}

// focus
const selectRef = ref();
onMounted(() => selectRef.value?.focus())
</script>
