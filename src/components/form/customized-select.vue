<template>
  <a-input-group compact>
    <a-select v-if="!inputMode" v-bind="$attrs" style="width: calc(100% - 32px)"></a-select>
    <a-input v-if="inputMode" v-bind="$attrs" style="width: calc(100% - 32px)"></a-input>

    <a-tooltip :title="`switch to ${inputMode ? 'select' : 'input'} mode`">
      <a-button @click="inputMode = !inputMode">
        <template #icon>
          <SwitcherOutlined></SwitcherOutlined>
        </template>
      </a-button>

    </a-tooltip>
  </a-input-group>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { SwitcherOutlined } from '@ant-design/icons-vue';

const inputMode = ref<boolean>(false);
</script>
