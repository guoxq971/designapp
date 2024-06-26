<!--文字-->
<template>
  <div class="qsb-wrap-bd">
    <div class="qsb-wrap">
      <!--操作区域-->
      <div class="handle-wrap">
        <div class="handle-wrap-top">
          <el-button @click="onAddText" class="btn" type="primary">新增文字</el-button>
          <!--字号-->
          <el-select style="width: 80px" v-model="param.fontSize" @change="onEditText">
            <el-option v-for="item in fontSizeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>

          <!--加粗-->
          <div v-title="showHotkeyLabel(36)" class="btn-2" :class="{ active: param.fontWeight === 'bold' }" @click="onFontWeight">
            <iconpark-icon name="text-bold-6fh2oci5" size="19" />
          </div>

          <!--斜体-->
          <div v-title="showHotkeyLabel(37)" class="btn-2" :class="{ active: param.fontItalic === 'italic' }" @click="onFontItalic">
            <iconpark-icon name="text-italic-6fh2p3ep" size="19" />
          </div>

          <!--下划线-->
          <div v-title="showHotkeyLabel(38)" class="btn-2" :class="{ active: param.textDecoration === 'underline' }" @click="onFontUnderline">
            <iconpark-icon name="text-underline" size="19" />
          </div>

          <!--字体-->
          <!--          <el-dropdown placement="bottom">-->
          <!--            <div v-title="'字体'" class="btn-2" :class="{ active: param.fontFamily !== 'sans-serif' }">-->
          <!--              <svg style="font-size: 20px" viewBox="64 64 896 896" data-icon="font-size" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" class="">-->
          <!--                <path-->
          <!--                  d="M920 416H616c-4.4 0-8 3.6-8 8v112c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-56h60v320h-46c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h164c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8h-46V480h60v56c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V424c0-4.4-3.6-8-8-8zM656 296V168c0-4.4-3.6-8-8-8H104c-4.4 0-8 3.6-8 8v128c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-64h168v560h-92c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h264c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-92V232h168v64c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8z"-->
          <!--                ></path>-->
          <!--              </svg>-->
          <!--            </div>-->
          <!--            <el-dropdown-menu slot="dropdown">-->
          <!--              <el-dropdown-item-->
          <!--                v-for="item in fontFamilyList"-->
          <!--                :style="{-->
          <!--                  backgroundColor: item.value === param.fontFamily ? '#ecf5ff' : '',-->
          <!--                  color: item.value === param.fontFamily ? '#66b1ff' : '',-->
          <!--                }"-->
          <!--                :key="item.value"-->
          <!--                @click.native="onFontFontFamily(item)"-->
          <!--              >-->
          <!--                <span :style="{ fontFamily: item.value }" style="font-size: 18px">-->
          <!--                  {{ item.label }}-->
          <!--                </span>-->
          <!--              </el-dropdown-item>-->
          <!--            </el-dropdown-menu>-->
          <!--          </el-dropdown>-->
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
        <div style="width: 32px; height: 32px; padding-right: 10px; border-radius: 4px; margin-right: 10px" class="bd-shadow" :style="{ background: param.fontColor }"></div>
        <!--双向绑定值input-->
        <el-input v-model="param.fontColor" style="width: 90px; margin-right: 10px" @input="colorInput" />
        <!--拾色器-->
        <colorPickerButton />
      </div>
    </div>
  </div>
</template>

<script>
import { Sketch } from 'vue-color';
import title from '@/designApplication/core/utils/directives/title/title';
import { fontFamilyList, presetColors, textParam } from '@/designApplication/components/layout/leftTabs/textTabs/text/util';
import { mapState } from 'vuex';
import { queue_define } from '@/designApplication/core/utils/useQueue';
import { getView } from '@/designApplication/components/layout/prodWorkspace/utils/common';
import { canvasDefine } from '@/designApplication/core/canvas/define';
import { addLog } from '@/designApplication/store/prod';
import { HotkeysUtil } from '@/designApplication/core/utils/hotkeys';
import colorPickerButton from '@/designApplication/components/layout/colorPickerButton.vue';
import fontWrap from '../text/fontWrap.vue';

export default {
  directives: { title },
  components: {
    'sketch-picker': Sketch,
    colorPickerButton,
    fontWrap,
  },
  data() {
    return {
      textKonva: false,
      param: { ...textParam },
      fontFamilyList: fontFamilyList,
      fontSizeList: [
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
      ],
      fontWeightList: [
        { label: '正常', value: 'normal' },
        { label: '加粗', value: 'bold' },
      ],
      fontItalicList: [
        { label: '正常', value: 'normal' },
        { label: '斜体', value: 'italic' },
      ],
      textDecorationList: [
        { label: '无', value: 'none' },
        { label: '下划线', value: 'underline' },
      ],
      presetColors,
    };
  },
  computed: {
    showHotkeyLabel() {
      return (key) => {
        return HotkeysUtil.getHotkeysByKey(key)?.show_label;
      };
    },
    ...mapState({
      handlerKey: (state) => state.designApplication.handlerKey,
    }),
    activeImage() {
      const view = getView();
      return view?.imageList.find((e) => e.isActive);
    },
  },
  watch: {
    /**
     * 字体发生改变, 如果有选中的文字, 则修改对应文字节点信息
     */
    'param.text': {
      handler() {
        if (this.textKonva) {
          this.onEditText();
        }
      },
      immediate: true,
    },
    activeImage(image) {
      // 当前选中的是文字
      if (image && image.type === canvasDefine.text) {
        this.textKonva = image;
        // 重置参数为当前选中的文字的参数
        Object.keys(this.param).forEach((key) => (this.param[key] = image[key]));
      } else {
        this.textKonva = null;
      }
    },
    // 操作记录 - 为了处理快捷键设置字体样式
    handlerKey(val) {
      if (val) {
        if (this.activeImage && this.activeImage.type === canvasDefine.text) {
          // 重置参数为当前选中的文字的参数
          Object.keys(this.param).forEach((key) => (this.param[key] = this.activeImage[key]));
        }
      }
    },
  },
  methods: {
    /** * 文字-字体 */
    onFontFontFamily(item) {
      this.param.fontFamily = item.value;
      if (this.textKonva) this.onEditText();
    },
    /** * 文字-下划线 */
    onFontUnderline() {
      this.param.textDecoration = this.param.textDecoration === 'underline' ? 'normal' : 'underline';
      if (this.textKonva) this.onEditText();
    },
    /** * 文字-斜体 */
    onFontItalic() {
      this.param.fontItalic = this.param.fontItalic === 'italic' ? 'normal' : 'italic';
      if (this.textKonva) this.onEditText();
    },
    /** * 文字 加粗 */
    onFontWeight() {
      this.param.fontWeight = this.param.fontWeight === 'bold' ? 'normal' : 'bold';
      if (this.textKonva) this.onEditText();
    },
    /**
     * 修改文字 - 在已选择的文字上修改
     */
    onEditText() {
      if (this.textKonva) {
        const view = getView();
        view.updateImageList.push({
          uuid: this.textKonva.uuid,
          type: queue_define.edit_text,
          param: this.param,
          after: () => addLog({ view: view }),
        });
      }
    },
    /** * 添加文字 * */
    async onAddText() {
      if (!this.param.text) {
        this.$message.warning('请输入文字');
        return;
      }
      const view = getView();
      if (!view) {
        this.$message.warning('请先选择视图');
        return;
      }
      view.updateImageList.push({
        type: queue_define.create_text,
        param: this.param,
        after: () => addLog({ view: view }),
      });
    },
    /**
     * 颜色改变
     */
    colorInput(val) {
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
      this.param.fontColor = color;

      this.onEditText();
    },
  },
};
</script>

<style lang="less" scoped>
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
  color: #409eff !important;
  border-color: #c6e2ff !important;
  background-color: #ecf5ff !important;
}
// 取色器--end
// 操作区域
.handle-wrap {
  margin-bottom: 10px;
  .handle-wrap-top {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    .btn {
      margin-right: 5px;
    }
    .btn-2 {
      transition: all 0.3s;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid #eee;
      padding: 3px 4px;
      border-radius: 4px;
      margin-left: 5px;
      &:hover {
        border: 1px solid #4087ff;
      }
    }
    .sel {
      width: 100px;
    }
  }
}
.bd-shadow {
  box-shadow: 0 2px 4px #0000001f, 0 0 6px #0000000a;
}
.qsb-wrap-bd {
  height: 650px;
}
//取色板--start
.qsb-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 8px 10px 10px 10px;

  :deep(.vc-sketch) {
    width: calc(100% - 20px);
    display: flex;
    flex-direction: column;
    padding-top: 0;
    padding-bottom: 40px;
    // 取色区域盘
    .vc-sketch-saturation-wrap {
      height: 150px;
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
        //width: 32px;
        //height: 32px;
        width: 9%;
        height: 0;
        padding-bottom: 9%;
        margin: 0 12.5px 10px 0;
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
    bottom: 15px;
    position: absolute;
    padding-left: 10px;
  }
}
//取色板--end
</style>
