import { getBox, getPrintBox } from '@/designClass/util/view/viewUtil';
import { ImageDetail, TextParam, ViewCanvas, ViewDetail, ViewPrintInfo } from '@/designClass/interface/interface';
import { DesignerApp } from '@/designClass/core/designerAPP/designerApp';
import { Template } from '@/designClass/core/template/template';
import { computed } from 'vue';
import { createCanvas } from '@/designClass/util/view/createCanvas';
import { getPath } from '@/fnDesigner/js/pathLayer';
import { CANVAS_DESIGN_TYPE_BACKGROUND_COLOR_LIGHT_THREE, CANVAS_PATH_TYPE_EDIT_D, CANVAS_PATH_TYPE_PREVIEW_D_2D, PRIMARY_COLOR } from '@/fnDesigner/config/common';
import { clipFunc } from '@/fnDesigner/js/clipFunc';
import { ImageDesign } from '@/designClass/core/design/image';
import { verifyImage } from '@/designClass/util/design/image';
import { DESIGN_TYPE, LINE_TYPE, MODE_TYPE } from '@/designClass/core/define';
import { BackgroundImageDesign } from '@/designClass/core/design/backgroundImage';
import { BackgroundColorDesign } from '@/designClass/core/design/backgroundColor';
import { TextDesign } from '@/designClass/core/design/text';
import * as TWEEN from '@tweenjs/tween.js';

export class View {
  /**@type {DesignerApp} 设计器*/
  $app;
  /**@type {Template} 模板*/
  $template;
  /**@type {string} 视图id*/
  id;
  /**@type {string} 视图名称*/
  name;
  /**@type {string} 偏移量x*/
  offsetX;
  /**@type {string} 偏移量y*/
  offsetY;
  /**@type {ViewCanvas|null}*/
  canvas;
  /**@type {string} 激活的设计图自定义id*/
  activeDesignId;
  /**@type {boolean} 是否正在高亮*/
  isHighlight = false;

  /**@type {DesignItem[]} 设计列表*/
  designList = [];

  /**
   * @param {ViewDetail} view 视图详情
   * @param {TemplateDetail} templateDetail 模板详情
   * @param {DesignerApp} da 设计器
   * @param {Template} template 模板
   */
  constructor(view, templateDetail, da, template) {
    this.$app = da;
    this.$template = template;
    this.id = view.id;
    this.name = view.name;
    this.offsetX = view.viewMaps[0].offset.x;
    this.offsetY = view.viewMaps[0].offset.y;
  }

  /**
   * 应用设计信息
   */
  setDesignData(designData) {
    designData.forEach((data) => {
      switch (data.type) {
        case DESIGN_TYPE.text:
          this.addDesignText(data.param);
          break;
        case DESIGN_TYPE.image:
          this.addDesignImage(data.detail);
          break;
        case DESIGN_TYPE.backgroundImage:
          this.addDesignBackgroundImage(data.detail);
          break;
        case DESIGN_TYPE.backgroundColor:
          this.addDesignBackgroundColor(data.colorCode);
          break;
      }
    });
  }

  /**
   * 获取设计信息
   */
  getDesignData() {
    return this.designList.map((design) => {
      const attrs = {
        x: design.node.attrs.x,
        y: design.node.attrs.y,
        rotation: design.node.attrs.rotation,
        scaleX: design.node.attrs.scaleX,
        scaleY: design.node.attrs.scaleY,
      };
      return {
        type: design.type,
        detail: design.detail,
        param: design.param,
        colorCode: design.colorCode,
        tile: design.tileClass?.getParam(),
        attrs,
      };
    });
  }

  /**
   * 更新模型材质
   * @param {updateMeshOpt} opt
   */
  updateMesh(opt = {}) {
    opt = Object.assign({ multi: true }, opt);
    const meshItem = this.$template.template3d.meshList.find((e) => e.viewId == this.id);
    if (meshItem) {
      setTimeout(() => {
        // 更新中间画布
        meshItem.mesh.material.map.needsUpdate = true;
        if (opt.multi) {
          // 更新多角度
          this.$template.multiList.forEach((item) => item.templateCamera3d?.updateMesh());
        }
      }, 50);
    }
  }

  /**
   * 添加设计 - 文字
   * @param {TextParam} param
   * @param {Object} attrs 初始化参数
   */
  async addDesignText(param, attrs = {}) {
    if (param.fnUuid) {
      const textDesign = this.designList.find((design) => design.node.attrs.fnUuid === param.fnUuid);
      if (!textDesign) {
        console.error('添加设计 - 文字，失败，未找到该设计');
        return;
      }
      textDesign.change(param);
      return;
    }
    await verifyImage(DESIGN_TYPE.text, null, this.$app);
    const design = new TextDesign(param, this.$app, this.$template, this, attrs);
    this.designList.push(design);
    return design;
  }

  /**
   * 添加设计 - 设计图
   * @param {ImageDetail} detail
   * @param {object} attrs 初始化的属性
   */
  async addDesignImage(detail, attrs = {}) {
    await verifyImage(DESIGN_TYPE.image, detail, this.$app);
    const design = new ImageDesign(detail, this.$app, this.$template, this, attrs);
    this.designList.push(design);
    return design;
  }

  /**
   * 添加设计 - 背景图
   * @param {ImageDetail} detail
   * @param {object} attrs 初始化的属性
   */
  async addDesignBackgroundImage(detail, attrs = {}) {
    await verifyImage(DESIGN_TYPE.backgroundImage, detail, this.$app);
    this.$template.viewList.forEach((view) => {
      view.designList.push(new BackgroundImageDesign(detail, this.$app, this.$template, view, attrs));
    });
  }

  /**
   * 添加设计 - 背景色
   * @param {string} colorCode
   */
  async addDesignBackgroundColor(colorCode) {
    await verifyImage(DESIGN_TYPE.backgroundColor, null, this.$app);

    // 已存在背景色就修改
    const isSame = this.canvas.backgroundGroup.getChildren().some((node) => node.attrs.type === DESIGN_TYPE.backgroundColor);
    if (isSame) {
      this.$template.viewList.forEach((view) => {
        view.designList.forEach((design) => {
          if (design.type === DESIGN_TYPE.backgroundColor) {
            design.colorCode = colorCode;
            design.change(colorCode);
          }
        });
      });
      return;
    }

    this.$template.viewList.forEach((view) => {
      view.designList.push(new BackgroundColorDesign(colorCode, this.$app, this.$template, view));
    });
  }

  /**
   * 当前激活的设计
   * @type {DesignItem|null}
   */
  activeDesign = computed(() => {
    return this.designList.find((design) => design.node?.attrs.fnUuid === this.activeDesignId);
  });

  /**
   * 设置激活设计
   * @param {DesignItem|Konva.Image} design
   */
  setActiveDesign(design) {
    const transformer = this.canvas.transformer;
    const node = design?.isDesign ? design?.node : design;
    design = node.attrs.$design;
    if (node.attrs.type === DESIGN_TYPE.backgroundColor) {
      console.error('背景色不能选中');
      return;
    }

    // 不能选中 =  如果当前是预览模式 && 3d可加载 && 模型操作=false
    if (this.$app.mode === MODE_TYPE.preview && this.$app.activeTemplate.template3d.isSureLoad3d && !this.$app.modelOperational) {
      return;
    }

    // 选中设计
    transformer.attachTo(node);
    transformer.visible(true);
    this.activeDesignId = node.attrs.fnUuid;
  }

  /**
   * 清空图层设计
   */
  clearDesign() {
    this.designList.forEach((design) => {
      design.remove();
    });
    this.designList = [];
    this.setActiveNull();
  }

  /**
   * 模板图
   * */
  image = computed(() => {
    if (this.$app && this.$template) {
      const activeColorId = this.$app.activeColorId;
      const appearances = this.$template.detail.appearances;
      const d = appearances.find((e) => e.id == activeColorId);
      const s = d?.views.find((e) => e.id == this.id);
      if (s) {
        return s.image;
      }
    }
    return '';
  });
  /**
   * 模板纹理图
   * */
  texture = computed(() => {
    if (this.$app && this.$template) {
      const activeColorId = this.$app.activeColorId;
      const appearances = this.$template.detail.appearances;
      const d = appearances.find((e) => e.id == activeColorId);
      const s = d?.views.find((e) => e.id == this.id);
      if (s) {
        return s.texture;
      }
    }
    return '';
  });

  /**
   * 设置选中为空
   */
  setActiveNull() {
    const node = this.canvas.transformer.node();
    if (node) {
      node?.attrs?.$design?.updateMesh();
    }
    this.canvas.transformer.visible(false);
    this.canvas.transformer.nodes([]);
    this.activeDesignId = '';
  }

  /**
   * 预览模式回调
   */
  previewModeCallback() {
    if (this.canvas) {
      // 设置超出隐藏
      const editD = getPath(this.canvas.pathLayer, CANVAS_PATH_TYPE_PREVIEW_D_2D);
      if (editD) {
        this.canvas.group.setAttr('clipFunc', (ctx) => clipFunc(ctx, editD));
        this.canvas.backgroundGroup.setAttr('clipFunc', (ctx) => clipFunc(ctx, editD));
      }
      // 设置车线
      this.canvas.pathLayer.visible(false);
      // 隐藏选中框
      this.setActiveNull();
      // 更新模型
      this.updateMesh();
      // 显示3d高亮
      this.canvas.threeLightGroup.children.forEach((node) => node.visible(true));
    }
  }

  /**
   * 编辑模式回调
   */
  editModeCallback() {
    if (this.canvas) {
      const len = this.$template.detail?.pointoutPrintAreas?.length === 0;
      let fn = null;
      if (!len) {
        const d = getPath(this.canvas.pathLayer, CANVAS_PATH_TYPE_EDIT_D);
        fn = (ctx) => clipFunc(ctx, d);
      }
      // 设置超出隐藏
      this.canvas.group.setAttr('clipFunc', fn);
      this.canvas.backgroundGroup.setAttr('clipFunc', fn);

      // 设置path
      this.canvas.pathLayer.visible(true);

      // 隐藏3d高亮
      this.canvas.threeLightGroup.children.forEach((node) => node.visible(false));
    }
  }

  /**
   * 创建canvas
   * @param {HTMLElement|null} container
   */
  createCanvas(container) {
    if (!container) {
      return console.error('createCanvas: container is required');
    }

    this.canvas = createCanvas({
      container,
      viewInfo: this.getInfo(),
      $app: this.$app,
      $view: this,
    });
  }

  /**
   * 辅助线
   * @param {LINE_TYPE} type
   * @param {DesignItem} design
   */
  drawLine(type, design) {
    if (!this.$app.isDrawLine) {
      return;
    }
    switch (type) {
      case LINE_TYPE.down:
        this.canvas.lineLayer.visible(true);
        design.node.opacity(0.75);
        break;
      case LINE_TYPE.up:
        this.canvas.lineLayer.visible(false);
        design.node.opacity(1);
        break;
    }
  }

  /**
   * 磁吸
   * @param {DesignItem} design
   */
  magnet(design) {
    if (!this.$app.isMagnet) {
      return;
    }
    const node = design.node;
    // 设计的四个点的坐标是否与六条辅助线接近(num=10)
    const num = 4;
    // designPos
    const dp = getBox(node).bbox;
    // printPos
    const ps = getPrintBox(this.getInfo()).bbox;
    // 判断是否在辅助线上
    function hasActive(n) {
      return Math.abs(n) <= num;
    }
    function unActive(lineNode) {
      lineNode.setAttrs({
        stroke: PRIMARY_COLOR,
        strokeWidth: 1.6,
      });
    }
    function active(lineNode) {
      lineNode.setAttrs({
        stroke: '#67c23a',
        strokeWidth: 3,
      });
    }
    this.canvas.lineLayer?.children.forEach((lineNode) => {
      if (lineNode.attrs.type === '上') {
        if (hasActive(dp.y - ps.y)) {
          active(lineNode);
          node.setAttrs({ y: node.y() + (ps.y - dp.y) });
        } else if (hasActive(dp.y2 - ps.y)) {
          active(lineNode);
          node.setAttrs({ y: node.y() + (ps.y - dp.y2) });
        } else if (hasActive(dp.cy - ps.y)) {
          active(lineNode);
          node.setAttrs({ y: node.y() + (ps.y - dp.cy) });
        } else {
          unActive(lineNode);
        }
      } else if (lineNode.attrs.type === '下') {
        if (hasActive(dp.y - ps.y2)) {
          active(lineNode);
          node.setAttrs({ y: node.y() + (ps.y2 - dp.y) });
        } else if (hasActive(dp.y2 - ps.y2)) {
          active(lineNode);
          node.setAttrs({ y: node.y() + (ps.y2 - dp.y2) });
        } else if (hasActive(dp.cy - ps.y2)) {
          active(lineNode);
          node.setAttrs({ y: node.y() + (ps.y2 - dp.cy) });
        } else {
          unActive(lineNode);
        }
      } else if (lineNode.attrs.type === '左') {
        if (hasActive(dp.x - ps.x)) {
          active(lineNode);
          node.setAttrs({ x: node.x() + (ps.x - dp.x) });
        } else if (hasActive(dp.x2 - ps.x)) {
          active(lineNode);
          node.setAttrs({ x: node.x() + (ps.x - dp.x2) });
        } else if (hasActive(dp.cx - ps.x)) {
          active(lineNode);
          node.setAttrs({ x: node.x() + (ps.x - dp.cx) });
        } else {
          unActive(lineNode);
        }
      } else if (lineNode.attrs.type === '右') {
        if (hasActive(dp.x - ps.x2)) {
          active(lineNode);
          node.setAttrs({ x: node.x() + (ps.x2 - dp.x) });
        } else if (hasActive(dp.x2 - ps.x2)) {
          active(lineNode);
          node.setAttrs({ x: node.x() + (ps.x2 - dp.x2) });
        } else if (hasActive(dp.cx - ps.x2)) {
          active(lineNode);
          node.setAttrs({ x: node.x() + (ps.x2 - dp.cx) });
        } else {
          unActive(lineNode);
        }
      } else if (lineNode.attrs.type === '中水平线') {
        if (hasActive(dp.y - ps.cy)) {
          active(lineNode);
          node.setAttrs({ y: node.y() + (ps.cy - dp.y) });
        } else if (hasActive(dp.y2 - ps.cy)) {
          active(lineNode);
          node.setAttrs({ y: node.y() + (ps.cy - dp.y2) });
        } else if (hasActive(dp.cy - ps.cy)) {
          active(lineNode);
          node.setAttrs({ y: node.y() + (ps.cy - dp.cy) });
        } else {
          unActive(lineNode);
        }
      } else if (lineNode.attrs.type === '中垂直线') {
        if (hasActive(dp.x - ps.cx)) {
          active(lineNode);
          node.setAttrs({ x: node.x() + (ps.cx - dp.x) });
        } else if (hasActive(dp.x2 - ps.cx)) {
          active(lineNode);
          node.setAttrs({ x: node.x() + (ps.cx - dp.x2) });
        } else if (hasActive(dp.cx - ps.cx)) {
          active(lineNode);
          node.setAttrs({ x: node.x() + (ps.cx - dp.cx) });
        } else {
          unActive(lineNode);
        }
      }
    });
  }

  /**
   * 销毁canvas
   */
  destroyCanvas() {
    if (this.canvas) {
      const item = this.canvas;
      if (item) {
        if (item?.designList) {
          item?.designList?.forEach((it) => it.destroy());
        }
        if (item?.pathLayer) {
          item?.pathLayer?.children.forEach((it) => it.destroy());
        }
        if (item?.layer) {
          item?.layer?.children.forEach((it) => it.destroy());
        }
        if (item?.stage) {
          item?.stage?.destroy();
        }
        if (item?.lineLayer) {
          item?.lineLayer?.destroy();
        }
        if (item.container) {
          item.container.innerHTML = '';
        }
        Object.keys(item).forEach((key) => {
          if (key === 'designList') {
            //
          } else {
            item[key] = null;
          }
        });
      }
    }
  }

  /**
   * 获取视图信息
   * @returns {ViewPrintInfo}
   */
  getInfo() {
    const templateDetail = this.$template.detail;
    const viewId = this.id;

    const print = templateDetail.printAreas.find((e) => e.defaultView.id === viewId);
    const printout = templateDetail.pointoutPrintAreas.find((e) => e.defaultView.id === viewId);
    const view = templateDetail.views.find((e) => e.id === viewId);

    return {
      width: print?.boundary?.size?.width,
      height: print?.boundary?.size?.height,
      offsetX: view.viewMaps[0].offset.x,
      offsetY: view.viewMaps[0].offset.y,
      printout: {
        d: printout?.soft?.d,
        v: printout?.soft?.v,
        x: printout?.size.x,
        y: printout?.size.y,
        width: printout?.size.width,
        height: printout?.size.height,
      },
      print: {
        d: print?.boundary?.soft?.content?.svg?.path?.d,
        width: print?.boundary?.size?.width,
        height: print?.boundary?.size?.height,
        d_3d: null,
        d_2d: print?.boundary?.soft?.content?.svg?.path?.d,
      },
      //   if (this.isNeed3d) {
      // d = this.config3d.viewList?.find((e) => e.viewId == this.view.id)?.uvD;
      // d_3d = d;
    };
  }

  /**
   * 高亮动画
   */
  higLightAnimation() {
    // 有3d才能执行
    if (!this.$template.template3d.isSureLoad3d) {
      return;
    }
    const lightRect = this.canvas.threeLightGroup.children.find((e) => e.attrs.type === CANVAS_DESIGN_TYPE_BACKGROUND_COLOR_LIGHT_THREE);
    if (!lightRect) {
      console.error('lightRect is null');
      return;
    }

    if (this.isHighlight) {
      return;
    }

    // 当前颜色
    const changeColor = PRIMARY_COLOR; //#4087ff

    const updateModel = () => {
      this.updateMesh();
    };

    // 高亮 1=白 0=深, 值越小越深色
    // t1
    const p0 = { n: 0 };
    const p1 = { n: 0.85 };
    //t2
    const p2 = { n: 0.85 };
    const p3 = { n: 0 };

    // 开始
    const start = () => {
      lightRect.setAttr('fill', changeColor);
      updateModel();
      this.isHighlight = true;
    };

    // 过程
    const update = (n) => {
      try {
        lightRect.setAttr('opacity', n);
        updateModel();
      } catch (e) {
        console.log('update error 高亮过程切换了1', e);
      }
    };

    // 结束
    const complete = () => {
      try {
        if (this) {
          lightRect.setAttr('opacity', 0);
          this.isHighlight = false;
          updateModel();
        }
      } catch (e) {
        console.log('update error 高亮过程切换了2', e);
      }
    };

    // 动画
    const t1 = new TWEEN.Tween(p0)
      .delay(200)
      .to(p1, 400)
      .onUpdate(({ n }) => {
        update(n);
      })
      .onStart(() => {
        start();
      })
      .easing(TWEEN.Easing.Quadratic.InOut);
    const t2 = new TWEEN.Tween(p2)
      .to(p3, 700)
      .onUpdate(({ n }) => {
        update(n);
      })
      .onComplete(() => {
        complete();
      })
      .easing(TWEEN.Easing.Quadratic.InOut);
    t1.chain(t2);
    t1.start();
  }

  /**
   * 摄像机动画
   */
  cameraAnimation(callback = null, time = 600) {
    if (!this.$template.template3d.isSureLoad3d) {
      return;
    }
    callback = callback ? callback : () => this.higLightAnimation();
    const camera = this.$template.template3d?.three.camera;
    const target = this.$template.template3d?.cameraPositionList.find((e) => e.viewId == this.id);
    if (!target) {
      callback && callback();
      return;
    }
    const p0 = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const p1 = { x: target.position.x, y: target.position.y, z: target.position.z };

    const t1 = new TWEEN.Tween(p0)
      .to(p1, time)
      .onUpdate(({ x, y, z }) => {
        camera.position.set(x, y, z);
      })
      .onComplete(() => {
        callback && callback();
      })
      .easing(TWEEN.Easing.Quadratic.InOut);
    t1.start();
  }
}
