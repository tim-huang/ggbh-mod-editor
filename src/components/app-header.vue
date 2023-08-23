
<template>
  <div class="app-header flex flex-col justify-center">
    <div class="flex flex-row place-items-center mx-2 gap-4">
      <!-- go back arrow -->
      <a @click="router.back()" class="cursor-pointer" title="Go back">
        <arrow-left-outlined></arrow-left-outlined>
      </a>
      <div class="flex flex-col place-items-start gap-0.5 font-sans">
        <!-- title  -->
        <div class="text-lg bold">
          <span>{{ title }}</span>
        </div>
        <!-- sub title -->
        <div class="text-sm text-gray-500 flex flex-row">
          <!-- project path -->
          <a-tag color="blue">
            <template #icon>
              <folder-open-outlined></folder-open-outlined>
            </template>
            <span>{{ gameData.path }}</span>
          </a-tag>
          <!-- readonly -->
          <a-tag @click="gameData.readonly = !gameData.readonly" class="cursor-pointer"
            :color="gameData.readonly ? 'red' : 'green'">
            <template #icon>
              <lock-outlined v-if="gameData.readonly"></lock-outlined>
              <unlock-outlined v-else></unlock-outlined>
            </template>
            <span>{{ gameData.readonly ? "Readonly" : "Writable" }}</span>
          </a-tag>
          <!-- <path-selector></path-selector> -->
        </div>
      </div>
      <!-- <path-selector></path-selector> -->
    </div>
    <div class="absolute right-4 top-1/2 -translate-y-1/2 flex flex-row place-items-center gap-4 z-10">
      <!-- TODO: implement feature - search anything  -->
      <a-input-search placeholder="Search anything" width="300px"></a-input-search>
      <a-dropdown>
        <a class="menu-icon cursor-pointer">
          <menu-outlined class="text-blue-500"></menu-outlined>
        </a>
        <template #overlay>
          <a-menu v-model:selectedKeys="selectedKeys" :items="computedMenuItem" @click="gotoLink">
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">

import { computed, ref } from 'vue';
import { menuItems } from '@/router'
import { useRoute, useRouter } from 'vue-router'
import PathSelector from '@/components/path-selector.vue'
import { MenuOutlined, FolderOpenOutlined, ArrowLeftOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons-vue';
import { ItemType } from 'ant-design-vue';
import { useGameData } from '@/data/customized-game-data';

const route = useRoute();
const { gameData } = useGameData();

const title = computed<string>(() => {
  return (menuItems.find(item => item?.key === route.path) as { label?: string })?.label || route.path;
})

const computedMenuItem = computed<ItemType[]>(() => {
  return menuItems.filter(item => item && item.key != route.path)
})

const selectedKeys = ref([])

const router = useRouter()

const gotoLink = ({ key }: { key: string }) => {
  if (key) {
    router.push(key)
  }
}

</script>

<style scoped>
.app-header {
  width: 100vw;
  height: 64px;
  position: relative;
}

.menu-icon {
  font-size: 1.2em;
}
</style>

