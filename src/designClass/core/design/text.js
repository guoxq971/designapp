import { DESIGN_TYPE } from '@/designClass/core/define';
import { View } from '@/designClass/core/view/view';
import { Konva } from '@/fnDesigner/three/konva';
import { getUuid } from '@/utils/fnUtils';
import { nextTick } from 'vue';
import { DesignHandle } from '@/designClass/core/design/design';
import { TileToImage } from '@/designClass/util/design/tileToImage';
import { designToImageUpload } from '@/designClass/util/design/toImage/designToImage';
import { textToImageUpload } from '@/designClass/util/design/toImage/textToImage';

export class TextDesign extends DesignHandle {
  /**@type {DesignerApp} 设计器*/
  $app;
  /**@type {Template} 模板*/
  $template;
  /**@type {View} 视图*/
  $view;
  /**@type {DESIGN_TYPE}*/
  type = DESIGN_TYPE.text;
  /**@type {TextParam} param*/
  param;
  /**@type {Konva.Image} 节点*/
  node;
  /**@type {boolean} 是否设计*/
  isDesign = true;
  /**@type {string} 监听设计*/
  watchImageUuid = '';
  /**@type {string} fnUuid*/
  fnUuid = getUuid();

  /**
   * @param {TextParam} param 设计图详情
   * @param {DesignerApp} $app 设计器
   * @param {Template} template 模板
   * @param {View} view 视图
   * @param {Object} attrs 初始化参数
   * */
  constructor(param, $app, template, view, attrs) {
    super();
    this.$app = $app;
    this.$template = template;
    this.$view = view;
    this.param = param;

    this.init(attrs);
  }

  init(attrs) {
    const canvas = this.$view.canvas;
    const param = this.param;

    // 是否存在当前字体
    const node = canvas.designList.find((e) => e.attrs.type === DESIGN_TYPE.text && e.attrs.fnUuid === param.fnUuid);
    if (node) {
      this.change(param);
    } else {
      this.create(param, attrs);
    }
  }

  create(opt, attrs = {}) {
    const canvas = this.$view.canvas;
    this.param = opt;
    const createFn = () => {
      const style = [opt.fontItalic, opt.fontWeight];
      const fontStyle = style.join(' ');
      return new Konva.Text({
        param: this.param,
        fnUuid: this.fnUuid,
        $design: this,
        type: DESIGN_TYPE.text,
        text: opt.text,
        fill: opt.fontColor || '#000',
        fontSize: opt.fontSize || 20,
        fontFamily: opt.fontFamily || 'Calibri',
        fontStyle: fontStyle, // 样式
        textDecoration: opt.textDecoration || 'none', // 下划线
        textAnchor: opt.textAlign || 'left', // 文字对齐方式
        letterSpacing: opt.letterSpacing || 0, // 字间距
        lineHeight: opt.lineHeight || 1, // 行间距
        scaleX: 1,
        scaleY: 1,
        visible: true,
        draggable: true, // 是否可拖拽
        ...attrs,
      });
    };
    // 添加到视图
    this.node = createFn();
    // 添加监听
    this.mousedown();
    this.dragend();
    // 添加到设计层
    canvas.group.add(this.node);
    // 选中
    this.active();
    // 编辑模式
    this.$app.setModeEdit();
    // 更新模型
    this.updateMesh();
    // 设置宽度和偏移量
    setSizeAndOffset(this.node, opt);
    // 如果没有自定义属性, 居中
    if (Object.keys(attrs).length === 0) {
      // 居中
      this.centerHV();
    }
    // 碰撞检测
    this.isCollide();
  }

  change(opt) {
    this.param = opt;
    // 设置宽度和偏移量
    setSizeAndOffset(this.node, opt);
    // 正常修改
    const style = [opt.fontItalic, opt.fontWeight];
    const fontStyle = style.join(' ');
    this.node.setAttrs({
      param: this.param,
      text: opt.text,
      fill: opt.fontColor || '#000',
      fontSize: opt.fontSize || 20,
      fontFamily: opt.fontFamily || 'Calibri',
      fontStyle: fontStyle, // 样式
      textDecoration: opt.textDecoration || 'none', // 下划线
      textAnchor: opt.textAlign || 'left', // 文字对齐方式
      letterSpacing: opt.letterSpacing || 0, // 字间距
      lineHeight: opt.lineHeight || 1, // 行间距
    });
    // 选中
    this.active();
    // 编辑模式
    this.$app.setModeEdit();
    // 更新模型
    this.updateMesh();
  }

  /**
   * 获取提交的数据
   */
  async getSubmitData() {
    const data = {
      type: 'design',
      printArea: { id: this.$view.id },
      offset: { x: 1, y: 1, unit: 'mm' },
      content: {
        dpi: this.$template.detail.dpi,
        unit: 'mm',
        svg: {
          image: {
            designId: '', //1
            width: '', //1
            height: '', //1
            isBg: 0,
            transform: '', //1
            hspacing: 0,
            vspacing: 0,
            printColorRGBs: '',
            tileType: '',
          },
        },
      },
      printType: { id: 17 },
      isCopy: '',
      isText: true,
      textId: '',
      restrictions: { changeable: true },
    };
    const result = await textToImageUpload(this);
    data.content.svg.image.designId = result.checkRes.data.seqId;
    data.content.svg.image.transform = `rotate(${9},${result.imgWidth / 2},${result.imgHeight / 2})`;
    data.content.svg.image.width = result.imgWidth;
    data.content.svg.image.height = result.imgHeight;

    data.fnData = {
      attrs: {
        x: this.node.attrs.x,
        y: this.node.attrs.y,
        scaleX: this.node.attrs.scaleX,
        scaleY: this.node.attrs.scaleY,
        rotation: this.node.attrs.rotation,
      },
      param: this.param,
      type: this.type,
    };

    return data;
  }
}

// 修正宽度和偏移量
function setSizeAndOffset(node, param) {
  // 获取原来的文字和字体大小
  const text = node.text();
  const fontSize = node.fontSize();

  // 如果文字和字体大小不一样
  if (text !== param.text || fontSize !== param.fontSize) {
    // 创建一个临时的文字对象
    let tempText = new Konva.Text({
      text: param.text,
      fill: param.fontColor || '#000',
      fontSize: param.fontSize || 20,
      fontFamily: param.fontFamily || 'Calibri',
      fontStyle: param.fontItalic + ' ' + param.fontWeight, // 样式
      textDecoration: param.textDecoration || 'none', // 下划线
      textAnchor: param.textAlign || 'left', // 文字对齐方式
      letterSpacing: param.letterSpacing || 0, // 字间距
      lineHeight: param.lineHeight || 1, // 行间距
    });
    node.setAttrs({
      width: tempText.width(),
      height: tempText.height(),
    });
    // 释放
    tempText.destroy();
    tempText = null;
  }

  // 设置偏移量
  nextTick(() => {
    node.setAttrs({
      offsetX: node.width() / 2,
      offsetY: node.height() / 2,
    });
  });
}
