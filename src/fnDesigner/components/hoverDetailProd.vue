<!--鼠标经过的浮框 - 产品-->
<template>
  <el-card class="hover-container" v-if="detail">
    <!--图片-->
    <div class="image-wrap">
      <div class="num">{{ detail.views.length }}面定制</div>
      <template v-if="detail.templateImages && detail.templateImages.length">
        <img class="image" :src="c_src" alt="" />
      </template>
      <template v-else>
        <imgTrack :url1="getShowImage(detail).image" :url2="getShowImage(detail).texture" />
        <!--        <img class="image" :src="detail.showImage.thumbImg" alt="" />-->
        <!--        <img class="image" :src="detail.showImage.texture" alt="" />-->
      </template>
    </div>

    <!--标题 - 副标题-->
    <div class="title">{{ detail.templateName }}</div>
    <div class="title-2">(编号:{{ detail.templateNo }}, 型号:{{ detail.templateModel }})</div>

    <!--颜色-->
    <div class="model-info-color">
      <div class="model-info-color-item" v-for="item in colorList" :key="item.id">
        <div :style="{ backgroundColor: item.colorCode }"></div>
      </div>
    </div>

    <!--尺码-->
    <div class="model-info-color">
      <div class="model-info-color-size" v-for="item in sizeList" :key="item.id">
        {{ item.name }}
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue';
import { getColorList, getShowImage, getSizeList } from '@/fnDesigner/js/getProductInfoHelp';
import imgTrack from '@/fnDesigner/components/imgTrack';
import { designStoreToRefs } from '@/designClass/store';
const da = designStoreToRefs();

const detail = computed(() => {
  return da.value.hoverTemplateDetail;
});
const c_src = computed(() => {
  if (!detail.value) return;
  // console.log('判断是否需要拼接前缀地址', this.src, this.src.indexOf('http'), this.basePathImg);
  // 判断是否需要拼接前缀地址
  if (detail.value.templateImages && detail.value.templateImages.length === 0) return '';
  if (detail.value.templateImages[0] && detail.value.templateImages[0].indexOf('http') === -1) {
    return process.env.VUE_APP_API_BASE_IMG_URL + detail.value.templateImages[0];
  }
  return detail.value.templateImages[0];
});
const colorList = computed(() => {
  return getColorList(detail.value);
});
const sizeList = computed(() => {
  return getSizeList(detail.value);
});
</script>

<style scoped lang="less">
.hover-container {
  position: absolute;
  z-index: 7;
  top: 10.4rem;
  right: -27.7rem;
  width: 26.5rem;

  :deep(.el-card__body) {
    padding: 0.7rem;
  }

  .title {
    font-size: 1.3rem;
    font-weight: bold;
    margin: 0.8rem 0;
    //letter-spacing: 0.4rem;
  }

  .title-2 {
    color: #c0c4cc;
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
    //letter-spacing: 0.4rem;
  }

  .image-wrap {
    position: relative;
    width: 100%;
    height: 24.5rem;
    background-color: #f5f7fa;
    border-radius: 0.4rem;
    overflow: hidden;
    .image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .num {
      position: absolute;
      z-index: 2;
      right: 0.4rem;
      bottom: 0.2rem;
      padding: 0.1rem;
      border: 0.1rem solid #66b1ff;
      border-radius: 0.4rem;
      background-color: #66b1ff;
      color: #fff;
    }
  }
}

// 颜色 and 尺码
.model-info-color {
  display: flex;
  max-width: 43rem;
  flex-wrap: wrap;

  .model-info-color-item {
    width: 1.9rem;
    border: #d6d2d2 solid 0.1rem;
    border-radius: 0.4rem;
    height: 1.9rem;
    margin-right: 0.4rem;
    margin-bottom: 0.8rem;
    display: flex;
    justify-content: center;
    align-items: center;

    & div {
      width: 1.3rem;
      height: 1.3rem;
      border-radius: 0.3rem;
    }
  }

  .model-info-color-size {
    border: 0.1rem solid #ccc;
    padding: 0 0.3rem;
    margin-right: 0.4rem;
    border-radius: 0.4rem;
    background-color: #fff;
    margin-bottom: 0.8rem;
    //margin-bottom: .5rem;
    font-size: 1.3rem;
  }
}
</style>
