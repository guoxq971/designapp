<!--推荐参数-->
<template>
  <div class="recommend-container">
    <span class="icon el-icon-warning" @mouseenter="boxEnter()" @mouseleave="boxLeave()" />
    <transition name="el-fade-in-linear">
      <div v-show="visibleRecommend" ref="boxWrapRef" class="box-wrap" @mouseenter="boxEnter" @mouseleave="boxLeave" :style="{ right: right }">
        <div style="white-space: nowrap">推荐设计像素宽高： {{ size }}</div>
        <div style="white-space: nowrap">推荐设计分辨率：{{ dpi }}</div>
        <div>
          工厂生产版：
          <template v-if="isPsd">
            <template v-if="detail.psdVersion">
              <el-popover popper-class="prod-popover" placement="right-start" width="450" v-model="visible" trigger="manual">
                <el-table :data="detail.designLogs" @mouseenter.native="tableEnter" @mouseleave.native="tableLeave">
                  <el-table-column :resizable="false" label="版本号" prop="version" align="center" />
                  <el-table-column :resizable="false" label="更新时间" prop="createTime" align="center" />
                  <el-table-column :resizable="false" label="备注" prop="remark" align="center" />
                </el-table>
                <el-button type="text" slot="reference" @mouseenter.native="versionEnter" @mouseleave.native="versionLeave">
                  {{ detail.psdVersion }}
                </el-button>
              </el-popover>
              <br />
            </template>
            <el-button type="primary" size="mini" @click="handlerDown" :style="detail.psdVersion ? 'position: relative; right: -92px;' : ''">下载psd</el-button>
          </template>
          <span v-else>{{ psd }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { defineEmits, defineProps, ref, computed, watch, nextTick } from 'vue';
import { designStoreToRefs } from '@/designClass/store';
import { ConfigDesign, downloadImg } from '@/fnDesigner/views/appCenter/components/recommendParamUtil';

const emit = defineEmits(['mEnter', 'mLeave']);
const $app = designStoreToRefs();
const props = defineProps({
  detail: { type: Object, default: () => {} },
  visibleRecommend: { type: Boolean, default: false },
});
const recommend_timer = ref(null);
const right = ref('');
const visible = ref(false);
const timer = ref(null);

const boxWrapRef = ref(null);

watch([() => $app.value.activeTemplate.detail.templateNo, () => props.visibleRecommend], (val) => {
  if (val[0] || val[1]) {
    nextTick(() => {
      computedRight();
    });
  }
});

const config = computed(() => {
  return new ConfigDesign($app.value.activeTemplate.detail?.configDesign);
});
// 推荐尺码
const size = computed(() => {
  let config2 = config.value;
  let size,
    width = 0,
    height = 0;
  if (config2.recommendWidth) width = config2.recommendWidth;
  if (config2.recommendWidth) height = config2.recommendHeight;
  if (width || height) {
    size = `${width}*${height}px`;
  } else {
    size = '暂无数据';
  }
  return size;
});
// 推荐dpi
const dpi = computed(() => {
  let config2 = config.value;
  let dpi;
  if (config2.recommendDpi) dpi = config2.recommendDpi;
  if (dpi) {
    dpi = `${dpi}像素/英寸`;
  } else {
    dpi = '暂无数据';
  }
  return dpi;
});
// 推荐psd
const psd = computed(() => {
  let config2 = config.value;
  let psd;
  if (config2.factoryProductionDocuments) psd = config2.factoryProductionDocuments;
  if (psd) {
    psd = `${psd}`;
  } else {
    psd = '暂无数据';
  }
  return psd;
});
// 是否有psd
const isPsd = computed(() => {
  return !!config.value.factoryProductionDocuments;
});

/**
 * 弹窗的移入事件
 * */
function boxEnter() {
  clearTimeout(recommend_timer.value);
  $app.value.RecommendVisible = true;
}
/**
 * 弹窗的移出事件
 * */
function boxLeave() {
  recommend_timer.value = setTimeout(() => {
    $app.value.RecommendVisible = false;
  }, 300);
}
/*
 * 表格的鼠标移入事件
 * -持续展示表格和推荐弹窗
 * */
function tableEnter() {
  clearTimeout(timer.value);
  visible.value = true;
  emit('mEnter');
}
/*
 * 表格的鼠标移出事件
 * -隐藏表格
 * */
function tableLeave() {
  timer.value = setTimeout(() => {
    visible.value = false;
  }, 300);
  emit('mLeave', 200);
}
/*
 * 版本号的鼠标移入事件
 * -展示表格
 * */
function versionEnter() {
  clearTimeout(timer.value);
  visible.value = true;
  emit('mEnter');
}
/*
 * 版本号的鼠标移出事件
 * -隐藏表格
 * */
function versionLeave() {
  timer.value = setTimeout(() => {
    visible.value = false;
  }, 300);
}
/*
 * 计算right
 * */
function computedRight() {
  nextTick(() => {
    right.value = -boxWrapRef.value.clientWidth - 10 + 'px';
  });
}
/*
 * 下载psd文件
 * */
function handlerDown() {
  let url = '/base-web/CMProductTemplateConfigDesignAct/downLoad.act';
  downloadImg(url, {
    downUrl: config.value.factoryProductionDocuments,
    templateId: $app.value.activeTemplate.detail.seqId,
  });
}
</script>

<style scoped lang="less">
.recommend-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  position: relative;
}
.icon {
  font-size: 25px;
  color: var(--fn-primary-color);
}
.prod-popover {
  padding: 7px;
}
.box-wrap {
  min-width: 180px;
  position: absolute;
  z-index: 11;
  right: -220px;
  top: -9px;
  background: #fff;
  padding: 9px;
  border: 1px solid #ccc;
  border-radius: 5px;
  line-height: 27px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);

  font-size: 14px;
  font-weight: normal;
}
</style>
