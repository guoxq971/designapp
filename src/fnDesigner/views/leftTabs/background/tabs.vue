<template>
  <el-tabs v-model="active">
    <el-tab-pane label="背景图" name="1">
      <backgroundImage />
    </el-tab-pane>
    <el-tab-pane label="背景色" name="2">
      <backgroundColor />
    </el-tab-pane>
    <el-tab-pane label="收藏背景" name="3">
      <collectImage />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import { ref } from 'vue';
import backgroundImage from './backgroundImage.vue';
import collectImage from './collect.vue';
import backgroundColor from './backgroundColor.vue';

const active = ref('1');
</script>

<style scoped lang="less">
@import url('/src/fnDesigner/css/tabs.less');
</style>
