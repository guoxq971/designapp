<!--产品工作台 - 尺码-->
<template>
  <div class="model-info-color" style="pointer-events: all">
    <div class="model-info-color-size" v-for="item in sizeList" :key="item.id" @click="onClick(item)" :class="{ action: item.id == da.activeSizeId, disabled: disabled(item) }">
      <span>{{ item.name }}</span>
      <span v-if="isShowDesignFlag(item)" class="flag-wrap">设计</span>

      <!--插槽-->
      <slot :item="item"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getSizeList } from '@/fnDesigner/js/getProductInfoHelp';
import { designStoreToRefs } from '@/designClass/store';
const da = designStoreToRefs();

// 是否禁用
const disabled = computed(() => {
  return (item) => {
    if ([null, undefined, ''].includes(item.disabled)) {
      return false;
    } else {
      return item.disabled;
    }
  };
});
// 是否显示设计标识
const isShowDesignFlag = computed(() => (item) => false);

const sizeList = computed(() => {
  // console.log('尺码列表', cloneDeep(result));
  return getSizeList(da.value.activeTemplate.detail);
});

function onClick(item) {
  da.value.activeSizeId = item.id;
}
</script>

<style scoped lang="less">
@import url('/src/fnDesigner/css/colorCard.less');

.disabled {
  background: #ccc;
  pointer-events: none;
}
</style>
