<template>
  <div class="tab-container">
    <div class="qsb-wrap-bd">
      <div class="qsb-wrap">
        <!--操作区域-->
        <div class="handle-wrap">
          <div class="handle-wrap-top">
            <el-button @click="onAddText" class="btn" type="primary">新增文字</el-button>
            <!--字号-->
            <el-select style="width: 8.0rem" v-model="param.fontSize" @change="onEditText">
              <el-option v-for="item in fontSizeList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>

            <!--加粗-->
            <div class="btn-2" :class="{ active: param.fontWeight === 'bold' }" @click="onFontWeight">
              <iconpark-icon name="text-bold-6fh2oci5" size="28" />
            </div>

            <!--斜体-->
            <div class="btn-2" :class="{ active: param.fontItalic === 'italic' }" @click="onFontItalic">
              <iconpark-icon name="text-italic-6fh2p3ep" size="28" />
            </div>

            <!--下划线-->
            <div class="btn-2" :class="{ active: param.textDecoration === 'underline' }" @click="onFontUnderline">
              <iconpark-icon name="text-underline" size="28" />
            </div>
          </div>

          <!--字体-->
          <fontWrap :fontPath.sync="param.fontPath" :fontFamily.sync="param.fontFamily" @changeFont="onEditText" />

          <!--输入文字-->
          <el-input v-model="param.text" type="textarea" :rows="5" placeholder="请在这里输入文字" @input="onEditText()" :style="{ fontFamily: param.fontFamily }" />
        </div>

        <!--色盘-->
        <sketch-picker :value="param.fontColor" @input="colorInput" :presetColors="presetColors" />

        <!--自定义栏-->
        <div class="costom-wrap">
          <!--色块-->
          <div style="width: 3.2rem; height: 3.2rem; padding-right: 1.0rem; border-radius: .4rem; margin-right: 1.0rem" class="bd-shadow" :style="{ background: param.fontColor }"></div>
          <!--双向绑定值input-->
          <el-input v-model="param.fontColor" style="width: 9.0rem; margin-right: 1.0rem" @input="colorInput" />
          <!--拾色器-->
          <!--<colorPickerButton />-->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import title from '@/fnDesigner/directives/title/title';
export default {
  directives: { title },
};
</script>
<script setup>
import fontWrap from '@/fnDesigner/views/leftTabs/text/text/fontWrap.vue';
import { Sketch as sketchPicker } from 'vue-color';
import { ref, watch } from 'vue';
import { PRESET_COLORS } from '@/fnDesigner/config/common';
import { getTextParamByNode } from '@/fnDesigner/js/text';
import { designStoreToRefs } from '@/designClass/store';
import { DESIGN_TYPE } from '@/designClass/core/define';
const textKonva = ref(null);
const param = ref({
  fnUuid: '',
  text: '',
  fontColor: '#000',
  fontSize: 20,
  fontPath: '', //字体路径
  fontFamily: 'sans-serif', //'微软雅黑',
  fontWeight: 'normal', //normal,bold
  fontItalic: 'normal', //normal,italic
  textDecoration: 'none', //none,underline
  textAlign: 'left', //left,center,right
  lineHeight: 1, //字体行高
  letterSpacing: 0, //字体间距
});
const fontFamilyList = [];
const fontSizeList = [
  { label: '12', value: 12 },
  { label: '14', value: 14 },
  { label: '16', value: 16 },
  { label: '18', value: 18 },
  { label: '20', value: 20 },
  { label: '22', value: 22 },
  { label: '24', value: 24 },
  { label: '26', value: 26 },
  { label: '28', value: 28 },
  { label: '30', value: 30 },
];
const fontWeightList = [
  { label: '正常', value: 'normal' },
  { label: '加粗', value: 'bold' },
];
const fontItalicList = [
  { label: '正常', value: 'normal' },
  { label: '斜体', value: 'italic' },
];
const textDecorationList = [
  { label: '无', value: 'none' },
  { label: '下划线', value: 'underline' },
];
const presetColors = PRESET_COLORS;

const $app = designStoreToRefs();

// 如果当前激活的节点是文字
watch(
  () => $app.value.activeView?.activeDesignId,
  (val) => {
    let kNode = null;
    if (val) {
      const node = $app.value.activeView.canvas.designList.find((e) => e.attrs.fnUuid === val);
      if (node?.attrs.type === DESIGN_TYPE.text) {
        param.value = getTextParamByNode(node);
        kNode = node;
      }
    } else {
      param.value.fnUuid = '';
    }
    textKonva.value = kNode;
  },
);

// 新增字体
function onAddText() {
  $app.value.activeView.addDesignText(param.value);
}
// 粗体
function onFontWeight() {
  param.value.fontWeight = param.value.fontWeight === 'bold' ? 'normal' : 'bold';
  if (textKonva.value) onEditText();
}
// 斜体
function onFontItalic() {
  param.value.fontItalic = param.value.fontItalic === 'italic' ? 'normal' : 'italic';
  if (textKonva.value) onEditText();
}
// 下划线
function onFontUnderline() {
  param.value.textDecoration = param.value.textDecoration === 'underline' ? 'normal' : 'underline';
  if (textKonva.value) onEditText();
}
// 修改字体
function onEditText() {
  if (textKonva.value) {
    $app.value.activeView.addDesignText({ ...param.value, fnUuid: textKonva.value.attrs.fnUuid });
  }
}
// 字体颜色
function colorInput(val) {
  let color = '';

  if (typeof val === 'object') {
    // 取色器
    color = val.hex8;
  } else if (typeof val === 'string') {
    // input
    color = val;
  }

  color = color.replace(/#/g, '');
  // color取前6位
  color = '#' + color.substring(0, 6);
  if (color === '#') color = '';
  param.value.fontColor = color;

  onEditText();
}
</script>

<style scoped lang="less">
@import url('/src/fnDesigner/css/tab.less');
// 取色器--start
// 隐藏取色器的透明度拖拽条
:deep(.vc-sketch-alpha-wrap) {
  display: none;
}
// 隐藏透明度选项
:deep(.vc-sketch-presets) {
  //.vc-sketch-presets-color:nth-last-child(1) {
  //  display: none;
  //}
}
// 隐藏透明度A
:deep(.vc-sketch-field) {
  .vc-sketch-field--double:nth-last-child(1) {
    display: none;
  }
}
.active {
  color: var(--fn-primary-color) !important;
  border-color: #c6e2ff !important;
  background-color: #ecf5ff !important;
}
// 取色器--end
// 操作区域
.handle-wrap {
  margin-bottom: 1rem;
  .handle-wrap-top {
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    .btn {
      margin-right: 0.5rem;
    }
    .btn-2 {
      transition: all 0.3s;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 0.1rem solid #eee;
      padding: 0.3rem 0.4rem;
      border-radius: 0.4rem;
      margin-left: 0.5rem;
      &:hover {
        border: 0.1rem solid var(--fn-primary-color);
      }
    }
    .sel {
      width: 10rem;
    }
  }
}
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
  padding: 0.8rem 1rem 1rem 1rem;

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
