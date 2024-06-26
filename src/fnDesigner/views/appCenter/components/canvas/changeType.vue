<template>
  <!--v-if="!isCustomTemplate"-->
  <div class="switch">
    <el-dropdown trigger="click" size="small">
      <span class="el-dropdown-link link-wrap">
        <span class="active-title">{{ activeTypeName }}</span>
        <i class="active-title el-icon-arrow-down el-icon--right"></i>
      </span>

      <el-dropdown-menu slot="dropdown">
        <el-tooltip placement="right">
          <div slot="content">
            <div>
              <div>设计参数全尺码通用，</div>
              <div>①多尺码产品，设计与生产效果存在部分误差</div>
              <div>②单尺码产品，无误差</div>
            </div>
          </div>
          <el-dropdown-item :disabled="disabledCommon" @click.native="onSwitch(TEMPLATE_DESIGN_TYPE.common)">通用设计</el-dropdown-item>
        </el-tooltip>

        <el-tooltip placement="right">
          <div slot="content">
            <!--精细-->
            <div>
              <template v-if="disabledRefine">
                <div>该产品暂不支持精细设计</div>
              </template>
              <template v-else>
                <div>每个尺码单独设计，细分裁片</div>
                <div>①设计与生产结果不存在误差</div>
                <div>②选择需要的尺码进行设计，支持全尺码设计与部分尺码设计</div>
              </template>
            </div>
          </div>
          <el-dropdown-item :disabled="disabledRefine" @click.native="onSwitch(TEMPLATE_DESIGN_TYPE.refine)">精细设计</el-dropdown-item>
        </el-tooltip>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { PREVIEW_SIZE_UNIT } from '@/fnDesigner/config/common';
import { designStoreToRefs } from '@/designClass/store';
import { TEMPLATE_DESIGN_TYPE } from '@/designClass/core/define';
const da = designStoreToRefs();
const previewSize = ref(PREVIEW_SIZE_UNIT);
const activeTypeName = computed(() => {
  return {
    [TEMPLATE_DESIGN_TYPE.common]: '通用设计',
    [TEMPLATE_DESIGN_TYPE.refine]: '精细设计',
  }[da.value.activeTemplateType];
});
// 通用是否禁用
const disabledCommon = computed(() => !da.value.templateList.some((e) => e.type === TEMPLATE_DESIGN_TYPE.common));
// 精细是否禁用
const disabledRefine = computed(() => !da.value.templateList.some((e) => e.type === TEMPLATE_DESIGN_TYPE.refine));

// 切换
function onSwitch(type) {
  da.value.useTemplateBySize(type);
  da.value.activeTemplateType = type;
}
</script>

<style scoped lang="less">
@size: v-bind(previewSize);
:deep(.el-dropdown) {
  font-size: 1.3rem;
}
.switch {
  position: absolute;
  left: calc((@size + 1.2rem) * -1);
  cursor: pointer;
  top: -3.3rem;
  width: calc(@size + 0.1rem);
  height: 2.5rem;
  border-radius: 0.4rem;

  background: var(--fn-primary-color);
  display: flex;
  justify-content: center;
  align-items: center;

  .active-title {
    color: #fff !important;
  }
}
</style>
