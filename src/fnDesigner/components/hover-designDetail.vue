<!--设计说明-->
<template>
  <transition name="el-fade-in-linear">
    <div v-show="isShow" class="hover-wrap">
      <div class="rect-wrap">
        <div class="rect-1 yhx">
          <div class="rect-2 cfx"></div>
        </div>
      </div>
      <div class="w-wrap">
        <div class="w-title">
          <div class="pic yhx"></div>
          <div>印花线-黑色/白色</div>
        </div>
        <div class="w-content">
          <div style="margin-bottom: .7rem">将背景图层延伸设计到此线条，以避免因设计未铺满生产区域导致实际生产效果出现边缘设计断层（留白或者留黑），影响实物美观</div>
          <div>
            注：
            <br />
            1.白色产品为黑色虚线，非白色产品为白色虚线；
            <br />
            2.设计全幅产品设计图需覆盖到印花线内全部区域。
          </div>
        </div>
      </div>
      <el-divider style="margin: 0 .5rem" />
      <div class="w-wrap">
        <div class="w-title">
          <div class="pic cfx"></div>
          <div>裁缝线</div>
        </div>
        <div class="w-content">实际生产需要裁切、缝合、包边的大概位置，设计时LOGO、图案和文字建议适当避开，否则可能造成图案不完整或实物效果偏差</div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'HoverDesignDetail',
  data() {
    return {
      isShow: true,
    };
  },
};
</script>

<style lang="less" scoped>
:deep(.el-divider--horizontal) {
  margin: 1.6rem 0;
}

.yhx {
  background-image: linear-gradient(to right, #f2f2f2ff 50%, #000 0%), linear-gradient(to bottom, #f2f2f2ff 50%, #000 0%), linear-gradient(to left, #f2f2f2ff 50%, #000 0%),
    linear-gradient(to top, #f2f2f2ff 50%, #000 0%);
  background-position: top, right, bottom, left;
  background-size: 12px 0.7px, 1.4px 12px, 12px 1.4px, 0.7px 12px;
  background-repeat: repeat-x, repeat-y, repeat-x, repeat-y;
}

.cfx {
  background-image: linear-gradient(to right, #f2f2f2ff 50%, #f80404 0%), linear-gradient(to bottom, #f2f2f2ff 50%, #f80404 0%), linear-gradient(to left, #f2f2f2ff 50%, #f80404 0%),
    linear-gradient(to top, #f2f2f2ff 50%, #f80404 0%);
  background-position: top, right, bottom, left;
  background-size: 12px 0.7px, 1.4px 12px, 12px 1.4px, 0.7px 12px;
  background-repeat: repeat-x, repeat-y, repeat-x, repeat-y;
}

.hover-wrap {
  box-shadow: 0rem 0rem 0.8rem 0rem rgb(153 153 153);
  //position: absolute;
  //right: 35.7rem;
  //top: -0.1rem;
  //left: -28.1rem;
  //z-index: 6;
  width: 26.7rem;
  //height: 37.5rem;
  border: 0.1rem solid #ccc;
  border-radius: 0.4rem;
  padding: 0.7rem;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;

  // rect
  .rect-wrap {
    width: 24.3rem;
    height: 13.7rem;
    background: inherit;
    background-color: #f2f2f2ff;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    margin-bottom: 1.7rem;

    .rect-1 {
      width: 20.1rem;
      height: 10.2rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .rect-2 {
      width: 17.3rem;
      height: 6.8rem;
    }
  }

  // 印花线 裁缝线
  .w-wrap {
    .w-title {
      display: flex;
      align-items: center;

      .pic {
        width: 5rem;
        height: 2rem;
        margin-right: 0.7rem;
        margin-bottom: 0.7rem;
      }
    }

    .w-content {
    }
  }
}
</style>
