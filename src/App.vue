<script setup lang="ts">
import PathSelector from '@/components/path-selector.vue'
import MainView from '@/pages/main-view.vue'
import { useStyleProvider } from 'ant-design-vue';
import { useGameData } from "@/data/customized-game-data"
import { onMounted, reactive } from 'vue';
import { UseStyleProviderProps } from 'ant-design-vue/es/_util/cssinjs/StyleContext';
import { useAppConfig } from './data/app-config';

const { gameData } = useGameData();

// fix css confliction issue of tailwindcss & antdv 
const styleProvider = reactive<UseStyleProviderProps>({
  hashPriority: "high"
})
useStyleProvider(styleProvider)

// load config
const appConfig = useAppConfig();
onMounted(appConfig.init)

</script>

<template>
  <PathSelector v-if="!gameData.path" :class="{ 'h-screen': !gameData.path }"></PathSelector>
  <MainView v-else class="main-view"></MainView>
</template>

<style scoped>
/* .main-view { */
/*   height: calc(100vh - 36px); */
/* } */
</style>
