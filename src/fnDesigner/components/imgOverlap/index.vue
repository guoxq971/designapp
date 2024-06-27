<!--2张图片重叠-->
<template>
  <div class="img-overlap-img" :style="{ height: `${height}px`, width: `${width}px` }">
    <el-image :src="src1" :style="{ height: `${height}px`, width: `${width}px` }"></el-image>
    <el-image class="img-overlap-img-url2" :src="src2" :style="{ height: `${height}px`, width: `${width}px` }"></el-image>
  </div>
</template>

<script>
import { isFileSuffixTool } from '@/fnDesigner/views/appCenter/components/price/util';

export default {
  props: {
    // 图片高度
    height: {
      type: Number,
      default: 80,
    },
    // 图片宽度
    width: {
      type: Number,
      default: 80,
    },
    // 图片地址-背景
    url1: {
      type: String,
      default: '',
    },
    // 图片地址
    url2: {
      type: String,
      default: '',
    },
    // 是否需要加域名前缀
    isBase: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    src1() {
      let url = '';
      // 是否是指定后缀图片
      if (isFileSuffixTool.isCheckSuffix(this.url1)) {
        url = isFileSuffixTool.getPic(this.url1);
      } else {
        let result1 = this.isBase; //是否需要加前缀
        let result2 = (this.url1 + '').indexOf('http') === -1; //url中如果存在 http 就不加前缀
        let result4 = (this.url1 + '').indexOf('https') === -1; //url中如果存在 https 就不加前缀
        let result3 = this.url1 !== ''; //图片不能为空
        if (result3 && result1 && result2 && result4) {
          url = this.basePathImg + this.url1;
        } else {
          url = this.url1;
        }
      }
      return url;
    },
    src2() {
      let url = '';
      // 是否是指定后缀图片
      if (isFileSuffixTool.isCheckSuffix(this.url2)) {
        url = isFileSuffixTool.getPic(this.url2);
      } else {
        let result1 = this.isBase; //是否需要加前缀
        let result2 = (this.url2 + '').indexOf('http') === -1; //url中如果存在 http 就不加前缀
        let result4 = (this.url2 + '').indexOf('https') === -1; //url中如果存在 https 就不加前缀
        let result3 = this.url2 !== ''; //图片不能为空
        if (result3 && result1 && result2 && result4) {
          url = this.basePathImg + this.url1;
        } else {
          url = this.url2;
        }
      }
      return url;
    },
  },
};
</script>

<style scoped lang="less">
.img-overlap-img {
  position: relative;

  .img-overlap-img-url2 {
    position: absolute;
    top: 0;
    left: 0;
  }

  //&:hover{
  //    border:2px solid #409eff;
  //}
}
</style>
