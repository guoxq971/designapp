<template>
  <div style="position: relative">
    <!--渲染按钮-->
    <el-button v-if="$app.activeTemplate" style="position: absolute; top: .5rem; left: .5rem; z-index: 3;" type="primary" size="mini" @click="onRender" :loading="$app.loadingMulti">渲染</el-button>
    <el-carousel style="width: 100%" :interval="50000" :autoplay="false" :loop="false" arrow="always" ref="carousel" indicator-position="outside">
      <template v-if="$app.activeTemplate">
        <el-carousel-item v-for="item in $app.activeTemplate.multiList" :key="item.id" @click.native="onClick(item)">
          <!--glb模型-->
          <div v-if="item.glb" v-loading="item.templateCamera3d.loading">
            <glbItem isNotMask cursorZoomIn typeName="模型" :image="item.bgImg" :texture="item.prodImg" :width="multiBoxHeight" :height="multiBoxHeight">
              <div :id="item.glbContainerId" class="fn-full" />
            </glbItem>
          </div>
          <template v-else>
            <!--简单多角度-->
            <template v-if="!item.composeId">
              <multiAngleFold cursorZoomIn typeName="简单" :image="item.bgImg" :mask="item.designImg" :texture="item.prodImg" :width="multiBoxHeight" :height="multiBoxHeight" />
            </template>
            <!--复杂多角度-->
            <template v-else>
              <multiAngleFold cursorZoomIn typeName="复杂" :image="item.bgImg" :mask="item.designImg" :texture="item.prodImg" :width="multiBoxHeight" :height="multiBoxHeight" />
            </template>
          </template>
        </el-carousel-item>
      </template>
    </el-carousel>
  </div>
</template>

<script setup>
import { RIGHT_WIDTH_UNIT } from '@/fnDesigner/config/common';
import glbItem from './glbItem.vue';
import { computed } from 'vue';
import { complexMultiDispose, findMultiDesignImg } from '@/fnDesigner/js/multi';
import multiAngleFold from './multiAngleFold.vue';
import { ref } from 'vue';
import { designStoreToRefs } from '@/designClass/store';

const multiBoxPadding = '.8rem';
const multiBoxHeight = ref(`calc(${RIGHT_WIDTH_UNIT} - ${multiBoxPadding})`);

const $app = designStoreToRefs();
// 渲染
function onRender() {
  $app.value.activeTemplate.onRender();
}

function onClick(item) {}
</script>

<style scoped lang="less">
/*多角度-start*/
@padding: v-bind(multiBoxPadding);
:deep(.el-carousel) {
  background: #fff;
  padding: @padding @padding 0 @padding;
  border: 0.1rem solid #ebeef5;
}
:deep(.el-carousel__indicators--outside) {
  button {
    background-color: var(--fn-primary-color);
  }
}
:deep(.el-carousel__button) {
  height: 0.4rem;
}

:deep(.el-carousel__container) {
  height: v-bind(multiBoxHeight);
}

:deep(.el-carousel__item) {
  display: flex;
  justify-content: center;
  align-items: center;
}

// 多角度-左右切换按钮
:deep(.el-carousel__arrow) {
  background-color: #1f2d3d7d;
}

/*多角度-end*/
</style>
