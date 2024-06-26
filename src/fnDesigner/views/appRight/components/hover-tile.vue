<template>
  <el-popover placement="bottom" width="370" trigger="click">
    <div class="hover-wrap">
      <div class="hover-wrap">
        <div class="img" @click="onTile">平铺</div>
        <div class="img" @click="onNotTile">不平铺</div>
        <div class="img" @click="onReset">重置</div>
      </div>
    </div>
    <div class="line-group">
      <div class="line">
        <span class="label">水平间距</span>
        <el-input class="ipt" v-model.number="param.gapX" @change="onTile()" />
        <el-slider class="slider" v-model="param.gapX" :min="0" :max="500" @change="onTile()" />
      </div>
      <div class="line">
        <span class="label">垂直间距</span>
        <el-input class="ipt" v-model.number="param.gapY" @change="onTile()" />
        <el-slider class="slider" v-model="param.gapY" :min="0" :max="500" @change="onTile()" />
      </div>
      <div class="line">
        <span class="label">交错类型</span>
        <el-radio-group v-model="param.offsetType" @change="onTile()">
          <el-radio-button :label="TILE_TYPE_OFFSET.x">水平交错</el-radio-button>
          <el-radio-button :label="TILE_TYPE_OFFSET.y">垂直交错</el-radio-button>
        </el-radio-group>
      </div>
      <div class="line">
        <span class="label">交错偏移量</span>
        <el-input class="ipt" v-model.number="param.offset" @change="onTile()" />
        <el-slider class="slider" v-model="param.offset" :min="0" :max="500" @change="onTile()" />
      </div>
      <div class="line">
        <span class="label">镜像</span>
        <el-radio-group v-model="param.mirrorType" @change="onTile()">
          <el-radio-button :label="TILE_TYPE_MIRROR.none">无</el-radio-button>
          <el-radio-button :label="TILE_TYPE_MIRROR.horizontal">水平</el-radio-button>
          <el-radio-button :label="TILE_TYPE_MIRROR.vertical">垂直</el-radio-button>
          <el-radio-button :label="TILE_TYPE_MIRROR.rotate">旋转</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <slot slot="reference"></slot>
  </el-popover>
</template>

<script>
import dragPop from '@/fnDesigner/directives/drag/drag';
import title from '@/fnDesigner/directives/title/title';
export default {
  directives: { dragPop, title },
};
</script>
<script setup>
import { designStoreToRefs } from '@/designClass/store';
import { ref, watch } from 'vue';
import { TILE_TYPE_MIRROR, TILE_TYPE_OFFSET } from '@/designClass/core/define';
const $app = designStoreToRefs();
const param = ref({
  gapX: 0,
  gapY: 0,
  offset: 0,
  offsetType: TILE_TYPE_OFFSET.x,
  mirrorType: TILE_TYPE_MIRROR.none,
});

watch(
  () => $app.value?.activeDesign,
  (design) => {
    if (design) {
      const tile = design?.tileClass;
      if (tile) {
        param.value.gapX = tile.gapX;
        param.value.gapY = tile.gapY;
        param.value.offset = tile.offset;
        param.value.offsetType = tile.offsetType;
        param.value.mirrorType = tile.mirrorType;
      }
    }
  },
);

/**
 * 重置
 */
function onReset() {
  param.value.gapX = 0;
  param.value.gapY = 0;
  param.value.offset = 0;
  param.value.offsetType = TILE_TYPE_OFFSET.x;
  param.value.mirrorType = TILE_TYPE_MIRROR.none;
  $app.value.activeDesign?.tileClass?.setParam(param.value);
  $app.value?.activeDesign?.tileClass?.change(true);
}
/**
 * 不平铺
 */
async function onNotTile() {
  $app.value.activeDesign?.tileClass.reset();
  // $app.value.activeDesign?.tileClass?.destroy();
}
/**
 * 平铺 铺满
 * @returns {Promise<void>}
 */
function onTile() {
  $app.value.activeDesign?.tileClass?.setParam(param.value);
  $app.value.activeDesign?.tile(true);
}
</script>

<style scoped lang="less">
:deep(.el-popover__reference-wrapper) {
  width: 100%;
  height: 100%;
}
.line-group {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.line {
  display: flex;
  align-items: center;
  gap: 1rem;
  .label {
    white-space: nowrap;
    width: 7.5rem;
    text-align: right;
  }
  .ipt {
    width: 5.5rem;
  }
  .slider {
    flex: 1;
  }
}
.name {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.hover-wrap {
  width: 23.5rem;
  display: flex;
  justify-content: space-around;
  margin-bottom: 0.7rem;
  .img {
    cursor: pointer;
    width: 5rem;
    height: 5rem;
    border: 0.1rem solid #dcdfe6;
    border-radius: 0.4rem;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;

    &:hover {
      border: 0.1rem solid var(--fn-primary-color);
    }
  }
}
</style>
