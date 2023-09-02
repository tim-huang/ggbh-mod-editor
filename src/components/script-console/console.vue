<template>
  <div class="w-full h-[600px] space-y-1">
    <div class="w-full h-[calc(100%-100px)] p-1 flex flex-col gap-y-0.5 border border-solid rounded border-gray-100">
      <a-alert v-for="item of scriptHistory" :key="item.time" :type="item.error ? 'error' : 'success'"
        @close="removeHistory(item)" show-icon closable>
        <template #message>
          <a-space>
            <div class="w-48 overflow-hidden text-ellipsis whitespace-nowrap">{{ item.script }}</div>
            <a-popover trigger="click" v-model:open="item.popover">
              <div class="flex flex-row place-items-center gap-1 cursor-pointer">
                <InfoCircleOutlined v-if="!item.error" class="text-green-600 cursor-pointer" @click="log2Console(item)"
                  title="Log to console">
                </InfoCircleOutlined>
                <div :class="{ 'ml-1 w-96 overflow-hidden text-sm text-ellipsis whitespace-nowrap text-gray-500': true }">
                  {{ item.result || item.error }}</div>
              </div>
              <template #content>
                <div class="flex flex-col gap-y-1 w-[800px]">
                  <a-textarea :rows="20" :value="stringify(item.result || item.error)"></a-textarea>
                  <a-button @click="item.popover = false" type="primary">Close</a-button>
                </div>
              </template>
            </a-popover>
          </a-space>
        </template>
        <template #action>
          <a-space>
            <span class="text-xs text-gray-400">{{ item.time.toLocaleTimeString() }}</span>
            <span class="text-xs text-pink-300 flex flex-row gap-1 place-items-center">
              <ClockCircleOutlined></ClockCircleOutlined>
              <span>{{ item.duration }}ms</span>
            </span>
            <EditOutlined @click="scriptContent = item.script" class="text-blue-500" title="Reedit"></EditOutlined>
          </a-space>
        </template>
      </a-alert>
    </div>
    <div class="w-full h-[100px] flex flex-row gap-1">
      <a-textarea :rows="5" v-model:value="scriptContent" class="w-[calc(100%-66px)]" ref="scriptInput"
        @keyup.ctrl.enter="executeScript"></a-textarea>
      <div
        class="flex flex-col text-center justify-center align-middle w-[64px] border border-solid border-red-500 rounded bg-red-100 text-red-600 font-bold cursor-pointer hover:bg-red-200"
        @click="executeScript" title="CTRL-ENTER">
        <FireOutlined></FireOutlined>RUN<br>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { EditOutlined, InfoCircleOutlined, ClockCircleOutlined, FireOutlined } from '@ant-design/icons-vue';
import { useAppConfig } from '@/data/app-config';
import { useGameData } from '@/data/customized-game-data';

const scriptContent = ref<string>('')

type ScriptRunningHistory = {
  script: string;
  time: Date;
  duration: number;
  result?: any;
  error?: unknown;
  popover?: boolean;
}

const appConfig = useAppConfig();
const { gameData } = useGameData();

const scriptHistory = ref<ScriptRunningHistory[]>([]);
const scriptInput = ref();

const executeScript = () => {
  const script = scriptContent.value.trim();
  if (!script) return;
  const lines = script.split('\n').filter(str => str.trim());
  lines[lines.length - 1] = 'return ' + lines[lines.length - 1];
  const runningInfo: ScriptRunningHistory = {
    script, time: new Date(), duration: 0
  }
  try {
    const fn = new Function('appConfig', 'gameData', lines.join('\n'))
    runningInfo.result = fn(appConfig, gameData);
  } catch (e) {
    runningInfo.error = e;
  }
  runningInfo.duration = Date.now() - runningInfo.time.getTime();
  scriptHistory.value.push(runningInfo)
}

const removeHistory = (item: ScriptRunningHistory) => {
  scriptHistory.value = scriptHistory.value.filter(i => i != item);
}

const stringify = computed(() => {
  return (obj: any) => {
    if (!obj) return '';
    if (typeof obj === 'object') {
      return JSON.stringify(obj, null, 2);
    } else {
      return obj.toString();
    }
  }
})

const log2Console = (obj: ScriptRunningHistory) => {
  console.log(obj.result);
}
onMounted(() => {
  scriptInput.value?.focus();
})
</script>
