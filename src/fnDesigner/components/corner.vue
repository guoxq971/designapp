<template>
  <div class="right-bottom-corner">
    <div class="interior" />
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue';
const props = defineProps({
  zero: { type: Boolean, default: true },
});
const rightUnit = computed(() => {
  return props.zero ? '0' : '0.4rem';
});
const bottomUnit = computed(() => {
  return props.zero ? '0' : '0.4rem';
});
</script>

<style scoped lang="less">
.right-bottom-corner {
  position: absolute;
  z-index: 3;
  bottom: v-bind(bottomUnit);
  right: v-bind(rightUnit);
  width: 1rem;
  height: 1rem;
  border-bottom-right-radius: 0.3rem;
  overflow: hidden;
  .interior {
    width: 0;
    height: 0;
    border-bottom: 1rem solid var(--fn-primary-color);
    border-left: 1rem solid transparent;
  }
}
</style>
