<template>
  <div>
    <a-page-header :title="selectedDialogue?.type || 'Drama'" @back="() => null">
      <template #extra>
        <drama-search-input @item-selected="onSelected" clear-after-selected></drama-search-input>
        <!--        <a-button type="primary" :icon="h(SearchOutlined)">Find...</a-button>-->
      </template>
    </a-page-header>
    <a-empty v-if="!selectedDialogue"></a-empty>
    <drama-dialogue-viewer :dialogue-id="selectedDialogue.id"
      v-else-if="selectedDialogue.type === GameDataKey.DramaDialogue"></drama-dialogue-viewer>
    <game-data-viewer v-else-if="selectedData" :data-key="selectedDialogue?.type" :data="selectedData"></game-data-viewer>
  </div>
</template>


<script setup lang="ts">
import { computed, ref, onUnmounted, watch } from 'vue';
import { useGameData } from '@/data/customized-game-data'
import { GameDataKey } from '@/common/ggbh-meta';
import DramaSearchInput from '@/components/drama/drama-search-input.vue'
import DramaDialogueViewer from '@/components/drama/drama-dialogue-viewer.vue'
import GameDataViewer from '@/components/viewer/game-data-viewer.vue'
import { useRoute } from "vue-router";

const currentRoute = useRoute()

const { gameData } = useGameData();
const selectedDialogue = ref();

if (!gameData.json.DramaDialogue) {
  gameData.load(GameDataKey.DramaDialogue)
}

const onSelected = (item: { id: string, type: string }) => {
  selectedDialogue.value = item
}

const selectedData = computed(() => {
  if (!selectedDialogue.value) return
  const source: GameObjectData[] = (selectedDialogue.value.type === GameDataKey.DramaOptions ?
    gameData.combined.DramaOptions
    : gameData.combined.DramaDialogue) || [];

  return source?.find(item => item.id == selectedDialogue.value.id)
})

let watchHandler = watch([() => currentRoute.query.type, () => currentRoute.query.id], () => {
  if (currentRoute.query.id && currentRoute.query.type) {
    selectedDialogue.value = { ...currentRoute.query }
  }
})

onUnmounted(() => {
  watchHandler()
})
</script>
