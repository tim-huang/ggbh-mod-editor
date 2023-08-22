<template>
  <a-table :columns="columns" :dataSource="dataSource" size="small"></a-table>
</template>

<script lang="ts" setup>
import { GameDataKey, gameMetaInfo } from '@/common/ggbh-meta';
import { computed } from 'vue';

const props = defineProps<{
  dataKey: GameDataKey,
  dataSource: ArrayLike<any>,
}>()

const fields = gameMetaInfo[props.dataKey].fields;


const columns = computed(() => {
  return fields.map(field => ({
    title: field.label,
    dataIndex: field.code,
    key: field.code
  }))
})

</script>
