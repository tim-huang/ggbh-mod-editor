<template>
  <div class="w-screen h-screen">
    <app-header></app-header>
    <div class="main-view-content max-w-screen w-screen overflow-scroll p-2">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">

import AppHeader from '@/components/app-header.vue';



</script>

<style scoped>
.main-view-content {
  height: calc(100vh - 64px);
  max-height: calc(100vh - 64px);
}
</style>

