<template>
  <div>
    <!--正常-->
    <el-table :data="list" v-if="[PRODUCT_SPECIAL_TYPE_2].includes($app.specialType)">
      <el-table-column align="center" property="num" label="下单件数" />
      <el-table-column align="center" property="price" label="单件价格" width="92">
        <template slot="header">
          单件价格
          <el-tooltip placement="top" :content="tooltip">
            <span class="el-icon-question" />
          </el-tooltip>
        </template>
        <template slot-scope="{ row }">
          <span style="color: var(--fn-primary-color)">￥{{ row.price }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!--尺码 | 颜色-->
    <el-table :data="list" v-if="![PRODUCT_SPECIAL_TYPE_2].includes($app.specialType)">
      <el-table-column align="center" label="">
        <el-table-column align="center" property="num" label="下单件数" />
      </el-table-column>
      <el-table-column align="center" label="单件价格">
        <template slot="header">
          单件价格
          <el-tooltip v-if="[PRODUCT_SPECIAL_TYPE_1].includes($app.specialType)" placement="top" :content="tooltip">
            <span class="el-icon-question" />
          </el-tooltip>
          <el-tooltip v-if="[PRODUCT_SPECIAL_TYPE_0].includes($app.specialType)" placement="top" :content="tooltip">
            <span class="el-icon-question" />
          </el-tooltip>
        </template>
        <el-table-column v-for="(item, index) in headerList" :key="`aa${index}`" align="center" :width="width">
          <template slot="header">
            <span v-if="[PRODUCT_SPECIAL_TYPE_0].includes($app.specialType)" class="fn-red">{{ item.join(' / ') }}</span>
            <div v-if="[PRODUCT_SPECIAL_TYPE_1].includes($app.specialType)" style="display: flex">
              <div :style="{ background: getColor(it) }" class="chunk-wrap" v-for="it in item" :key="it" />
            </div>
          </template>
          <template slot-scope="{ row }">
            <span style="color: #409eff">￥{{ row[item[0]] }}</span>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { PRODUCT_SPECIAL_TYPE_0, PRODUCT_SPECIAL_TYPE_1, PRODUCT_SPECIAL_TYPE_2 } from '@/fnDesigner/config/common';
import { computed, ref } from 'vue';
import { getHeaderObj } from '@/fnDesigner/views/appCenter/components/price/util';
import { designStoreToRefs } from '@/designClass/store';

const $app = designStoreToRefs();

const width = computed(() => {
  let num = 120;
  const maxLen = Math.max(...headerList.value.map((e) => e.length));
  if (maxLen > 3) {
    num += (maxLen - 3) * 24;
  }
  return num;
});

const tooltip = '该价格不含可选工艺、配件';
const headerList = ref([]);
const list = computed(() => {
  // 表头组成
  let headerObj = {};
  // 表格数据
  let result = [];
  if ($app.value.priceList.length === 0) {
    return result;
  }
  // 件数
  const numList = $app.value.priceList[0].list.map((it) => it.num);
  // 尺码/颜色
  const propList = $app.value.priceList.map((e) => e.prop);

  switch ($app.value.specialType) {
    // 颜色 | 尺码
    case PRODUCT_SPECIAL_TYPE_0:
    case PRODUCT_SPECIAL_TYPE_1:
      // 表头
      headerObj = getHeaderObj($app.value.priceList);

      // 件数合并
      for (let num of numList) {
        const obj = { num: num };
        for (let prop of propList) {
          obj[prop] = $app.value.priceList.find((e) => e.prop === prop).list.find((e) => e.num === num).price;
        }
        result.push(obj);
      }

      headerList.value = Object.values(headerObj);
      break;
    // 正常
    case PRODUCT_SPECIAL_TYPE_2:
      result = $app.value.priceList[0].list;
      break;
    default:
      result = [];
      break;
  }

  return result;
});

// 获取颜色
function getColor(color) {
  const result = $app.value.activeTemplate?.appearances.find((e) => e.name === color);
  if (result) {
    return result.colors[0].value;
  }
  return '';
}
</script>

<style scoped lang="less">
.chunk-wrap {
  width: 2rem;
  height: 2rem;
  background: #fff;
  border: 0.1rem solid;
  border-radius: 0.4rem;
  margin-right: 0.4rem;
}
</style>
