<!--产品工作台 - 颜色-->
<template>
  <div class="model-info-color" style="pointer-events: all">
    <div v-for="item in da.colorList" :key="item.id" @click="onClick(item)" :class="{ action: item.id == da.activeColorId }" :title="item.colorName" class="model-info-color-item">
      <div :style="{ backgroundColor: item.colorCode }"></div>
    </div>
  </div>
</template>

<script setup>
import { designStoreToRefs } from '@/designClass/store';
const da = designStoreToRefs();

function onClick(item) {
  da.value.activeColorId = item.id;
}
</script>

<style scoped lang="less">
@import url('/src/fnDesigner/css/colorCard.less');
</style>
