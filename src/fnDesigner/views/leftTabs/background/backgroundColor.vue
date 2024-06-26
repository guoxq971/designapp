<!--取色板-->
<template>
  <div class="qsb-wrap-bd">
    <div class="qsb-wrap">
      <!--取色器-->
      <sketch-picker :value="color" @input="colorInput" :presetColors="presetColors" />
      <!--自定义栏-->
      <div class="costom-wrap">
        <!--色块-->
        <div style="width: 3.2rem; height: 3.2rem; padding-right: 1.0rem; border-radius: .4rem; margin-right: 1.0rem" class="bd-shadow" :style="{ background: color }"></div>
        <!--双向绑定值input-->
        <el-input v-model="color" style="width: 9.0rem; margin-right: 1.0rem" @input="colorInput" />
        <!--拾色器-->
        <!--<colorPickerButton />-->
      </div>
    </div>
  </div>
</template>

<script setup>
import { Sketch as sketchPicker } from 'vue-color';
import { ref } from 'vue';
import { designStoreToRefs } from '@/designClass/store';
const presetColors = ['#F51E30', '#F76707', '#F2DE33', '#EAC588', '#FFC0CB', '#0099FF', '#1E9658', '#FFFFFF', '#00224C', '#4C2075', '#C0C0C0', '#665544', '#333333', '#750033', '#07462C', '#000000'];
const color = ref('');
const costomColor = ref(''); //自定义颜色

const $app = designStoreToRefs();

// 颜色发生变化
function colorInput(val) {
  let colorCode = '';
  if (typeof val === 'object') {
    colorCode = val.hex8;
  } else if (typeof val === 'string') {
    colorCode = val;
  }
  colorCode = colorCode.replace(/#/g, '');
  // color取前6位
  colorCode = '#' + colorCode.substring(0, 6);
  if (colorCode === '#') colorCode = '';
  color.value = colorCode;
  // 设置颜色
  $app.value.activeView.addDesignBackgroundColor(color.value);
}
</script>

<style lang="less" scoped>
.bd-shadow {
  box-shadow: 0 0.2rem 0.4rem #0000001f, 0 0 0.6rem #0000000a;
}
.qsb-wrap-bd {
  height: 65rem;
}
//取色板--start
.qsb-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1rem;

  :deep(.vc-sketch) {
    width: calc(100% - 2rem);
    display: flex;
    flex-direction: column;
    padding-top: 0;
    padding-bottom: 5rem;
    // 取色区域盘
    .vc-sketch-saturation-wrap {
      height: 15rem;
      padding-bottom: 0;
      order: 1;
    }

    // rgba区域
    .vc-sketch-field {
      display: none;
      order: 3;
    }

    // 16种取色区域
    .vc-sketch-presets {
      order: 0;

      .vc-sketch-presets-color {
        //width: 3.2rem;
        //height: 3.2rem;
        width: 9%;
        height: 0;
        padding-bottom: 9%;
        margin: 0 1.25rem 1rem 0;
      }
    }

    // 滑块取色
    .vc-sketch-controls {
      order: 2;

      // 方块
      .vc-sketch-color-wrap {
        display: none;
      }
    }
  }

  // 自定义区域
  .costom-wrap {
    display: flex;
    bottom: 1.5rem;
    position: absolute;
    padding-left: 1rem;
  }
}
//取色板--end
</style>
