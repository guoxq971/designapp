<!--图层编辑-->
<template>
  <el-dialog :title="title" v-drag :visible.sync="show" :close-on-click-modal="false" width="30%" top="5vh">
    <el-row class="dialog-bd">
      <el-skeleton v-if="!isShow" />
      <el-form v-else label-width="80px">
        <el-form-item label="图片主题:">
          <el-input v-model="detail.imageSjsTitle"></el-input>
        </el-form-item>
        <el-form-item label="图片名称:">
          <el-input v-model="detail.imageName"></el-input>
        </el-form-item>
        <el-form-item label="图片标签:">
          <el-input type="textarea" :rows="4" v-model="detail.imageTag"></el-input>
        </el-form-item>
      </el-form>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button @click="emit('update:show', false)">关 闭</el-button>
      <el-button type="primary" @click="handlerSave" :loading="loading">确认</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue';
import { GRequest, METHOD } from '@/utils/request';
import { Message } from 'element-ui';

const emit = defineEmits(['update:show']);
const props = defineProps({
  show: { type: Boolean, default: false },
  seqId: { type: String, default: '' },
});

onMounted(() => {
  getDetail();
});

// 提交参数
class SubmitTye {
  constructor(param) {
    this.id = param.seqId;
    this.imageName = param.imageName;
    this.imageSjsTitle = param.imageSjsTitle;
    this.tags = param.imageTag;
    this.maintype = param.isBackground;
    this.basetype = param.basetype;
    this.nexttype = param.nexttype;
  }
}

const isShow = ref(false);
//加载状态
const loading = ref(false);
//标题
const title = ref('图层编辑');
//当前场景 add=新增 edit=编辑 detail=详情
const type = ref('');
//接口获取的detail
const detail = ref({});
//开关
const btn = ref(false);

/*
 * 获取详情
 * */
async function getDetail() {
  let res = await GRequest(`/base-web/CMDesignImageAct/selectBySeqId.act`, METHOD.GET, { seqId: props.seqId });
  if (res.data.retState !== '0') {
    emit('update:show', false);
    return;
  }
  detail.value = res.data.data;
  isShow.value = true;
}
//保存
async function handlerSave() {
  try {
    loading.value = true;
    let res = await GRequest(`/base-web/CMDesignImageAct/updataDeignImage.act`, METHOD.POST, new SubmitTye(detail.value));
    if (res.data.retState !== '0') return;
    Message.success('操作成功');
    emit('update:show', false);
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="less" scoped></style>
