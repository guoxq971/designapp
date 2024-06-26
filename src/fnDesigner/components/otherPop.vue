<!--其他设置-->
<template>
  <transition name="el-fade-in-linear">
    <div class="other-wrap" v-dragPop="{ top: 71, left: 1278 }">
      <!--头部-->
      <div class="header" slot="header">
        <div>
          其他设置
        </div>
        <div @click="onClose" class="close el-icon-close"></div>
      </div>

      <!--内容-->
      <div class="body">
        <div class="body-main">
          <div class="item-row">
            <div>中线/边线</div>
            <el-switch v-model="$app.isDrawLine" />
          </div>
          <div class="item-row">
            <div>磁吸</div>
            <el-switch v-model="$app.isMagnet" />
          </div>
          <div class="item-row">
            <div>模型操作</div>
            <el-switch v-model="$app.modelOperational" @change="onChangeModel" />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import dragPop from '@/fnDesigner/directives/drag/drag';
export default {
  directives: { dragPop },
};
</script>
<script setup>
import { designStoreToRefs } from '@/designClass/store';
import { MODE_TYPE } from '@/designClass/core/define';
const $app = designStoreToRefs();

function onClose() {
  $app.value.otherSettingVisible = false;
}
function onChangeModel() {
  if ($app.value.modelOperational === false) {
    // 3d && 预览模式 && 有选中
    if ($app.value.activeTemplate.template3d.isSureLoad3d && $app.value.mode === MODE_TYPE.preview && $app.value.activeView.canvas.transformer.nodes().length > 0) {
      $app.value.activeView.setActiveNull();
    }
  }
}
</script>

<style scoped lang="less">
.other-wrap {
  width: 24.5rem;
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

    .refresh {
      cursor: pointer;
    }

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
    .body-main {
      padding: 0 1rem 1rem 1rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .item-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
      }
    }
  }
}
</style>
