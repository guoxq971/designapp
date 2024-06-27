<!--位置和变换-->
<template>
  <transition name="el-fade-in-linear">
    <div class="position-wrap" v-dragPop="{ top: 99, left: 1244 }">
      <!--头部-->
      <div class="header" slot="header">
        <div>位置和变换</div>
        <div @click="onClose" class="close el-icon-close"></div>
      </div>

      <!--列表-->
      <div class="body" @mousedown.stop>
        <div class="position-map">
          <div style="display: flex">
            <mapChunk @click.native="handlerAlign('topLeft')" v-title="'左上角对齐'" :conf-area="chunkObj.topLeft" :conf-radius="chunkRadiusObj.a11" />
            <mapChunk @click.native="handlerAlign('topCenter')" :conf-area="chunkObj.topCenter" v-title="'上对齐'" />
            <mapChunk @click.native="handlerAlign('topRight')" v-title="'右上角对齐'" :conf-area="chunkObj.topRight" :conf-radius="chunkRadiusObj.a13" />
          </div>
          <div style="display: flex">
            <mapChunk @click.native="handlerAlign('centerLeft')" :conf-area="chunkObj.centerLeft" v-title="'左对齐'" />
            <mapChunk @click.native="handlerAlign('centerCenter')" :conf-area="chunkObj.centerCenter" v-title="'居中对齐'" />
            <mapChunk @click.native="handlerAlign('centerRight')" :conf-area="chunkObj.centerRight" v-title="'右对齐'" />
          </div>
          <div style="display: flex">
            <mapChunk @click.native="handlerAlign('bottomLeft')" :conf-area="chunkObj.bottomLeft" :conf-radius="chunkRadiusObj.a31" v-title="'左下角对齐'" />
            <mapChunk @click.native="handlerAlign('bottomCenter')" :conf-area="chunkObj.bottomCenter" v-title="'下对齐'" />
            <mapChunk @click.native="handlerAlign('bottomRight')" :conf-area="chunkObj.bottomRight" :conf-radius="chunkRadiusObj.a33" v-title="'右下角对齐'" />
          </div>
        </div>
      </div>

      <!--分页-->
      <div class="footer" @mousedown.stop>
        <el-input class="input" v-model="param.x" @blur="onPosition" @keyup.enter.native="onPosition">
          <div slot="suffix">X</div>
        </el-input>
        <el-input class="input" v-model="param.y" @blur="onPosition" @keyup.enter.native="onPosition">
          <div slot="suffix">Y</div>
        </el-input>
        <el-input class="input" v-model="param.width" @blur="onSize($event, 'width')" @keyup.enter.native="onSize($event, 'width')">
          <div slot="suffix">W</div>
        </el-input>
        <el-input class="input" v-model="param.height" @blur="onSize($event, 'height')" @keyup.enter.native="onSize($event, 'height')">
          <div slot="suffix">H</div>
        </el-input>
      </div>
    </div>
  </transition>
</template>

<script>
import dragPop from '@/fnDesigner/directives/drag/drag';
import title from '@/fnDesigner/directives/title/title';
export default {
  directives: { dragPop, title },
};
</script>
<script setup>
import lodash from 'lodash';
import mapChunk from './positionChunk.vue';
import { computed, ref, watch } from 'vue';
import { chunkObj, chunkRadiusObj } from './position.js';
import { designStoreToRefs } from '@/designClass/store';
import { DESIGN_TYPE } from '@/designClass/core/define';
import { getScaleMax } from '@/designClass/util/view/viewUtil';
const $app = designStoreToRefs();
/**
 * 关闭弹窗
 */
function onClose() {
  $app.value.positionPopVisible = false;
}
const param = ref({
  width: '',
  height: '',
  x: '',
  y: '',
});
const activeImage = computed(() => {
  const view = $app.value.activeView;
  if (!view) return;
  const design = view.activeDesign;
  if (!design) return;
  if (design?.type === DESIGN_TYPE.backgroundImage) return;
  const width = Math.abs(design.node.attrs.width * design.node.attrs.scaleX);
  const height = Math.abs(design.node.attrs.height * design.node.attrs.scaleY);
  return {
    watchImageUuid: design?.watchImageUuid,
    width: width,
    height: height,
    x: design.node.attrs.x - width / 2,
    y: design.node.attrs.y - height / 2,
    rotation: design.node.attrs.rotation,
    design: design,
  };
});
watch(
  [
    //
    () => activeImage.value,
  ],
  lodash.debounce((val) => {
    const result = val[0];
    if (!result) {
      param.value.width = '';
      param.value.height = '';
      param.value.x = '';
      param.value.y = '';
    } else {
      param.value.width = result.width.toFixed(2);
      param.value.height = result.height.toFixed(2);
      param.value.x = result.x.toFixed(2);
      param.value.y = result.y.toFixed(2);
    }
  }, 80),
);

/**
 * 手动输入尺寸
 * @param e
 * @param {string} type 尺寸类型 width | height
 */
async function onSize(e, type) {
  await $app.value.isActiveDesignMsg();
  if (!activeImage.value) return;
  const view = $app.value.activeView;
  const result = activeImage.value;

  const org = result.design.node.attrs[type]; // 原始尺寸
  const val = +param.value[type]; // 输入尺寸
  let scale = val / org; // 缩放比例

  // 获取最大缩放比例
  let readSize;
  let orgSize;
  const print = view.getInfo();
  if (result.design.type === DESIGN_TYPE.image) {
    readSize = result.design.node.attrs.inch;
    orgSize = { width: result.design.node.attrs.width, height: result.design.node.attrs.height };
  }
  if (readSize && orgSize) {
    const maxScale = getScaleMax(type, result.design.node.attrs.inch, print, orgSize);
    scale = Math.min(scale, maxScale.scaleX);
  }
  result.design.node.setAttrs({
    scaleX: scale,
    scaleY: scale,
  });
  activeImage.value.design?.updateMesh();
  activeImage.value.design?.updateWatch();
}
/**
 * 手动输入位置
 */
async function onPosition() {
  await $app.value.isActiveDesignMsg();
  if (!activeImage.value) return;
  const curImage = activeImage.value.design.node.attrs;
  const scaleX = Math.abs(curImage.scaleX);
  const scaleY = Math.abs(curImage.scaleY);
  const imageWidth = curImage.width * scaleX;
  const imageHeight = curImage.height * scaleY;

  let x;
  let y;
  x = +param.value.x + imageWidth / 2;
  y = +param.value.y + imageHeight / 2;

  activeImage.value.design.node.setAttrs({
    x: x,
    y: y,
  });
  activeImage.value.design?.updateMesh();
  activeImage.value.design?.updateWatch();
}
/**
 * 对齐函数
 * @param {string} type 对齐类型
 * */
async function handlerAlign(type) {
  await $app.value.isActiveDesignMsg();
  if (!activeImage.value) return;
  const view = $app.value.activeView;

  const print = view.getInfo().print;
  const prodWidth = print.width;
  const prodHeight = print.height;
  const curImage = activeImage.value.design.node.attrs;
  const scaleX = Math.abs(curImage.scaleX);
  const scaleY = Math.abs(curImage.scaleY);
  const imageWidth = curImage.width * scaleX;
  const imageHeight = curImage.height * scaleY;
  const imageOffsetX = imageWidth / 2;
  const imageOffsetY = imageHeight / 2;

  const result = {
    leftTopX: 0 + imageOffsetX,
    leftTopY: 0 + imageOffsetY,
    topCenterX: prodWidth / 2 - imageWidth / 2 + imageOffsetX,
    topCenterY: 0 + imageOffsetY,
    rightTopX: prodWidth - imageWidth + imageOffsetX,
    rightTopY: 0 + imageOffsetY,
    leftCenterX: 0 + imageOffsetX,
    leftCenterY: prodHeight / 2 - imageHeight / 2 + imageOffsetY,
    x: prodWidth / 2 - imageWidth / 2 + imageOffsetX,
    y: prodHeight / 2 - imageHeight / 2 + imageOffsetY,
    rightCenterX: prodWidth - imageWidth + imageOffsetX,
    rightCenterY: prodHeight / 2 - imageHeight / 2 + imageOffsetY,
    leftBottomX: 0 + imageOffsetX,
    leftBottomY: prodHeight - imageHeight + imageOffsetY,
    bottomCenterX: prodWidth / 2 - imageWidth / 2 + imageOffsetX,
    bottomCenterY: prodHeight - imageHeight + imageOffsetY,
    rightBottomX: prodWidth - imageWidth + imageOffsetX,
    rightBottomY: prodHeight - imageHeight + imageOffsetY,
  };
  let move = { x: 0, y: 0 };
  switch (type) {
    case 'topLeft':
      move.x = result.leftTopX;
      move.y = result.leftTopY;
      break;
    case 'topCenter':
      move.x = result.topCenterX;
      move.y = result.topCenterY;
      break;
    case 'topRight':
      move.x = result.rightTopX;
      move.y = result.rightTopY;
      break;
    case 'centerLeft':
      move.x = result.leftCenterX;
      move.y = result.leftCenterY;
      break;
    case 'centerCenter':
      move.x = result.x;
      move.y = result.y;
      break;
    case 'centerRight':
      move.x = result.rightCenterX;
      move.y = result.rightCenterY;
      break;
    case 'bottomLeft':
      move.x = result.leftBottomX;
      move.y = result.leftBottomY;
      break;
    case 'bottomCenter':
      move.x = result.bottomCenterX;
      move.y = result.bottomCenterY;
      break;
    case 'bottomRight':
      move.x = result.rightBottomX;
      move.y = result.rightBottomY;
      break;
    default:
      console.error('对齐函数的type错误 alignFn type error');
      break;
  }

  move.x = lodash.round(move.x, 0);
  move.y = lodash.round(move.y, 0);

  activeImage.value.design.node.setAttrs({
    x: move.x,
    y: move.y,
  });
  activeImage.value.design?.updateMesh();
  activeImage.value.design?.updateWatch();
}
</script>

<style scoped lang="less">
.position-wrap {
  width: 28rem;
  position: absolute;
  z-index: 10;
  background-color: #fff;
  padding: 0 0.5rem;
  border-radius: 0.5rem;

  :deep(.el-card__header) {
    padding: 0;
  }

  .header {
    padding: 0.7rem 0.8rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.3rem;
    font-weight: bold;
    cursor: default;

    .close {
      cursor: pointer;
      font-size: 1.8rem;
      font-weight: bold;

      &:hover {
        color: var(--fn-primary-color);
      }
    }
  }

  .body {
    margin-top: 0.2rem;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
  }

  .footer {
    margin-top: 0.8rem;
    margin-bottom: 0.5rem;

    .input {
      width: 12rem;
      margin-right: 1rem;
      margin-bottom: 1rem;

      :deep(.el-input__suffix) {
        user-select: none;
        font-size: 1.4rem;
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>
