<!--物流方式，物流渠道-->
<template>
  <el-form :inline="inlines" ref="form" :model="params" :rules="rules" :label-width="config.width" :style="inlines ? 'display:flex;' : ''">
    <el-form-item
      :style="itemStyle"
      v-if="showArr.includes(1)"
      class="groupCode"
      :label="config.CompanyName"
      prop="expressCompany"
      :rules="[{ required: isRequired && isExpressCompanyRequired, message: '请选择物流方式', trigger: 'blur' }]"
    >
      <el-select
        ref="expressCompany"
        style="width: 100px;"
        :disabled="wldisable"
        :style="{ width: config.iptWidth1 || config.iptWidth }"
        v-model="params.expressCompany"
        :multiple="multipleCompany"
        :collapse-tags="multipleCompany"
        placeholder="请选择物流方式"
        filterable
        @change="getPhyDitch"
      >
        <el-option v-if="isEmpty && allSelect.way" label="全部" value=""></el-option>
        <el-option v-for="item in select.wuliu1" :label="item.expressId" :value="item.seqId" :key="item.seqId">
          <span style="float: left">{{ item.expressId }}</span>
          <span v-if="isRecommendWay" style="float: right; color: #f56c6c; font-size: 13px">{{ '海运空运'.indexOf(item.expressId) > -1 ? '推荐' : '' }}</span>
        </el-option>
      </el-select>
    </el-form-item>
    <div :style="{ display: inlines ? 'inline-flex' : 'flex', flexDirection: inlines ? (changeSort ? 'row-reverse' : 'row') : changeSort ? 'column-reverse' : 'column' }">
      <el-form-item
        :style="{ marginBottom: changeSort ? 0 : '', ...expressStyle, marginRight: changeSort ? 0 : '' }"
        v-if="showArr.includes(2)"
        :label="config.expressName"
        prop="expressMode"
        :rules="[{ required: isRequired, message: '请选择物流渠道', trigger: 'blur' }]"
      >
        <el-tooltip :disabled="isTip" :content="config.tipContent">
          <el-select
            style="width: 100px;"
            :disabled="expressDisabled"
            :style="{ width: config.iptWidth2 || config.iptWidth }"
            v-model="params.expressMode"
            @change="getDispatch"
            filterable
            :multiple="multipleMode"
            :collapse-tags="multipleMode"
            placeholder="请选择物流渠道"
          >
            <el-option v-if="!multipleMode && isEmpty && allSelect.mode" label="全部" value="" />
            <el-option-group :label="isModePopover ? '' : '单价，时效仅供参考'" :class="{ mode: multipleMode }">
              <el-option v-for="item in wuliu2" :key="item.expressId" :label="item.expressName" :disabled="expressWithDispatch(item)" :value="item.expressId">
                <div class="mode-option">
                  <div class="mode-option-name">
                    {{ item.expressName }}
                    <span v-if="item.expressRecommend && isMultipleMode">
                      (
                      <span class="q-red" style="font-size: 12px;font-weight: 500">推荐</span>
                      )
                    </span>
                  </div>
                  <div class="mode-option-price dp-flex" v-if="!isModePopover">
                    <template v-if="item.billingUnit">
                      <div class="dp-flex">
                        <div class="price-unit">¥ {{ item.billingUnit }}</div>
                        <div>{{ item.time }}</div>
                      </div>
                    </template>
                    <div v-else class="no-billing">暂无报价</div>
                  </div>
                </div>
              </el-option>
            </el-option-group>
          </el-select>
        </el-tooltip>
      </el-form-item>
      <!--      :class="changeSort ? 'placeholder' : ''"-->
      <el-form-item
        v-if="showArr.includes(3)"
        :label="config.dispatchName"
        :style="{ marginBottom: inlines ? 0 : changeSort ? '' : 0, marginright: 0, ...dispatchStyle }"
        prop="dispatchMode"
        :rules="[{ required: isRequired, message: '请选择派送方式', trigger: 'blur' }]"
      >
        <el-tooltip :disabled="isTip" :content="config.tipContent">
          <el-select
            style="width: 100px;"
            :disabled="psdisable"
            :style="{ width: config.iptWidth3 || config.iptWidth }"
            v-model="params.dispatchMode"
            filterable
            :multiple="multiple"
            :collapse-tags="multiple"
            @change="selectMode"
            placeholder="请选择派送方式"
          >
            <el-option v-if="isEmpty && allSelect.dispatch" label="全部" value=""></el-option>
            <template v-for="(item, index) in select.wuliu3">
              <el-tooltip :disabled="!(isMultipleRe && isKa(item) && (!item.deliveryRecommend || !item.chooseFlag))" content="该仓库不支持卡派，若有需求请联系物流中心" :key="index">
                <!--只要是不推荐的或者chooseFlag为false的就要禁用-->
                <el-option :disabled="isMultipleRe && isKa(item) && (!item.deliveryRecommend || !item.chooseFlag)" :label="item.deliveryName" :value="item.deliveryId">
                  <span style="float: left">{{ item.deliveryName }}</span>
                  <span v-if="isMultipleRe && isKa(item)" style="float: right; color: #f56c6c; font-size: 12px">{{ item.deliveryRecommend && item.chooseFlag ? '推荐' : '(无优惠,不推荐)' }}</span>
                </el-option>
              </el-tooltip>
            </template>
          </el-select>
        </el-tooltip>
        <div v-if="isMultipleRe && deliveryRecommend" class="deliver-tip">无优惠，不推荐</div>
      </el-form-item>
    </div>
  </el-form>
</template>

<script>
import common, { noPageList } from '@/fnDesigner/views/appCenter/components/price/expressSelect/util';
import _ from 'lodash';
import axios from 'axios';

export default {
  name: 'index',
  props: {
    width: { type: String, default: '100px' },
    // 列表获取的回调(只在获取所有的时候生效, props.isTwoDispatch = true)
    wuliuCallback: { type: Function, default: () => {} },
    // 渠道和派送方式展示位置是否互换
    changeSort: { type: Boolean, default: false },
    // 样式控制
    mb0: { type: Boolean, default: false },
    // 样式控制
    ml: { default: '' },
    // 【样式】false=竖着的 true=横着的
    inlines: { type: Boolean, default: true },
    wldisable: { default: false },
    qddisable: { default: false },
    psdisable: { default: false },
    config: {
      type: Object,
      default() {
        return {};
      },
    },
    // 物流方式是否要展示推荐
    isRecommendWay: {
      type: Boolean,
      default: false,
    },
    // 物流方式
    expressCompany: [Array, String],
    // 物流渠道
    expressMode: [Array, String],
    // 派送方式
    dispatchMode: [Array, String],
    reset: { type: Boolean },
    showArr: {
      type: Array,
      default() {
        return [1, 2];
      },
    },
    // 是否需要验证
    isRequired: { type: Boolean, default: false },
    // 物流方式是否需要验证，因为之前的isRequired是物流方式，渠道，派送方式共用,对于单个需要不要验证的不好处理,所以加了这个
    isExpressCompanyRequired: {
      type: Boolean,
      default: true,
    },
    // 是否需要空选择项
    isEmpty: { type: Boolean, default: true },
    /**
     * 是否需要全部选择下拉项
     * 这个是和isEmpty做兼容,之前isEmpty是控制3个下拉是否需要全部
     * allSelect是对单个做控制是否需要下拉
     */
    allSelect: {
      type: Object,
      default: () => {
        return {
          way: true, // 物流方式
          mode: true, // 物流渠道
          dispatch: true, // 派送方式
        };
      },
    },
    fbacode: {
      type: String,
      default: '',
    },
    // 物流方式是否多选
    multipleCompany: { type: Boolean, default: false },
    // 物流渠道是否多选
    multipleMode: { type: Boolean, default: false },
    // 物流状态是否根据上级来禁用
    expressModeDisabledIsByLast: { type: Boolean, default: false },
    // 物流方式下拉列表是否展示推荐
    isCompanyRe: { type: Boolean, default: false },
    // 派送方式是否多选
    multiple: { type: Boolean, default: false },
    // 派送方式下拉列表是否展示推荐
    isMultipleRe: { type: Boolean, default: false },
    // 物流渠道下拉列表是否展示推荐
    isMultipleMode: { type: Boolean, default: false },
    // 鼠标移入渠道和派送方式时是否需要提示,true-不需要，false-需要
    isTip: { type: Boolean, default: true },
    // 鼠标移入渠道的下拉列表是否需要提示,true-不需要，false-需要
    isModePopover: { type: Boolean, default: true },
    // 是否需要获取全部派送方式
    isAllDispatch: { type: Boolean, default: false },
    // 规则验证是否通过
    isPass: { type: Boolean, default: false },
    // 选择物流方式或渠道,下级清空时是否需要清除校验
    isNextVerify: { type: Boolean, default: false },
    // 获取接口要传的参数 全部: 0,启用: '0', 禁用: '1'
    useConfig: {
      type: Object,
      default: () => {
        return {
          useWay: '0', // 物流方式
          useMode: '0', // 物流渠道
          useDispatch: '0', // 派送方式
        };
      },
    },
    // 获取物流渠道的接口用哪个 get-关联关系的，second-物流方式和渠道是父子关系的
    modeApi: {
      type: String,
      default: 'get',
    },
    // 派送方式是否为二级
    isTwoDispatch: {
      type: Boolean,
      default: false,
    },
    // 初始化时，是否需要调物流渠道列表的接口
    isGetMole: {
      type: Boolean,
      default: true,
    },
    // 重复调用的接口是否需要取消
    isCancel: {
      type: Boolean,
      default: true,
    },
    // 已经被选择的物流渠道和派送方式,列表在这里面的数据要被禁用，不能选择
    selectEandD: {
      type: Array,
      default: () => {
        return [];
      },
    },
    // 派送方式el-form-item样式设置
    dispatchStyle: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    // 物流渠道禁用
    expressDisabled() {
      if (this.qddisable) return true;
      if (this.expressModeDisabledIsByLast && this.params.dispatchMode === '') return true;
      return false;
    },
    // 有多个物流渠道和派送方式时，重复的不能选
    expressWithDispatch() {
      return (data) => {
        let result = false;
        if (this.selectEandD.length) {
          result = this.selectEandD.some((item) => item.expressMode === data.expressId && item.dispatchMode === data.deliveryId);
        }
        return result;
      };
    },
    // 配送方式是否推荐提示语
    deliveryRecommend() {
      let result = false;
      const param = this.select.wuliu3.find((item) => item.deliveryId === this.params.dispatchMode);
      if (param) {
        result = !param.deliveryRecommend && param.deliveryName === '卡派';
      }
      return result;
    },
    // 派送方式名称是否卡派
    isKa() {
      return (row) => {
        const result = row.deliveryName === '卡派';
        return result;
      };
    },
    wuliu2() {
      let list;
      if (this.isTwoDispatch) {
        // 特殊场景,派送方式是二级
        if (this.params.dispatchMode) {
          const wuliu2 = _.cloneDeep(this.region.wuliu2);
          // 过滤出渠道列表
          const dList = wuliu2.filter((e) =>
            e.children.some((item) => {
              if (Array.isArray(this.params.dispatchMode)) {
                return this.params.dispatchMode.includes(item.deliveryId);
              } else {
                return item.deliveryId === this.params.dispatchMode;
              }
            }),
          );
          // 过滤派送方式
          dList.forEach((item) => {
            const children = _.cloneDeep(item);
            item.children = children.children.filter((e) => {
              if (Array.isArray(this.params.dispatchMode)) {
                return this.params.dispatchMode.includes(e.deliveryId);
              } else {
                return e.deliveryId === this.params.dispatchMode;
              }
            });
          });

          // 含推荐数据
          const recommendList = dList.filter((e) => e.expressRecommend === true);
          // 按价格排序的推荐数据
          const newRecommendList = this.sortPrice(recommendList);
          // 不含推荐数据
          const noRecommendList = dList.filter((e) => e.expressRecommend === false);
          // 按价格排序的不推荐数据
          const newNoRecommendList = this.sortPrice(noRecommendList);
          // // 排序价格低的放上面,
          // const dList1 = dList.filter((e) => e.children[0].billingUnit).sort((a, b) => a.children[0].billingUnit - b.children[0].billingUnit);
          // const dList2 = dList.filter((e) => !e.children[0].billingUnit);
          list = [...newRecommendList, ...newNoRecommendList];
          // 把里面的单价和时效赋值给父元素,现在只展示父元素,派送方式和名称也是取childen中的第一的值
          list.forEach((item) => {
            item.billingUnit = item.children[0]?.billingUnit || 0;
            item.time = item.children[0]?.time || '';
            item.deliveryId = item.children[0]?.deliveryId || '';
            item.deliveryName = item.children[0]?.deliveryName || '';
          });
        } else {
          list = [];
        }
      } else {
        list = this.select.wuliu2;
      }
      return list;
    },
    // 物流方式样式控制
    itemStyle() {
      let str = '';
      if (this.ml) {
        str += `margin-left:${this.ml}!important;`;
      }
      if (this.mb0) {
        str += `margin-bottom:0!important;`;
      }
      return str;
    },
    expressStyle() {
      const obj = {};
      if (this.ml) {
        obj.marginLeft = this.ml;
      }
      return obj;
    },
  },
  data() {
    return {
      initWuliuCallback1: true, // 获取全部物流方式的时候会执行回调，让回调只执行一次
      initWuliuCallback2: true, // 获取全部物流方式的时候会执行回调，让回调只执行一次
      params: {
        expressCompany: '' || [], //物流方式
        expressCompanyName: '', //物流方式名称
        expressMode: '' || [], //物流渠道
        dispatchMode: '' || [], // 派送方式
        dispatchModeName: '', // 派送方式名称
      },
      // 原始数据,目前只存wuliu2的数据
      region: {
        wuliu1: [],
        wuliu2: [],
        wuliu3: [],
      },
      source: null,
      rules: {
        expressCompany: [{ required: true, message: '请选择物流方式', trigger: 'change' }],
        expressMode: [{ required: true, message: '请选择物流渠道', trigger: 'change' }],
        dispatchMode: [{ required: true, message: '请选择派送方式', trigger: 'change' }],
      },
      select: {
        wuliu1: [],
        wuliu2: [],
        wuliu3: [],
      },
      isMole: false, // 初始化时，是否需要调物流渠道列表的接口
    };
  },
  watch: {
    isGetMole: {
      immediate: true,
      handler(value) {
        this.isMole = value;
      },
    },
    reset() {
      Object.keys(this.params).forEach((key) => (this.params[key] = ''));
    },
    params: {
      deep: true,
      immediate: true,
      handler(value) {
        this.$emit('input', value);
      },
    },
    // 物流方式
    'params.expressCompany': {
      deep: true,
      handler(val) {
        this.$emit('update:expressCompany', val);
        this.checkForm();
        // 清除校验
        this.isNextVerify &&
          this.$nextTick(() => {
            this.$refs.form.clearValidate('expressMode');
            this.$refs.form.clearValidate('dispatchMode');
          });
      },
    },
    fbacode: {
      immediate: false,
      handler() {
        // 派送方式是二级时
        if (this.isTwoDispatch) {
          if (this.isMole) {
            this.expressList();
          } else {
            this.isMole = true;
          }
        }
      },
    },
    expressCompany: {
      immediate: true,
      handler(val) {
        this.params.expressCompany = val;
        if (val) {
          if (this.isMole && this.showArr !== [1]) {
            this.expressList();
          } else {
            this.isMole = true;
          }
          // 获取物流方式名称
          // this.getExpressCompanyName();
          // this.$emit('change', this.params);
        }
        if (val === [] || !val) {
          if (this.isAllDispatch) {
            this.getAllDispatch();
          }
          // 获取物流渠道
          if (this.showArr.includes(2)) {
            this.expressList();
          }
        }
      },
    },
    // 物流渠道
    'params.expressMode': {
      deep: true,
      handler(val) {
        this.$emit('update:expressMode', val);
        // this.checkForm();
        // 清除校验
        this.isNextVerify &&
          this.$nextTick(() => {
            this.$refs.form.clearValidate('dispatchMode');
          });
      },
    },
    expressMode: {
      immediate: true,
      handler(val) {
        this.params.expressMode = val;
        if (val) {
          // 派送方式不是二级时
          if (!this.isTwoDispatch) {
            if (typeof val === 'object') {
              this.dispatchList(val);
            } else {
              this.dispatchList([val]);
            }
          }
          // this.$emit('change', this.params);
        } else {
          // 派送方式不是二级时
          if (!this.isTwoDispatch) {
            // 物流方式有值时
            if (this.params.expressCompany && this.showArr !== [1]) {
              this.dispatchList();
            }
          }
        }
      },
    },
    // 派送方式
    'params.dispatchMode': {
      deep: true,
      handler(val) {
        this.$emit('update:dispatchMode', val);
        // this.checkForm();
      },
    },
    dispatchMode: {
      immediate: true,
      handler(val) {
        this.params.dispatchMode = val;
        // if (val) {
        //   this.getDispatchMode(val);
        //   this.$emit('change', this.params);
        // }
      },
    },
    isAllDispatch: {
      immediate: true,
      handler(val) {
        if (val) {
          this.getAllDispatch();
        }
      },
    },
  },
  methods: {
    // 价格排序
    sortPrice(list) {
      // 有价格的数据,价格低的放上面
      const pList = list.filter((e) => e.children[0]?.billingUnit).sort((a, b) => a.children[0]?.billingUnit - b.children[0]?.billingUnit);
      const nList = list.filter((e) => !e.children[0]?.billingUnit);
      return [...pList, ...nList];
    },
    // 必填时，校验是否通过 true-通过，false-不通过
    async checkForm() {
      let isPass = false;
      if (this.showArr.sort().toString() === '1') {
        isPass = this.checkFiled('expressCompany');
      }
      if (this.showArr.sort().toString() === '1,2') {
        isPass = !!(this.checkFiled('expressCompany') && this.params.expressMode);
      }
      if (this.showArr.sort().toString() === '1,2,3') {
        isPass = !!(this.checkFiled('expressCompany') && this.params.expressMode && this.checkFiled('dispatchMode'));
      }
      this.$emit('update:isPass', isPass);
    },

    // 清空校验
    clearFiled() {
      this.$refs.form.resetFields();
    },

    // 校验字段是否有值
    checkFiled(filed) {
      let result = false;
      if (typeof this.params[filed] === 'string') {
        result = !!this.params[filed];
      } else {
        result = this.params[filed].length > 0;
      }
      return result;
    },

    resetData() {
      Object.keys(this.params).forEach((key) => (this.params[key] = ''));
    },
    //返回数据
    getData() {
      return this.params;
    },
    //返回数据 [返回两个对象]
    getData2() {
      //物流渠道
      const t = this.getObjById(this.params.expressCompany, this.select.wuliu1);
      const d = this.getObjById(this.params.expressMode, this.select.wuliu2);
      const p = this.getObjById(this.params.dispatchMode, this.select.wuliu3, 'deliveryId');
      return {
        expressMode: d,
        expressCompany: t,
        dispatchMode: p,
      };
    },
    /**
     * 根据id获取对象
     *  @param filedVal string | array 查找的id
     *  @param list array 查找的对象
     *  @param filed 根据哪个字段查找
     * */
    getObjById(filedVal, list, filed = 'seqId') {
      let res;
      if (typeof filedVal === 'string') {
        res = list.find((e) => e[filed] === filedVal);
      } else {
        const arr = [];
        filedVal.forEach((key) => {
          const t = list.find((e) => e[filed] === key);
          arr.push(t);
        });
        res = arr;
      }
      return res;
    },
    // 物流方式
    getPhyWay() {
      common.getPhysicalListOneNew({ useflag: this.useConfig.useWay, deleteFlag: 0 }).then((res) => {
        if (res.data.code === 0) {
          this.select.wuliu1 = res.data.data;
          if (this.initWuliuCallback2 === true) {
            this.initWuliuCallback2 = false;
            if (this.initWuliuCallback1 === false && this.initWuliuCallback2 === false) {
              const obj = {
                wuliu1: this.select.wuliu1,
                wuliu2: this.region.wuliu2,
                wuliu3: this.select.wuliu3,
              };
              this.wuliuCallback(obj);
            }
          }
        }
      });
    },
    // 物流渠道
    getPhyDitch(value) {
      this.params.expressMode = this.multipleMode ? [] : '';
      this.params.dispatchMode = this.multiple ? [] : '';
      if ((!value || value.length === 0) && this.isAllDispatch) {
        this.getAllDispatch();
      } else {
        if (this.showArr.includes(2)) {
          this.expressList();
        }
        if (this.showArr.includes(3)) {
          this.getDispatch();
        }
      }
      // 获取物流方式名称
      this.getExpressCompanyName();
      this.emitChange(); //通知父级
    },
    // 通知给父级
    emitChange() {
      this.$emit('change', this.params);
      const obj = {
        // 1
        expressCompany: this.select.wuliu1.find((e) => e.seqId === this.params.expressCompany),
        // 2
        expressMode: this.region.wuliu2.find((e) => e.expressId === this.params.expressMode),
        // 3
        dispatchMode: this.select.wuliu3.find((e) => e.deliveryId === this.params.dispatchMode),
      };
      const obj2 = {
        expressCompany: obj.expressCompany,
        one: obj.expressCompany,
        expressMode: obj.expressMode,
        two: obj.expressMode,
        dispatchMode: obj.dispatchMode,
        three: obj.dispatchMode,
      };
      this.$emit('change2', obj2);
    },
    // 派送方式
    selectMode(value) {
      this.getDispatchMode(); //获取派送方式
      this.emitChange(); //通知父级
      if (this.isTwoDispatch) {
        this.params.expressMode = '';
      }
      // 选择派送方式，并且有选择物流方式的前提下物流渠道反选
      // if (!this.multiple && !this.multipleCompany) {
      //   if (this.params.expressCompany && !this.params.expressMode) {
      //     const param = this.findParam(this.params.dispatchMode, this.select.wuliu3);
      //     this.params.expressMode = param.expressId;
      //   }
      //   // 物流渠道的子集children根据派送方式id做过滤
      //   // isModePopover  鼠标移入渠道的下拉列表是否需要提示,true-不需要，false-需要
      //   if (!this.isModePopover) {
      //     this.select.wuliu2 = this.filterChildren(this.params.dispatchMode);
      //   }
      // }
    },
    // 获取派送方式名称
    getDispatchMode(id = '') {
      if (!id) {
        // 如果是多选就不管
        if (Array.isArray(this.params.dispatchMode)) {
          return;
        }
        id = this.params.dispatchMode;
      }
      let name = '';
      for (let item of this.select.wuliu3) {
        if (item.deliveryId === id) {
          name = item.deliveryName;
          break;
        }
      }
      this.params.dispatchModeName = name;
    },
    // 物流方式名称
    getExpressCompanyName(id = '') {
      let name = '';
      if (!id) {
        id = this.params.expressCompany;
      }
      if (!this.multipleCompany || id) {
        for (let e of this.select.wuliu1) {
          if (e.seqId === id) {
            name = e.expressId;
            break;
          }
        }
      }
      if (!id) {
        return name;
      } else {
        this.params.expressCompanyName = name;
      }
    },
    // 获取物流渠道列表
    async expressList() {
      const _this = this;
      let expressWayId = [];
      if (typeof this.params.expressCompany === 'string') {
        if (this.params.expressCompany) {
          expressWayId = [this.params.expressCompany];
        }
      } else {
        expressWayId = this.params.expressCompany;
      }
      let res = {};
      if (this.modeApi === 'get') {
        if (_this.source !== null) {
          _this.source();
        }
        // expressUseflag：0 物流渠道启用
        res = await common.dispatchList(
          { expressWayId, useflag: this.useConfig.useMode, fbacode: this.fbacode, expressUseflag: 0, delFlag: 0 },
          {
            cancelToken: new axios.CancelToken(function(c) {
              _this.source = c;
            }),
          },
        );
        if (res.data.code !== 0) return;
        // 派送方式是二级时
        if (this.isTwoDispatch) {
          this.setDispatchList(JSON.parse(JSON.stringify(res)));
        }
      } else {
        console.log('执行了');
        res = await common.getPhysicalListTwoNew({ parentIds: expressWayId, useflag: this.useConfig.useMode });
        res.data.data.forEach((item) => {
          const pObj = JSON.parse(JSON.stringify(item));
          item.expressName = pObj.expressId;
          item.expressId = pObj.seqId;
        });
      }
      if (res.data.code === 0) {
        _this.source = null;
        let mList = [];
        mList = this.subsetMode(_.cloneDeep(res.data.data));
        // 如果派送当时存在时
        // isModePopover  鼠标移入渠道的下拉列表是否需要提示,true-不需要，false-需要
        if (this.params.dispatchMode && !this.isModePopover) {
          // 物流渠道下面的children只展示和派送方式关联的数据（this.params.dispatchMode）
          mList = this.filterChildren(this.params.dispatchMode);
        }
        this.select.wuliu2 = mList;
        if (this.params.expressMode) {
          // 默认的物流渠道id值不存在列表中时，清空值
          const isExit = this.checkExit(this.select.wuliu2, 'expressId', this.params.expressMode);
          if (!isExit) this.params.expressMode = this.multipleMode ? [] : '';
        }
        // 派送方式不是二级时
        if (!this.isTwoDispatch) {
          const expressIds = this.select.wuliu2.map((item) => item.expressId);
          await this.dispatchList(expressIds);
        } else {
          // 初始的回调
          if (this.initWuliuCallback1 === true) {
            this.initWuliuCallback1 = false;
            if (this.initWuliuCallback1 === false && this.initWuliuCallback2 === false) {
              const obj = {
                wuliu1: this.select.wuliu1,
                wuliu2: this.region.wuliu2,
                wuliu3: this.select.wuliu3,
              };
              this.wuliuCallback(obj);
            }
          }
        }
      }
      // common.dispatchList({ expressWayId, useflag: this.useConfig.useMode, fbacode: this.fbacode }, { bmIsCancel: 1 }).then((res) => {
      //   if (res.data.code === 0) {
      //     let mList = [];
      //     mList = this.subsetMode(_.cloneDeep(res.data.data));
      //     // 如果派送当时存在时
      //     // isModePopover  鼠标移入渠道的下拉列表是否需要提示,true-不需要，false-需要
      //     if (this.params.dispatchMode && !this.isModePopover) {
      //       // 物流渠道下面的children只展示和派送方式关联的数据（this.params.dispatchMode）
      //       mList = this.filterChildren(this.params.dispatchMode);
      //     }
      //     this.select.wuliu2 = mList;
      //     const expressIds = this.select.wuliu2.map((item) => item.expressId);
      //     this.dispatchList(expressIds);
      //   }
      // });
    },

    // 判断值在不在列表中，不在清空
    checkExit(list, filed, value) {
      const result = list.some((item) => item[filed] === value);
      return result;
    },
    /**
     * 物流渠道的子集children根据派送方式id做过滤
     * key：过滤条件
     * id：过滤的值
     *
     */
    filterChildren(id, key = 'deliveryId') {
      const list = _.cloneDeep(this.region.wuliu2);
      list.forEach((item) => {
        const arr = item.children.filter((e) => e[key] === id);
        item.children = arr;
      });
      return list;
    },

    // 过滤去重,并比较最低价
    filterList(list, key = 'deliveryId') {
      const dMap = new Map();
      list.forEach((item) => {
        if (dMap.has(item[key])) {
          const param = dMap.get(item[key]);
          // 有价格要比较价格取最低价
          if (param?.billingUnit) {
            if (item.billingUnit && item.billingUnit < param.billingUnit) {
              dMap.set(item[key], item);
            }
          } else {
            // 没有价格时 谁有价格就用谁
            if (item?.billingUnit) dMap.set(item[key], item);
          }
        } else {
          dMap.set(item[key], item);
        }
      });
      const arr = [...dMap.values()];
      // 有价格的在一块排序地到高
      const mList1 = arr.filter((item) => item.billingUnit).sort((a, b) => a.billingUnit - b.billingUnit);
      // 没有价格的在一块
      const mList2 = arr.filter((item) => !item.billingUnit);
      return [...mList1, ...mList2];
    },

    // 分组每个渠道下面有多少派送方式
    subsetMode(mList) {
      const dMap = new Map();
      mList.forEach((item) => {
        if (dMap.has(item.expressId)) {
          const param = dMap.get(item.expressId);
          param.children.push(JSON.parse(JSON.stringify(item)));
          dMap.set(item.expressId, param);
        } else {
          item.children = [JSON.parse(JSON.stringify(item))];
          dMap.set(item.expressId, item);
        }
      });
      const list = [...dMap.values()];
      // isModePopover  鼠标移入渠道的下拉列表是否需要提示,true-不需要，false-需要
      if (!this.isModePopover) {
        // 派送方式下过滤出最低价
        list.forEach((item) => {
          item.children = this.filterList(item.children);
        });
      }
      this.region.wuliu2 = _.cloneDeep(list);

      return list;
    },
    // 根据物流方式和渠道获取获取派送方式
    async dispatchList(expressIds = []) {
      let expressWayId = [];
      if (typeof this.params.expressCompany === 'string') {
        if (this.params.expressCompany) {
          expressWayId = [this.params.expressCompany];
        }
      } else {
        expressWayId = this.params.expressCompany;
      }
      let res;
      // 重复调用的接口是否需要取消
      if (this.isCancel) {
        res = await common.dispatchList({ expressWayId, expressIdList: expressIds, useflag: this.useConfig.useDispatch, fbacode: this.fbacode, delFlag: 0 }, { bmIsCancel: 1 });
      } else {
        res = await common.dispatchList({ expressWayId, expressIdList: expressIds, useflag: this.useConfig.useDispatch, fbacode: this.fbacode, delFlag: 0 });
      }

      if (res.data.code !== 0) return;
      this.setDispatchList(res);
    },

    // 派送方式列表赋值
    setDispatchList(res) {
      const dMap = new Map();
      //  排序:deliveryRecommend 是否推荐, true-推荐，false-不推荐, chooseFlag是否禁用：true-启用，false-禁用
      const list = _.orderBy(res.data.data, ['deliveryRecommend', 'chooseFlag'], ['desc', 'desc']);
      // 派送方式做去重
      list.forEach((item) => {
        if (!dMap.has(item.deliveryId)) {
          dMap.set(item.deliveryId, item);
        } else {
          const dItem = dMap.get(item.deliveryId);
          if (item.chooseFlag) {
            dItem.chooseFlag = item.chooseFlag;
          }
        }
      });
      const arr = [];
      dMap.forEach((value) => {
        arr.push(value);
      });
      // 派送方式名称是卡派并且是不推荐和禁用的数据,,
      const noKReList = [];
      // 派送方式名称是卡派并且是推荐和没禁用的数据,,
      const KReList = [];
      // 其他
      const oList = [];
      arr.forEach((item) => {
        //  && !item.deliveryRecommend
        if (item.deliveryName === '卡派') {
          // deliveryRecommend:是否推荐, chooseFlag:是否禁用 false-禁用,true启用
          if (item.deliveryRecommend && item.chooseFlag) {
            KReList.push(item);
          } else {
            noKReList.push(item);
          }
        } else {
          oList.push(item);
        }
      });
      this.select.wuliu3 = [...KReList, ...oList, ...noKReList];
      // 派送方式是单选时
      if (!this.multiple) {
        // 默认的派送方式id值不存在列表中时，清空值
        const isExit = this.checkExit(this.select.wuliu3, 'deliveryId', this.params.dispatchMode);
        if (!isExit) this.params.dispatchMode = '';
      } else {
        if (this.params.dispatchMode.length > 0) {
          const dispatchModes = _.cloneDeep(this.params.dispatchMode);
          // 已选的数据id不在派送方式列表中时，将选中的派送方式id删除
          const ids = dispatchModes.filter((id) => this.select.wuliu3.map((item) => item.deliveryId).includes(id));
          this.params.dispatchMode = ids;
        }
      }
    },

    // 清空派送方式和获取派送列表
    async getDispatch() {
      // 派送方式是二级时
      if (this.isTwoDispatch) {
        this.getExpressCompanyName(); // 获取物流方式名称
        this.getDispatchMode(); //获取派送方式
        this.emitChange(); //通知父级
        return;
      }
      if (this.showArr.includes(3)) {
        this.params.dispatchMode = this.multiple ? this.params.dispatchMode : '';
        this.getExpressCompanyName(); // 获取物流方式名称
        this.getDispatchMode(); //获取派送方式
        this.emitChange(); //通知父级
      }
    },

    // 根据id查找对用的数据
    findParam(id, list, filed = 'deliveryId') {
      return list.find((item) => item[filed] === id);
    },

    // 获取全部派送方式
    async getAllDispatch() {
      const res = await noPageList({ useflag: this.useConfig.useDispatch });
      if (res.data.code !== 0) return;
      res.data.data.forEach((item) => (item.deliveryId = item.seqId));
      this.select.wuliu3 = res.data.data;
    },
    // 单元格合并
    spanMethod({ row, column }) {
      if (column.property === 'billingUnit') {
        if (!row.billingUnit) {
          return [1, 2];
        }
      }
    },
  },
  created() {
    // 要展示物流方式时才要调物流方式列表
    if (this.showArr.includes(1)) {
      this.getPhyWay();
    }
  },
};
</script>

<style lang="less" scoped>
.mode {
  display: block !important;
}
.no-price {
  padding: 10px;
  margin: auto;
  background: #f5f7fa;
  border-radius: 6px;
}

:deep(.el-select-group__title) {
  padding-right: 20px;
  text-align: center;
}

.mode-option {
  display: flex;
  justify-content: space-between;

  .mode-option-name {
    min-width: 120px;
  }

  .mode-option-price {
    flex: 1;

    .price-unit {
      min-width: 40px;
      margin-right: 12px;
    }
  }
}

.dp-flex {
  display: flex;
  justify-content: space-between;
}

.deliver-tip {
  width: 300px;
  color: red;
  font-size: 12px;
  position: absolute;
  top: 24px;
}

.no-billing {
  color: #c0c4cc;
}

.placeholder :deep(.el-input__inner) {
  padding: 0 25px 0 2px;
}
</style>
