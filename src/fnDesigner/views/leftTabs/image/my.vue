<template>
  <imageTab :api="getList" />
</template>

<script setup>
import imageTab from '@/fnDesigner/components/imageTab/imageTab.vue';
import { GRequest, METHOD } from '@/utils/request';
import { encodeUrl } from '@/fnDesigner/js/common';

function getList(param) {
  return GRequest(`/base-web/CMDesignImageAct/getDesignImageList.act${encodeUrl(param)}`, METHOD.GET, '', { timeout: 60 * 1000 });
}
</script>
