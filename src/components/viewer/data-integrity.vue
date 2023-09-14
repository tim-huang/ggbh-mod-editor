<template>
  <a-dropdown v-if="errors.length">
    <a-tag color="orange">
      <ExclamationCircleOutlined></ExclamationCircleOutlined>
      <span>{{ errors.length }} issues</span>
    </a-tag>
    <template #overlay>
      <a-menu :items="errors"></a-menu>
    </template>
  </a-dropdown>
</template>
<script lang="ts" setup>
import { GameDataKey } from '@/common/ggbh-meta';
import { useGameObject } from '@/data/app-config';
import { useGameData } from '@/data/customized-game-data';
import { computed } from 'vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { ItemType } from 'ant-design-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const { gameData, getReferenceObjectsByField } = useGameData();

const errors = computed<ItemType[]>(() => {
  const result: ItemType[] = [];
  Object.keys(gameData.json).forEach((k) => {
    const key = k as GameDataKey;
    if (gameData.json[key]?.length) {
      const { mergedObjectConfig } = useGameObject(() => key);
      const referFields = Object.values(mergedObjectConfig.value.fields || {}).filter(field => field.refer?.length);
      if (!referFields.length) return;
      // check reference
      const customzedObject = gameData.json[key];
      referFields.forEach((field) => {
        customzedObject?.forEach(obj => {
          const val = obj[field.code];
          if (!val || val === '0') return;
          const fv = field.multiple ? val.split('|') : [val];
          fv.forEach(value => {
            const ref = getReferenceObjectsByField(field, value);
            if (!Object.keys(ref).length) {
              const msg = `${key}.${obj.id}: ${field.code} reference to nonexisting object ${fv}`;
              result.push({
                key: msg,
                label: msg,
                onClick: () => {
                  router.push({ path: "/object-browser", query: { type: key, id: obj.id } })
                }
              })
            }
          })
        })
      })
    }
  })
  return result;
})
</script>
