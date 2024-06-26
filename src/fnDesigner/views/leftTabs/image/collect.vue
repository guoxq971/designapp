<template>
  <imageTab ref="imageTabRef" :api="getList" @success="EmitSuccess" :isNeedHeader="false" :isNeedFooter="false" />
</template>

<script setup>
import imageTab from '@/fnDesigner/components/imageTab/imageTab.vue';
import { GRequest, METHOD } from '@/utils/request';
import { ref, watch } from 'vue';
import { designStoreToRefs } from '@/designClass/store';
const da = designStoreToRefs();
const imageTabRef = ref(null);

watch(
  () => da.value.imageCollectUuid,
  () => {
    imageTabRef.value.getList();
  },
);

function getList() {
  return GRequest(`/base-web/CMDesignImageQuickAct/queryQuickImageListSJ.act`, METHOD.GET, '', { timeout: 60 * 1000 });
}

const EmitSuccess = (list) => {
  da.value.imageCollectList = list;
};
</script>
