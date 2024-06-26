<template>
  <div class="fn-designer-container">
    <!--左侧-->
    <AppLeft />
    <!--中间-->
    <AppCenter />
    <!--右侧-->
    <appRight />
  </div>
</template>

<script setup>
import AppLeft from '@/fnDesigner/views/leftTabs';
import AppCenter from '@/fnDesigner/views/appCenter';
import appRight from '@/fnDesigner/views/appRight';
</script>

<style scoped lang="less">
.fn-designer-container {
  background-color: #f2f2f2;
  height: calc(100vh - 6rem);
  padding: 1.2rem 1.2rem;
  display: flex;
  justify-content: space-between;
  overflow: auto;
}
</style>
