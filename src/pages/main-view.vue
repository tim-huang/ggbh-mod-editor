<template>
  <a-layout :style="{ width: '100%', height: '100%' }">
    <a-layout-header style="position: fixed; z-index: 1; width: 100%;">
      <PathSelector></PathSelector>
    </a-layout-header>
    <a-layout style="marginTop: 64px; height: calc(100vh - 64px)">
      <a-layout-sider v-model:collapsed="collapsed" collapsible theme='light'>
        <div class="logo" />
        <a-menu v-model:selectedKeys="selectedKeys" mode="inline" :items="menuItems" @click="gotoLink">
        </a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout-content :style="{ minHeight: '100%', minWidth: '100%' }">
          <router-view></router-view>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">

import { computed, ref } from 'vue';
import { menuItems } from '@/router'
import { useRouter } from 'vue-router'
import PathSelector from '@/components/path-selector.vue'

const collapsed = ref(false)
const selectedKeys = ref([])

const router = useRouter()

const gotoLink = ({ key }: { key: string }) => {
  console.log(key)
  if (key) {
    router.push(key)
  }
}


</script>

<style scoped></style>

