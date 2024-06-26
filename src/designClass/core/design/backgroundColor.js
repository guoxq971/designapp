import { DESIGN_TYPE } from '@/designClass/core/define';
import { View } from '@/designClass/core/view/view';
import { Konva } from '@/fnDesigner/three/konva';
import { getUuid } from '@/utils/fnUtils';
import { Message } from 'element-ui';
import { DesignHandle } from '@/designClass/core/design/design';

export class BackgroundColorDesign extends DesignHandle {
  /**@type {DesignerApp} 设计器*/
  $app;
  /**@type {Template} 模板*/
  $template;
  /**@type {View} 视图*/
  $view;
  /**@type {string} 颜色*/
  colorCode;
  /**@type {DESIGN_TYPE}*/
  type = DESIGN_TYPE.backgroundColor;
  /**@type {Konva.Image} 节点*/
  node;
  /**@type {boolean} 是否设计*/
  isDesign = true;
  /**@type {string} fnUuid*/
  fnUuid = getUuid();

  /**
   @param {string} colorCode 颜色
   @param {DesignerApp} $app 设计器
   @param {Template} template 模板
   @param {View} view 视图
   */
  constructor(colorCode, $app, template, view) {
    super();
    this.$app = $app;
    this.$template = template;
    this.$view = view;
    this.colorCode = colorCode;

    this.init();
  }

  init() {
    const canvas = this.$view.canvas;
    const colorCode = this.colorCode;

    // 是否已存在背景图
    const hasBackgroundImage = canvas.designList.some((e) => e.attrs.type === DESIGN_TYPE.backgroundImage);
    if (hasBackgroundImage) {
      Message.warning('背景图已存在，无法添加背景色');
      return;
    }

    // 是否存在背景色
    const hasBackgroundColor = canvas.designList.some((e) => e.attrs.type === DESIGN_TYPE.backgroundColor);
    switch (hasBackgroundColor) {
      // 存在，修改对应颜色
      case true:
        this.change(colorCode);
        break;
      // 不存在，创建
      case false:
        this.create(colorCode);
        break;
      default:
        this.create(colorCode);
        break;
    }
  }

  create(colorCode) {
    // 获取视图数据
    const viewInfo = this.$view.getInfo();
    // 加载图片，并添加到设计层,所有视图的背景图都是一样的
    const createFn = () => {
      return new Konva.Rect({
        fnUuid: this.fnUuid,
        $design: this,
        type: DESIGN_TYPE.backgroundColor,
        x: 0,
        y: 0,
        offsetX: 0,
        offsetY: 0,
        width: viewInfo.print.width,
        height: viewInfo.print.height,
        fill: colorCode,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        draggable: false, // 是否可拖拽
        visible: true,
      });
    };
    // 添加到视图
    const node = createFn();
    this.node = node;
    this.$view.canvas.backgroundGroup.add(node);
    // 更新模型
    this.updateMesh();
  }

  change(colorCode) {
    this.$template.viewList.forEach((view) => {
      view.canvas.backgroundGroup.children.forEach((node) => {
        node.setAttr('fill', colorCode);
      });
    });
    // 更新模型
    this.updateMesh();
  }

  /**
   * 获取提交的数据
   */
  async getSubmitData() {
    const data = {
      type: 'backgroundColor',
      printArea: { id: this.$view.id },
      offset: { x: 1, y: 1, unit: 'mm' },
      content: {
        dpi: this.$template.detail.dpi,
        unit: 'mm',
        svg: this.colorCode,
      },
      printType: { id: 17 },
      isCopy: '',
      isText: false,
      textId: '',
      restrictions: { changeable: true },
    };

    data.fnData = {
      colorCode: this.colorCode,
      type: this.type,
    };
    return data;
  }
}
