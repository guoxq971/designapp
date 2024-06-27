<!--历史设计记录-->
<template>
  <transition name="el-fade-in-linear">
    <div class="history-wrap" v-dragPop="{ top: 99, left: 1163 }">
      <!--头部-->
      <div class="header" slot="header">
        <div>
          我最近设计过的产品
          <span @click="getList" class="el-icon-refresh refresh"></span>
        </div>
        <div @click="onClose" class="close el-icon-close"></div>
      </div>

      <!--列表-->
      <div class="body" v-loading="loading">
        <div style="width: 30%;height: 33.3%;margin: 1%;" v-for="item in showList" :key="item.code">
          <!--@click="onSel(item)"-->
          <div class="box-wrap" v-loading="item.loading" @mousedown.stop>
            <!--删除按钮-->
            <el-popover popper-class="history-popover" placement="bottom" width="170" v-model="item.visible">
              <p class="fn-mb-gap-min">是否确认删除该产品？</p>
              <div style="text-align: right; margin: 0">
                <el-button type="text" @click="item.visible = false" class="fn-button-text">取消</el-button>
                <el-button type="primary" @click.stop="onDel(item)" class="fn-button-mini">确定</el-button>
              </div>
              <div slot="reference" class="close el-icon-circle-close" @click.stop />
            </el-popover>

            <div margin="0" class="pic">
              <el-image :src="item.imgUrl" />
            </div>
            <div class="title">{{ item.code }}</div>
          </div>
        </div>

        <!--空盒子-->
        <div style="width: 30%;height: 33.3%;margin: 1%;" v-for="item in 6 - showList.length" :key="item" />
      </div>

      <!--分页-->
      <div class="footer">
        <pageContainer @mousedown.native.stop :param="params" :total="total" />
      </div>
    </div>
  </transition>
</template>

<script>
import dragPop from '@/fnDesigner/directives/drag/drag';
export default {
  directives: { dragPop },
};
</script>
<script setup>
import pageContainer from './page.vue';
import { computed, onMounted, ref } from 'vue';
import { GRequest, METHOD } from '@/utils/request';
import { designStoreToRefs } from '@/designClass/store';
onMounted(() => getList());

const $app = designStoreToRefs();
const historyList = ref([]);
const loading = ref(false);
const params = ref({
  pageNum: 1,
  pageSize: 6,
});
const showList = computed(() => {
  return historyList.value.slice((params.value.pageNum - 1) * params.value.pageSize, params.value.pageNum * params.value.pageSize);
});
const total = computed(() => {
  return historyList.value.length;
});
// 删除历史记录
async function onDel(data) {
  try {
    data.visible = false;
    data.loading = true;
    await GRequest('/base-web/CMProductAmazonAct/updateUserflagBatchBySeqIds.act', METHOD.POST, { seqIds: data.id });
    getList();
  } finally {
    data.loading = false;
  }
}

// 关闭弹窗
function onClose() {
  $app.value.historyVisible = false;
}
/**
 * 获取历史记录列表
 */
function getList() {
  loading.value = true;
  GRequest(`/base-web/CMProductAct/productsHis.act`, METHOD.GET, {})
    .then((res2) => {
      if (res2.data.retState !== '0') {
        return;
      }
      for (let item of res2.data.products) {
        item.loading = false;
        item.visible = false;
      }
      historyList.value = res2.data.products;
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>

<style scoped lang="less">
.fn-button-mini {
  width: 4.8rem;
  height: 2.4rem;
  padding: 0;
  font-size: 1.2rem;
}
.history-wrap {
  width: 35rem;
  position: absolute;
  //top: 0;
  //left: -35.5rem;
  z-index: 10;
  background-color: #fff;
  padding: 0 0.5rem;
  border-radius: 0.5rem;

  :deep(.el-card__header) {
    padding: 0;
  }
  .header {
    padding: 0.7rem 0.8rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.3rem;
    font-weight: bold;
    cursor: default;

    .refresh {
      cursor: pointer;
    }

    .close {
      cursor: pointer;
      font-size: 1.8rem;
      font-weight: bold;
      &:hover {
        color: var(--fn-primary-color);
      }
    }
  }

  .body {
    margin-top: 0.2rem;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;

    .box-wrap {
      transition: all 0.3s;
      border: 0.1rem solid #eee;
      border-radius: 0.4rem;
      overflow: hidden;
      position: relative;
      &:hover {
        border-color: var(--fn-primary-color);
      }

      .close {
        position: absolute;
        right: 0.4rem;
        top: 0.4rem;
        cursor: pointer;
        font-size: 1.6rem;
        z-index: 2;
        color: #333;
        &:hover {
          color: var(--fn-primary-color);
        }
      }

      .pic {
        cursor: pointer;
        user-select: none;
      }

      .title {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 2.1rem;
      }
    }
  }

  .footer {
    height: 3rem;
    //background-color: green;
    margin-top: 0.8rem;
    margin-bottom: 0.5rem;
  }
}
</style>
