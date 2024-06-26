<!--头部搜索 - 筛选-->
<template>
  <el-form label-width="80px" class="sx-form">
    <!--    <el-form-item label="是否全幅:">-->
    <!--      <el-radio-group v-model="param.isAll" size="small" @change="getList(true)">-->
    <!--        <el-radio v-for="item in isAllList" :key="item.value" :label="item.value" border>-->
    <!--          {{ item.label }}-->
    <!--        </el-radio>-->
    <!--      </el-radio-group>-->
    <!--    </el-form-item>-->
    <!--    <el-form-item label="是否侵权:">-->
    <!--      <el-radio-group v-model="param.copyright" size="small" @change="getList(true)">-->
    <!--        <el-radio v-for="item in copyrightList" :key="item.value" :label="item.value" border>-->
    <!--          {{ item.label }}-->
    <!--        </el-radio>-->
    <!--      </el-radio-group>-->
    <!--    </el-form-item>-->
    <el-form-item label="图片类型:">
      <el-radio-group v-model="param.imageType" size="small" @change="getList(true)">
        <el-radio v-for="item in picTypeList" :key="item.value" :label="item.value" border>
          {{ item.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'filterPop',
  data() {
    return {
      // 是否全幅
      isAllList: [
        { label: '全部', value: '' },
        { label: '全幅', value: 1 },
        { label: '非全幅', value: 0 },
      ],
      // 图片类型
      picTypeList: [
        { label: '全部', value: '' },
        { label: '.png', value: '.png' },
        { label: '.jpg', value: '.jpg' },
      ],
      // 是否侵权
      copyrightList: [
        { label: '全部', value: '' },
        { label: '侵权', value: 1 },
        { label: '非侵权', value: 0 },
        { label: '漂白', value: 2 },
      ],
    };
  },
  props: {
    param: Object,
    getList: Function,
  },
};
</script>

<style scoped lang="less"></style>
