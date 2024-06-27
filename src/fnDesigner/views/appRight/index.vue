<template>
  <div class="app-right-container">
    <!--收藏-浮动弹窗-->
    <collectPop v-show="$app.collectPopVisible" />
    <!--其他设置-浮动弹窗-->
    <otherPop v-show="$app.otherSettingVisible" />
    <!--定位-浮动弹窗-->
    <positionPop v-show="$app.positionPopVisible" />
    <!--历史记录-浮动弹窗-->
    <historyPop v-show="$app.historyVisible" />

    <div class="btn-group fn-mb-gap-min big-group">
      <!--说明-->
      <el-popover placement="left-start" width="26.7rem" trigger="hover" :visible-arrow="false" popper-class="remark-pop">
        <hoverDesignDetail />
        <div class="btn" slot="reference">
          <remarkSvg />
        </div>
      </el-popover>
      <!--设置-->
      <el-dropdown placement="bottom">
        <div class="btn multi">
          <corner />
          <settingSvg />
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>快捷键</el-dropdown-item>
          <el-dropdown-item @click.native="onOtherSetting">其他设置</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <div class="btn">
        <historySvg @click.native="onHistory" />
      </div>
      <div class="btn btn-big">保存模板</div>
      <el-popover placement="bottom" width="80" trigger="click" popper-class="pop-btn-group-save">
        <el-button @click="onSaveProduct(SUBMIT_TYPE_SAVE_NUM_BTN.save)" :loading="$app.saveLoading" class="btn btn-big primary">保存产品</el-button>
        <el-button @click="onSaveProduct(SUBMIT_TYPE_SAVE_NUM_BTN.color)" :loading="$app.saveLoading" :disabled="saveAllBtnDisabled" class="btn btn-big primary-2">全颜色合成</el-button>

        <!--@click="onSaveProduct(SUBMIT_TYPE_SAVE_NUM_BTN.save)"-->
        <el-button slot="reference" :loading="$app.saveLoading" class="btn btn-big primary">保存产品</el-button>
      </el-popover>
    </div>

    <div class="btn-group big-group">
      <!--后退-->
      <div class="btn btn-h-big">
        <prevSvg />
      </div>
      <!--前进-->
      <div class="btn btn-h-big">
        <nextSvg />
      </div>
      <!--清空-->
      <el-dropdown placement="bottom">
        <div class="btn btn-h-big multi" @click="onClearCur">
          <corner />
          <clearSvg />
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="onClearCur">当前设计面</el-dropdown-item>
          <el-dropdown-item @click.native="onClearAll">全部设计面</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <!--图层开关-->
      <div @click="onTriggerDesignList" class="btn btn-h-big btn-big" :class="{ active: $app.designListVisible }">{{ designListVisibleName }}</div>
      <!--收藏开关-->
      <div @click="onTriggerCollect" class="btn btn-h-big btn-big" :class="{ active: $app.collectPopVisible }">{{ collectVisibleName }}</div>
    </div>

    <!--设计图操作-->
    <div class="btn-group operation">
      <!--置顶-->
      <div @click="onTop" v-title="'置顶'" class="btn btn-h-big">
        <topSvg />
      </div>
      <!--置底-->
      <div @click="onBottom" v-title="'置底'" class="btn btn-h-big">
        <bottomSvg />
      </div>
      <!--上移-->
      <div @click="onUp" v-title="'上移'" class="btn btn-h-big">
        <upSvg />
      </div>
      <!--下移-->
      <div @click="onDown" v-title="'下移'" class="btn btn-h-big">
        <downSvg />
      </div>
      <!--复制-->
      <div @click="onCopy" v-title="'复制'" class="btn btn-h-big"><copySvg /></div>
      <!--删除-->
      <div @click="onRemove" v-title="'删除'" class="btn btn-h-big">
        <deleteSvg />
      </div>

      <!--水平居中-->
      <div @click="onCenterX" v-title="'水平居中'" class="btn btn-h-big"><centerXSvg /></div>
      <!--垂直居中-->
      <div @click="onCenterY" v-title="'垂直居中'" class="btn btn-h-big"><centerYSvg /></div>
      <!--水平翻转-->
      <div @click="onFlipX" v-title="'水平翻转'" class="btn btn-h-big"><flipXSvg /></div>
      <!--垂直翻转-->
      <div @click="onFlipY" v-title="'垂直翻转'" class="btn btn-h-big"><flipYSvg /></div>
      <!--放大-->
      <div @click="onScaleUp" v-title="'放大'" class="btn btn-h-big"><scaleUpSvg /></div>
      <!--缩小-->
      <div @click="onScaleDown" v-title="'缩小'" class="btn btn-h-big"><scaleDownSvg /></div>

      <!--左旋转45-->
      <div @click="onRotateUp" v-title="'左旋转45'" class="btn btn-h-big"><rotateSvg /></div>
      <!--右旋转45-->
      <div @click="onScRotateDown" v-title="'右旋转45'" class="btn btn-h-big"><rotateSvg /></div>
      <!--最大化-->
      <el-popover placement="bottom" trigger="hover" :visible-arrow="true" popper-class="pop-btn-group">
        <div class="btn-group">
          <div @click="onMax('max')" v-title="'最大化'" class="btn btn-h-big"><maxSvg /></div>
          <div @click="onMax('width')" v-title="'宽度最大化'" class="btn btn-h-big"><maxWidthSvg /></div>
          <div @click="onMax('height')" v-title="'高度最大化'" class="btn btn-h-big"><maxHeightSvg /></div>
        </div>
        <div slot="reference" @click="onMax('max')" v-title="'最大化'" class="btn btn-h-big multi">
          <corner />
          <maxSvg />
        </div>
      </el-popover>
      <!--平铺-->
      <hoverTile>
        <div @click="onTile" v-title="'平铺'" class="btn btn-h-big multi">
          <corner />
          <tileSvg />
        </div>
      </hoverTile>
      <!--定位-->
      <div @click="onPosition" v-title="'定位'" class="btn btn-h-big multi">
        <corner />
        <positionSvg />
      </div>
    </div>

    <!--设计列表-->
    <designList v-show="$app.designListVisible" />

    <!--多角度-->
    <multiCard v-loading="$app.loading" />
  </div>
</template>

<script>
import title from '@/fnDesigner/directives/title/title';
export default {
  directives: { title },
};
</script>
<script setup>
import historyPop from '@/fnDesigner/components/historyPop.vue';
import { RIGHT_WIDTH_UNIT } from '@/fnDesigner/config/common';
import hoverTile from '@/fnDesigner/views/appRight/components/hover-tile.vue';
import designList from '../../components/designList.vue';
import multiCard from './components/multiCard.vue';
import collectPop from '@/fnDesigner/components/collectPop.vue';
import positionPop from '@/fnDesigner/components/positionPop/positionPop.vue';
import positionSvg from '@/fnDesigner/components/svg/positionSvg.vue';
import historySvg from '@/fnDesigner/components/svg/historySvg.vue';
import clearSvg from '@/fnDesigner/components/svg/clearSvg.vue';
import prevSvg from '@/fnDesigner/components/svg/prevSvg.vue';
import remarkSvg from '@/fnDesigner/components/svg/remarkSvg.vue';
import nextSvg from '@/fnDesigner/components/svg/nextSvg.vue';
import settingSvg from '@/fnDesigner/components/svg/settingSvg.vue';
import topSvg from '@/fnDesigner/components/svg/topSvg.vue';
import bottomSvg from '@/fnDesigner/components/svg/bottomSvg.vue';
import upSvg from '@/fnDesigner/components/svg/upSvg.vue';
import downSvg from '@/fnDesigner/components/svg/downSvg.vue';
import deleteSvg from '@/fnDesigner/components/svg/deleteSvg.vue';
import flipXSvg from '@/fnDesigner/components/svg/flipXSvg.vue';
import flipYSvg from '@/fnDesigner/components/svg/flipYSvg.vue';
import centerXSvg from '@/fnDesigner/components/svg/centerXSvg.vue';
import centerYSvg from '@/fnDesigner/components/svg/centerYSvg.vue';
import scaleUpSvg from '@/fnDesigner/components/svg/scaleUpSvg.vue';
import scaleDownSvg from '@/fnDesigner/components/svg/scaleDownSvg.vue';
import copySvg from '@/fnDesigner/components/svg/copySvg.vue';
import tileSvg from '@/fnDesigner/components/svg/tileSvg.vue';
import rotateSvg from '@/fnDesigner/components/svg/rotateSvg.vue';
import maxSvg from '@/fnDesigner/components/svg/maxSvg.vue';
import maxHeightSvg from '@/fnDesigner/components/svg/maxHeightSvg.vue';
import maxWidthSvg from '@/fnDesigner/components/svg/maxWidthSvg.vue';
import corner from '@/fnDesigner/components/corner.vue';
import OtherPop from '@/fnDesigner/components/otherPop.vue';
import { computed, ref } from 'vue';
import { MessageBox } from 'element-ui';
import hoverDesignDetail from '@/fnDesigner/components/hover-designDetail.vue';
import { designStoreToRefs } from '@/designClass/store';
import { SUBMIT_TYPE_SAVE_NUM_BTN } from '@/designClass/core/define';
const $app = designStoreToRefs();

const rightWidthUnit = ref(RIGHT_WIDTH_UNIT);

// 历史记录
function onHistory() {
  $app.value.historyVisible = !$app.value.historyVisible;
}
// 其他设置
function onOtherSetting() {
  $app.value.otherSettingVisible = !$app.value.otherSettingVisible;
}

// 全颜色合成
const saveAllBtnDisabled = computed(() => !$app.value.activeTemplate || !$app.value.activeTemplate.detail?.isCanSynthesis);

// 图层列表开关
const designListVisibleName = computed(() => {
  return $app.value.designListVisible ? '关闭图层' : '开启图层';
});
function onTriggerDesignList() {
  $app.value.designListVisible = !$app.value.designListVisible;
}

// 收藏浮动弹窗
const collectVisibleName = computed(() => {
  return $app.value.collectPopVisible ? '关闭收藏' : '开启收藏';
});
function onTriggerCollect() {
  $app.value.collectPopVisible = !$app.value.collectPopVisible;
}

// 清空当前
async function onClearCur() {
  await MessageBox.confirm('确定清空当前设计面吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  });
  $app.value.activeView.clearDesign();
}
// 清空所有
async function onClearAll() {
  await MessageBox.confirm('确定清空所有设计面吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  });
  $app.value.activeTemplate.clearAllDesign();
}

/**
 * 保存产品
 */
function onSaveProduct(type) {
  $app.value.saveProduct(type);
}

// 复制
async function onCopy() {
  await $app.value.isActiveDesignMsg();
  $app.value.activeDesign?.copy();
}
// 置顶
async function onTop() {
  await $app.value.isActiveDesignMsg();
  $app.value.activeDesign?.moveTop();
}
// 置底
async function onBottom() {
  await $app.value.isActiveDesignMsg();
  $app.value.activeDesign?.moveBottom();
}
// 上移
async function onUp() {
  await $app.value.isActiveDesignMsg();
  $app.value.activeDesign?.moveUp();
}
// 下移
async function onDown() {
  await $app.value.isActiveDesignMsg();
  $app.value.activeDesign?.moveDown();
}
// 删除
async function onRemove() {
  await $app.value.isActiveDesignMsg();
  $app.value.activeDesign?.remove();
}
// 水平居中
async function onCenterX() {
  await $app.value.isActiveDesignMsg();
  $app.value.activeDesign?.centerHorizontal();
}
// 垂直居中
async function onCenterY() {
  await $app.value.isActiveDesignMsg();
  $app.value.activeDesign?.centerVertical();
}
// 水平翻转
async function onFlipX() {
  await $app.value.isActiveDesignMsg();
  $app.value.activeDesign?.flipHorizontal();
}
// 垂直翻转
async function onFlipY() {
  await $app.value.isActiveDesignMsg();
  $app.value.activeDesign?.flipVertical();
}
// 放大
async function onScaleUp() {
  await $app.value.isActiveDesignMsg();
  $app.value.activeDesign?.scaleUp();
}
// 缩小
async function onScaleDown() {
  await $app.value.isActiveDesignMsg();
  $app.value.activeDesign?.scaleDown();
}
// 左旋转45
async function onRotateUp() {
  await $app.value.isActiveDesignMsg();
  $app.value.activeDesign?.rotateUp();
}
// 右旋转45
async function onScRotateDown() {
  await $app.value.isActiveDesignMsg();
  $app.value.activeDesign?.rotateDown();
}
// 最大化
async function onMax(type) {
  await $app.value.isActiveDesignMsg();
  $app.value.activeDesign?.max(type);
}
// 平铺
async function onTile() {
  // await $app.value.isActiveDesignMsg();
  // $app.value.activeDesign?.tile();
}
// 定位
function onPosition() {
  $app.value.positionPopVisible = !$app.value.positionPopVisible;
}
</script>

<style lang="less">
.remark-pop {
  padding: 0 !important;
  left: 127.2rem !important;
  top: 7rem !important;
}

.pop-btn-group {
  padding: 0 !important;
  @btnSize: 4.8rem;
  .btn-group {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    background-color: #fff;
    padding: 0.8rem;
    border: 0.1rem solid #ebeef5;
  }
  .btn {
    margin-right: 1.2rem;
    user-select: none;
    width: @btnSize;
    height: 3.6rem;
    font-size: 1.4rem;
    position: relative;
    cursor: pointer;
    border-radius: 0.3rem;
    border: 0.1rem solid #dcdfe6;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    justify-content: center;
    align-items: center;
    &:last-child {
      margin-right: 0;
    }
    > svg {
      color: #7e7e7e;
    }

    &:hover {
      background-color: #fff0e9;
      color: var(--fn-primary-color);
      border-color: var(--fn-primary-color);
      > svg {
        color: var(--fn-primary-color);
      }
    }
  }

  .primary {
    border-color: var(--fn-primary-color);
    background-color: var(--fn-primary-color);
    color: #fff;
    &:hover {
      color: #fff;
      background-color: #fd894d;
    }
  }

  .primary-2 {
    border-color: #f3d19e;
    background-color: #f3d19e;
    color: #fff;
    &:hover {
      border-color: #f3d19e;
      color: #fff;
      background-color: rgba(243, 209, 158, 0.8);
    }
  }

  .btn-big {
    font-size: 1.2rem;
    width: 7.2rem;
    letter-spacing: 0.1rem;
  }
}
.pop-btn-group-save {
  .pop-btn-group();
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  padding-top: 10px !important;
  min-width: 130px !important;
  .btn {
    width: 100px !important;
    margin-right: 0 !important;
    margin-left: 0 !important;
    margin-bottom: 7px;
  }
}
</style>
<style scoped lang="less">
@btnSize: 4.8rem;
.app-right-container {
  max-width: v-bind(rightWidthUnit);
  //width: v-bind(RIGHT_WIDTH_UNIT);

  .big-group {
    display: flex;
    justify-content: space-between;
  }

  .operation {
    @gap: 0.9rem;
    .btn {
      margin-right: @gap;
      margin-bottom: @gap;
      &:nth-child(n + 11) {
        margin-bottom: 0;
      }
      &:nth-child(6n) {
        margin-right: 0;
      }
    }
  }

  .btn-group {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    background-color: #fff;
    padding: 0.8rem;
    border: 0.1rem solid #ebeef5;
  }
  .btn {
    user-select: none;
    width: @btnSize;
    height: 3.6rem;
    font-size: 1.4rem;
    position: relative;
    cursor: pointer;
    border-radius: 0.3rem;
    border: 0.1rem solid #dcdfe6;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    justify-content: center;
    align-items: center;
    > svg {
      color: #7e7e7e;
    }

    &:hover {
      background-color: #fff0e9;
      color: var(--fn-primary-color);
      border-color: var(--fn-primary-color);
      > svg {
        color: var(--fn-primary-color);
      }
    }
  }
  .active {
    background-color: #fff0e9;
    color: var(--fn-primary-color);
    border-color: var(--fn-primary-color);
    > svg {
      color: var(--fn-primary-color);
    }
  }

  .primary {
    border-color: var(--fn-primary-color);
    background-color: var(--fn-primary-color);
    color: #fff;
    &:hover {
      color: #fff;
      background-color: #fd894d;
    }
  }

  .btn-big {
    font-size: 1.2rem;
    width: 7.2rem;
    letter-spacing: 0.1rem;
  }

  .btn-h-big {
    height: @btnSize;
  }
}
.multi {
  position: relative;
}
</style>
