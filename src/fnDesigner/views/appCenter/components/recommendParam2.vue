<!--推荐参数-->
<template>
  <div class="recommend-container">
    <span class="icon el-icon-warning" @mouseenter="boxEnter()" @mouseleave="boxLeave()" />
    <transition name="el-fade-in-linear">
      <div v-show="visibleRecommend" ref="box-wrap" class="box-wrap" @mouseenter="boxEnter" @mouseleave="boxLeave" :style="{ right: right }">
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

<script>
import { designStoreToRefs } from '@/designClass/store';

const $app = designStoreToRefs();
class ConfigDesign {
  //推荐dpi 主要用于设计器
  recommendDpi = '';
  //推荐宽 主要用于设计器
  recommendWidth = '';
  //推荐高 主要用于设计器
  recommendHeight = '';
  //工厂生产版 文件路径
  factoryProductionDocuments = '';
  // 文件名称
  fileName = '';
  constructor(obj) {
    if (obj) {
      this.recommendDpi = obj.recommendDpi;
      this.recommendWidth = obj.recommendWidth;
      this.recommendHeight = obj.recommendHeight;
      this.factoryProductionDocuments = obj.factoryProductionDocuments;
      this.fileName = obj.fileName || '';
    }
  }
}

export default {
  name: 'recommendParam',
  props: {
    // 产品详情
    detail: { type: Object, default: () => {} },
    visibleRecommend: { type: Boolean, default: false },
  },
  data() {
    return {
      recommend_timer: null,

      right: '',
      visible: false,
      timer: null,
    };
  },
  watch: {
    'detail.templateNo': {
      immediate: true,
      handler(val) {
        this.computedRight();
      },
    },
    visibleRecommend: {
      immediate: true,
      handler(val) {
        if (val) {
          this.computedRight();
        }
      },
    },
  },
  computed: {
    /*
     * 参数
     * */
    config() {
      return new ConfigDesign(this.detail?.configDesign);
    },
    // 推荐尺码
    size() {
      let config = this.config;
      let size,
        width = 0,
        height = 0;
      if (config.recommendWidth) width = config.recommendWidth;
      if (config.recommendWidth) height = config.recommendHeight;
      if (width || height) {
        size = `${width}*${height}px`;
      } else {
        size = '暂无数据';
      }
      return size;
    },
    // 推荐dpi
    dpi() {
      let config = this.config;
      let dpi;
      if (config.recommendDpi) dpi = config.recommendDpi;
      if (dpi) {
        dpi = `${dpi}像素/英寸`;
      } else {
        dpi = '暂无数据';
      }
      return dpi;
    },
    // 推荐psd
    psd() {
      let config = this.config;
      let psd;
      if (config.factoryProductionDocuments) psd = config.factoryProductionDocuments;
      if (psd) {
        psd = `${psd}`;
      } else {
        psd = '暂无数据';
      }
      return psd;
    },
    // 是否有psd
    isPsd() {
      let config = this.config;
      return !!config.factoryProductionDocuments;
    },
  },
  methods: {
    /**
     * 弹窗的移入事件
     * */
    boxEnter() {
      clearTimeout(this.recommend_timer);
      $app.value.RecommendVisible = true;
    },
    /**
     * 弹窗的移出事件
     * */
    boxLeave() {
      this.recommend_timer = setTimeout(() => {
        $app.value.RecommendVisible = false;
      }, 300);
    },
    /*
     * 表格的鼠标移入事件
     * -持续展示表格和推荐弹窗
     * */
    tableEnter() {
      clearTimeout(this.timer);
      this.visible = true;
      this.$emit('mEnter');
    },
    /*
     * 表格的鼠标移出事件
     * -隐藏表格
     * */
    tableLeave() {
      this.timer = setTimeout(() => {
        this.visible = false;
      }, 300);
      this.$emit('mLeave', 200);
    },
    /*
     * 版本号的鼠标移入事件
     * -展示表格
     * */
    versionEnter() {
      clearTimeout(this.timer);
      this.visible = true;
      this.$emit('mEnter');
    },
    /*
     * 版本号的鼠标移出事件
     * -隐藏表格
     * */
    versionLeave() {
      this.timer = setTimeout(() => {
        this.visible = false;
      }, 300);
    },
    /*
     * 计算right
     * */
    computedRight() {
      this.$nextTick(() => {
        this.right = -this.$refs['box-wrap'].clientWidth - 10 + 'px';
      });
    },
    /*
     * 下载psd文件
     * */
    handlerDown() {
      let config = this.config;
      let url = '/base-web/CMProductTemplateConfigDesignAct/downLoad.act';
      if (!this.$downloadImg) {
        this.$message.warning('下载失败');
        return;
      }
      this.$downloadImg(url, {
        downUrl: config.factoryProductionDocuments,
        templateId: this.detail.seqId,
      });
    },
  },
};
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
