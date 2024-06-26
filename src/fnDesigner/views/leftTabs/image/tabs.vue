<template>
  <el-tabs v-model="active">
    <el-tab-pane label="我的图库" name="1">
      <myImage />
    </el-tab-pane>
    <el-tab-pane label="平台图库" name="2">
      <platformImage />
    </el-tab-pane>
    <el-tab-pane label="收藏图库" name="3">
      <collectImage />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import { ref } from 'vue';
import myImage from './my.vue';
import collectImage from './collect.vue';
import platformImage from './platform.vue';

const active = ref('1');
</script>

<style scoped lang="less">
@import url('/src/fnDesigner/css/tabs.less');
</style>
