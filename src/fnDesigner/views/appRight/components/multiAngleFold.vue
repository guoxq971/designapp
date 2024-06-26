<template>
  <div :class="{ 'cursor-zoom-in': cursorZoomIn }" :style="{ width: picWidth, height: picHeight }" class="box-wrap" :data-name="typeName">
    <img :style="{ width: picWidth, height: picHeight }" :src="image" alt="" class="img-1 z-index-1" />
    <template v-if="!isNotMask">
      <img :style="{ width: picWidth, height: picHeight }" v-if="mask" :src="mask" alt="" class="img-1 z-index-2" />
    </template>
    <template v-else>
      <div class="img-1 z-index-2" style="width: 100%; height: 100%; }">
        <slot></slot>
      </div>
    </template>
    <img :style="{ width: picWidth, height: picHeight }" v-if="texture" :src="texture" alt="" class="img-1 z-index-3" />
  </div>
</template>

<script>
import { RIGHT_WIDTH_UNIT } from '@/fnDesigner/config/common';

export default {
  props: {
    // 是否不需要mask
    isNotMask: { type: Boolean, default: false },
    // 放大镜 cursor: zoom-in
    cursorZoomIn: { type: Boolean, default: false },
    // 尺码，如果有尺码，宽高就不生效
    size: { type: [String, Number], default: -1 },
    width: { type: [String, Number], default: RIGHT_WIDTH_UNIT },
    height: { type: [String, Number], default: RIGHT_WIDTH_UNIT },
    // 类型名称(标记） 简单 | 复杂
    typeName: { type: String, default: '' },
    // 图片地址
    image: { type: String, default: '' },
    mask: { type: String, default: '' },
    texture: { type: String, default: '' },
  },
  computed: {
    picWidth() {
      let width = this.width;
      if (this.size !== -1) {
        width = this.size;
      }
      if (width.toString().indexOf('rem') === -1) {
        width = `${width}rem`;
      }
      return width;
    },
    picHeight() {
      let height = this.height;
      if (this.size !== -1) {
        height = this.size;
      }
      if (height.toString().indexOf('rem') === -1) {
        height = `${height}rem`;
      }
      return height;
    },
  },
};
</script>

<style scoped lang="less">
@width: v-bind(RIGHT_WIDTH_UNIT);
@height: v-bind(RIGHT_WIDTH_UNIT);
.cursor-zoom-in {
  cursor: zoom-in;
}

.box-wrap {
  width: @width;
  height: @height;
  position: relative;
}
.img-1 {
  width: @width;
  height: @height;
  position: absolute;
}
.z-index-1 {
  z-index: 1;
}
.z-index-2 {
  z-index: 2;
}
.z-index-3 {
  z-index: 3;
}
</style>
