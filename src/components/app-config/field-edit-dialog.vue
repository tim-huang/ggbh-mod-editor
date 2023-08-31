<template>
  <a-modal title="Reference" @ok="saveField" v-model:open="openModel" :ok-button-props="{ disabled: okButtonDisabled }"
    width="850px">
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
      <template v-if="dialogModel.referType === 'R' && dialogModel.refer">
        <a-form-item :wrapper-col="{ offset: 4, span: 20 }" :hasFeedback="false">
          <template v-if="dialogModel.refer?.length">
            <div class="grid grid-cols-12 gap-0.5 font-bold">
              <span class="col-span-6">Object</span>
              <span class="col-span-5">Field</span>
              <span class="col-span-1"></span>
            </div>
            <div v-for="( refer, index ) of  dialogModel.refer " :key="index" class="grid grid-cols-12 gap-0.5">
              <a-form-item :name="['refer', index, 'object']" :rules="[{ required: true }]" class="col-span-6">
                <a-select v-model:value="refer.object" :options="referenceObjects" show-search />
              </a-form-item>
              <a-form-item :name="['refer', index, 'field']" :rules="[{ required: true }]" class="col-span-5">
                <a-select v-model:value="refer.field" :options="computeReferenceFields(refer.object as GameDataKey)"
                  show-search />
              </a-form-item>
              <a title="remove" @click="removeRefer(index)">
                <close-circle-outlined class="text-red-600"></close-circle-outlined>
              </a>
            </div>
            <a-form-item>
              <a-checkbox v-model:checked="dialogModel.multiple">Multiple</a-checkbox>
            </a-form-item>
          </template>
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 4, span: 20 }">
          <a-space>
            <a-button @click="addEmptyReference">
              <template #icon>
                <plus-outlined></plus-outlined>
              </template>
              Add Reference
            </a-button>
            <a-dropdown>
              <a-button>Frequent Reference</a-button>
              <template #overlay>
                <a-menu :items="frequentReferences"></a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </a-form-item>
      </template>
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
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';

const props = defineProps<{
  dataKey: GameDataKey,
  code: string,
  open?: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:open', open?: boolean): void
}>();

const openModel = useVModel(props, 'open', emit)
const { setField, mergedObjectConfig, appConfig } = useGameObject(() => props.dataKey)

// form model
type DialogModel = AppConfig.IFieldConfig & { referType?: 'N' | 'D' | 'R', type?: string }
const dialogModel = ref<DialogModel>();
const stopPropsWatch = watchEffect(() => {
  const field: DialogModel = (mergedObjectConfig.value.fields || {})[props.code];
  if (field) {
    dialogModel.value = { ...field }
    // set referType
    if (field.dictionary) {
      dialogModel.value.referType = 'D'
    } else if (field.refer) {
      dialogModel.value.refer = field.refer.map(r => ({ ...r }))
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
    return !!dialogModel.value.refer?.some((refer) => (refer.object || refer.field) && (!refer.object || !refer.field))
      || !dialogModel.value.refer?.filter(r => r.object && r.field)?.length
  }
  return false
})

// add new reference
const addEmptyReference = () => {
  doAddReference("" as GameDataKey, "");
}
// frequentReferences
const doAddReference = (key: GameDataKey, fieldCode: string) => {
  if (!dialogModel.value || dialogModel.value.referType !== 'R') return;
  if (!dialogModel.value.refer?.length) {
    dialogModel.value.refer = []
  }
  dialogModel.value.refer!.push({
    object: key,
    field: fieldCode,
  })
}
const frequentReferences = [
  {
    label: '文本:LocalText.key',
    key: 'LocalText.key',
    onClick() {
      doAddReference(GameDataKey.LocalText, 'key');
    }
  },
  {
    label: '日志:RoleLogLocal.key',
    key: 'RoleLogLocal.key',
    onClick() {
      doAddReference(GameDataKey.RoleLogLocal, 'keyID');
    }
  },
  {
    label: '剧情:DramaDialogue.id',
    key: 'DramaDialogue.id',
    onClick() {
      doAddReference(GameDataKey.DramaDialogue, 'id');
    }
  },
  {
    label: '道具:ItemProps.id',
    key: 'ItemProps.id',
    onClick() {
      doAddReference(GameDataKey.ItemProps, 'id');
    }
  },
]
// refer type changed
const referTypeChanged = (e: any) => {
  if (!dialogModel.value) return
  if (e.target.value === 'R' && !dialogModel.value?.refer) {
    dialogModel.value.refer = []
  }
}

// remove a refer
const removeRefer = (index: number) => {
  if (!dialogModel.value?.refer?.length) return;
  if (index < 0 || index > dialogModel.value.refer.length - 1) {
    return
  }
  dialogModel.value.refer.splice(index, 1)
}
// save field
const saveField = () => {
  // const field = getOrCreateField(props.code);
  const field = Object.assign({}, dialogModel.value);
  // Object.assign(field, dialogModel.value, { referType: undefined, label: undefined, type: undefined })
  field.refer = field.refer?.filter((r) => r.field && r.object)
  if (dialogModel.value?.referType !== 'R' || !field.refer?.length) {
    delete field.refer
    delete field.multiple
  }
  if (dialogModel.value?.referType !== 'D') {
    delete field.dictionary
  }
  delete field.referType;
  delete field.label;
  delete field.type;
  setField(field);
  openModel.value = false
}

// datasource for reference object select
const referenceObjects = Object.keys(gameMetaInfo)
  // .filter(key => key != props.dataKey)
  .map(key => ({ value: key, label: key }))
// datasource for reference field select
const computeReferenceFields = computed(() => {
  return (object: GameDataKey) => {
    if (!object) return []
    const { mergedObjectConfig } = useGameObject(() => object)
    return Object.values(mergedObjectConfig.value.fields!).map((field) => {
      return {
        value: field.code,
        label: field.code + " - " + (field.alias || field.label)
      }
    })
  }
})

// datasource for dictionary select
const dictionaries = appConfig.getSelectOptions("dictionary");
// datasource for dictionary example
const exampleDictionary = computed(() => {
  if (dialogModel.value?.dictionary) {
    return appConfig.getSelectOptions(dialogModel.value.dictionary)
  }
  return []
})
</script>
