<template>
  <el-tabs v-model="active">
    <el-tab-pane label="通用产品" name="1">
      <commonProd />
    </el-tab-pane>
    <el-tab-pane label="收藏产品" name="2">
      <collectProd />
    </el-tab-pane>
    <el-tab-pane label="定制模板" name="3">
      <!--      <commonProd />-->
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import { ref } from 'vue';
import commonProd from './common.vue';
import collectProd from './collect.vue';

const active = ref('1');
</script>

<style scoped lang="less">
@import url('/src/fnDesigner/css/tabs.less');
</style>
