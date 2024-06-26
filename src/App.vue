<template>
  <div id="app">
    <div class="header-container"></div>
    <router-view />
  </div>
</template>

<script setup>
import { useDevice } from '@/fnHooks/useDevice';
useDevice();
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.header-container {
  height: 6rem;
  background-color: #fff;
  box-shadow: 0 0 2rem 0 #f2f2ff;
}
.fn-scroll-bar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background-color: #fff;
}
.fn-scroll-bar::-webkit-scrollbar-thumb {
  border-radius: 6px;
  cursor: pointer;
  background-color: rgba(144, 147, 153, 0.3);
  transition: background-color 0.3s;
}
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background-color: #fff;
}
::-webkit-scrollbar-thumb {
  border-radius: 6px;
  cursor: pointer;
  background-color: rgba(144, 147, 153, 0.3);
  transition: background-color 0.3s;
}
</style>
