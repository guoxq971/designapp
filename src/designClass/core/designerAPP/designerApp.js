import { Template } from '@/designClass/core/template/template';
import { ImageDetail } from '@/designClass/interface/interface';
import { getTemplateConfig, getRefineSizeDetail, getRefineSizeConfig3d } from '@/designClass/util/template/gerTemplateConfig';
import { Message, MessageBox } from 'element-ui';
import { GRequest, METHOD } from '@/utils/request';
import { getUuid } from '@/utils/fnUtils';
import { computed, ComputedRef } from 'vue';
import { MODE_TYPE, TEMPLATE_DESIGN_TYPE, TRANSFORMER_TYPE } from '@/designClass/core/define';
import { getImageId } from '@/designClass/util/design/image';
import { View } from '@/designClass/core/view/view';

/**
 * 设计器
 */
export class DesignerApp {
  /**@type {TEMPLATE_DESIGN_TYPE} 激活的模板类型*/
  activeTemplateType = TEMPLATE_DESIGN_TYPE.common;
  /**@type {string} 激活尺码id*/
  activeSizeId = '';
  /**@type {string} 激活视图id*/
  activeViewId = '';
  /**@type {string} 激活颜色id*/
  activeColorId = '';
  /**@type {string} 当前激活的模板seqId*/
  activeTemplateId = '';
  /**@type {Template|null} 当前激活的模板*/
  activeTemplate = null;
  /**@type {MODE_TYPE} 模式*/
  mode = MODE_TYPE.preview;
  /**@type {string} id拼接*/
  canvas2dId = 'canvas2d';
  /**@type {string} id*/
  canvas3dId = 'canvas3d';

  /**@type {string} 监听模板刷新*/
  watchTemplateUuid = '1';

  /**@type {boolean} 模板加载loading*/
  loading = false;
  /**@type {boolean} 多角度加载loading*/
  loadingMulti = false;

  /**@type {Template[]} 模板列表*/
  templateList = [];

  /**@type {array[]} 价格列表*/
  priceList = [];
  /**@type {boolean} 价格loading*/
  priceLoading = false;
  /**@type {string} 特殊价格|特殊尺码*/
  specialType = '';

  /**@type {boolean} 右键菜单开关*/
  menuVisible = false;

  /**@type {boolean} 其他设置浮动弹窗开关*/
  otherSettingVisible = false;

  /**@type {boolean} 设计列表开关*/
  designListVisible = true;

  /**@type {boolean} 设计图/背景图的浮动弹窗开关*/
  collectPopVisible = false;

  /**@type {boolean} 定位的浮动弹窗开关*/
  positionPopVisible = false;

  /**@type {string} 更新收藏模板列表*/
  collectTemplateUuid = '';
  /**@type {TemplateDetail[]} 收藏产品列表*/
  templateCollectList = [];

  /**@type {string} 更新设计图收藏列表*/
  imageCollectUuid = '';
  /**@type {ImageDetail[]} 收藏设计图列表*/
  imageCollectList = [];

  /**@type {string} 更新背景收藏列表*/
  backgroundCollectUuid = '';
  /**@type {ImageDetail[]} 收藏背景图列表*/
  backgroundCollectList = [];

  /**@type {TemplateDetail|null} 鼠标经过模板*/
  hoverTemplateDetail = null;
  /**@type {ImageDetail|null} 鼠标经过图*/
  hoverImageDetail = null;
  /**@type{number|null} 鼠标经过*/
  hoverTimer = null;

  /**@type {boolean} 选中框按下[缩放|旋转]*/
  transformerStartDown = false;
  /**@type {TRANSFORMER_TYPE} 选中框操作类型[缩放|旋转]*/
  transformerStartType = TRANSFORMER_TYPE.none;
  /**@type {boolean} 模型操作*/
  modelOperational = false;
  /**@type {boolean} 辅助线*/
  isDrawLine = false;
  /**@type {boolean} 磁吸*/
  isMagnet = false;

  /**
   * 是否展示canvas
   * @type {ComputedRef<boolean>}
   */
  isShow2d = computed(() => {
    let result = true;
    // 能加载3d
    if (this.activeTemplate.template3d?.isSureLoad3d && this.mode === MODE_TYPE.preview) {
      result = false;
    }
    return result;
  });

  /**
   * 设置模式-预览
   */
  setModePreview() {
    this.mode = MODE_TYPE.preview;
    this.activeTemplate.previewCallbackAll();
    // 更新3d材质
    this.activeTemplate.template3d?.updateMesh();
  }

  /**
   * 设置模式-编辑
   */
  setModeEdit(force = false) {
    // 阻止进入编辑模式
    if (this.activeTemplate.template3d?.isSureLoad3d && !force) {
      return;
    }
    this.mode = MODE_TYPE.edit;
    this.activeTemplate?.editCallbackAll();
  }

  /**
   * 设置模式-变化
   */
  setModeChange() {
    if (this.mode === MODE_TYPE.edit) {
      this.setModePreview();
    } else {
      this.setModeEdit();
    }
  }

  /**
   * 设置模板
   * @param {TemplateDetail} detail
   * */
  async setTemplate(detail) {
    const designDataList = this.activeTemplate?.getAllDesignData() || [];

    // 清空之前的缓存
    this.templateList.forEach((template) => template.destroy());
    this.templateList = [];
    try {
      this.loading = true;

      // 获取模板配置
      const { commonConfig, refineConfigList } = await getTemplateConfig(detail.templateNo);

      // 通用
      if (commonConfig.isUse) {
        this.templateList.push(new Template(commonConfig, detail, this));
      }
      // 精细
      refineConfigList.forEach((refineConfig) => {
        if (refineConfig.isUse) {
          this.templateList.push(new Template(refineConfig, null, this));
        }
      });

      if (!this.templateList.length) {
        const msg = '该产品的模板已关闭';
        Message.warning(msg);
        this.useTemplate();
        return Promise.reject(msg);
      }

      // 获取价格
      this.getTemplatePrice(detail.templateNo);
      // 使用第一个模板
      await this.useTemplate(this.templateList[0]);
      setTimeout(() => this.activeTemplate?.setAllDesignList(designDataList));
    } finally {
      this.loading = false;
      this.watchTemplateUuid = getUuid();
    }
  }

  /**
   * 使用模板 - 根据尺码
   * @param {TEMPLATE_DESIGN_TYPE} type
   * @param {string} size
   */
  async useTemplateBySize(type, size = '') {
    let template;
    let msg;
    switch (type) {
      // 通用
      case TEMPLATE_DESIGN_TYPE.common:
        template = this.templateList.find((e) => e.type === type);
        if (!template) {
          msg = '该产品的模板已关闭';
          Message.warning(msg);
          return Promise.reject(msg);
        }
        break;
      // 精细
      case TEMPLATE_DESIGN_TYPE.refine:
        if (!size) {
          const refineList = this.templateList.filter((e) => e.type === type);
          if (!refineList.length) {
            msg = '该产品的模板已关闭';
            Message.warning(msg);
            return Promise.reject(msg);
          }
          template = refineList[0];
        } else {
          template = this.templateList.find((e) => e.type === type && e.size === size);
          if (!template) {
            msg = '该产品的模板已关闭';
            Message.warning(msg);
            return Promise.reject(msg);
          }
        }
        break;
      default:
        msg = '未知的模板类型';
        Message.warning(msg);
        return Promise.reject(msg);
    }
    await this.useTemplate(template);
  }

  /**
   * 获取模板尺码的详情
   * @private
   * @param {Template} template
   */
  async getTemplateDetailWithSize(template) {
    this.loading = true;
    try {
      const templateNo = template.config3d.templateNo;
      const size = template.size;
      // 获取精细尺码的详情
      const detail = await getRefineSizeDetail(templateNo, size);
      if (!detail) {
        await this.useTemplate();
        const msg = '获取精细尺码的详情失败';
        Message.warning(msg);
        return Promise.reject(msg);
      }
      const config3d = await getRefineSizeConfig3d(templateNo, size);
      template.detail = detail;
      template.config3d = config3d;
      // 初始化视图列表
      template.initViewList();
    } finally {
      this.loading = false;
    }
  }

  /**
   * 使用模板
   * @param {Template|null} template
   */
  async useTemplate(template = null) {
    if (!template) {
      this.activeTemplate = null;
      this.activeTemplateId = '';
      this.activeColorId = '';
      this.activeSizeId = '';
      this.activeTemplateType = TEMPLATE_DESIGN_TYPE.common;
      return;
    }
    // 详情不存在,获取
    if (!template.detail) {
      await this.getTemplateDetailWithSize(template);
    }
    // 配置不存在,获取
    if (!template.templateExport.isRequest) {
      template.templateExport.getConfigApi();
    }

    // 加载2d
    setTimeout(() => {
      const doms = this.activeTemplate.viewList.map((view) => document.getElementById(this.canvas2dId + view.id));
      this.activeTemplate.destroy();
      this.activeTemplate.createAllCanvas(doms);
      this.setModePreview();
    });
    // 加载3d
    setTimeout(() => {
      if (this.activeTemplate.template3d.isSureLoad3d) {
        this.activeTemplate.template3d.create3d(document.getElementById(this.canvas3dId), () => this.activeTemplate.createMulti3d());
      }
    });
    this.activeTemplateType = template.type;
    this.activeTemplate = template;
    this.activeTemplateId = template?.detail?.seqId;
    this.activeColorId = template?.detail.sizes[0].id;
    this.activeSizeId = template?.detail.appearances[0].id;
    this.activeViewId = template?.detail.views[0].id;
  }

  /**
   * 获取模板价格
   * @private
   * @param {string} templateNo
   */
  getTemplatePrice(templateNo) {
    this.priceLoading = true;
    GRequest(`/base-web/CMDesignerAct/listTemplatePrice`, METHOD.GET, { templateNo })
      .then((res) => {
        if (res.data.code !== 0) return;
        // 模板价格返回为空
        if (Object.keys(res.data.data).length === 0) {
          this.specialType = '';
          this.priceList = [];
          return;
        }
        this.specialType = res.data.data.templateType;
        this.priceList = res.data.data.resList.map((e) => {
          return {
            prop: e.templateProperty,
            list: e.priceList, //{price,num}
          };
        });
      })
      .finally(() => {
        this.priceLoading = false;
      });
  }

  /**
   * 更新收藏模板列表
   */
  getCollectTemplateList() {
    this.collectTemplateUuid = getUuid();
  }

  /**
   * 更新收藏背景图列表
   */
  getCollectBackgroundImageList() {
    this.backgroundCollectUuid = getUuid();
  }

  /**
   * 更新收藏设计图列表
   */
  getCollectImageList() {
    this.imageCollectUuid = getUuid();
  }

  /**
   * 是否是收藏模板
   * @type {(TemplateDetail)=>(boolean)}
   */
  isCollectTemplate = computed(() => {
    return (item) => {
      return this.templateCollectList.some((e) => e.id === item.id);
    };
  });

  /**
   * 当前的颜色列表
   * @type {ComputedRef<Appearance[]>}
   */
  colorList = computed(() => {
    const result = [];
    this.activeTemplate.detail?.appearances?.forEach((item) => {
      result.push({
        ...item,
        id: item.id,
        colorCode: item.colors[0].value,
        colorName: item.name,
      });
    });
    return result;
  });

  /**
   * 当前的颜色
   * @type {ComputedRef<Appearance>} 颜色item
   */
  activeColor = computed(() => {
    let result;
    if (!this.activeColorId) {
      result = null;
    } else if (!this.colorList.length) {
      result = null;
    } else if (!this.activeTemplate) {
      result = null;
    } else {
      result = this.colorList.find((e) => e.id === this.activeColorId);
    }
    return result;
  });

  /**
   * 当前激活的view
   * @type {View|null}
   */
  activeView = computed(() => {
    let result;
    if (!this.activeViewId) {
      result = null;
    } else if (!this.activeTemplate) {
      result = null;
    } else {
      result = this.activeTemplate.viewList.find((e) => e.id === this.activeViewId);
    }
    return result;
  });

  /**
   * 当前激活的设计
   * @type {DesignItem|null}
   */
  activeDesign = computed(() => {
    return this.activeView?.designList.find((design) => design.node?.attrs.fnUuid === this.activeView.activeDesignId);
  });

  /**
   * 当前激活的设计列表
   * @type {DesignNode[]}
   */
  activeCanvasDesignList = computed(() => {
    return this.activeView?.canvas?.designList || [];
  });

  /**
   * 获取收藏的设计图
   * @param {ImageDetail} item
   * @returns {ImageDetail|null}
   */
  getCollectImageFn(item) {
    let id = getImageId(item);
    let list = [];
    if (item.isBg) {
      list = this.backgroundCollectList;
    } else {
      list = this.imageCollectList;
    }
    return list.find((e) => e.seqId === id);
  }

  /**
   * 收藏/取消收藏设计
   * @param {ImageDetail} data
   * @returns {Promise<void>}
   */
  async collectImage(data) {
    const result = this.getCollectImageFn(data);
    const id = getImageId(data);
    if (result) {
      await MessageBox.confirm('确定取消收藏该设计图吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      // 取消收藏
      await GRequest(`/base-web/CMDesignImageQuickAct/deleteImage.act?seqId=${result?.quickimgid}`, METHOD.POST, { seqId: id });
    } else {
      // 收藏
      if (data.isBg) {
        await GRequest(`/base-web/CMDesignImageQuickAct/saveQuickDesignImage.act`, METHOD.GET, { imgId: id });
      } else {
        await GRequest(`/base-web/CMDesignImageQuickAct/saveQuickDesignImageSJ.act`, METHOD.GET, { imgId: id });
      }
    }
    Message.success('操作成功');

    // 重新获取收藏列表
    if (data.isBg) {
      this.getCollectBackgroundImageList();
    } else {
      this.getCollectImageList();
    }
  }

  /**
   * 是否是收藏设计图 computed
   * @type {ComputedRef<function(ImageDetail): boolean>}
   */
  isCollectImage = computed(() => {
    return (item) => {
      let id = '';
      let list = [];
      if (item.isBg) {
        list = this.backgroundCollectList;
      } else {
        list = this.imageCollectList;
      }
      // 这是从收藏列表进来的
      if (!!item.quickimgid) {
        id = item.seqId;
      } else {
        id = item.id;
      }
      return list.some((e) => e.seqId === id);
    };
  });
}
