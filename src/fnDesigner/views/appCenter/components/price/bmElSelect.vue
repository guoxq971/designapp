<template>
  <el-select
    v-model="c_vlaue"
    :style="`width:${bmWidth}`"
    :placeholder="placeholder"
    :disabled="disabled"
    collapse-tags
    :multiple="multiple"
    @change="handlerChange"
    filterable
    @blur="onBlur"
    :size="size"
    :loading="loading"
  >
    <el-option v-if="isFirst" :label="firstLabel" value=""></el-option>
    <el-option v-for="(item, index) in c_options" :key="`${uuid}${index}`" :label="item.label" :value="item.value" />
  </el-select>
</template>

<script>
import { getUuid } from '@/utils/fnUtils';

export default {
  name: 'bmElSelect',
  model: {
    prop: 'value',
    event: 'change123',
  },
  props: {
    loading: { type: Boolean, default: false },
    // 多选
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: '请选择' },
    // 是否展示第一个选项[全部]
    isFirst: { type: Boolean, default: true },
    // 第一个选项的 label 文本
    firstLabel: { type: String, default: '全部' },
    width: { type: [Number, String], default: 120 },
    options: { type: Array, default: () => [] },
    value: { type: [Number, String, Array], default: () => '' },
    // 尺寸 small | mini
    size: { type: String, default: 'small' },
  },
  computed: {
    // 宽度
    bmWidth() {
      if (this.width + ''.indexOf('%') > -1) {
        return this.width;
      } else {
        return this.width + 'px';
      }
    },
  },
  data() {
    return {
      uuid: getUuid(),
      c_vlaue: '',
      c_options: [],
      org_options: [],
    };
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler(val) {
        this.c_vlaue = val;
      },
    },
    c_vlaue: {
      deep: true,
      immediate: true,
      handler(val) {
        this.$emit('change123', val);
        this.$emit('update:value', val);
      },
    },
    options: {
      deep: true,
      immediate: true,
      handler(val) {
        this.c_options = val;
        this.org_options = val;
      },
    },
  },
  methods: {
    handlerChange() {
      let d = this.options.find((item) => item.value === this.c_vlaue);
      this.$emit('change', d);
    },
    onBlur() {
      this.c_options = this.org_options;
    },
  },
};
</script>

<style lang="less" scoped></style>
