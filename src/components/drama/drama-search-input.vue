<template>
  <a-auto-complete v-model:value="keyword" :options="autoCompleteDataSource" :dropdown-match-select-width="800"
    @select="onSelect" allow-clear>
    <a-input placeholder="Find one">
      <template #prefix>
        <search-outlined class="text-gray-400"></search-outlined>
      </template>
    </a-input>
    <template #option="item">
      <template v-if="item.options">
        <a-space>
          <span class="text-xs text-gray-500">{{ item.value }}</span>
          <a-badge :count="item.options?.length ?? 0"></a-badge>
        </a-space>
      </template>
      <template v-else>
        <a-space :key="item.key">
          <component :is="item.type === GameDataKey.DramaDialogue ? MessageOutlined : UnorderedListOutlined" />
          <span class="text-xs text-gray-500">{{ item.id }}</span>
          <span class="text-xs text-gray-500">{{ item.textKey }}</span>
          <a-tag v-if="item.content?.length > 1">{{ item.content.length }}</a-tag>
          <span class="text-sm" v-if="item.content?.length">{{ item.content[0] }}</span>
          <a-tag v-else color="red">No Content</a-tag>
        </a-space>
      </template>
    </template>
  </a-auto-complete>
</template>

<script lang="ts" setup>

import { useGameData } from "@/data/customized-game-data";
import { computed, ref } from "vue";
import { GameDataKey } from "@/common/ggbh-meta";
import { SearchOutlined, MessageOutlined, UnorderedListOutlined } from "@ant-design/icons-vue";

const props = defineProps<{
  clearAfterSelected?: boolean
}>();

type OptionItem = {
  id: string,
  value: string,
  // key: string,
  textKey: string,
  content: string[],
  type: string; //GameDataKey.DramaOptions | GameDataKey.DramaDialogue,
  links?: string[],
}

const emits = defineEmits<{
  (e: "itemSelected", option: OptionItem): void;
}>()

const { gameData, fn } = useGameData()
const keyword = ref("");

// menu item is selected
const onSelect = (_: any, option: OptionItem) => {
  emits("itemSelected", option)
  if (props.clearAfterSelected) {
    keyword.value = ""
  }
}

// map dialogue to item
const dialogue = computed<OptionItem[]>(() => {
  return gameData.combined.DramaDialogue?.map((d: DramaDialogue) => {
    return {
      id: d.id,
      // key: GameDataKey.DramaDialogue+d.id,
      value: GameDataKey.DramaDialogue + d.id,
      // value: d.id,
      textKey: d.dialogue,
      content: fn.getText(d.dialogue),
      type: GameDataKey.DramaDialogue,
      links: (d.options && d.options != "0") ? d.options.split("|") : undefined
    }
  }) || [];
})

// map options to item
const dialogueOptions = computed<OptionItem[]>(() => {
  return gameData.combined.DramaOptions?.map((o: DramaOptions) => {
    return {
      id: o.id,
      // key: GameDataKey.DramaOptions+o.id,
      value: GameDataKey.DramaOptions + o.id,
      // value: o.id,
      textKey: o.text,
      content: fn.getText(o.text),
      type: GameDataKey.DramaOptions,
    }
  }) || [];
})

// filter item by keyword
const optionFilter = (item: OptionItem) => {
  if (!keyword.value) return true
  if (item.id.indexOf(keyword.value) != -1) return true;
  if (item.content?.some(s => s.indexOf(keyword.value) != -1)) return true;
  return false
}
// combine dialogue & options
const autoCompleteDataSource = computed(() => {
  const result = [];
  const filteredDialogues = dialogue.value.filter(optionFilter);
  const filteredOptions = dialogueOptions.value.filter(optionFilter);
  if (filteredDialogues.length) {
    result.push({
      value: 'Dialogues',
      options: filteredDialogues
    })
  }
  if (filteredOptions.length) {
    result.push({
      value: 'Options',
      options: filteredOptions
    })
  }
  return result;
})
</script>
