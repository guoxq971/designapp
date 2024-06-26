<!--图片组合-->
<template>
  <div class="img" @click="handleImg">
    <img v-if="src1" :src="src1" class="img-box" alt="" style="pointer-events: none;" :style="{ display: imgVisible ? 'block' : 'none' }" />
    <slot></slot>
    <img v-if="src2" :src="src2" class="img-box1" alt="" style="pointer-events: none;" :style="{ display: imgVisible ? 'block' : 'none' }" />
  </div>
</template>

<script setup>
import { isFileSuffixTool } from '@/laod/utils';
import { computed, defineProps, defineEmits } from 'vue';
import { vm } from '@/main';
import { isRenderings } from '@/components/imgTrack/util';

const props = defineProps({
  imgVisible: { type: Boolean, default: true },
  // 图片地址1-背景
  url1: {
    type: String,
    default: '',
  },
  // 图片地址2-非背景
  url2: {
    type: String,
    default: '',
  },
  // 图片宽
  imgWidth: {
    type: String,
    default: '100%',
  },
  // 图片高
  imgHeight: {
    type: String,
    default: '100%',
  },
});

// 判断是否有前缀，没有就加前缀
const checkFix = (oUrl) => {
  let url = '';
  // 是否是指定后缀图片
  // if (isFileSuffixTool.isCheckSuffix(oUrl)) {
  //   url = isFileSuffixTool.getPic(oUrl);
  // } else {
  //   let result2 = (oUrl + '').indexOf('http') === -1; //url中如果存在 http 就不加前缀
  //   let result4 = (oUrl + '').indexOf('https') === -1; //url中如果存在 https 就不加前缀
  //   let result3 = oUrl !== ''; //图片不能为空
  //   if (result3 && result2 && result4) {
  //     url = vm.basePathImg + oUrl;
  //   } else {
  //     url = oUrl;
  //   }
  // }
  return oUrl;
};

const src1 = computed(() => {
  const s = checkFix(props.url1);
  return isRenderings(props.url2) ? '' : s;
});

const src2 = computed(() => {
  const s = checkFix(props.url2);
  return isRenderings(props.url1) ? '' : s;
});

const emit = defineEmits(['click']);
const handleImg = () => {
  emit('click');
};
</script>

<style scoped lang="less">
.img {
  width: v-bind('props.imgWidth');
  height: v-bind('props.imgHeight');
  position: relative;

  .img-box,
  .img-box1 {
    width: 100%;
    height: auto;
  }

  .img-box1 {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }
}
</style>
