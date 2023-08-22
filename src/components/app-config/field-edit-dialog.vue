<template>
  <a-modal title="Reference" @ok="saveField" v-model:open="openModel" :ok-button-props="{ disabled: okButtonDisabled }">
    <a-form :model="dialogModel" v-if="dialogModel" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" size="small">
      <a-form-item label="Code">{{ dialogModel.code }}</a-form-item>
      <a-form-item label="Name">{{ dialogModel.label }}</a-form-item>
      <a-form-item label="Alias" name="alias">
        <a-input v-model:value="dialogModel.alias" />
      </a-form-item>
      <a-form-item label="Reference">
        <a-radio-group v-model:value="dialogModel.referType" @change="referTypeChanged">
          <a-radio value='N'>None</a-radio>
          <a-radio value='D'>Dictionary</a-radio>
          <a-radio value='R'>Another Object</a-radio>
        </a-radio-group>
      </a-form-item>
      <!-- Reference another object -->
      <div v-if="dialogModel.referType === 'R' && dialogModel.refer">
        <a-form-item label="Object" :name="['refer', 'object']" :rules="[{ required: true }]">
          <a-select v-model:value="dialogModel.refer.object" :options="referenceObjects" show-search />
        </a-form-item>
        <a-form-item label="Field" :name="['refer', 'field']" :rules="[{ required: true }]">
          <a-select v-model:value="dialogModel.refer.field" :options="referenceFields" show-search />
        </a-form-item>
        <a-form-item :name="['refer', 'multiple']" :wrapper-col="{ offset: 4, span: 20 }">
          <a-checkbox v-model:checked="dialogModel.refer.multiple">Multiple</a-checkbox>
        </a-form-item>
      </div>
      <!-- Refer to a dictionary -->
      <div v-else-if="dialogModel.referType === 'D'">
        <a-form-item label="Dictionary" name="dictionary" :rules="[{ required: true }]">
          <a-select v-model:value="dialogModel.dictionary" :options="dictionaries" show-search />
        </a-form-item>
        <a-form-item label="Example">
          <a-select :options="exampleDictionary" show-search />
        </a-form-item>
      </div>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, computed, watchEffect, onUnmounted } from 'vue';
import { useGameObject } from '@/data/app-config'
import { GameDataKey, gameMetaInfo } from '@/common/ggbh-meta';
import { useVModel } from '@vueuse/core';
import { getSelectOptions } from '@/data/dict';

const props = defineProps<{
  dataKey: GameDataKey,
  code: string,
  open?: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:open', open?: boolean): void
}>();

const openModel = useVModel(props, 'open', emit)
const { getOrCreateField, mergedObjectConfig } = useGameObject(() => props.dataKey)

// form model
type DialogModel = AppConfig.IFieldConfig & { referType?: 'N' | 'D' | 'R' }
const dialogModel = ref<DialogModel>();
const stopPropsWatch = watchEffect(() => {
  const field: DialogModel = (mergedObjectConfig.value.fields || {})[props.code];
  if (field) {
    dialogModel.value = { ...field }
    // set referType
    if (field.dictionary) {
      dialogModel.value.referType = 'D'
    } else if (field.refer) {
      dialogModel.value.refer = { ...field.refer }
      dialogModel.value.referType = 'R';
    } else {
      dialogModel.value.referType = 'N'
    }
  } else {
    dialogModel.value = undefined
  }
})
// stop watch when unmounted
onUnmounted(() => {
  stopPropsWatch()
})

// okDisabled
const okButtonDisabled = computed<boolean>(() => {
  if (!dialogModel.value) return true;
  if (dialogModel.value.referType === 'D') {
    return !dialogModel.value.dictionary
  } else if (dialogModel.value.referType === 'R') {
    return !(dialogModel.value.refer?.object && dialogModel.value.refer?.field)
  }
  return false
})

// refer type changed
const referTypeChanged = (e: any) => {
  if (!dialogModel.value) return
  if (e.target.value === 'R' && !dialogModel.value?.refer) {
    dialogModel.value.refer = {
      object: "",
      field: ""
    }
  }
}

// save field
const saveField = () => {
  const field = getOrCreateField(props.code);
  Object.assign(field, dialogModel.value, { referType: undefined })
  console.log(field, dialogModel.value)
  if (dialogModel.value?.referType !== 'R') {
    delete field.refer
  }
  if (dialogModel.value?.referType !== 'D') {
    delete field.dictionary
  }
  openModel.value = false
}

// datasource for reference object select
const referenceObjects = Object.keys(gameMetaInfo).filter(key => key != props.dataKey).map(key => ({ value: key, label: key }))
// datasource for reference field select
const referenceFields = computed(() => {
  if (!dialogModel.value?.refer?.object) return []
  const { mergedObjectConfig } = useGameObject(() => dialogModel.value!.refer!.object! as GameDataKey)
  return Object.values(mergedObjectConfig.value.fields!).map((field) => {
    return {
      value: field.code,
      label: field.alias || field.label
    }
  })
})

// datasource for dictionary select
const dictionaries = getSelectOptions("dictionary");
// datasource for dictionary example
const exampleDictionary = computed(() => {
  if (dialogModel.value?.dictionary) {
    return getSelectOptions(dialogModel.value.dictionary)
  }
  return []
})
</script>
