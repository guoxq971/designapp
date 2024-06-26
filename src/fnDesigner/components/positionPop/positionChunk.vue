<template>
  <div class="box-wrap" :style="{ width: `${size}px`, height: `${size}px`, padding: `${margin}px` }">
    <div class="small-box" :style="oneStyle" />
    <div class="small-box" :style="twoStyle" />
    <div class="small-box" :style="threeStyle" />
    <div class="small-box" :style="fourStyle" />
  </div>
</template>

<script>
export default {
  name: 'layerPositionByChunk',
  props: {
    /*
     * 显示边框
     * - [上,右,下,左]
     * - 数字=边框宽度
     * */
    confArea: {
      type: Array,
      default() {
        return [
          [0, 0, 0, 0], //1,1 第一排第一个方格
          [0, 0, 0, 0], //1,2 第一排第二个方格
          [0, 0, 0, 0], //2,1 第二排第一个方格
          [0, 0, 0, 0], //2,2 第二排第二个方格
        ];
      },
    },
    /*
     * 圆角
     * - eg:[[1,1,1]]第一排第一个方格左上圆角
     * - eg:[[1,1,2]]第一排第一个方格右上圆角
     * - eg:[[1,1,3]]第一排第一个方格左下圆角
     * - eg:[[1,1,4]]第一排第一个方格右下圆角
     * */
    confRadius: {
      type: Array,
      default() {
        return [
          [1, 1, 0],
          [1, 2, 0],
          [2, 1, 0],
          [2, 2, 0],
        ];
      },
    },
  },
  data() {
    return {
      // 粗细
      borderWidth: 1,
      // 圆角
      borderRadius: 3,
      // 间距
      margin: 8,
      // 大小
      size: 40,
    };
  },
  computed: {
    oneStyle() {
      return {
        ...this.borderStyleFormat(this.confArea[0]),
        ...this.borderRadiusFormat(this.confRadius[0]),
      };
    },
    twoStyle() {
      return {
        ...this.borderStyleFormat(this.confArea[1]),
        ...this.borderRadiusFormat(this.confRadius[1]),
      };
    },
    threeStyle() {
      return {
        ...this.borderStyleFormat(this.confArea[2]),
        ...this.borderRadiusFormat(this.confRadius[2]),
      };
    },
    fourStyle() {
      return {
        ...this.borderStyleFormat(this.confArea[3]),
        ...this.borderRadiusFormat(this.confRadius[3]),
      };
    },
  },
  methods: {
    /*
     * 单条边格式化
     * @param {number} num 边框宽度
     * @return {string} 单条边的边框样式
     * */
    borderFormat(num) {
      return num ? `${num}px solid` : '';
    },
    /*
     * 边框样式格式化
     * @param {array} arr
     * @return {object} 四条边的边框样式
     * */
    borderStyleFormat(arr) {
      return {
        borderTop: this.borderFormat(arr[0]),
        borderRight: this.borderFormat(arr[1]),
        borderBottom: this.borderFormat(arr[2]),
        borderLeft: this.borderFormat(arr[3]),
      };
    },
    /*
     * 边框圆角
     * @param {array} arr
     * @return {object} 圆角样式
     * */
    borderRadiusFormat(arr) {
      let fx = arr[2];
      return {
        borderTopLeftRadius: fx === 1 ? `${this.borderRadius}px` : '',
        borderTopRightRadius: fx === 2 ? `${this.borderRadius}px` : '',
        borderBottomLeftRadius: fx === 3 ? `${this.borderRadius}px` : '',
        borderBottomRightRadius: fx === 4 ? `${this.borderRadius}px` : '',
      };
    },
  },
};
</script>

<style scoped lang="less">
.box-wrap {
  display: flex;
  flex-wrap: wrap;
  background: #f0f2f5;

  &:hover {
    background: #e4e4e4;
    cursor: pointer;
  }

  .small-box {
    width: 50%;
    height: 50%;
  }
}
</style>
