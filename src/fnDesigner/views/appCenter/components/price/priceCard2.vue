<!--产品控制台 - 价格列表-->
<template>
  <div class="price-wrap" style="pointer-events: all">
    <el-popover class="popver-icon" v-if="!loadingPrice && priceList && priceList.length" placement="left" :width="width" trigger="click">
      <!--表格-->
      <priceCardPriceTable :data="priceList" :isSpecial="isSpecial" />

      <!--产品毛利-->
      <el-popover placement="bottom" width="905" trigger="click">
        <template slot="reference">
          <el-button @click="onClick" type="primary" size="mini" style="width: 100%;margin-top: 6px;">
            产品毛利
            <span class="el-icon-arrow-down" />
          </el-button>
        </template>

        <!--毛利计算器-->
        <grossProfitCalculator v-if="showCalculator" :detail="c_detail" :isShowDel="false" />
      </el-popover>

      <!--icon-->
      <div slot="reference" class="el-icon-question icon"></div>
    </el-popover>

    <div class="text" v-if="!loadingPrice">
      {{ price }}
    </div>
    <div class="text" v-else>
      <div class="el-icon-loading" style="font-size: 17px" />
    </div>
    <!--特殊颜色/尺码标识-->
    <div class="warning" v-if="[0, 1, '0', '1'].includes(isSpecial)">
      <span v-if="['0', 0].includes(isSpecial)">尺码</span>
      <span v-if="['1', 1].includes(isSpecial)">颜色</span>
      <span>不同价</span>
    </div>
  </div>
</template>

<script>
import { getHeaderObj } from '@/designApplication/components/layout/prodWorkspace/utils/common';
import priceCardPriceTable from '@/designApplication/components/layout/prodWorkspace/priceCardPriceTable.vue';
import grossProfitCalculator from '@/fnComponents/grossProfitCalculator.vue';

export default {
  name: 'priceCard',
  components: { grossProfitCalculator, priceCardPriceTable },
  props: {
    // 特殊产品标识 0: 尺码 1: 颜色
    isSpecial: { type: [String, Number], default: '' },
    priceList: { type: Array, default: () => [] },
    activeColorId: { type: [String, Number], default: '' },
    activeSizeId: { type: [String, Number], default: '' },
    // 产品详情
    detail: { type: Object, default: () => ({}) },
    loadingPrice: { type: Boolean, default: false },
  },
  data() {
    return {
      showCalculator: false,
      c_detail: {
        templateId: '',
      },
    };
  },
  computed: {
    width() {
      let num = 200;
      if (this.priceList?.length > 0) {
        const headerObj = getHeaderObj(this.priceList);
        num = 100 + 100 * Object.keys(headerObj).length;
        const maxLen = Math.max(...Object.values(headerObj).map((e) => e.length));
        if (maxLen > 3) {
          num += (maxLen - 3) * 24;
        }
      }
      return num;
    },
    // 产品价格
    price() {
      let price = '';
      // console.log('价格组件, 产品价格, 参数 =>', this.priceList, this.isSpecial);
      if (this.priceList && !this.loadingPrice) {
        if (this.isSpecial === '') {
          price = '未获取到价格';
        } else {
          if (this.priceList?.length) {
            let prop;
            if (this.isSpecial == 1) {
              prop = this.activeColorId;
            } else if (this.isSpecial == 0) {
              prop = this.activeSizeId;
            }
            price = `￥${this.getTemplatePrice(this.priceList, prop, this.isSpecial)}`;
          }
        }
      }
      return price;
    },
  },
  watch: {
    detail: {
      handler(val) {
        this.c_detail.templateId = val.seqId;
      },
      immediate: true,
    },
  },
  methods: {
    /**
     * 点击毛利计算器
     */
    onClick() {
      this.showCalculator = true;
    },
    /**
     * 获取模板价格根据类型
     * @param {import('@/design').ProdItemData.priceList} list 模板价格列表
     * @param {string} prop 类型 例如：尺码 | 颜色 会是激活的id
     * @param {number} isSpecial 是否是特殊模板 2-正常 1-颜色 0-尺码
     * @param {number} num 1：获取价格 2：获取数量
     * @returns {string}
     * */
    getTemplatePrice(list, prop, isSpecial, num = 1) {
      const appearances = this.detail.appearances;
      const sizes = this.detail.sizes;

      if (list.length === 0) return '';
      if (list[0].prop === '') return list[0].list.find((e) => e.num === num)?.price;
      // 颜色
      if ([1, '1'].includes(isSpecial)) {
        const result = appearances.find((e) => e.id == prop);
        if (!result) return '';
        return list.find((e) => e.prop === result.name)?.list.find((e) => e.num === num)?.price;
      }
      // 尺码
      if ([0, '0'].includes(isSpecial)) {
        const result = sizes.find((e) => e.id == prop);
        if (!result) return '';
        return list.find((e) => e.prop === result.name)?.list.find((e) => e.num === num)?.price;
      }
      return '';
    },
  },
};
</script>

<style scoped lang="less">
.popver-icon {
  position: absolute;
  left: -19px;
  color: #0099ff;
  cursor: pointer;
}
.price-wrap {
  display: flex;
  position: relative;
  .price-icon {
    position: absolute;
    left: -23px;
    color: #0099ff;
    cursor: pointer;
    font-size: 17px;
  }

  .text {
    height: 22px;
    display: flex;
    align-items: center;
    font-weight: bold;
    font-size: 17px;
    color: #ff7a3d;
  }
  .warning {
    background-color: orange;
    color: #fff;
    padding: 0 4px;
    border-radius: 4px;
    font-size: 15px;
    margin-left: 6px;
    font-weight: normal;
  }
}
</style>
