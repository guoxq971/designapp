<template>
  <imageTab :api="getList" :isNeedAccountList="false" :isNeedUpload="false" isNeedCategory />
</template>

<script setup>
import imageTab from '@/fnDesigner/components/imageTab/imageTab.vue';
import { GRequest, METHOD } from '@/utils/request';
import { encodeUrl } from '@/fnDesigner/js/common';

function getList(params) {
  return GRequest(`/base-web/CMDesignImageAct/getPlatformDesignImageList.act${encodeUrl(params)}`, METHOD.GET, '', { timeout: 60 * 1000 });
}
</script>
