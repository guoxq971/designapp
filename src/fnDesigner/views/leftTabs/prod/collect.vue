<template>
  <productTab ref="productTabRef" :api="getList" @success="EmitSuccess" />
</template>

<script setup>
import { GRequest, METHOD } from '@/utils/request';
import productTab from '@/fnDesigner/views/leftTabs/prod/productTab.vue';
import { watch, ref } from 'vue';
import { designStoreToRefs } from '@/designClass/store';
const da = designStoreToRefs();

const productTabRef = ref(null);
watch(
  () => da.value.collectTemplateUuid,
  () => {
    productTabRef.value.getList();
  },
);

// 列表
const getList = (params) => {
  return GRequest(`/base-web/CMProductTemplateAct/selectTemplateList4Design.act`, METHOD.GET, { ...params.value, collectFlag: 1 });
};
const EmitSuccess = (list) => {
  da.value.templateCollectList = list;
};
</script>
