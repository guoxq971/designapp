<!--批量上传主题图/背景图-->
<template>
  <el-dialog :title="title" v-if="btn" v-drag :visible.sync="btn" :close-on-click-modal="false" width="55%" custom-class="upLoadDialog" append-to-body>
    <div v-loading="loading" element-loading-text="素材上传中">
      <el-row class="dialog-bd" style="text-align: center" v-show="imgList.length">
        <!--height="100px" max-height="450px" v-adaptive -->
        <el-table :data="imgList" ref="tableGroup" :header-cell-style="{ background: '#fff' }">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="缩略图" align="center">
            <template slot-scope="{ row }">
              <el-image style="width: 80px; height: 80px" :src="row.url" v-if="row.url"></el-image>
            </template>
          </el-table-column>
          <el-table-column label="名称" align="center">
            <template slot-scope="{ row }">
              <el-input v-model="row.label" type="textarea"></el-input>
            </template>
          </el-table-column>

          <!--一级图片分类-->
          <el-table-column label="图片分类" align="center" width="200">
            <template slot-scope="{ row }">
              <el-select v-model="row.newBasetype" placeholder="请选择商户一级分类" @change="(e) => handlerChangeByPic(e, row)">
                <el-option v-for="item in onePicList" :key="item.value" :label="item.name" :value="item.seqId"></el-option>
              </el-select>
              <el-select v-model="row.newNexttype" placeholder="请选择商户二级分类">
                <el-option v-for="item in row.picSelectList" :key="item.value" :label="item.name" :value="item.seqId"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="{ row }">
              <template v-if="secConfirm">
                <div v-if="row.state === '2'">
                  <div style="color: red">上传确认：该图片分辨率为{{ row.dpi }}，小于系统推荐值150，请确认是否上传！</div>
                  <el-button type="primary" @click="req(row, true)">
                    确认上传
                  </el-button>
                </div>
                <div v-if="row.state === '0'">
                  <div style="color: red">上传失败</div>
                  <el-button style="margin-bottom: 8px" type="danger" @click="req(row, true)">
                    重新上传
                  </el-button>
                  <!--                                    <el-button type="danger" @click="delImg(row)">删除</el-button>-->
                </div>
              </template>
              <template v-else>
                <el-button type="danger" @click="delImg(row)" v-if="!isDesignTaskList">删除</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
    </div>

    <div
      v-if="!secConfirm"
      class="dialog-footer"
      :style="{
        display: 'flex',
        marginTop: '2rem',
        justifyContent: imgList.length ? 'right' : 'center',
      }"
    >
      <el-upload
        ref="upload"
        class="upload-demo"
        :drag="imgList.length == 0"
        action=""
        :show-file-list="false"
        multiple
        :on-change="fileChange"
        :auto-upload="false"
        list-type="picture"
        accept=".jpg,.JPG,.png,.PNG.jpeg,.JPEG"
        style="margin-right: 10px"
      >
        <template v-if="imgList.length == 0">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
          <div class="el-upload__tip" slot="tip" style="color: red; text-align: center">
            支持jpg和png格式，图片大小不超过20M
          </div>
        </template>
        <template v-else>
          <el-button type="primary" v-if="!isDesignTaskList">继续添加</el-button>
        </template>
      </el-upload>
      <el-button v-show="imgList.length" type="primary" @click="handlerSave" :loading="loading">
        保存并返回
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { dispose_designParam } from '@/fnComponents/mulSetImg/util';
import _ from 'lodash';
import { disposePicSelect, disposePicSelectByTwo, onePicDetailValue } from '@/fnComponents/mulSetImg/mulSetImgUtil';
import { GRequest, METHOD } from '@/utils/request';

export default {
  name: 'index',
  props: {
    getList: {
      type: Function,
      default() {
        return () => {};
      },
    },
  },
  computed: {
    // 当前的类型 = 设计师任务列表
    isDesignTaskList() {
      return this.bmType === 2;
    },
  },
  data() {
    return {
      // 定时器 loading
      timerLoading: null,
      // 图集
      loading_atlas: false,
      atlasList: [],
      // 特殊标识(init方法中有注释)
      bmType: 1,
      // 当前params参过来的参数
      initParams: {},
      // 表格数据
      list: [],
      // 一级分类选择框加载状态
      firloading: false,
      // 二级分类选择框加载状态
      secloading: false,
      //加载状态
      loading: false,
      //标题
      title: '',
      // 分辨率低于150的图片数组
      dpiArr: [],
      // 是否二次确认
      secConfirm: false,
      //当前场景(默认设计图) mulMainImg-批量主题图,mulBgImg-批量背景图，mainImg-主题图,bgImg-背景图
      type: 'mulMainImg',
      // 上传的类型 1主题图 2背景图 3主题图&背景图 4文字 5镜像图 6平铺图
      mainType: '',
      //接口获取的detail
      detail: {
        // 一级分类
        newBasetype: onePicDetailValue,
        // 二级分类
        newNexttype: '',
        // 小组一级分类
        teamBasetype: '',
        // 小组二级分类
        teamNexttype: '',
        // 是否侵权
        copyright: '',
        // 是否全幅
        isFu: '',
      },
      // 批量添加主题/名称/标签
      content: '',
      // 上传图片文件列表
      imgList: [],
      // 一级图片列表
      onePicList: [],
      // 二级图片列表
      twoPicList: [],
      //外部表的detail
      tableDetail: {},
      //开关
      btn: false,
      // 小组分类数据
      teamTree: [],
    };
  },
  watch: {
    btn(val) {
      if (!val) {
        if (this.secConfirm) {
          this.getList();
        }
        this.timerLoading && clearTimeout(this.timerLoading);
        this.$reset(this);
      }
    },
  },
  beforeDestroy() {
    this.timerLoading && clearTimeout(this.timerLoading);
  },
  methods: {
    /*
     * 表格单个操作:图片一级分类选择框change事件
     * @param {string} e seqId
     * @param {object} data 表格行数据
     * */
    async handlerChangeByPic(e, data) {
      const obj = await disposePicSelectByTwo(e);
      const list = obj.list.filter((m) => m.seqId !== '0');
      // 赋值一级、二级分类的value
      this.$set(data, 'newBasetype', e);
      this.$set(data, 'newNexttype', '');
      // 赋值二级分类的列表
      this.$set(data, 'picSelectList', list);
    },

    // 删除图片
    delImg(row) {
      let idx = this.imgList.findIndex((m) => {
        return m.uid == row.uid;
      });
      this.imgList.splice(idx, 1);
      this.$refs.upload.uploadFiles.splice(idx, 1);
    },
    /*
     * 初始化
     * */
    async init(params) {
      // bmType 1:默认 2:设计师任务列表-上传设计师图片
      // type = mulSetMainImg(图片管理new用到的)
      // type != mulSetMainImg(设计器中用到的)
      this.type = params.type;
      this.bmType = params.bmType || 1;
      this.initParams = params;
      if (this.type == 'mulSetMainImg') {
        this.title = '上传主题图';
        this.mainType = '1';
      }
      if (this.type == 'mulMainImg') {
        this.title = '批量上传主题图';
        this.mainType = '1';
      }
      if (this.type == 'mulBgImg') {
        this.title = '批量上传背景图';
        this.mainType = '2';
      }

      // 处理图片
      let obj = await disposePicSelect();
      // 赋值一级图片分类
      this.onePicList = obj.list.filter((m) => m.seqId !== '0');

      // 展示弹窗
      this.btn = true;
    },

    // 选择图片
    fileChange(file) {
      let idx = this.imgList.findIndex((m) => {
        return m.name == file.name;
      });
      if (idx != -1) {
        this.$refs.upload.uploadFiles.splice(idx, 1);
        this.$message.warning('图片已添加，请修改名称后重试！');
        return;
      }
      this.fileToDataURL(file.raw, file);
    },

    /*
     * Blob地址转为dataUrl, 并添加到imgList
     * @param {object} raw elupload的raw文件对象
     * @param {object} file 文件对象
     * */
    fileToDataURL(raw, file) {
      let reader = new FileReader();
      reader.readAsDataURL(raw);
      const names = file.name.split('.');
      reader.onload = () => {
        file.url = reader.result;
        let obj = {
          // 上传的状态 0-上传失败，1-上传成功，2-(像素小于150，需要再次确认)
          state: '',
          // 主题
          sjsTitle: '',
          // 名称
          label: names.slice(0, names.length - 1).join('.'),
          // 标签
          tags: '',
          // 主题图
          main_type: [this.mainType],
          // 是否侵权
          isCopyRightGrade: '0',
          // 是否全幅
          isFuGrade: '0',
          // 一级图片分类
          newBasetype: '',
          // 二级图片分类
          newNexttype: '',

          ...file,
        };
        this.imgList.push(obj);
      };
    },
    /*
     * 循环上传
     * @param {any} m
     * @param {any} secConfirm 二次确认(来自设计器调用的时候传 false 就行)
     * @param {null | number | string} mainType 上传的类型 1主题图 2背景图 3主题图&背景图 4文字 5镜像图 6平铺图
     * @param {null | object} mirroring 设计器镜像 {type,imageId}
     * */
    async req(m, secConfirm, mainType = null, mirroring = null, isDel = true, isLoading = false) {
      if (isLoading) {
        this.loading = true;
      }
      try {
        const cut1500Flag = mirroring ? 1 : '';
        let form = dispose_designParam(m, cut1500Flag);
        console.log('form', form);
        let res = await GRequest(`/base-web/CMDesignImageAct/ajaxBatchUploadDesign.act`, METHOD.POST, form, {
          timeout: 50 * 60 * 1000,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        // 成功
        if (res.data.status) {
          // dpi小于150 并且 isCanUploadImg有上传权限
          if (res.data.dpi < 150 && !res.data.isCanUploadImg) {
            m.state = '2';
            m.dpi = res.data.dpi;
          }
          // dpi 正常
          else {
            // mulSetMainImg = 主题图 else 背景图
            let main_type;
            if (mainType) {
              main_type = [mainType];
            } else {
              main_type = [this.mainType];
            }
            const names = res.data.imageName.split('.');
            let data = {
              fileName: res.data.fileName,
              fileSize: res.data.fileSize,
              sjsTitle: m.sjsTitle || '',
              label: m.label,
              tags: m.tags || '',
              main_type: main_type,
              // 侵权
              isCopyRightGrade: m.isCopyRightGrade || '',
              // 全幅
              isFuGrade: m.isFuGrade || '',
              // 图片一级分类
              newBasetype: m.newBasetype || '',
              // 图片二级分类
              newNexttype: m.newNexttype || '',
              // 小组一级分类
              teamBasetype: m.teamBasetype || '',
              // 小组二级分类
              teamNexttype: m.teamNexttype || '',
              width: res.data.width,
              height: res.data.height,
              imageName: names.slice(0, names.length - 1).join('.'),
              imageDir: res.data.imageDir,
              orgImage: res.data.orgImage,
              dpi: res.data.dpi,
              thumbImage: res.data.thumbImage,
              designImage: res.data.designImage,
              imageType: res.data.imageType,
            };
            console.log('上传文字 mirroring', mirroring);
            console.log('上传文字 data', data);
            // mirroring 不为null就是设计器的上传，确认镜像图关联关系和保存图
            if (mirroring) {
              data.type = mirroring.type;
              data.imageId = mirroring.imageId;
              const d = await GRequest(`/base-web/cm/cmDesignImageMirroringRef/check?usertype=1`, METHOD.POST, [data]);
              if (d.data.code != 0) {
                this.$message.warning('上传失败');
                return Promise.reject('上传设计图失败');
              }
              return d.data.data[0];
            }
            // 上传(设置上传主题图参数)
            const mainRes = await GRequest(`/base-web/CMDesignImageAct/ajaxSaveBatchDesign.act?usertype=1`, METHOD.POST, data, { timeout: 60000 });
            if (mainRes.data.code != 0) {
              this.$message.error(`${m.name}上传失败`);
              m.state = '0';
            } else {
              this.$emit('success', { type: 1, data: mainRes.data.data, seqId: this.initParams?.data?.seqId });
              console.log('上传成功', m);
              if (isDel) {
                this.delImgList(m);
              }
              // this.$message.success('上传成功！');
              // this.btn = false;
              return {
                fnM: m,
                ...mainRes.data.data,
              };
            }
          }

          // 重新上传
          if (secConfirm) {
            this.delImgList(m);
            this.loading = false;
            if (this.imgList.length == 0) {
              this.secConfirm = false;
              if (this.bmType != 2) {
                this.$message.success('上传成功！');
              }
              this.getList();
              this.$emit('success', res);
              // this.btn = false;
            }
          }
        }
        // 失败
        else {
          this.$message({
            message: `${m.name}上传失败`,
            type: 'error',
            duration: 0,
            showClose: true,
          });
          m.state = '0';
          // 单个上传的时候
          if (secConfirm) {
            this.loading = false;
          }
        }
      } finally {
        if (isLoading) {
          this.loading = false;
        }
        // 如果数据为空就关闭弹窗
        if (this.imgList.length == 0) {
          this.btn = false;
        }
      }
    },
    // 根据uid删除imgList的某条数据,filed
    delImgList(m, filed = 'uid') {
      let idx = this.imgList.findIndex((n) => {
        return n[filed] == m[filed];
      });
      if (idx != -1) this.imgList.splice(idx, 1);
    },
    //保存
    handlerSave() {
      let check = true;
      let imgList = _.cloneDeep(this.imgList);
      // console.log('imgList', JSON.parse(JSON.stringify(imgList)));
      for (let i = 0; i < imgList.length; i++) {
        if (!imgList[i].isCopyRightGrade) {
          this.$message.warning(`请选择‘${imgList[i].label}’是否侵权！`);
          check = false;
          break;
        }
        if (!imgList[i].isFuGrade) {
          this.$message.warning(`请选择‘${imgList[i].label}’是否全幅！`);
          check = false;
          break;
        }
      }
      if (!check) return;
      this.secConfirm = false;

      let resArr = this.imgList.map((m) => {
        return this.req(m, false, null, null, true, false);
      });
      console.log('this.imgList', this.imgList);
      this.loading = true;
      Promise.all(resArr)
        .then((res) => {
          if (this.imgList.length) {
            this.secConfirm = true;
            if (this.imgList.length !== imgList.length) {
              if (this.bmType != 2) {
                this.$message.success('其他图片上传成功');
              }
            }
          } else {
            if (this.bmType != 2) {
              // 清空imgList
              this.imgList.splice(0, this.imgList.length);
              this.$message.success('上传成功！');
            }
            this.getList();
            this.$emit('successAll', resArr);
            this.btn = false;
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="less" scoped>
:deep(.upLoadDialog .el-dialog__body) {
  padding: 10px 20px 30px;
}
</style>
