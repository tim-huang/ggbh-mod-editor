<template>
  <a-space direction="vertical" class="w-full">
    <div class="p-2 grid grid-cols-3 gap-5">
      <!-- prev dialogue -->
      <a-dropdown v-if="prev?.length > 1" placement="bottom">
        <a-button :icon="h(CaretLeftOutlined)" type="primary">Previous</a-button>
        <template #overlay>
          <a-menu :items="prev" @click="(e: any) => gotoDialogue(e.key)"></a-menu>
        </template>
      </a-dropdown>
      <a-button @click="gotoDialogue(prev[0]?.key as string)" :icon="h(CaretLeftOutlined)" type="primary"
        v-else-if="prev?.length === 1">
        Prev
      </a-button>
      <div v-else></div>

      <!-- dialogue type -->
      <a-popover trigger="click">
        <div class="cursor-pointer">
          <h4 class="align-bottom text-blue-500">
            <info-circle-outlined></info-circle-outlined>
            <field-display :data-key="GameDataKey.DramaDialogue" :field="getField('uiType')"
              :field-value="data?.uiType || ''" />
            <!-- {{ data?.uiType }} - {{ dramaUiType[data?.uiType as string] }} -->
          </h4>
          <h4>
            <field-display :data-key="GameDataKey.DramaDialogue" :field="getField('title')"
              :field-value="data?.title || ''" />
          </h4>
        </div>
        <template #content v-if="data">
          <game-data-viewer :data-key="GameDataKey.DramaDialogue" :data="data" />
        </template>
      </a-popover>
      <!-- next dialogue -->
      <a-button @click="gotoDialogue(data.nextDialogue)" :icon="h(CaretRightOutlined)" type="primary"
        v-if="data?.nextDialogue && data?.nextDialogue !== '0'">
        Next
      </a-button>
    </div>
    <!-- participants-->
    <div class="w-full h-32 relative">
      <div v-if="data?.npcLeft && data?.npcLeft !== '0'" class="absolute left-4 flex flex-col">
        <img src="/public/images/human.png" height="128" :class="{ 'blur-sm': data.speaker !== '1' }">
        <field-display :data-key="GameDataKey.DramaDialogue" :field="getField('npcLeft')"
          :field-value="data?.npcLeft || ''" />
        <!-- <span>{{ data?.npcLeft }} - {{ dramaNpc[data?.npcLeft] }}</span> -->
      </div>
      <div v-if="data?.npcRight && data?.npcRight !== '0'" class="absolute right-4 flex flex-col">
        <img src="/public/images/human.png" height="128" style="transform: rotateY(180deg)"
          :class="{ 'blur-sm': data.speaker !== '2' }">
        <field-display :data-key="GameDataKey.DramaDialogue" :field="getField('npcRight')"
          :field-value="data?.npcRight || ''" />
        <!-- <span>{{ data?.npcRight }} - {{ dramaNpc[data?.npcRight] }}</span> -->
      </div>
    </div>
    <!-- content -->
    <div class="w-full p-4 bg-gray-200 m-2 rounded-lg border border-gray-500 border-solid">
      <field-display :data-key="GameDataKey.DramaDialogue" :field="getField('dialogue')"
        :field-value="data?.dialogue || ''" />

      <!-- <p v-for="(item, index) in textContents"><message-outlined /> {{ item }} </p> -->
    </div>
    <!-- options -->
    <a-list item-layout="horizontal" :data-source="options" v-if="options?.length">
      <template #renderItem="{ item }">
        <a-list-item>
          <div class="flex flex-col place-items-start">
            <a-popover trigger="click">
              <h4 class="cursor-pointer">{{ item.text[0] || '无文本' }} ({{ item.option.id }})</h4>
              <template #content>
                <game-data-viewer :data-key="GameDataKey.DramaOptions" :data="item.option" />
              </template>
            </a-popover>
            <a v-for="dst of item.to" @click="gotoDialogue(dst.id)"><message-outlined class="mx-1" />{{ dst.text[0] ||
              '无文本' }}</a>
          </div>
        </a-list-item>
      </template>
    </a-list>
  </a-space>
</template>

<script lang="ts" setup>

import { useGameData } from "@/data/customized-game-data";
import { computed, h } from "vue";
import GameDataViewer from "@/components/game-data-viewer.vue";
import { CaretRightOutlined, CaretLeftOutlined, InfoCircleOutlined, MessageOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { GameDataKey } from "@/common/ggbh-meta";
import { ItemType } from "ant-design-vue";
import FieldDisplay from "../field-display.vue";
import { useGameObject } from "@/data/app-config";

const props = defineProps<{
  dialogueId: string
}>()

const router = useRouter();
const { gameData, fn } = useGameData();
const { mergedObjectConfig } = useGameObject(() => GameDataKey.DramaDialogue)

// field
const getField = computed(() => {
  return (code: string): AppConfig.IFieldConfig => {
    if (mergedObjectConfig.value.fields) {
      return mergedObjectConfig.value.fields[code] || { code }
    }
    return { code }
  }
})
// current dialogue data
const data = computed<DramaDialogue | undefined>(() => {
  return (gameData.combined.DramaDialogue as DramaDialogue[])
    .find(item => item.id === props.dialogueId)
})

// previous dialogue data
const prev = computed<ItemType[]>(() => {
  if (!data.value?.id) return []
  const found = (gameData.combined.DramaDialogue as DramaDialogue[])
    .filter(item => item.nextDialogue === data.value?.id)
  return found.map(item => {
    const texts = fn.getText(item.dialogue)
    return {
      key: item.id,
      label: (texts?.length > 0 ? texts[0] : "No Content").substring(0, 20)
    }
  })
})

// current dialogue text contents
// const textContents = computed<string[]>(() => {
//   return fn.getText(data.value?.dialogue)
// })

// current dialogue title
// const titles = computed<string[]>(() => {
//   return fn.getText(data.value?.title)
// })

// options
type LocalOption = {
  option: DramaOptions,
  text: string[],
  to: {
    id: string,
    text: string[]
  }[]
}
const options = computed<LocalOption[]>(() => {
  if (!data.value || !data.value.options || data.value.options === '0') return []
  const options = data.value.options.split('|')
  const found = (gameData.combined.DramaOptions as DramaOptions[])
    .filter((item) => options.indexOf(item.id) != -1)
  return found.map(item => {
    const option: LocalOption = {
      option: item,
      text: fn.getText(item.text),
      to: []
    }
    if (item.nextDialogue && item.nextDialogue !== '0') {
      item.nextDialogue.split('|').forEach(id => {
        const dst = (gameData.combined.DramaDialogue as DramaDialogue[]).find((a) => a.id === id)
        dst && option.to.push({ id, text: fn.getText(dst.dialogue) })
      })
    }
    return option
  })
})

// goto specified dialogue
const gotoDialogue = (id: string) => {
  router.push({
    path: "/drama",
    query: {
      type: GameDataKey.DramaDialogue,
      id
    }
  })
}
</script>

<style scoped></style>
