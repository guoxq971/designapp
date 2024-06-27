<!--查看详情-->
<template>
  <el-dialog :title="title" v-if="btn" v-drag :visible.sync="btn" :close-on-click-modal="false" width="77%" top="5vh">
    <el-row class="dialog-bd">
      <fnTabs :template-id="templateId" />
    </el-row>
  </el-dialog>
</template>

<script>
import fnTabs from './components/tabs.vue';
import { TemplateDescType } from './util';

export default {
  name: 'index',
  components: {
    fnTabs,
  },
  data() {
    return {
      templateId: '',
      activeName: '1',
      // 表格数据
      list: [],
      //加载状态
      loading: false,
      //标题
      title: '',
      //当前场景 add=新增 edit=编辑 detail=详情
      type: '',
      //接口获取的detail
      detail: new TemplateDescType(),
      //开关
      btn: false,
    };
  },
  watch: {
    btn(val) {
      if (!val) {
        this.$reset(this);
        this.$emit('close');
      }
    },
  },
  methods: {
    /*
     * 供外部调用的方法
     * */
    init(param) {
      if (this.btn) {
        this.btn = false;
        return;
      }
      if (param.type === 'detail') {
        /*
         * @param {string} param.data.seqId 主键seqId
         * @param {string} param.data.title 标题
         * */
        this.templateId = param.data.seqId;
        this.title = param.data.title;
        this.btn = true;
        this.$nextTick(() => {
          // const _param = { type: 'detail', data: { seqId: param.data.seqId } };
          // this.$refs.templateTabs.init(_param);
        });
      }
    },
  },
};
</script>

<style lang="less" scoped>
:deep(.el-tabs__nav) {
  width: 100%;
}

//input输入框的disable状态
:deep(.el-input.is-disabled .el-input__inner) {
  color: #000;
}
:deep(.el-dialog__body) {
  padding: 10px 20px 30px 20px;
}
</style>
