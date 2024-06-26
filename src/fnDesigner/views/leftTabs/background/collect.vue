<template>
  <imageTab ref="imageTabRef" :api="getList" @success="EmitSuccess" :isNeedHeader="false" :isNeedFooter="false" />
</template>

<script setup>
import imageTab from '@/fnDesigner/components/imageTab/imageTab.vue';
import { GRequest, METHOD } from '@/utils/request';
import { ref, watch } from 'vue';
import { designStoreToRefs } from '@/designClass/store';
const $app = designStoreToRefs();
const imageTabRef = ref(null);
watch(
  () => $app.value.backgroundCollectUuid,
  () => {
    imageTabRef.value.getList();
  },
);

function getList() {
  return GRequest(`/base-web/CMDesignImageQuickAct/queryQuickImageList.act`, METHOD.GET);
}

const EmitSuccess = (list) => {
  $app.value.backgroundCollectList = list;
};
</script>
