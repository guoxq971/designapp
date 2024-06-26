<template>
  <imageTab :api="getList" :isNeedAccountList="false" :isNeedUpload="false" />
</template>

<script setup>
import imageTab from '@/fnDesigner/components/imageTab/imageTab.vue';
import { GRequest, METHOD } from '@/utils/request';
import { encodeUrl } from '@/fnDesigner/js/common';

function getList(param) {
  return GRequest(`/base-web/CMDesignImageAct/getBgDesignsList.act${encodeUrl(param)}`, METHOD.GET);
}
</script>
