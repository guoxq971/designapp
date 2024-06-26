<template>
  <div class="tab-container">
    <!--右键菜单-->
    <Contextmen :item-list="menuItemList" :visible.sync="da.menuVisible" />

    <!--条件-->
    <div class="header-tab">
      <div class="line-wrap">
        <el-input class="ipt-wrap" placeholder="请输入名称/编号" v-model="params.tempalteNoOrName" @keyup.enter.native="onSearch">
          <el-button slot="append" icon="el-icon-search" :loading="loading" @click="onSearch" />
        </el-input>
        <div class="other-wrap">
          <el-cascader
            class="classify-wrap"
            filterable
            placeholder="分类"
            popper-class="pc-sel-area-cascader"
            v-model="category.selected"
            :options="category.options"
            :props="{ checkStrictly: true }"
            @change="getListByCategory"
            clearable
          />
        </div>
      </div>
    </div>

    <!--列表-->
    <div class="list-tab" v-loading="loading">
      <div
        @click="onClick(item)"
        @contextmenu="(e) => onContextmenu(e, item)"
        @mouseleave="mouseleave(item)"
        @mouseenter="mouseenter(item)"
        v-for="item in list"
        :key="item.seqId"
        class="item-list"
        :class="{ active: da.activeTemplateId === item.seqId }"
      >
        <corner v-if="da.isCollectTemplate(item)" />
        <imgTrack :url1="getShowImage(item).image" :url2="getShowImage(item).texture" />
      </div>
    </div>

    <!--分页-->
    <el-pagination
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
import { defineProps, defineEmits, defineExpose, onMounted, ref } from 'vue';
import imgTrack from '@/components/imgTrack/index.vue';
import corner from '@/fnDesigner/components/corner.vue';
import Contextmen from '@/fnDesigner/components/contextmen.vue';
import { Message, MessageBox } from 'element-ui';
import { GRequest, METHOD } from '@/utils/request';
import { getShowImage } from '@/fnDesigner/js/getProductInfoHelp';
import { designStoreToRefs } from '@/designClass/store';
const da = designStoreToRefs();

defineExpose({
  getList,
});
const emit = defineEmits(['success']);
const props = defineProps({
  api: { type: Function, default: () => {} },
  isSetProd: { type: Boolean, default: false },
});

// 右键菜单
const menuItemList = [{ key: '1', icon: 'el-icon-caret-left', text: '', fn: null }];
function onContextmenu(e, data) {
  e.preventDefault();
  // 注册收藏的事件
  const item = menuItemList[0];
  item.text = da.value.isCollectTemplate(data) ? '取消收藏产品' : '收藏产品';
  item.fn = async () => {
    const result = da.value.isCollectTemplate(data);
    if (result) {
      await MessageBox.confirm('确定取消收藏该产品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      // 取消收藏
      await GRequest(`/base-web/cm/cmProductTemplateCollect/delete/${data?.collectId}`, METHOD.POST);
    } else {
      // 收藏产品
      await GRequest(`/base-web/cm/cmProductTemplateCollect/save`, METHOD.POST, { templateId: data.seqId });
    }
    Message.success('操作成功');

    // 重新获取收藏列表
    da.value.getCollectTemplateList();
  };

  // 打开弹窗
  da.value.menuVisible = true;
}

// 鼠标进入
function mouseenter(item) {
  clearTimeout(da.value.hoverTimer);
  if (item && item.seqId) da.value.hoverTemplateDetail = item;
}
// 鼠标离开
function mouseleave(item) {
  da.value.hoverTimer = setTimeout(() => (da.value.hoverTemplateDetail = null), 300);
}

onMounted(() => {
  getList();
});

function onClick(item) {
  da.value.setTemplate(item);
}

// 列表
const loading = ref(false);
const list = ref([]);
const total = ref(0);
const params = ref({
  tempalteNoOrName: '',
  pageNum: 1,
  pageSize: 24,
});
function getList() {
  loading.value = true;
  props
    .api(params)
    .then((res) => {
      if (res.data.retState !== '0') return;
      list.value = res.data.productTypes;
      total.value = res.data.count;

      // 默认选中第一个
      if (props.isSetProd && list.value.length && !da.value.activeTemplate) {
        da.value.setTemplate(list.value[0]);
      }
      emit('success', list.value);
    })
    .finally(() => {
      loading.value = false;
    });
}
const onSearch = () => {
  params.value.pageNum = 1;
  getList();
};

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
