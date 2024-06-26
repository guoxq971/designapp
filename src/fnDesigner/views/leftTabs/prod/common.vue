<template>
  <productTab :api="getList" isSetProd />
</template>

<script setup>
import { GRequest, METHOD } from '@/utils/request';
import productTab from '@/fnDesigner/views/leftTabs/prod/productTab.vue';

// 列表
const getList = (params) => {
  return GRequest(`/base-web/CMProductTemplateAct/selectTemplateList4Design.act`, METHOD.GET, params.value);
};
</script>
