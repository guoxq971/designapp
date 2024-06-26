<template>
  <div class="left-container">
    <div class="head-tabs">
      <el-button v-for="item in tabs" :key="item.value" class="btn" @click="(evt) => onClick(item, evt)" :type="isActive(item.value)">
        <div class="center">
          <iconpark-icon :name="item.icon" size="20" />
          <div class="text">{{ item.label }}</div>
        </div>
      </el-button>
    </div>

    <!--tabs-->
    <div class="body-tabs">
      <prodTabs v-show="active === TABS_TYPE_PROD" />
      <imageTabs v-show="active === TABS_TYPE_IMAGE" />
      <backgroundTabs v-show="active === TABS_TYPE_BACKGROUND" />
      <textTabs v-show="active === TABS_TYPE_TEXT" />
    </div>

    <!--hover 详情-->
    <transition name="el-fade-in-linear">
      <hoverDetailProd v-if="da.hoverTemplateDetail" @mouseleave.native="mouseleave" @mouseenter.native="mouseenter" />
    </transition>

    <!--hover 详情-->
    <hoverDetailImage v-if="da.hoverImageDetail" @mouseleave.native="mouseleave" @mouseenter.native="mouseenter" />
  </div>
</template>

<script setup>
import { buttonBlur } from '@/fnDesigner/js/common';
import prodTabs from './prod/tabs.vue';
import imageTabs from './image/tabs.vue';
import backgroundTabs from './background/tabs.vue';
import textTabs from './text/tabs.vue';
import { ref, computed } from 'vue';
import { LEFT_WIDTH_UNIT } from '@/fnDesigner/config/common';
import HoverDetailProd from '@/fnDesigner/components/hoverDetailProd.vue';
import HoverDetailImage from '@/fnDesigner/components/hoverDetailImage.vue';
import { designStoreToRefs } from '@/designClass/store';
const da = designStoreToRefs();
const leftWidth = ref(LEFT_WIDTH_UNIT);

// 鼠标进入
function mouseenter() {
  clearTimeout(da.value.hoverTimer);
}
// 鼠标离开
function mouseleave() {
  da.value.hoverTimer = setTimeout(() => {
    da.value.hoverTemplateDetail = null;
    da.value.hoverImageDetail = null;
  }, 300);
}

// tabs
const TABS_TYPE_PROD = 'prod';
const TABS_TYPE_IMAGE = 'image';
const TABS_TYPE_BACKGROUND = 'background';
const TABS_TYPE_TEXT = 'text';
const tabs = [
  { sort: 1, value: TABS_TYPE_PROD, label: '选择产品', icon: 'theme' },
  { sort: 2, value: TABS_TYPE_IMAGE, label: '选择图片', icon: 'pic' },
  { sort: 3, value: TABS_TYPE_BACKGROUND, label: '选择背景', icon: 'background-color' },
  { sort: 4, value: TABS_TYPE_TEXT, label: '添加文字', icon: 'add-text' },
];

const active = ref(tabs[0].value);
const isActive = computed(() => {
  return (type) => {
    return active.value === type ? 'primary' : '';
  };
});

// 点击
function onClick(item, evt) {
  buttonBlur(evt);
  active.value = item.value;
}
</script>

<style scoped lang="less">
.left-container {
  max-width: v-bind(leftWidth);
  width: v-bind(leftWidth);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  .head-tabs {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.8rem;
    .btn {
      width: 24%;
      height: 4.4rem;
      margin-left: 0;
      font-size: 1.3rem;
      border-radius: 0.5rem;
      padding: 0.2rem 0.6rem !important;
      transition: all 0.3s;

      .center {
        display: flex;
        justify-content: center;
        align-items: center;

        .text {
          margin-left: 0.3rem;
          margin-top: 0.2rem;
        }
      }
    }
  }

  .body-tabs {
    flex: 1;
    :deep(.el-tabs) {
      background-color: #fff;
      height: 100%;
      display: flex;
      flex-direction: column;
      .el-tabs__content {
        flex: 1;
        .el-tab-pane {
          height: 100%;
        }
      }
    }
  }
}
</style>
