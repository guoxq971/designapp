<template>
  <div class="canvas-container" :style="canvasStyle">
    <!--模板导出弹窗-->
    <templateExportDialog v-if="templateExport.show" :show.sync="templateExport.show" />

    <!--通用/精细-->
    <changeType />
    <!--模板导出-->
    <div class="template-export-button" v-if="$app.activeTemplate.templateExport.configList.length">
      <div @click="onTemplateExport" class="btn primary">导出</div>
    </div>

    <!--预览图-->
    <div class="preview-group">
      <div @click="onSetActiveView(item)" v-for="item in $app.activeTemplate.viewList" :key="`preview${item.id}`" class="preview-item" :class="{ active: $app.activeViewId == item.id }">
        <imgTrack :url1="item.image" :url2="item.texture" />
      </div>
    </div>

    <!--画布-->
    <div v-show="isShow2d && item.id == $app.activeViewId" v-for="item in $app.activeTemplate.viewList" :key="`canvas${item.id}`" :style="canvasStyle">
      <imgTrack :url1="item.image" :url2="item.texture" style="user-select: none" :img-visible="imgVisible">
        <div style="position: absolute;top: 0;" :id="$app.canvas2dId + item.id" :style="canvasStyle"></div>
      </imgTrack>
    </div>

    <!--3d-->
    <div v-show="isShow3d" v-loading="loadingModel">
      <div :id="$app.canvas3dId" :style="canvasStyle"></div>
    </div>
  </div>
</template>

<script setup>
import templateExportDialog from './templateExportDialog.vue';
import {
  //
  CANVAS_SIZE_UNIT,
  PREVIEW_SIZE_UNIT,
} from '@/fnDesigner/config/common';
import imgTrack from '@/fnDesigner/components/imgTrack';
import changeType from './changeType.vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { designStoreToRefs } from '@/designClass/store';
import { MODE_TYPE } from '@/designClass/core/define';
const $app = designStoreToRefs();

const previewSize = ref(PREVIEW_SIZE_UNIT);
const canvasStyle = ref({ width: CANVAS_SIZE_UNIT, height: CANVAS_SIZE_UNIT });

// 是否显示模板静态图
const imgVisible = computed(() => $app.value.mode === MODE_TYPE.preview || $app.value.activeTemplate.detail.pointoutPrintAreas?.length === 0);

onBeforeUnmount(() => {
  $app.value.activeTemplate.destroy();
});
// 模型加载中
const loadingModel = computed(() => $app.value.activeTemplate.template3d?.loading);
// 是否能加载3d
const isSureLoad3d = computed(() => $app.value.activeTemplate.template3d?.isSureLoad3d);
// 显示2d
const isShow2d = computed(() => $app.value.isShow2d);
// 显示3d
const isShow3d = computed(() => {
  let result = false;
  // 预览模式 && 可加载3d
  if ($app.value.mode === MODE_TYPE.preview && isSureLoad3d.value) {
    result = true;
  }
  return result;
});

/**
 * 选择预览图
 * @param {View} item
 */
function onSetActiveView(item) {
  $app.value.activeViewId = item.id;
  nextTick(() => $app.value.activeView.cameraAnimation());
}

/**
 * 模板导出
 */
const templateExport = ref({
  show: false,
});
function onTemplateExport() {
  templateExport.value.show = true;
}
</script>

<style scoped lang="less">
// 模板导出
.template-export-button {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  z-index: 1;
  .btn {
    user-select: none;
    width: 4.8rem;
    height: 3.2rem;
    font-size: 1.4rem;
    position: relative;
    cursor: pointer;
    border-radius: 0.3rem;
    border: 0.1rem solid #dcdfe6;
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
}
.preview-group {
  @size: v-bind(previewSize);
  position: absolute;
  left: calc((@size + 1.2rem) * -1);
  .preview-item {
    width: @size;
    height: @size;
    border: 0.1rem solid #888;
    margin-bottom: 0.8rem;
    cursor: pointer;
    border-radius: 0.4rem;
  }

  .active {
    border: 0.2rem solid var(--fn-primary-color);
  }
}
.canvas-container {
  position: relative;
  background-image: linear-gradient(to right, #f2f2f2 50%, #cccccc 0%), linear-gradient(#f2f2f2 50%, #cccccc 0%), linear-gradient(to left, #f2f2f2 50%, #cccccc 0%),
    linear-gradient(to top, #f2f2f2 50%, #cccccc 0%);
  background-position: center top, right center, center bottom, left center;
  background-size: 12px 1.4px, 1.4px 12px, 12px 1.4px, 0.8px 12px;
  background-repeat: repeat-x, repeat-y, repeat-x, repeat-y;
}
</style>
