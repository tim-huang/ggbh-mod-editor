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

"1": "大地图踩地雷",
"2": "大地图出图标",
"3": "战斗内特殊房间",
"4": "调用引导功能触发",
"5": "指定位置的范围内触发",
"6": "大地图固定点奇遇",
"7": "当玩家竞价后，NPC抬价时，设置抬价NPC为剧情NPC2",
"8": "NPC找玩家聊天（注意，事件动作必须是callDrama）",
"9": "玩家在非战斗状态下连续点击某一类物品多次",
"10": "玩家在大地图上没有打开其他任何UI，持续一定时间",
"11": "玩家打开某个UI且达到指定时间没有进行任何操作时",
"12": "打开10005的建筑",
"13": "接取宗门任务时触发事件",
"14": "自定义触发",
"15": "打开10005的建筑分类",
"16": "玩家踩到大地图事件上",