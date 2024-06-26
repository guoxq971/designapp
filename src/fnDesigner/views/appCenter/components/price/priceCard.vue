<!--产品控制台 - 价格列表-->
<template>
  <div class="price-wrap" style="pointer-events: all">
    <el-popover popper-class="popver-icon" v-if="!da.priceLoading && da.priceList && da.priceList.length" placement="left" :width="width" trigger="click">
      <!--表格-->
      <priceCardPriceTable :data="da.priceList" :isSpecial="da.specialType" />

      <!--产品毛利-->
      <el-popover placement="bottom" width="905" trigger="click">
        <template slot="reference">
          <!--@click="onClick"-->
          <el-button type="primary" size="mini" class="btn">
            产品毛利
            <span class="el-icon-arrow-down" />
          </el-button>
        </template>

        <!--毛利计算器-->
        <!--<grossProfitCalculator v-if="showCalculator" :detail="c_detail" :isShowDel="false" />-->
      </el-popover>

      <!--icon-->
      <div slot="reference" class="el-icon-question icon"></div>
    </el-popover>

    <div class="text" v-if="!da.priceLoading">
      {{ price }}
    </div>
    <div class="text" v-else>
      <div class="el-icon-loading loading-icon" />
    </div>
    <!--特殊颜色/尺码标识-->
    <div class="warning" v-if="[PRODUCT_SPECIAL_TYPE_0, PRODUCT_SPECIAL_TYPE_1].includes(da.specialType)">
      <span v-if="[PRODUCT_SPECIAL_TYPE_0].includes(da.specialType)">尺码</span>
      <span v-if="[PRODUCT_SPECIAL_TYPE_1].includes(da.specialType)">颜色</span>
      <span>不同价</span>
    </div>
  </div>
</template>

<script setup>
import { PRODUCT_SPECIAL_TYPE_0, PRODUCT_SPECIAL_TYPE_1 } from '@/fnDesigner/config/common';
import { computed } from 'vue';
import { getHeaderObj } from '@/fnDesigner/views/appCenter/components/price/util';
import PriceCardPriceTable from '@/fnDesigner/views/appCenter/components/price/priceCardPriceTable.vue';
import { designStoreToRefs } from '@/designClass/store';
const da = designStoreToRefs();

// 宽度
const width = computed(() => {
  let num = 200;
  if (da.value.priceList?.length > 0) {
    const headerObj = getHeaderObj(da.value.priceList);
    num = 100 + 100 * Object.keys(headerObj).length;
    const maxLen = Math.max(...Object.values(headerObj).map((e) => e.length));
    if (maxLen > 3) {
      num += (maxLen - 3) * 24;
    }
  }
  return num;
});

// 当前价格
const price = computed(() => {
  let price = '';
  if (da.value.priceList && !da.value.priceLoading) {
    if (da.value.specialType === '') {
      price = '未获取到价格';
    } else {
      if (da.value.priceList?.length) {
        let prop;
        if (da.value.specialType === PRODUCT_SPECIAL_TYPE_1) {
          prop = da.value.activeColorId;
        } else if (da.value.specialType === PRODUCT_SPECIAL_TYPE_0) {
          prop = da.value.activeSizeId;
        }
        price = `￥${getTemplatePrice(da.value.priceList, prop, da.value.specialType)}`;
      }
    }
  }
  return price;
});

/**
 * 获取模板价格根据类型
 * @param {array} list 模板价格列表
 * @param {string} prop 类型 例如：尺码 | 颜色 会是激活的id
 * @param {string} isSpecial 是否是特殊模板 2-正常 1-颜色 0-尺码
 * @param {number} num 1：获取价格 2：获取数量
 * @returns {string}
 * */
function getTemplatePrice(list, prop, isSpecial, num = 1) {
  const appearances = da.value.activeTemplate.detail.appearances;
  const sizes = da.value.activeTemplate.detail.sizes;

  if (list.length === 0) return '';
  if (list[0].prop === '') return list[0].list.find((e) => e.num === num)?.price;
  // 颜色
  if ([PRODUCT_SPECIAL_TYPE_1].includes(isSpecial)) {
    const result = appearances.find((e) => e.id == prop);
    if (!result) return '';
    return list.find((e) => e.prop === result.name)?.list.find((e) => e.num === num)?.price;
  }
  // 尺码
  if ([PRODUCT_SPECIAL_TYPE_0].includes(isSpecial)) {
    const result = sizes.find((e) => e.id == prop);
    if (!result) return '';
    return list.find((e) => e.prop === result.name)?.list.find((e) => e.num === num)?.price;
  }
  return '';
}
</script>

<style lang="less">
.popver-icon {
  position: absolute;
  left: -1.9rem;
  color: var(--fn-primary-color);
  cursor: pointer;
  .btn {
    width: 100%;
    margin-top: 1.2rem;
    height: 3.3rem;
  }
}
</style>
<style scoped lang="less">
.icon {
  color: var(--fn-primary-color);
  line-height: 2.2rem;
}
.price-wrap {
  display: flex;
  position: relative;
  //left: -1.5rem;
  .price-icon {
    position: absolute;
    left: -2.3rem;
    color: var(--fn-primary-color);
    cursor: pointer;
    font-size: 1.7rem;
  }

  .text {
    height: 2.2rem;
    display: flex;
    align-items: center;
    font-weight: bold;
    font-size: 1.7rem;
    color: #ff7a3d;
    .loading-icon {
      font-size: 1.7rem;
    }
  }
  .warning {
    background-color: orange;
    color: #fff;
    padding: 0 0.4rem;
    border-radius: 0.4rem;
    font-size: 1.5rem;
    margin-left: 0.6rem;
    font-weight: normal;
  }
}
</style>
