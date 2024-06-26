<template>
  <div v-loading="$app.loading" class="app-center-container">
    <div class="app-center-box" :style="canvasStyle">
      <template v-if="$app.activeTemplate">
        <!--模板名称-->
        <div class="title-wrap-container">
          <div class="title-card-container">{{ $app.activeTemplate.detail.name }}</div>
        </div>
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
import priceCard from './components/price/priceCard.vue';
import colorCard from './components/colorCard.vue';
import sizeCard from './components/sizeCard.vue';
import canvasCard from './components/canvas';
import { CANVAS_SIZE_UNIT } from '@/fnDesigner/config/common';
import { ref } from 'vue';
import { designStoreToRefs } from '@/designClass/store';

const canvasStyle = ref({ width: CANVAS_SIZE_UNIT });
const $app = designStoreToRefs();
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
</style>
