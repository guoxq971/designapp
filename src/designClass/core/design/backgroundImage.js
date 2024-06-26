import { DESIGN_TYPE } from '@/designClass/core/define';
import { ImageDetail } from '@/designClass/interface/interface';
import { View } from '@/designClass/core/view/view';
import { Konva } from '@/fnDesigner/three/konva';
import { getUuid } from '@/utils/fnUtils';
import { getImageUrl, loadImage } from '@/designClass/util/design/image';
import { imageSize } from '@/designClass/util/design/imageSize';
import { DesignHandle } from '@/designClass/core/design/design';
import { Tile } from '@/designClass/util/design/tile';
import { TileToImage } from '@/designClass/util/design/tileToImage';
import { designToImageUpload } from '@/designClass/util/design/toImage/designToImage';

export class BackgroundImageDesign extends DesignHandle {
  /**@type {DesignerApp} 设计器*/
  $app;
  /**@type {Template} 模板*/
  $template;
  /**@type {View} 视图*/
  $view;
  /**@type {DESIGN_TYPE}*/
  type = DESIGN_TYPE.backgroundImage;
  /**@type {ImageDetail} detail*/
  detail;
  /**@type {Konva.Image} 节点*/
  node;
  /**@type {boolean} 是否设计*/
  isDesign = true;
  /**@type {string} 监听设计*/
  watchImageUuid = '';
  /**@type {string} fnUuid*/
  fnUuid = getUuid();
  /**@type {Tile} 平铺*/
  tileClass;

  /**
   * @param {ImageDetail} detail 设计图详情
   * @param {DesignerApp} $app 设计器
   * @param {Template} template 模板
   * @param {View} view 视图
   * @param {object} attrs 自定义属性
   * */
  constructor(detail, $app, template, view, attrs = {}) {
    super();
    this.$app = $app;
    this.$template = template;
    this.$view = view;
    this.detail = detail;
    this.tileClass = new Tile(this.$app, this.$template, this.$view, this);

    this.init(attrs);
  }

  init(attrs = {}) {
    const templateDetail = this.$template.detail;
    const canvas = this.$view.canvas;
    const viewInfo = this.$view.getInfo();
    const detail = this.detail;

    // 解析图片尺寸
    const parseImageSizeObj = imageSize(detail.size, templateDetail.dpi, viewInfo.print);
    // 加载图片，并添加到设计层
    loadImage(getImageUrl(detail), { width: parseImageSizeObj.width, height: parseImageSizeObj.height }).then((dom) => {
      this.node = new Konva.Image({
        fnUuid: this.fnUuid,
        $design: this,
        detail: detail,
        inch: parseImageSizeObj.inch,
        type: DESIGN_TYPE.backgroundImage,
        image: dom,
        x: 0,
        y: 0,
        offsetX: parseImageSizeObj.size.width / 2,
        offsetY: parseImageSizeObj.size.height / 2,
        width: parseImageSizeObj.size.width,
        height: parseImageSizeObj.size.height,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        draggable: true, // 是否可拖拽
        visible: true,
      });
      // 添加监听
      this.mousedown();
      this.dragend();
      // 添加到设计层
      canvas.backgroundGroup.add(this.node);
      // 激活选中的设计
      this.active();
      // 编辑模式
      this.$app.setModeEdit();
      // 如果没有自定义属性, 居中和最大化
      if (Object.keys(attrs).length === 0) {
        // 居中
        this.centerHV();
        // 最大化
        this.max();
      }
      // 更新模型
      this.updateMesh();
      // 碰撞检测
      this.isCollide();
    });
  }

  /**
   * 获取提交的数据
   */
  async getSubmitData() {
    const data = this.getSubmitImageData();
    // 如果有平铺
    if (this.tileClass.node) {
      // console.log('平铺');
      const result = await TileToImage(this);
      // console.log('result', result);
      data.offset.x = 1;
      data.offset.y = 1;
      data.content.svg.image.transform = `rotate(${0},${result.width / 2},${result.width / 2})`;
      data.content.svg.image.designId = result.checkRes.data.seqId;
      data.content.svg.image.width = result.width;
      data.content.svg.image.height = result.height;
    }
    // 如果有翻转
    else if (this.node.scaleX() < 0 || this.node.scaleY() < 0) {
      // console.log('翻转');
      const result = await designToImageUpload(this);
      // console.log('result', result);
      data.content.svg.image.designId = result.checkRes.data.seqId;
      data.content.svg.image.designId = result.checkRes.data.seqId;
    }

    data.fnData = {
      attrs: {
        x: this.node.attrs.x,
        y: this.node.attrs.y,
        scaleX: this.node.attrs.scaleX,
        scaleY: this.node.attrs.scaleY,
        rotation: this.node.attrs.rotation,
      },
      tile: {
        isTile: Boolean(this.tileClass?.node),
        gapX: this.tileClass.gapX,
        gapY: this.tileClass.gapY,
        offset: this.tileClass.offset,
        offsetType: this.tileClass.offsetType,
        mirrorType: this.tileClass.mirrorType,
      },
      type: this.type,
      detail: this.detail,
    };

    return data;
  }
}
