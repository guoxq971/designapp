<template>
  <div>
    <!--正常-->
    <el-table :data="list" v-if="[2, '2'].includes(isSpecial)">
      <el-table-column align="center" property="num" label="下单件数" />
      <el-table-column align="center" property="price" label="单件价格" width="92">
        <template slot="header">
          单件价格
          <el-tooltip placement="top" :content="tooltip">
            <span class="el-icon-question" />
          </el-tooltip>
        </template>
        <template slot-scope="{ row }">
          <span style="color: #409eff">￥{{ row.price }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!--尺码 | 颜色-->
    <el-table :data="list" v-if="![2, '2'].includes(isSpecial)">
      <el-table-column align="center" label="">
        <el-table-column align="center" property="num" label="下单件数" />
      </el-table-column>
      <el-table-column align="center" label="单件价格">
        <template slot="header">
          单件价格
          <el-tooltip v-if="[1, '1'].includes(isSpecial)" placement="top" :content="tooltip">
            <span class="el-icon-question" />
          </el-tooltip>
          <el-tooltip v-if="[0, '0'].includes(isSpecial)" placement="top" :content="tooltip">
            <span class="el-icon-question" />
          </el-tooltip>
        </template>
        <el-table-column v-for="(item, index) in headerList" :key="`aa${index}`" align="center" :width="width">
          <template slot="header">
            <span v-if="[0, '0'].includes(isSpecial)" style="color: red">{{ item.join(' / ') }}</span>
            <div v-if="[1, '1'].includes(isSpecial)" style="display: flex">
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
<script>
import { getHeaderObj } from '@/designApplication/components/layout/prodWorkspace/utils/common';

export default {
  props: {
    // 数据
    data: { type: Array, default: () => [] },
    // 特殊 0-尺码 1-颜色 2-正常
    isSpecial: { type: [Number, String], default: 2 },
  },
  data() {
    return {
      tooltip: '该价格不含可选工艺、配件',
      headerList: [],
      list: [],
    };
  },
  computed: {
    width() {
      let num = 120;
      const maxLen = Math.max(...this.headerList.map((e) => e.length));
      if (maxLen > 3) {
        num += (maxLen - 3) * 24;
      }
      return num;
    },
  },
  methods: {
    getColor(color) {
      const result = this.$store.state.design.prod.detail.appearances.find((e) => e.name === color);
      if (result) {
        return result.colors[0].value;
      }
      return '';
    },
  },
  watch: {
    data: {
      immediate: true,
      deep: true,
      handler() {
        // console.log('watch price table this.data', this.data);
        if (this.data.length === 0) {
          this.list = [];
          return;
        }
        // 件数
        const numList = this.data[0].list.map((it) => it.num);
        // 尺码/颜色
        const propList = this.data.map((e) => e.prop);
        // 表头组成
        let headerObj = {};
        // 表格数据
        const list = [];

        switch (this.isSpecial) {
          // 颜色 | 尺码
          case '1':
          case 1:
          case 0:
          case '0':
            // 表头
            headerObj = getHeaderObj(this.data);

            // 件数合并
            for (let num of numList) {
              const obj = { num: num };
              for (let prop of propList) {
                obj[prop] = this.data.find((e) => e.prop === prop).list.find((e) => e.num === num).price;
              }
              list.push(obj);
            }

            this.headerList = Object.values(headerObj);
            this.list = list;
            break;
          // 正常
          case 2:
          case '2':
            this.list = this.data[0].list;
            break;
          default:
            this.list = [];
            break;
        }
      },
    },
  },
};
</script>

<style scoped lang="less">
.chunk-wrap {
  width: 20px;
  height: 20px;
  background: #fff;
  border: 1px solid;
  border-radius: 4px;
  margin-right: 4px;
}
</style>
