<template>
  <div v-if="isShowTemplate && !c_loading" class="table-wrap" :class="{ 'simple-wrap': isSimple }">
    <template v-if="c_detail">
      <div class="fun-wrap" v-if="isShowDel">
        <el-button type="danger" @click="onDel" size="mini">删除</el-button>
      </div>

      <div class="rate-wrap" v-if="isSimple">
        <span>当前汇率: {{ usdRate }}</span>
      </div>

      <!--图 + 颜色 + 尺码-->
      <el-card v-if="isComplex" style="width: 100%;">
        <div class="q-flex">
          <!--图片-->
          <div class="box-wrap">
            <div class="img-wrap">
              <bmImgOverlap :url1="c_detail.backGroundImage" :url2="c_detail.thumbImg" :width="120" :height="120" />
              <!--<img :src="url" alt="" />-->
            </div>
            <div class="info-wrap">
              <!--模板名称-->
              <div class="title">{{ c_detail.templateName }}</div>
              <!--模板编号-->
              <div>{{ c_detail.templateNo }}</div>
              <!--模板型号-->
              <div>{{ c_detail.templateModel }}</div>
            </div>
          </div>

          <!--分割线-->
          <el-divider direction="vertical" class="divider-wrap" />

          <!--尺码、 颜色-->
          <el-form label-width="40px" class="color-size-wrap ">
            <el-form-item label="类型">
              <div class="model-info-color">
                <div @click="onChangeBySizeType(item)" class="model-info-color-size" v-for="item in c_detail.sizeTypeList" :key="item.value" :class="{ action: item.value === activeSizeTypeId }">
                  {{ item.label }}
                </div>
              </div>
            </el-form-item>
            <el-form-item label="颜色">
              <div slot="label">
                <el-popover v-if="[1, '1'].includes(c_detail.priceType)" placement="top-start" width="220" trigger="hover">
                  <div v-if="c_detail.priceType == 1">
                    该产品不同颜色存在
                    <span class="fn-red">不同价格</span>
                  </div>
                  <div slot="reference" class="el-icon-warning icon-1" />
                </el-popover>
                <span>颜色</span>
              </div>
              <div class="model-info-color wrap-2">
                <div @click="onChangeByColor(item)" class="model-info-color-item" v-for="item in c_detail.colorList" :key="item.value" :class="{ action: item.value === activeColorId }">
                  <div :style="{ backgroundColor: item.label }"></div>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="尺码">
              <div slot="label">
                <el-popover v-if="[0, '0'].includes(c_detail.priceType)" placement="top-start" width="220" trigger="hover">
                  <div v-if="c_detail.priceType == 0">
                    该产品不同尺码存在
                    <span class="q-text-red">不同价格</span>
                  </div>
                  <div slot="reference" class="el-icon-warning icon-2" />
                </el-popover>
                <span>尺码</span>
              </div>
              <div class="model-info-color">
                <div @click="onChangeBySize(item)" class="model-info-color-size" v-for="item in c_detail.sizeList" :key="item.value" :class="{ action: item.value === activeSizeId }">
                  {{ item.label }}
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </el-card>

      <!--价格 + 数量 + 配置-->
      <div class="body-wrap">
        <el-card class="num-wrap">
          <div class="row">
            <div class="col"></div>
            <div class="col center">自发货</div>
            <div class="col center">平台配送</div>
          </div>
          <div class="row">
            <div class="col center">下单数量</div>
            <div class="col">
              <el-input v-model="c_detail.quantityFbm" @input="($event) => onChangeByQuantity($event)" maxlength="6" />
            </div>
            <div class="col">
              <el-input v-model="c_detail.quantityPlatform" @input="($event) => onChangeByQuantityPlatform($event)" maxlength="6" />
            </div>
          </div>
          <div class="row">
            <div class="col center-2">特殊工艺</div>
            <div class="col"></div>
            <div class="col col-group">
              <!--
                  注释：大概分为:
                      ①无特殊工艺【一级】
                      ②刺绣、绣花贴【一级、二级、三级(针数)】
                      ③其他工艺【一级、二级】
                          3.1 其他工艺中的皮革(包含无特殊工艺, 非皮革无特殊工艺)
                      ④针织【一级】
              -->
              <!--一级工艺-->
              <bm-el-select v-model="c_detail.firstCraft" :options="c_detail.firstCraftList" placeholder="一级工艺" :is-first="false" @change="(e) => onChangeByCraft(e, 1)" />
              <!--二级工艺 【不是针织、无特殊工艺、空 才有二级工艺】-->
              <template v-if="![2, '', -1, 0].includes(c_detail.firstCraft)">
                <bm-el-select v-model="c_detail.nextCraft" :options="c_detail.nextCraftList" placeholder="二级工艺" :is-first="false" @change="(e) => onChangeByCraft(e, 2)" />
              </template>
              <!--针数 【1-刺绣和3-绣花贴才有针数】-->
              <template v-if="[1, 3].includes(c_detail.firstCraft)">
                <el-input v-model="c_detail.numbers" @input="($event) => onChangeByNeedle($event)" placeholder="预估针数" />
              </template>
            </div>
          </div>
          <div class="row">
            <div class="col center-2" style="position: relative;top: 4px;">
              物流方式
            </div>
            <div class="col">
              <bm-el-select @change="onChangeByExpressFbm" v-model="c_detail.expressFbm" :options="expressList" placeholder="物流方式" :is-first="false" :loading="loading_express" />
            </div>
            <div class="col col-group">
              <!--物流方式-->
              <bm-express-select
                ref="wuliu"
                @change2="onChangeByExpress"
                :allSelect="{
                  way: false,
                  mode: false, // 物流渠道
                  dispatch: false,
                }"
                isTwoDispatch
                changeSort
                :inlines="false"
                :show-arr="[1, 2, 3]"
                :expressCompany.sync="c_detail.expressWayId"
                :expressMode.sync="c_detail.expressId"
                :dispatchMode.sync="c_detail.deliveryId"
                class="formmb0"
                :wuliuCallback="wuliuCallback"
                :is-get-mole="false"
              />
            </div>
          </div>
          <div class="row">
            <div class="col center">佣金比例</div>
            <div class="col">
              <el-input v-model="c_detail.brokerageFbm" @input="c_detail.brokerageFbm = getMoney($event, 2)" placeholder="佣金比例">
                <div slot="suffix">%</div>
              </el-input>
            </div>
            <div class="col">
              <el-input v-model="c_detail.brokeragePlatform" @input="c_detail.brokeragePlatform = getMoney($event, 2)" placeholder="佣金比例">
                <div slot="suffix">%</div>
              </el-input>
            </div>
          </div>
        </el-card>
        <el-card class="num-wrap money-wrap">
          <div class="row">
            <div class="col center">单件</div>
            <div class="col center">自发货</div>
            <div class="col center">平台配送</div>
          </div>
          <div class="row">
            <div class="col center">平台售价($)</div>
            <div class="col q-center">
              <el-input v-model="c_detail.sellingPriceFbm" @input="c_detail.sellingPriceFbm = getMoney($event, 2)" placeholder="请输入" />
            </div>
            <div class="col">
              <el-input v-model="c_detail.sellingPricePlatform" @input="c_detail.sellingPricePlatform = getMoney($event, 2)" placeholder="请输入" />
            </div>
          </div>
          <div class="row">
            <div class="col center">平台佣金($)</div>
            <div class="col q-center" v-if="c_loading"><span class="el-icon-loading"></span></div>
            <div class="col line" v-else>
              <div class="left">{{ fbmBrokerage }}</div>
              <div class="right">{{ fbmBrokerage_percent }}</div>
            </div>
            <div class="col q-center" v-if="c_loading"><span class="el-icon-loading"></span></div>
            <div class="col line" v-else>
              <div class="left">{{ platformBrokerage }}</div>
              <div class="right">{{ platformBrokerage_percent }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col center-2">平台配送($)</div>
            <div class="col line">{{ fbmPlatformDelivery }}</div>
            <div class="col q-center" v-if="platformDelivery_loading || c_loading"><span class="el-icon-loading"></span></div>
            <div class="col line" v-else>
              <div class="left">{{ platformDelivery }}</div>
              <div class="right">{{ platformDelivery_percent }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col center">货款成本(￥)</div>
            <div class="col q-center" v-if="costPrice_loading || c_loading"><span class="el-icon-loading"></span></div>
            <div v-else class="col line">
              <div class="left">{{ fbmCost }}</div>
              <div class="right">{{ fbmCost_percent }}</div>
            </div>
            <div class="col q-center" v-if="costPrice_loading || c_loading"><span class="el-icon-loading"></span></div>
            <div v-else class="col line">
              <div class="left">{{ platformCost }}</div>
              <div class="right">{{ platformCost_percent }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col center">物流成本(￥)</div>
            <div class="col q-center" v-if="loading_express"><span class="el-icon-loading"></span></div>
            <div v-else class="col line">
              <div class="left">{{ fbmLogistics }}</div>
              <div class="right">{{ fbmLogistics_percent }}</div>
            </div>
            <div class="col q-center" v-if="platformLogistics_loading || c_loading"><span class="el-icon-loading"></span></div>
            <div class="col line" v-else>
              <div class="left">{{ platformLogistics }}</div>
              <div class="right">{{ platformLogistics_percent }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col center">物流中心(￥)</div>
            <div class="col line">{{ fbmLogisticsCenter }}</div>
            <div class="col q-center" v-if="platformLogisticsCenter_loading || c_loading"><span class="el-icon-loading"></span></div>
            <div v-else class="col line">
              <div class="left">{{ platformLogisticsCenter }}</div>
              <div class="right">{{ platformLogisticsCenter_percent }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col center">毛利(￥)</div>
            <div class="col q-center" v-if="fbmGross_loading || c_loading"><span class="el-icon-loading"></span></div>
            <div class="col line" v-else>
              <div class="left">{{ fbmGross }}</div>
              <div class="right">{{ fbmGross_percent }}</div>
            </div>
            <div class="col q-center" v-if="platformGross_loading || c_loading"><span class="el-icon-loading"></span></div>
            <div class="col line" v-else>
              <div class="left">{{ platformGross }}</div>
              <div class="right">{{ platformGross_percent }}</div>
            </div>
          </div>
        </el-card>
      </div>
    </template>
  </div>
</template>

<script>
import lodash from 'lodash';
import bmExpressSelect from './expressSelect';
import { getMoney, loading, pageList } from '@/fnDesigner/views/appCenter/components/price/util';
import bmElSelect from '@/fnDesigner/views/appCenter/components/price/bmElSelect.vue';
import { GRequest, METHOD } from '@/utils/request';
import bmImgOverlap from '@/fnDesigner/components/imgOverlap';

const isEmpty_number = (num) => {
  const r1 = ['', null, undefined].includes(num);
  const r2 = Number.isNaN(num) || num === 'NaN';
  return r1 || r2;
};

const isNotEmpty_number = (num) => !isEmpty_number(num);
const isNotEmpty_numbers = (...nums) => nums.every((num) => isNotEmpty_number(num));

const percent_number = (num) => {
  if (isEmpty_number(num)) return '';
  let res = `${Number(num).toFixed(2)}%`;
  // 判断如果res是 infinty 或者 -infinty 则返回空字符串
  if (res === 'Infinity%' || res === '-Infinity%') res = '';
  return res;
};

export default {
  props: {
    // 是否展示删除按钮
    isShowDel: { type: Boolean, default: true },
    // 类型 1-毛利计算器 2-设计器场景(简)
    type: { type: [Number, String], default: 1 },
    // 是否展示 template 标签
    isShowTemplate: { type: Boolean, default: true },
    // 汇率
    rate: { type: [Number, String], default: '' },
    // 详情数据 (detail里面需要一个 templateId 字段)
    detail: { type: Object, default: () => {} },
    // 详情接口获取时的loading
    loading: { type: Boolean, default: false },
    // 尺码id
    sizeId: { type: [Number, String], default: '' },
    // 颜色id
    colorId: { type: [Number, String], default: '' },
  },
  components: {
    bmImgOverlap,
    bmElSelect,
    bmExpressSelect,
  },
  data() {
    return {
      // 防抖
      timer: {
        time: 500,
        onChangeByQuantity: null,
        onChangeByQuantityPlatform: null,
        onChangeByColor: null,
        onChangeBySize: null,
        onChangeByNeedle: null,
        onChangeByCraft: null,
      },

      c_rate: '', //汇率
      c_detail: {}, // 详情数据
      c_loading: false, // 详情接口获取时的loading

      expressList: [], // 物流列表
      loading_express: false, // 物流列表接口获取时的loading

      activeSizeTypeId: '', // 尺码类型
      activeSizeId: '', // 尺码
      activeColorId: '', // 颜色

      platformDelivery_loading: false, //配送费 loading【平台】
      fbmLogistics_loading: false, //物流成本 loading【自发货】
      platformLogistics_loading: false, //物流成本 loading【平台】
      costPrice_loading: false, //货款成本 loading【自发货+平台】
      platformLogisticsCenter_loading: false, //物流中心 loading【平台】
    };
  },
  watch: {
    // 详情数据
    detail: {
      handler(val) {
        if (val) {
          console.log('val', val);
          this.c_detail = val;
        }
      },
      deep: true,
      immediate: true,
    },
    c_detail: {
      handler(val) {
        if (val) {
          this.$emit('update:detail', val);
        }
      },
      deep: true,
      immediate: true,
    },
    // loading
    loading: {
      handler(val) {
        this.c_loading = val;
      },
    },
    c_loading: {
      handler(val) {
        this.$emit('update:loading', val);
      },
    },
    // 尺码id
    sizeId: {
      handler(val) {
        if (val) {
          this.activeSizeId = val;
        }
      },
      immediate: true,
    },
    // 颜色id
    colorId: {
      handler(val) {
        if (val) {
          this.activeColorId = val;
        }
      },
      immediate: true,
    },
  },
  async mounted() {
    if (this.detail.templateId) {
      const data = await this.getDetail();
      this.$set(this, 'c_detail', { ...this.c_detail, ...data, loading: false });
      this.dataReplenish();
    }

    // 如果没有传入汇率，则获取汇率
    if (this.rate === '') {
      const res = await GRequest(`/order-web/fi/fiUsdExchangeRate/get2UsdExchangeRate`, METHOD.GET);
      this.c_rate = res.data.usdRate;
    }
  },
  computed: {
    // 完整版
    isComplex() {
      return this.type == 1;
    },
    // 简易版
    isSimple() {
      return this.type == 2;
    },
    // 汇率
    usdRate() {
      let rate;
      if (this.rate) {
        rate = Number(this.rate);
      } else if (this.c_rate) {
        rate = Number(this.c_rate);
      } else {
        rate = '';
      }
      return rate;
    },
    // 【平台】毛利 loading
    platformGross_loading() {
      const { platformDelivery_loading, platformLogistics_loading, costPrice_loading } = this;
      return platformDelivery_loading || platformLogistics_loading || costPrice_loading;
    },
    // 【自发货】毛利 loading
    fbmGross_loading() {
      const { fbmLogistics_loading, costPrice_loading } = this;
      return fbmLogistics_loading || costPrice_loading;
    },
    // 【自发货】 平台佣金(保留两位小数) = 平台售价 * 佣金比例
    fbmBrokerage() {
      const { sellingPriceFbm, brokerageFbm } = this.c_detail;
      let num = '';
      if (sellingPriceFbm !== '' && brokerageFbm !== '') {
        const _brokerageFbm = Number(brokerageFbm) / 100;
        // 售价 * 佣金比例
        num = (sellingPriceFbm * _brokerageFbm).toFixed(2);
      }
      return isEmpty_number(num) ? '' : num;
    },
    // 【自发货】【百分比】 平台佣金
    fbmBrokerage_percent() {
      return percent_number(this.c_detail.brokerageFbm);
    },
    // 【平台】 平台佣金 = 平台售价 * 佣金比例 保留两位小数
    platformBrokerage() {
      const sellingPricePlatform = this.c_detail.sellingPricePlatform; // 平台售价
      const brokeragePlatform = this.c_detail.brokeragePlatform; // 佣金比例
      let num = '';
      if (isNotEmpty_numbers(sellingPricePlatform, brokeragePlatform)) {
        const _brokeragePlatform = Number(brokeragePlatform) / 100;
        // 售价 * 佣金比例
        num = (sellingPricePlatform * _brokeragePlatform).toFixed(2);
      }
      return isEmpty_number(num) ? '' : num;
    },
    // 【平台】【百分比】 平台佣金
    platformBrokerage_percent() {
      return percent_number(this.c_detail.brokeragePlatform);
    },
    // 【自发货】 平台配送 [前端放空]
    fbmPlatformDelivery() {
      return '';
    },
    // 【平台】 平台配送
    platformDelivery() {
      let num = this.c_detail.deliveryPlatform;
      if (['', 0, '0'].includes(this.c_detail.deliveryPlatform)) {
        num = '暂无数据';
      }
      return num;
    },
    // 【平台】【百分比】 平台配送 =平台配送($)/平台售价($)
    platformDelivery_percent() {
      let num = '';
      // 【平台】 平台配送 为空就不用算了，直接返回空
      if (!['', 0, '0'].includes(this.c_detail.deliveryPlatform)) {
        const platformDelivery = this.c_detail.deliveryPlatform; // 平台配送
        const sellingPricePlatform = this.c_detail.sellingPricePlatform; // 平台售价
        if (isNotEmpty_numbers(platformDelivery, sellingPricePlatform)) {
          num = percent_number((platformDelivery / sellingPricePlatform) * 100);
        }
      }
      return num;
    },
    // 【自发货】 货款成本
    fbmCost() {
      return this.c_detail.costPriceFbm;
    },
    // 【自发货】 【百分比】 货款成本 = 货款成本(￥) / (平台售价($) * 汇率)
    fbmCost_percent() {
      let num = '';
      const costPriceFbm = this.c_detail.costPriceFbm; // 货款成本
      const sellingPriceFbm = this.c_detail.sellingPriceFbm; // 平台售价
      const usdRate = this.usdRate; // 汇率
      if (isNotEmpty_numbers(costPriceFbm, sellingPriceFbm, usdRate)) {
        num = percent_number((costPriceFbm / (sellingPriceFbm * usdRate)) * 100);
      }
      return num;
    },
    // 【平台】 货款成本
    platformCost() {
      return this.c_detail.costPricePlatform;
    },
    // 【平台】 【百分比】 货款成本 = 货款成本(￥) / (平台售价($) * 汇率)
    platformCost_percent() {
      let num = '';
      const costPricePlatform = this.c_detail.costPricePlatform; // 货款成本
      const sellingPricePlatform = this.c_detail.sellingPricePlatform; // 平台售价
      const usdRate = this.usdRate; // 汇率
      if (isNotEmpty_numbers(costPricePlatform, sellingPricePlatform, usdRate)) {
        num = percent_number((costPricePlatform / (sellingPricePlatform * usdRate)) * 100);
      }
      return num;
    },
    // 【自发货】 物流成本 [所选的物流在物流列表(expressList)的详情(c_detail.expressCost)]
    fbmLogistics() {
      return this.c_detail.fbmLogistics;
    },
    // 【自发货】【百分比】 物流成本 = 物流成本(￥) / (平台售价($) * 汇率)
    fbmLogistics_percent() {
      let num = '';
      const fbmLogistics = this.c_detail.fbmLogistics; // 物流成本
      const sellingPriceFbm = this.c_detail.sellingPriceFbm; // 平台售价【自发货】
      const usdRate = this.usdRate; // 汇率
      if (isNotEmpty_numbers(fbmLogistics, sellingPriceFbm, usdRate)) {
        num = percent_number((fbmLogistics / (sellingPriceFbm * usdRate)) * 100);
      }
      return num;
    },
    // 【平台】 物流成本
    platformLogistics() {
      return this.c_detail.platformLogistics;
    },
    // 【平台】【百分比】 物流成本 = 物流成本(￥) / (平台售价($) * 汇率)
    platformLogistics_percent() {
      let num = '';
      const platformLogistics = this.c_detail.platformLogistics; // 物流成本
      const sellingPricePlatform = this.c_detail.sellingPricePlatform; // 平台售价
      const usdRate = this.usdRate; // 汇率
      if (isNotEmpty_numbers(platformLogistics, sellingPricePlatform, usdRate)) {
        num = percent_number((platformLogistics / (sellingPricePlatform * usdRate)) * 100);
      }
      return num;
    },
    // 【自发货】 物流中心 [前端放空]
    fbmLogisticsCenter() {
      return '';
    },
    // 【平台】 物流中心
    platformLogisticsCenter() {
      return this.c_detail.platformLogisticsCenter;
    },
    // 【平台】【百分比】 物流中心 = 物流中心($)/ (平台售价($) * 汇率)
    platformLogisticsCenter_percent() {
      let num = '';
      const platformLogisticsCenter = this.c_detail.platformLogisticsCenter; // 物流中心
      const sellingPricePlatform = this.c_detail.sellingPricePlatform; // 平台售价
      const usdRate = this.usdRate; // 汇率
      if (isNotEmpty_numbers(platformLogisticsCenter, sellingPricePlatform, usdRate) && usdRate !== 0) {
        num = percent_number((platformLogisticsCenter / (sellingPricePlatform * usdRate)) * 100);
      }
      return num;
    },
    // 【自发货】 毛利 = 平台售价($) * (1 - 佣金比例%) * 汇率 - 货款成本(￥) - 物流成本(￥)
    fbmGross() {
      let num = '';
      const usdRate = this.usdRate; //汇率
      const sellingPriceFbm = Number(this.c_detail.sellingPriceFbm); //平台售价
      const brokerageFbm = Number(this.c_detail.brokerageFbm); //佣金比例
      const costPriceFbm = Number(this.c_detail.costPriceFbm); //货款成本
      const fbmLogistics = Number(this.c_detail.fbmLogistics); //物流成本
      const _brokerageFbm = Number(brokerageFbm) / 100; //佣金比例
      const quantityFbm = this.c_detail.quantityFbm; // 数量
      // 平台售价($) * (1 - 佣金比例%) * 汇率 - 货款成本(￥) - 物流成本(￥)
      num = (sellingPriceFbm * (1 - _brokerageFbm) * usdRate - costPriceFbm - fbmLogistics).toFixed(2);
      return isEmpty_number(num) ? '' : num;
    },
    // 【自发货】 【百分比】 毛利 = 毛利(￥) / (平台售价($) * 汇率)
    fbmGross_percent() {
      let num = '';
      const fbmGross = this.fbmGross; // 毛利
      const sellingPriceFbm = this.c_detail.sellingPriceFbm; // 平台售价
      const usdRate = this.usdRate; // 汇率
      if (isNotEmpty_numbers(fbmGross, sellingPriceFbm, usdRate)) {
        num = percent_number((fbmGross / (sellingPriceFbm * usdRate)) * 100);
      }
      return num;
    },
    // 【平台】 毛利 = (平台售价($) * (1 - 佣金比例%) - 平台配送($)) * 汇率 - 货款成本(￥) - 物流成本(￥) - 物流中心(￥)
    platformGross() {
      let num = '';
      const usdRate = this.usdRate; //汇率
      const sellingPricePlatform = Number(this.c_detail.sellingPricePlatform); //平台售价
      const deliveryPlatform = Number(this.c_detail.deliveryPlatform); //平台配送
      const costPricePlatform = Number(this.c_detail.costPricePlatform); //货款成本
      const platformLogistics = Number(this.c_detail.platformLogistics); //物流成本
      const platformLogisticsCenter = Number(this.c_detail.platformLogisticsCenter); //物流中心
      const _brokeragePlatform = Number(this.c_detail.brokeragePlatform) / 100; //佣金比例
      num = ((sellingPricePlatform * (1 - _brokeragePlatform) - deliveryPlatform) * usdRate - costPricePlatform - platformLogistics - platformLogisticsCenter).toFixed(2);
      return isEmpty_number(num) ? '' : num;
    },
    // 【平台】【百分比】 毛利 = 毛利(￥) / (平台售价($) * 汇率)
    platformGross_percent() {
      let num = '';
      const platformGross = this.platformGross; // 毛利
      const sellingPricePlatform = this.c_detail.sellingPricePlatform; // 平台售价
      const usdRate = this.usdRate; // 汇率
      if (isNotEmpty_numbers(platformGross, sellingPricePlatform, usdRate)) {
        num = percent_number((platformGross / (sellingPricePlatform * usdRate)) * 100);
      }
      return num;
    },
  },
  methods: {
    // 初始化
    init() {},
    // 删除
    async onDel() {
      await this.$confirm('确定删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      this.$emit('del', this.c_detail);
    },
    // 获取详情数据
    async getDetail(templateId) {
      if (!templateId) templateId = this.c_detail.templateId;

      this.c_loading = true;
      try {
        // 获取模板id对应的详情数据
        let res = await GRequest(`/base-web/cm/cmProductTemplate/getByTemplateId/${templateId}`, METHOD.GET);
        if (res.data.code !== 0) return;

        // 尺码类型
        res.data.data.sizeTypeList = lodash.cloneDeep(res.data.data.sizeList.map((e) => ({ label: e.sizeType, value: e.sizeType })));
        res.data.data._sizeTypeObj = res.data.data.sizeList.reduce((pre, cur) => ((pre[cur.sizeType] = cur.sizeList.map((e) => ({ label: e, value: e, detail: e }))), pre), {});

        // 尺码
        res.data.data.sizeList = res.data.data._sizeTypeObj[res.data.data.sizeTypeList[0].value];

        // 颜色
        res.data.data._colorList = lodash.cloneDeep(res.data.data.colorList);
        res.data.data.colorList = res.data.data.colorList.map((e) => ({ label: e.colors_value, value: e.colors_value }));

        // 工艺 【0-普通】 【1-刺绣 3-绣花贴】 【2-针织】 【7-皮革】 【其他】
        res.data.data._firstCraftList = lodash.cloneDeep(res.data.data.firstCraftList);
        res.data.data.firstCraftList = res.data.data.firstCraftList.map((e) => ({ label: e.name, value: e.id, detail: e }));
        res.data.data._nextCraftList = lodash.cloneDeep(res.data.data.nextCraftList);
        res.data.data.nextCraftList = res.data.data.nextCraftList.map((e) => ({ label: e.name, value: e.id, detail: e }));
        res.data.data._nextCraftObj = res.data.data.nextCraftList.reduce((pre, cur) => {
          if (pre[cur.detail.parentId]) {
            pre[cur.detail.parentId].push(cur);
          } else {
            pre[cur.detail.parentId] = [cur];
          }
          return pre;
        }, {});

        /* 自定义字段 */
        // 下单数量
        res.data.data.quantityFbm = 1; //【自发货】
        res.data.data.quantityPlatform = 100; //【平台】
        // 特殊工艺【平台】
        res.data.data.firstCraft = ''; //一级工艺类型
        res.data.data.nextCraft = ''; //二级工艺类型
        res.data.data.numbers = ''; //针数
        // 物流方式
        res.data.data.expressWayId = ''; //【平台】物流方式
        res.data.data.expressId = ''; //【平台】渠道
        res.data.data.deliveryId = ''; //【平台】派送方式
        res.data.data.expressFbm = ''; //【自发货】
        // 佣金比例
        res.data.data.brokerageFbm = 15; //【自发货】
        res.data.data.brokeragePlatform = 15; //【平台】

        // 平台售价
        res.data.data.sellingPriceFbm = res.data.data.retailPrice; //【自发货】
        res.data.data.sellingPricePlatform = res.data.data.retailPrice; //【平台】
        // 平台配送
        // res.data.data.deliveryFbm = ''; //【自发货】
        res.data.data.deliveryPlatform = ''; //【平台】
        // 货款成本
        res.data.data.costPriceFbm = ''; //【自发货】
        res.data.data.costPricePlatform = ''; //【平台配送】
        // 物流成本
        res.data.data.fbmLogistics = ''; //【自发货】
        res.data.data.platformLogistics = ''; //【平台】
        // 物流中心
        // res.data.data.fbmLogisticsCenter = ''; //【自发货】
        res.data.data.platformLogisticsCenter = ''; //【平台】

        // 如果存在无特殊工艺就默认为 (无特殊工艺可能为 0 or -1)
        if (res.data.data.firstCraftList.some((e) => e.value === -1)) {
          res.data.data.firstCraft = -1;
        } else if (res.data.data.firstCraftList.some((e) => e.value === 0)) {
          res.data.data.firstCraft = 0;
        }

        // 模板id
        res.data.data.templateId = templateId;
        // 重量单位 g转kg
        res.data.data.weightByKg = res.data.data.weight / 1000;

        // 特殊 priceType：0-尺码 1-颜色 2-正常

        return res.data.data;
      } finally {
        this.c_loading = false;
      }
    },
    // 数据补充
    async dataReplenish() {
      if (this.isComplex) {
        // 尺码类型、尺码、颜色赋值
        this.activeSizeTypeId = this.c_detail.sizeTypeList[0].value;
        this.activeSizeId = this.c_detail.sizeList[0].value;
        this.activeColorId = this.c_detail.colorList[0].value;
      }

      // 获取 物流方式列表【自发货】【物流成本】
      await this.getFbmLogistics(this.c_detail.weight, this.c_detail.quantityFbm);
      // 获取 【平台】【平台配送】
      this.getLogisticsFee();
      // 获取【平台+自发货】【货款成本】
      this.getCost();
      // 获取【平台】【物流中心】
      this.getPlatformLogisticsCenter();
    },
    // 物流方式的回调
    async wuliuCallback(obj) {
      const d = obj.wuliu1.find((e) => e.expressId === '海运');
      if (d) {
        this.c_detail.expressWayId = d.seqId;
      }
      const d3 = obj.wuliu3.find((e) => e.deliveryName === '卡派');
      if (d3) {
        this.c_detail.deliveryId = d3.deliveryId;
        if (obj.wuliu2.length) {
          for (let item of obj.wuliu2) {
            const d = item.children.find((e) => e.deliveryId === this.c_detail.deliveryId);
            if (d) {
              this.c_detail.expressId = d.expressId;
              break;
            }
          }
        }
      }
      this.$nextTick(() => {
        if (this.$refs.wuliu) {
          this.$refs.wuliu?.emitChange();
        } else {
          console.error('自定义报错 => this.$refs.wuliu不存在');
        }
      });
    },
    // 【自发货】获取物流方式
    @loading('loading_express')
    async getFbmLogistics(weight, quantity) {
      if (quantity === '') return;
      const obj = {
        templateIdList: [this.c_detail.templateId],
        // weight = 重量 * 下单数量
        weight: weight * quantity,
        belong: 1,
      };
      const res = await GRequest(`/order-web/orderManageBussAct/expressFilterList4Counter.act`, METHOD.POST, obj);
      if (res.data.code !== 0) return;
      this.expressList = res.data.data.map((e) => ({ label: e.name, value: e.seqId, detail: e }));
      // 如果物流方式为空，就默认第一个
      if (this.c_detail.expressFbm === '') {
        this.c_detail.expressFbm = this.expressList[0].value;
        this.onChangeByExpressFbm(); //触发计算
      }
    },

    // 金额校验
    getMoney,
    // 【自发货】物流方式change
    async onChangeByExpressFbm() {
      await this.$nextTick();
      // 获取【自发货】的【物流成本】
      const d = this.expressList.find((e) => e.value === this.c_detail.expressFbm);
      if (d) {
        let expressCost = '';
        if (d.detail.expressCost && this.c_detail.quantityFbm > 0) {
          expressCost = (d.detail.expressCost / this.c_detail.quantityFbm).toFixed(2);
        }
        this.c_detail.fbmLogistics = expressCost;
      }
    },
    // 【平台】物流方式change
    async onChangeByExpress(data) {
      await this.$nextTick();
      // 获取 【平台】的【物流成本】
      if (data.three) {
        const { billingUnit, inSevenDayPrice } = data.three;
        // true-7天内有最低价 false-调用接口
        if (inSevenDayPrice) {
          this.c_detail.platformLogistics = (billingUnit * this.c_detail.weightByKg).toFixed(2);
        } else {
          if (data.two) {
            try {
              this.platformLogistics_loading = true;
              // 超过7天调用接口, 如果有最低价就取最低价, 没有就取配置的价格
              const obj = {
                pageNum: 1,
                pageSize: -1,
                expressWayId: this.c_detail.expressWayId.split().filter(Boolean),
                expressId: this.c_detail.expressId,
                deliveryId: this.c_detail.deliveryId.split().filter(Boolean),
                companyIds: [],
              };
              const res = await pageList(obj);
              if (res.data.code !== 0) return;
              // 过滤出 7 天内的最低价
              const _list = res.data.data.records.filter((e) => e.priceInSevenDay).map((e) => e.billingUnit);
              if (_list.length > 0) {
                // 七天内有最低价
                this.c_detail.platformLogistics = (Math.min(..._list) * this.c_detail.weightByKg).toFixed(2);
              } else {
                // 七天内没有最低价，获取配置的价格
                const res = await GRequest(`/fba-web/pack/dyFbaExpressSet/getNew/${data.three.expressId}`, METHOD.GET);
                if (res.data.code !== 0) return;
                this.c_detail.platformLogistics = (res.data.data.set.billingUnit * this.c_detail.weightByKg).toFixed(2);
              }
            } finally {
              this.platformLogistics_loading = false;
            }
          } else {
            // 未选中物流渠道
            this.c_detail.platformLogistics = '';
          }
        }
      } else {
        // 未选中派送方式
        this.c_detail.platformLogistics = '';
      }
    },
    // 工艺类型change
    async onChangeByCraft(e, type) {
      // loading设为true是调用接口 【【getCost】
      this.costPrice_loading = true;
      await this.$nextTick();
      if (type === 1) {
        this.c_detail.nextCraft = '';
        // this.c_detail.nextCraftList = e._nextCraftObj[this.c_detail.firstCraft] || [];
        this.$set(this.c_detail, 'nextCraftList', this.c_detail._nextCraftObj[this.c_detail.firstCraft] || []);
      } else if (type === 2) {
        //
      }

      // 防抖
      clearTimeout(this.timer.onChangeByCraft);
      this.timer.onChangeByCraft = setTimeout(() => {
        this.getCost(); //重新获取货款成本【自发货+fba】
      }, this.timer.time);
    },
    // 预估针数 input
    async onChangeByNeedle($event) {
      // loading设为true是调用接口 【【getCost】
      this.costPrice_loading = true;
      await this.$nextTick();
      this.c_detail.numbers = getMoney($event);

      // 防抖
      clearTimeout(this.timer.onChangeByNeedle);
      this.timer.onChangeByNeedle = setTimeout(() => {
        this.getCost(); //重新获取货款成本【自发货+fba】
      }, this.timer.time);
    },
    // 【自发货】下单数量input
    async onChangeByQuantity($event) {
      // loading设为true是调用接口 【getFbmLogistics】【getCost】
      this.costPrice_loading = true;
      this.loading_express = true;
      await this.$nextTick();
      this.c_detail.quantityFbm = getMoney($event);

      // 防抖
      clearTimeout(this.timer.onChangeByQuantity);
      this.timer.onChangeByQuantity = setTimeout(() => {
        // 重新获取物流方式
        this.getFbmLogistics(this.c_detail.weight, this.c_detail.quantityFbm).then(() => {
          // 【自发货】物流成本
          this.onChangeByExpressFbm();
        });
        //重新获取货款成本【自发货+fba】
        this.getCost();
      }, this.timer.time);
    },
    // 【平台】下单数量input
    async onChangeByQuantityPlatform($event) {
      // loading设为true是调用接口 【【getCost】
      this.costPrice_loading = true;
      await this.$nextTick();
      this.c_detail.quantityPlatform = getMoney($event);

      // 防抖
      clearTimeout(this.timer.onChangeByQuantityPlatform);
      this.timer.onChangeByQuantityPlatform = setTimeout(() => {
        this.getCost(); //重新获取货款成本【自发货+fba】
      }, this.timer.time);
    },
    // 尺码类型change
    onChangeBySizeType(item) {
      this.activeSizeTypeId = item.value; //尺码类型id
      this.c_detail.sizeList = this.c_detail._sizeTypeObj[item.value]; // 尺码列表
      this.activeSizeId = this.c_detail.sizeList[0].value; // 尺码id
    },
    // 颜色change
    async onChangeByColor(item) {
      if (this.c_detail.priceType == 1) {
        // loading设为true是调用接口 【【getCost】
        this.costPrice_loading = true;
      }
      await this.$nextTick();
      this.activeColorId = item.value;

      // 特殊颜色才调用接口
      if (this.c_detail.priceType == 1) {
        // 防抖
        clearTimeout(this.timer.onChangeByColor);
        this.timer.onChangeByColor = setTimeout(() => {
          this.getCost(); //重新获取货款成本【自发货+fba】
        }, this.timer.time);
      }
    },
    // 尺码change
    async onChangeBySize(item) {
      if (this.c_detail.priceType == 0) {
        // loading设为true是调用接口 【【getCost】【getLogisticsFee】
        this.costPrice_loading = true;
        this.platformDelivery_loading = true;
      }
      await this.$nextTick();
      this.activeSizeId = item.value;

      // 特殊尺码才调用接口
      if (this.c_detail.priceType == 0) {
        // 防抖
        clearTimeout(this.timer.onChangeBySize);
        this.timer.onChangeBySize = setTimeout(() => {
          this.getLogisticsFee(); //获取对应的配送费【平台】
          this.getCost(); //重新获取货款成本【自发货+fba】
        }, this.timer.time);
      }
    },
    // 查询【平台】【平台配送】
    @loading('platformDelivery_loading')
    async getLogisticsFee() {
      const obj = { templateId: this.c_detail.templateId, size: this.activeSizeId };
      const res = await GRequest(`/base-web/cm/cmTemplateDescribeFba/getShippingFee`, METHOD.POST, obj);
      if (res.data.code !== 0) return;
      // 运费 res.data.data
      this.c_detail.deliveryPlatform = res.data.data;
    },
    // 查询 【自发货+平台】【货款成本】
    @loading('costPrice_loading')
    async getCost() {
      const { firstCraft, nextCraft, numbers, quantityFbm, quantityPlatform, templateId } = this.c_detail;

      // 针数 【1-刺绣和3-绣花贴才有针数,并且针数必填】
      if ([1, 3].includes(firstCraft) && numbers <= 0) {
        return;
      }

      // 颜色和尺码不能同时为空
      if (this.activeColorId === '' && this.activeSizeId === '') {
        return;
      }

      const obj = {
        templateId: templateId, // 模板id
        color: this.activeColorId, // 颜色
        size: this.activeSizeId, // 尺码
        firstType: firstCraft, //工艺一级类型
        secondType: nextCraft, //工艺二级类型
        predictNum: numbers, //预估针数
        fbmOrderNum: quantityFbm, //订单数量【自发货】
        fbaOrderNum: quantityPlatform, //订单数量【平台】
      };
      const res = await GRequest(`/base-web/cm/cmProductTemplate/getGoodPrice`, METHOD.POST, obj);
      if (res.data.code !== 0) return;
      const { fbaGoodsPrice, fbmGoodsPrice } = res.data.data;
      this.c_detail.costPriceFbm = fbmGoodsPrice;
      this.c_detail.costPricePlatform = fbaGoodsPrice;
    },
    // 获取【平台】物流中心
    @loading('platformLogisticsCenter_loading')
    async getPlatformLogisticsCenter() {
      const res = await GRequest(`/fba-web/pack/dyFbaProductPack/getLogisticsCenterCost/${this.c_detail.templateId}`, METHOD.GET);
      if (res.data.code !== 0) return;
      this.c_detail.platformLogisticsCenter = res.data.data;
    },
  },
};
</script>

<style scoped lang="less">
.icon-1 {
  font-size: 17px;
  position: absolute;
  left: 449px;
  top: 62px;
  color: #ff9900;
}
.icon-2 {
  font-size: 17px;
  position: absolute;
  left: 449px;
  top: 107px;
  color: #ff9900;
}
.table-wrap {
  width: fit-content;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  height: fit-content;
  padding: 2px;
  position: relative;
  background-color: #f2f2f2;

  .fun-wrap {
    position: absolute;
    right: 8px;
    top: 8px;
    z-index: 1;
  }

  :deep(.el-card) {
    width: fit-content;
  }

  :deep(.el-card__body) {
    padding: 7px;
  }

  :deep(.el-input__suffix-inner) {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .wrap-2 {
    position: relative;
    top: 5px;
  }

  .divider-wrap {
    margin: 0 30px;
    height: auto !important;
    background-color: #303133;
  }

  @leftWidth: 400px;
  @rightMinWidth: 400px;
  @rightMaxWidth: 400px;

  // 图片
  .box-wrap {
    display: flex;
    width: @leftWidth;

    .title {
      font-weight: bold;
      font-size: 16px;
    }

    .img-wrap {
      width: 120px;
      height: 120px;
      margin-right: 10px;
      overflow: hidden;
      border-radius: 6px;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .info-wrap {
      & > div {
        margin-bottom: 6px;
      }
    }
  }

  .color-size-wrap {
    max-width: @rightMaxWidth;
    min-width: @rightMinWidth;

    :deep(.el-form-item) {
      margin-bottom: 13px !important;
    }

    :deep(.el-form-item__content) {
      line-height: 27px;
    }
  }

  .action {
    border: 2px solid var(--fn-primary-color) !important;
  }

  // 尺码、颜色
  .model-info-color {
    display: flex;
    flex-wrap: wrap;
    font-size: 13px;
    align-items: center;
    align-content: flex-start;
    gap: 4px;

    .model-info-color-item {
      transition: all 0.3s;
      cursor: pointer;
      width: 22px;
      height: 22px;
      border: solid 2px #d6d2d2; //#D6D2D2 transparent
      border-radius: 4px;
      margin-right: 4px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);

      & div {
        width: 14px;
        height: 14px;
        border-radius: 3px;
      }
    }

    .model-info-color-size {
      transition: all 0.3s;
      cursor: pointer;
      border: 2px solid transparent;
      padding: 0 7px;
      margin-right: 7px;
      border-radius: 4px;
      background-color: #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
      height: 26px;
      display: flex;
      align-items: center;
      margin-bottom: 4px;
    }
  }

  .body-wrap {
    display: flex;
    margin-top: 4px;

    // 数量 + 工艺
    .num-wrap {
      width: calc(@leftWidth + 30px);
      margin-right: 4px;

      .row {
        display: flex;
        //height: 40px;
        margin-bottom: 17px;

        &:first-child {
          height: 34px;
          margin-bottom: 0;
        }

        .center {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .center-2 {
          display: initial;
          text-align: center;
        }

        .col-group {
          @mb: 4px;

          & > * {
            margin-bottom: @mb;

            &:last-child {
              margin-bottom: 0;
            }
          }

          :deep(.el-form-item) {
            margin-bottom: @mb !important;
          }
        }

        // 列
        .col {
          flex: 1;
          margin-right: 13px;

          &:first-child {
            max-width: 63px;
            text-align: center;
          }

          &:last-child {
            margin-right: 0;
          }
        }
        .line {
          display: flex;
          justify-content: space-between;
          padding: 0 5px;
          .left {
            color: #4b89ff;
          }
          .right {
            color: red;
          }
        }
      }
    }

    // 金额
    .money-wrap {
      margin-left: 4px;
      margin-right: 0;
      flex: 1;

      .row {
        .col {
          &:first-child {
            max-width: 80px;
          }
        }
      }
    }
  }
}

// 简易版的样式
.simple-wrap {
  margin-top: 0;

  .rate-wrap {
    position: absolute;
    z-index: 1;
    right: 10px;
    bottom: 11px;
    color: red;
    font-weight: bold;
  }

  .body-wrap {
    margin-top: 0;
    .num-wrap {
      width: calc(330px + 30px);
      margin-right: 0;
      .row {
        margin-bottom: 10px;
      }
    }
    .money-wrap {
      width: calc(380px + 30px);
      margin-left: 0;
    }
  }
}
.q-flex {
  display: flex;
}
.q-text-red {
  color: #ff5151 !important;
}
</style>
