<template>
  <div v-loading="$app.loading" class="app-center-container">
    <!--查看详情-->
    <lookDetailDialog ref="lookDetailDialogRef" />

    <div class="app-center-box" :style="canvasStyle">
      <template v-if="$app.activeTemplate">
        <!--模板名称-->
        <div class="title-wrap-container">
          <div class="title-card-container">
            <!--标题-->
            {{ $app.activeTemplate.detail.name }}
            <!--查看详情-->
            <el-button class="detail-btn" type="text" @click="onLookDetail">查看详情 ></el-button>
            <!--psd-->
            <recommendParam :detail="$app.activeTemplate.detail" :visibleRecommend="$app.RecommendVisible" />
          </div>
        </div>
        <!--定制模板标题-->
        <!--        <div class="custom-title" v-if="isCustomTemplate">-->
        <!--          <div class="text" v-title="customTemplateParam.customName">使用中：(定制模板){{ customTemplateParam.customName }}</div>-->
        <!--        </div>-->
        <!--价格-->
        <priceCard />
        <!--颜色-->
        <colorCard />
        <!--尺码-->
        <sizeCard />
        <!--画布-->
        <canvasCard />
      </template>
    </div>
  </div>
</template>

<script setup>
import lookDetailDialog from './components/lookDetailDialog';
import priceCard from './components/price/priceCard.vue';
import colorCard from './components/colorCard.vue';
import sizeCard from './components/sizeCard.vue';
import canvasCard from './components/canvas';
import { CANVAS_SIZE_UNIT } from '@/fnDesigner/config/common';
import { ref } from 'vue';
import { designStoreToRefs } from '@/designClass/store';
import RecommendParam from '@/fnDesigner/views/appCenter/components/recommendParam.vue';

const canvasStyle = ref({ width: CANVAS_SIZE_UNIT });
const $app = designStoreToRefs();

const lookDetailDialogRef = ref(null);
function onLookDetail() {
  let data = {
    seqId: $app.value.activeTemplate.detail.seqId,
    title: $app.value.activeTemplate.detail.name,
  };
  lookDetailDialogRef.value.init({ type: 'detail', data });
}
</script>

<style scoped lang="less">
.app-center-container {
  width: 100%;
  display: flex;
  justify-content: center;
  .app-center-box {
    display: flex;
    flex-direction: column;
  }

  // 标题
  .title-wrap-container {
    display: flex;
    justify-content: center;
    position: relative;
    .title-card-container {
      text-align: center;
      display: flex;
      justify-content: center;
      font-weight: bold;
      font-size: 2rem;
    }
  }
}
.detail-btn {
  padding: 0;
  height: 2.6rem;
  margin-left: 0.8rem;
}
</style>
