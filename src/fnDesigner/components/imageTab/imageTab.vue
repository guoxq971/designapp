<template>
  <div class="tab-container">
    <!--批量上传主题/背景图-->
    <mulSetImg ref="mulSetImgRef" :getList="() => onSearch()" />
    <!--右键菜单-->
    <Contextmen :item-list="menuItemList" :visible.sync="da.menuVisible" />

    <!--条件-->
    <div class="header-tab" v-if="isNeedHeader">
      <div class="line-wrap">
        <!--输入框-->
        <el-input class="ipt-wrap" placeholder="请输入图片标题/编号" v-model="params.query" @keyup.enter.native="onSearch">
          <el-button slot="append" icon="el-icon-search" :loading="loading" @click="onSearch" />
        </el-input>
        <div class="other-wrap" :style="styleOther">
          <!--筛选-->
          <el-popover placement="bottom" width="550" trigger="click">
            <filterPop :param="params" :get-list="getList" />
            <el-button class="sx-btn" slot="reference" style="height: 100%">
              <span>筛选</span>
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
          </el-popover>
          <!--上传图片-->
          <el-button v-if="isNeedUpload" @click="onUploadPic" type="primary">上传图片</el-button>
          <!--分类-->
          <imageCategory v-if="isNeedCategory" :on-search="onSearch" :one.sync="params.basetype" :two.sync="params.nexttype" />
        </div>
      </div>

      <!--请选择图片来源-->
      <div class="line-wrap" v-if="isNeedAccountList">
        <el-select placeholder="请选择图片来源" @change="onSearch" v-model="params.customerId" class="fn-full">
          <el-option v-for="item in accountList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
    </div>

    <!--列表-->
    <div class="list-tab" v-loading="loading">
      <div @click="onClick(item)" @contextmenu="(e) => onContextmenu(e, item)" @mouseleave="mouseleave(item)" @mouseenter="mouseenter(item)" v-for="item in list" :key="item.seqId" class="item-list">
        <corner v-if="da.isCollectImage(item)" />
        <img :src="getShowImage(item)" class="fn-full" />
      </div>
    </div>

    <!--分页-->
    <el-pagination
      v-if="isNeedFooter"
      class="footer-tab"
      :pager-count="5"
      @current-change="onChange"
      @size-change="onChange"
      :current-page.sync="params.pageNum"
      :page-size="params.pageSize"
      :total="total"
      layout="prev, pager, next, jumper"
    />
  </div>
</template>

<script setup>
import { defineExpose, defineEmits, defineProps, onMounted, ref, computed } from 'vue';
import { GRequest, METHOD } from '@/utils/request';
import { useGetAccountList } from '@/fnDesigner/js/getAccountList';
import { EXCLUSIVE_VALUE } from '@/fnDesigner/config/common';
import { Message } from 'element-ui';
import FilterPop from '@/fnDesigner/components/imageTab/filterPop.vue';
import Contextmen from '@/fnDesigner/components/contextmen.vue';
import Corner from '@/fnDesigner/components/corner.vue';
import imageCategory from '@/fnDesigner/components/imageTab/imageCategory.vue';
import { designStoreToRefs } from '@/designClass/store';
import { encodeUrl } from '@/fnDesigner/js/common';
import mulSetImg from '@/fnComponents/mulSetImg';

defineExpose({ getList });
const emit = defineEmits(['success']);
const props = defineProps({
  api: { type: Function, default: () => {} },
  isNeedHeader: { type: Boolean, default: true },
  isNeedFooter: { type: Boolean, default: true },
  isNeedAccountList: { type: Boolean, default: true },
  isNeedUpload: { type: Boolean, default: true },
  isNeedCategory: { type: Boolean, default: false },
});

const styleOther = computed(() => {
  return [props.isNeedUpload, props.isNeedCategory].filter((e) => e).length === 0 ? { flex: 0 } : {};
});
const da = designStoreToRefs();

// 上传图片
const mulSetImgRef = ref(null);
function onUploadPic() {
  mulSetImgRef.value.init({ type: 'mulSetMainImg', teamTree: [] });
}

// 右键菜单
const menuItemList = [{ key: '1', icon: 'el-icon-caret-left', text: '', fn: null }];
function onContextmenu(e, data) {
  e.preventDefault();
  // 注册收藏的事件
  const item = menuItemList[0];
  item.text = da.value.getCollectImageFn(data) ? '取消收藏设计图' : '收藏设计图';
  item.fn = () => da.value.collectImage(data);

  // 打开弹窗
  da.value.menuVisible = true;
}

// 鼠标进入
function mouseenter(item) {
  clearTimeout(da.value.hoverTimer);
  if (item && (item.id || item.seqId)) da.value.hoverImageDetail = item;
}
// 鼠标离开
function mouseleave(item) {
  da.value.hoverTimer = setTimeout(() => (da.value.hoverImageDetail = null), 300);
}

onMounted(() => {
  onSearch();
});

// 获取图片展示
const getShowImage = (item) => {
  // 判断 item.designImg 是否 http 开头
  if (item.designImg && item.designImg.startsWith('http')) {
    return item.designImg;
  } else {
    return process.env.VUE_APP_API_BASE_IMG_URL + item.designImg;
  }
};

function onClick(item) {
  if (item.isBg) {
    da.value.activeView.addDesignBackgroundImage(item);
  } else {
    da.value.activeView.addDesignImage(item);
  }
}

// 列表
const LIST_COUNT = 4 * 8;
const loading = ref(false);
const list = ref([]);
const total = ref(0);
const params = ref({
  query: '', //标题、编号
  typeId: '', //【请选择图片来源-专属共享类】所有图案
  customerId: '', //【请选择图片来源-非专属共享类】子账号 (-1=专享共享图)

  limit: LIST_COUNT,
  offset: 0,

  total: 0,
  pageNum: 1,
  pageSize: LIST_COUNT,

  mediaType: 'json',
  gxtype1: '', //共享类-一级下拉
  gxtype2: '', //共享类-二级下拉
  basetype: '', //平台图库-一级下拉
  nexttype: '', //平台图库-二级下拉
  gxsx: 0, //共享类-筛选未使用的共享类 0-不筛选 1-筛选
  templateNo: '',
  orderImg: '',
  gxcopyright: '', //共享类-是否侵权 ''-全部 1-是 0-否 2-漂白
  gxImgQuality: '', //共享类-图片质量 0-未分类 1-精品 2-良
  gxSearchText: '',
  designerId: '', //插画师  -1全部 1无风险 2微风险 3较风险 4高风险
  tort_type: -1, //风险等级   -1全部 1无风险 2微风险 3较风险 4高风险
  isAll: '', //是否全幅 ''-全部 1-是 0-否
  copyright: '', //是否侵权 ''-全部 1-是 0-否 2-漂白
  quality: '', //图片质量 0-未分类 1-精品 2-良
  imageType: '', //图片格式 -1全部
  'qty[from]': '', //出单次数开始
  'qty[to]': '', //出单次数开始
  'width[from]': '', //宽度范围开始
  'width[to]': '', //宽度范围结束
  'height[from]': '', //高度范围开始
  'height[to]': '', //高度范围结束
  'created[from]': '', //上传时间范围开始
  'created[to]': '', //上传时间范围开始
  'modified[from]': '', //最近修改时间范围开始
  'modified[to]': '', //最近修改时间范围开始
});
async function getList() {
  try {
    loading.value = true;

    const param = { ...params.value };

    // 分页处理
    param.offset = (params.value.pageNum - 1) * params.value.pageSize || 0;
    param.limit = params.value.pageSize;

    // 专享共享类处理
    let isExclusive = false;
    let typeId = param.typeId;
    let customerId = param.customerId;
    if (param.customerId === EXCLUSIVE_VALUE && param.customerId !== '') {
      isExclusive = true;
      typeId = param.customerId;
      customerId = '';
    }
    param.typeId = typeId;
    param.customerId = customerId;

    let res2;
    // 专享共享类列表
    if (isExclusive) {
      res2 = await GRequest(`/base-web/CMDesignImageAct/getTopicDesignerShareList.act${encodeUrl(param)}`, METHOD.GET, '', { timeout: 60 * 1000 });
    }
    // 正常设计图列表
    else {
      // res2 = await GRequest(`/base-web/CMDesignImageAct/getDesignImageList.act${encodeUrl(param)}`, METHOD.GET, '', { timeout: 60 * 1000 });
      res2 = await props.api(params.value);
    }
    if (res2.data.retState !== '0') {
      Message.warning('获取设计图列表失败');
      return Promise.reject('获取设计图列表失败');
    }

    list.value = res2.data.designs || res2.data.list;
    total.value = res2.data.count;
    emit('success', list.value);
  } finally {
    loading.value = false;
  }
}
const onSearch = () => {
  params.value.pageNum = 1;
  getList();
};

// 账号列表
const { list: accountList } = useGetAccountList({ params: params });

// 分类
const category = ref({
  selected: [],
  options: [],
});
const getListByCategory = () => {};

// 分页
const onChange = () => {
  getList();
};
</script>

<style lang="less">
@import url('/src/fnDesigner/css/common.less');
</style>
<style scoped lang="less">
@import url('/src/fnDesigner/css/tab.less');
</style>
