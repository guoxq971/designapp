<!--收藏列表-->
<template>
  <transition name="el-fade-in-linear">
    <div class="list-group" v-dragPop="{ left: 1350, top: 90 }">
      <div class="img-warp" style="position: relative">
        <div class="title drag1">收藏图片</div>
        <div class="list-wrap">
          <div class="box-wrap" v-for="item in $app.imageCollectList" :key="item.id" @click.stop="onClick(item)" @mousedown.stop @contextmenu="(e) => onContextmenu(e, item)">
            <el-image class="img" :src="item.designImg" />
          </div>
        </div>
      </div>
      <div class="img-warp" style="position: relative">
        <div class="title drag1">收藏背景</div>
        <div class="list-wrap">
          <div class="box-wrap" v-for="item in $app.backgroundCollectList" :key="item.id" @click="onClick(item)" @mousedown.stop @contextmenu="(e) => onContextmenu(e, item)">
            <el-image class="box-wrap" :src="item.designImg" />
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
const $app = designStoreToRefs();

// 选择设计
function onClick(item) {
  if (item.isBg) {
    $app.value.activeView.addDesignBackgroundImage(item);
  } else {
    $app.value.activeView.addDesignImage(item);
  }
}

// 移除收藏设计
function onContextmenu(e, data) {
  e.preventDefault();
  $app.value.collectImage(data);
}
</script>

<style lang="less" scoped>
.bdr {
  border-right: 1px solid #ccc;
}

.list-group {
  width: 150px;
  height: 810px;
  user-select: none;
  //position: absolute;
  //right: 358px;
  z-index: 11;
  display: flex;
  justify-content: center;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
  background-color: #fff;

  .img-warp {
    display: flex;
    flex-direction: column;
    //margin-right: 7px;
    flex: 1;
    align-items: center;

    &:last-child {
      margin-right: 0;
    }

    .title {
      padding: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 14px;
      //font-weight: bold;
      height: 30px;
      background-color: var(--fn-primary-color);
      width: 100%;
      color: #fff;
      margin-bottom: 3px;
    }

    .list-wrap {
      flex: 1;
      height: 0;
      overflow: auto;
    }
  }

  .box-wrap {
    border-radius: 4px;
    overflow: hidden;
    width: 64px;
    height: 64px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 3px;

    .img {
      width: 64px;
      height: 64px;
      background-color: rgb(238 238 238);
    }

    &:hover {
      border: 1px solid var(--fn-primary-color);
    }
  }
}
</style>
