<template>
  <el-tabs v-model="active">
    <el-tab-pane label="文字" name="1">
      <textTab />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import { ref } from 'vue';
import textTab from './text/index.vue';

const active = ref('1');
</script>

<style scoped lang="less">
@import url('/src/fnDesigner/css/tabs.less');
</style>
