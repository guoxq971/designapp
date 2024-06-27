<template>
  <el-collapse-transition>
    <div v-if="imageList && imageList.length">
      <!--图层编辑-->
      <imageEditDialog v-if="imageEdit.show" :show.sync="imageEdit.show" :seqId="imageEdit.seqId" />

      <div class="design-group" style="overflow: auto;">
        <div class="design-wrap" v-for="(item, index) in imageList" :key="index" :class="{ active: isActive(item), 'design-disabled': isFixedDesign(item) }">
          <div class="wrap">
            <!--设计图-->
            <div v-if="[DESIGN_TYPE.image, DESIGN_TYPE.backgroundImage].includes(item.attrs.type)" class="design-bd" @click="onSetActiveImage(item)">
              <div class="design">
                <el-image :src="item.attrs.detail.designImg" style="width: 100%; height: 100%" />
              </div>
              <div class="title">
                <div class="title-text">{{ item.attrs.detail.name }}</div>
              </div>
            </div>

            <!--背景色-->
            <template v-if="item.attrs.type === DESIGN_TYPE.backgroundColor">
              <div class="design">
                <div style="width: 100%; height: 100%" :style="{ backgroundColor: item.attrs.fill }" />
              </div>
              <div class="title">
                <div class="title-text">
                  {{ item.attrs.$design.colorCode }}
                </div>
              </div>
            </template>

            <!--文字-->
            <div v-if="item.attrs.type === DESIGN_TYPE.text" class="design-bd" @click="onSetActiveImage(item)">
              <div class="design">
                <textSvg />
              </div>
              <div class="title">
                <div class="title-text">
                  {{ item.attrs.text }}
                </div>
              </div>
            </div>
          </div>

          <div class="handle">
            <!--设计图-->
            <template v-if="item.attrs.type === DESIGN_TYPE.image">
              <!--图层-编辑-->
              <div class="layer-btn" v-title="'图层-编辑'" @click="onEdit(item)">
                <editSvg />
              </div>
              <!--图层-收藏-->
              <div :class="{ 'layer-btn-active': isCollect(item) }" class="layer-btn" v-title="'图层-收藏'" @click="onImageCollect(item)">
                <collectSvg />
              </div>
            </template>

            <!--设计图,文字-->
            <template v-if="!isFixedDesign(item) && [DESIGN_TYPE.image, DESIGN_TYPE.text].includes(item.attrs.type) && !(item.attrs.detail && item.attrs.detail.isBg)">
              <!--图层-上移-->
              <div class="layer-btn" v-title="'图层-上移'" @click="onLayerUp(item)">
                <upSvg />
              </div>
              <!--图层-下移-->
              <div class="layer-btn" v-title="'图层-下移'" @click="onLayerDown(item)">
                <downSvg />
              </div>
            </template>

            <!--图层-删除-->
            <div v-if="!isFixedDesign(item)" class="layer-btn" v-title="'图层-删除'" @click="onLayerDel(item)">
              <deleteSvg />
            </div>
            <!--图层-显示隐藏-->
            <div class="layer-btn" v-title="'图层显示隐藏'" @click="onLayerVisible(item)" :key="testUid">
              <showSvg v-show="item.attrs.visible" />
              <hideSvg v-show="!item.attrs.visible" />
            </div>

            <!--锁定-->
            <div class="layer-btn-2" v-if="isFixedDesign(item)" v-title="'【定制模板】该图层处于锁定状态，不可调整'">
              <bindLook style="font-size: 2.0rem;color: red;" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-collapse-transition>
</template>

<script>
import title from '@/fnDesigner/directives/title/title';
export default {
  directives: { title },
};
</script>
<script setup>
import imageEditDialog from '@/fnDesigner/components/imageEditDialog.vue';
import collectSvg from '@/fnDesigner/components/svg/collectSvg.vue';
import deleteSvg from '@/fnDesigner/components/svg/deleteSvg.vue';
import upSvg from '@/fnDesigner/components/svg/upSvg.vue';
import downSvg from '@/fnDesigner/components/svg/downSvg.vue';
import showSvg from '@/fnDesigner/components/svg/showSvg.vue';
import hideSvg from '@/fnDesigner/components/svg/hideSvg.vue';
import editSvg from '@/fnDesigner/components/svg/editSvg.vue';
import { computed, ref } from 'vue';
import textSvg from '@/fnDesigner/components/textSvg.vue';

import { designStoreToRefs } from '@/designClass/store';
import { DESIGN_TYPE } from '@/designClass/core/define';
import { getUuid } from '@/utils/fnUtils';
const $app = designStoreToRefs();

const imageList = computed(() => $app.value.activeCanvasDesignList);

// 是否激活
const isActive = computed(() => (item) => $app.value.activeView?.canvas.transformer.node() === item);
// 是否锁定
const isFixedDesign = computed(() => (item) => item.attrs.fixed === 1);
// 是否收藏
const isCollect = computed(() => (item) => {
  if (
    [
      //
      DESIGN_TYPE.image,
      DESIGN_TYPE.backgroundImage,
    ].includes(item.attrs?.type)
  ) {
    return $app.value.isCollectImage(item.attrs.detail);
  }
  return false;
});

// 设置当前激活设计
function onSetActiveImage(item) {
  $app.value.setModeEdit(true);
  // $app.value.activeView.setActiveDesign(item);
  item.attrs.$design.active();
}

//编辑
const imageEdit = ref({
  show: false,
  seqId: '',
});
function onEdit(item) {
  imageEdit.value.show = true;
  imageEdit.value.seqId = item.attrs.detail.id;
}

// 收藏
function onImageCollect(item) {
  $app.value.collectImage(item.attrs.detail);
}

// 图层上移
function onLayerUp(item) {
  item.attrs.$design.moveUp();
}
// 图层下移
function onLayerDown(item) {
  item.attrs.$design.moveDown();
}
// 图层删除
function onLayerDel(item) {
  item.attrs.$design.remove();
}
// 图层显示隐藏
const testUid = ref('1');
function onLayerVisible(item) {
  item.attrs.$design.visible();
  testUid.value = getUuid();
}
</script>

<style scoped lang="less">
@designWidth: 3.4rem; // 设计图宽度
@designHeight: 3.4rem; // 设计图高度
@designPadding: 0.5rem; // 行内边距
@designMarginBottom: 0.4rem; // 行下间距
@borderWidth: 0.1rem; // 边框宽度
@num: 3.5; // 展示的数量
// 设计图列表
.design-group {
  background: #fff;
  padding: 0.8rem;
  width: 100%;
  border: 0.1rem solid #eee;
  max-height: calc((@designHeight + @designPadding * 2 + @borderWidth * 2 + @designMarginBottom) * @num);

  //overflow-y: auto;

  .active {
    border-color: var(--fn-primary-color) !important;
  }

  .design-disabled {
    background: #f2f2f2 !important;
  }

  .design-wrap {
    width: 100%;
    height: calc(@designHeight + @designPadding * 2 + @borderWidth * 2);
    display: flex;
    padding: @designPadding;
    border: @borderWidth solid #eee;
    border-radius: 0.4rem;
    margin-bottom: @designMarginBottom;
    &:last-child {
      margin-bottom: 0;
    }

    .wrap {
      display: flex;
      cursor: pointer;
    }
    .design-bd {
      width: fit-content;
      display: flex;
    }
    .design {
      width: @designWidth;
      height: @designHeight;
      //background-color: red;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.12), 0 0 0.6rem rgba(0, 0, 0, 0.04);
    }
    .title {
      height: @designHeight;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1rem;
      margin-left: 0.4rem;
      margin-right: 0.4rem;
      box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.12), 0 0 0.6rem rgba(0, 0, 0, 0.04);
      //background-color: green;

      .title-text {
        width: 8rem;
        word-wrap: break-word;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .handle {
      flex: 1;
      //background-color: pink;
      display: flex;
      user-select: none;
      justify-content: flex-end;

      .layer-btn {
        cursor: pointer;
        width: @designWidth;
        height: @designHeight;
        border: 0.1rem solid transparent;
        border-radius: 0.3rem;
        display: flex;
        justify-content: center;
        align-items: center;
        > svg {
          color: #7e7e7e;
        }
        &:hover {
          border-color: var(--fn-primary-color);
          > svg {
            color: var(--fn-primary-color);
          }
        }
        img {
          width: 100%;
          height: 100%;
        }
      }

      .layer-btn-active {
        > svg {
          color: var(--fn-primary-color);
        }
      }

      .layer-btn-2 {
        width: @designWidth;
        height: @designHeight;
        border: 0.1rem solid transparent;
        border-radius: 0.3rem;
        display: flex;
        justify-content: center;
        align-items: center;

        img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>
