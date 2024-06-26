import { View } from '@/designClass/core/view/view';
import { Config3d } from '@/designClass/interface/interface';
import { DESIGN_TYPE, TEMPLATE_DESIGN_TYPE } from '@/designClass/core/define';
import { DesignerApp } from '@/designClass/core/designerAPP/designerApp';
import { Template3d } from '@/designClass/core/template/template3d';
import { getMultiList, getSubmitParam } from '@/designClass/util/template/multi';
import { DRequest, METHOD } from '@/utils/request';
import { getUuid } from '@/utils/fnUtils';
import { TemplateCamera3d } from '@/designClass/core/template/templateCamera3d';
import { TemplateExport } from '@/designClass/core/template/templateExport/templateExport';

export class Template {
  /**@type {DesignerApp} 设计器*/
  $app;

  /**@type {TEMPLATE_DESIGN_TYPE} 模板设计类型*/
  type;

  /**@type {string} 模板尺码*/
  size;

  /**@type {TemplateDetail|null} 模板详情*/
  detail;

  /**@type {View[]} 视图列表*/
  viewList = [];

  /**@type {Config3d} 3d配置*/
  config3d;

  /**@type {Template3d} 3d*/
  template3d;

  /**@type {TemplateExport} 导出按钮的配置*/
  templateExport;

  /**@type {array} 点击渲染后端返回的多角度*/
  renderMultiList = [];
  /**@type {RenderMulti[]} 多角度列表*/
  multiList = [];

  /**
   * @prop {Config3d} config3d 3d配置
   * @prop {TemplateDetail} detail 模板详情
   * @prop {DesignerApp} $app 设计器
   */
  constructor(config, detail, $app) {
    this.$app = $app;
    // 模板详情
    this.detail = detail;
    // 模板3d配置
    this.config3d = config;
    // 模板尺码
    this.size = this.config3d.size || '';
    // 模板设计类型
    this.type = this.size ? TEMPLATE_DESIGN_TYPE.refine : TEMPLATE_DESIGN_TYPE.common;
    // 模板3d
    this.template3d = new Template3d($app, this);
    // 模板导出
    this.templateExport = new TemplateExport($app, this);
    // 多角度列表
    this.getMultiList();
    // 初始化视图列表
    this.initViewList();
  }

  /**
   * 解析详情获取多角度列表
   */
  getMultiList() {
    /**@type RenderMulti[]*/
    let result = [];
    // 2d
    const appearance = this.detail.appearances.find((e) => e.id == this.$app.activeColorId);
    if (appearance) {
      result = getMultiList(appearance, this.renderMultiList);
    }

    // 3d
    if (this.template3d.isSureLoad3d) {
      const multi3dList = this.detail['3dAngleList']?.filter((e) => e.size === this.size) || [];
      if (multi3dList.length) {
        multi3dList.forEach((item) => {
          const resultItem = result.find((e) => e.bgImg.split('_').find((v) => v === item.angleName));
          resultItem.glb = item.glbPath;
          resultItem.glbContainerId = 'fn-' + getUuid();
          resultItem.loading = true;
          resultItem.templateCamera3d = new TemplateCamera3d(this.$app, this);
        });
      }
    }
    this.multiList = result;
  }

  /**
   * 创建多角度3d
   */
  createMulti3d() {
    this.multiList.forEach((item) => {
      if (item.glb) {
        const three = item.templateCamera3d;
        const container = document.getElementById(item.glbContainerId);
        three.create3d(container, item.glb);
      }
    });
  }

  /**
   * 渲染多角度(后端)
   */
  async onRender() {
    try {
      this.$app.loadingMulti = true;
      const param = await getSubmitParam(this);
      // console.log('渲染多角度 param', param);
      await DRequest(`/designer-web/CMDesignAct/realTimeCutMulti2.act?mediaType=json`, METHOD.POST, param, { timeout: 3 * 60 * 1000 }).then((res) => {
        if (res.data.retState !== '0') return;
        this.renderMultiList = res.data.cutList;
        // 重新解析多角度列表
        const appearance = this.detail.appearances.find((e) => e.id == this.$app.activeColorId);
        if (appearance) {
          const result = getMultiList(appearance, this.renderMultiList);
          this.multiList.forEach((item) => {
            if (item.id === result.id) {
              item.designImg = result.designImg;
            }
          });
        }
      });
    } finally {
      this.$app.loadingMulti = false;
    }
  }

  /**
   * 获取所有设计
   */
  getAllDesignData() {
    const list = this.viewList.map((view) => view.getDesignData());
    if (list.length && list[0].length && [DESIGN_TYPE.backgroundImage, DESIGN_TYPE.backgroundColor].includes(list[0][0].type)) {
      list.forEach((item, index) => {
        if (index !== 0) {
          item.splice(
            item.findIndex((e) => [DESIGN_TYPE.backgroundImage, DESIGN_TYPE.backgroundColor].includes(e.type)),
            1,
          );
        }
      });
    }

    return list;
  }

  /**
   * 应用设计
   */
  setAllDesignList(designDataList) {
    this.viewList.forEach((view, index) => view.setDesignData(designDataList[index] || []));
  }

  /**
   * 初始化视图列表
   */
  initViewList() {
    // 详情存在的话，初始化视图列表
    if (this.detail) {
      for (const view of this.detail.views) {
        this.viewList.push(new View(view, this.detail, this.$app, this));
      }
    }
  }

  /**
   * 创建所有canvas
   */
  createAllCanvas(containerList) {
    for (let i = 0; i < this.viewList.length; i++) {
      this.viewList[i].createCanvas(containerList[i]);
    }
  }

  /**
   * 销毁所有canvas
   */
  destroyAllCanvas() {
    for (const view of this.viewList) {
      view.destroyCanvas();
    }
  }

  /**
   * 销毁
   */
  destroy() {
    // 3d
    this.template3d.destroy();
    // 多角度3d
    this.multiList.forEach((item) => {
      item.templateCamera3d?.destroy();
    });
    // 2d
    this.destroyAllCanvas();
  }

  /**
   * 执行所有view的preview回调
   */
  previewCallbackAll() {
    for (const view of this.viewList) {
      view.previewModeCallback();
    }
    // 开启3d循环
    this.template3d.openAnimate();
  }

  /**
   * 执行所有view的edit回调
   */
  editCallbackAll() {
    for (const view of this.viewList) {
      view.editModeCallback();
    }
    // 关闭3d循环
    this.template3d.closeAnimate();
  }

  /**
   * 清空所有view的设计
   */
  clearAllDesign() {
    for (const view of this.viewList) {
      view.clearDesign();
    }
  }
}