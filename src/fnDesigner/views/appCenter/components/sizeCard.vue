<!--产品工作台 - 尺码-->
<template>
  <div class="model-info-color" style="pointer-events: all">
    <div class="model-info-color-size" v-for="item in sizeList" :key="item.id" @click="onClick(item)" :class="{ action: item.id == $app.activeSizeId, disabled: disabled(item) }">
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
import { TEMPLATE_DESIGN_TYPE } from '@/designClass/core/define';
const $app = designStoreToRefs();

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
const isShowDesignFlag = computed(() => (item) => {
  let result;
  result = $app.value.templateList.find((e) => e.size == item.name && e.type === TEMPLATE_DESIGN_TYPE.refine)?.isDesign();
  return result;
});

const sizeList = computed(() => {
  // console.log('尺码列表', cloneDeep(result));
  return getSizeList($app.value.activeTemplate.detail);
});

function onClick(item) {
  if (item.id === $app.value.activeSizeId) return;
  $app.value.activeSizeId = item.id;
  if ($app.value.activeTemplateType === TEMPLATE_DESIGN_TYPE.refine) {
    $app.value.useTemplateBySize(TEMPLATE_DESIGN_TYPE.refine, item.name);
  }
}
</script>

<style scoped lang="less">
@import url('/src/fnDesigner/css/colorCard.less');

.disabled {
  background: #ccc;
  pointer-events: none;
}
</style>
