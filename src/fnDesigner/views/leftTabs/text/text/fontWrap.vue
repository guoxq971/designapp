<template>
  <div style="display: flex;margin-bottom: 8px;">
    <!--字体类型-->
    <el-select @change="onChangeByType" v-model="obj.activeFontType" style="min-width: 95px; margin-right: 8px; width: 95px;">
      <el-option v-for="item in fontTypeList" :key="item.value" :value="item.value" :label="item.label" />
    </el-select>

    <!--字体列表-->
    <el-select @change="onChangeByFont" :loading="loading" v-model="obj.fontFamily" style="margin-right: 8px;" :key="id" :style="{ fontFamily: obj.fontFamily }">
      <el-option v-for="item in returnList" :key="item.value" :value="item.value" :label="item.label" :disabled="item.state !== 2">
        <el-popover trigger="hover" placement="right" :disabled="['1'].includes(obj.activeFontType)">
          <div style="display: flex;flex-direction: column;align-items: center;padding:5px">
            <div>
              <span v-if="item.detail.teamName">{{ item.detail.teamName }} -</span>
              <span>{{ item.detail.createUserName }}</span>
            </div>
            <div>({{ item.detail.createTime }})</div>
          </div>

          <div slot="reference">
            <span v-if="item.state === 1" class="el-icon-loading" style="margin-right: 5px;"></span>
            <span :style="{ fontFamily: item.value }" style="font-size: 18px">{{ item.label }}</span>
          </div>
        </el-popover>
      </el-option>
    </el-select>

    <!--字体管理-->
    <el-button type="primary" @click="onFontMap">字体管理</el-button>
  </div>
</template>

<script>
import { loadFont } from '@/fnDesigner/js/font';
import { uuid } from '@/laod/utils';
import { GRequest, METHOD } from '@/utils/request';
import { getBasePathImgUrl } from '@/utils/fnUtils';

export default {
  name: 'fontWrap',
  props: {
    // 字体
    fontFamily: { type: String, default: '' },
    // 字体路径
    fontPath: { type: String, default: '' },
  },
  data() {
    return {
      loading: false,
      id: 123,
      obj: {
        activeFontType: '1', //当前选中的字体类型
        fontFamily: '', //字体
      },
      fontTypeList: [
        { label: '平台', value: '1', list: [] },
        { label: '我的', value: '2', list: [] },
        { label: '共享', value: '3', list: [] },
      ],
    };
  },
  computed: {
    returnList() {
      const d = this.fontTypeList.find((e) => e.value === this.obj.activeFontType);
      if (d && d.list) {
        return d.list;
      }
      return [];
    },
  },
  watch: {
    fontFamily(val) {
      this.obj.fontFamily = val;
    },
  },
  methods: {
    /**
     * 选择字体
     */
    onChangeByFont(data) {
      const d = this.returnList?.find((e) => e.value === data);
      if (d) {
        this.$emit('update:fontPath', d.url);
      }
      this.$emit('update:fontFamily', data);
      this.$emit('changeFont', data);
    },
    /**
     * 字体管理
     */
    onFontMap() {
      // 新开一个页面
      window.open('/pictureDepot/pictureMap/frontMap');
    },
    /**
     * 获取字体
     */
    async getFont() {
      try {
        // console.log('当前所有字体');
        // document.fonts.forEach((e) => console.log(e));
        const d = this.fontTypeList.find((e) => e.value === this.obj.activeFontType);
        if (d.list.length === 0) {
          this.loading = true;
          const param = {
            /**
             * 设计器页面查询类型：1平台字体 2我的字体， 3共享给我的字体，
             */
            designerQueryType: this.obj.activeFontType,
            pageNum: 1,
            pageSize: -1,
          };
          const res = await GRequest(`/basic-web/cm/cmFont/designerList/${param.pageNum}/${param.pageSize}`, METHOD.POST, param);
          if (res.data.code !== 0) return;
          // 要在这个地方加载字体 fontPath
          const list = res.data.data.records.map((e) => {
            return {
              label: e.fontName,
              value: 'bm' + e.fontName,
              detail: e,
              url: process.env.VUE_APP_API_BASE_IMG_URL + e.fontPath,
              name: e.fontName,
              state: 0, //0-未加载 1-加载中 2-加载成功 3-加载失败
            };
          });

          list.forEach((font) => loadFont(font));

          if (this.obj.activeFontType == 1) {
            list.unshift({
              label: '默认字体',
              value: '',
              detail: {},
              url: '',
              name: '默认字体',
              state: 2, //0-未加载 1-加载中 2-加载成功 3-加载失败
            });
          }

          d.list = list;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    /**
     * 字体类型切换
     */
    async onChangeByType() {
      this.id = uuid();
      const d = this.returnList?.find((e) => e.value === this.fontFamily);
      if (d) {
        this.obj.fontFamily = d.value;
      } else {
        this.obj.fontFamily = '';
      }
      await this.getFont();
    },
  },
  mounted() {
    this.onChangeByType();
  },
};
</script>

<style scoped lang="less"></style>
