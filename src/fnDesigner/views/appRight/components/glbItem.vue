<template>
  <multiAngleFold isNotMask cursorZoomIn typeName="简单" :image="image" :texture="texture" :width="width" :height="height">
    <slot></slot>
  </multiAngleFold>
</template>

<script setup>
import multiAngleFold from './multiAngleFold.vue';
import { defineProps } from 'vue';
defineProps({
  image: { type: String, default: '' },
  texture: { type: String, default: '' },
  width: { type: String, default: '' },
  height: { type: String, default: '' },
});
</script>

<style scoped lang="less"></style>
