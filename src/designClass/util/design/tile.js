import { createGroup, createImageGroup, getTileInfo } from '@/designClass/util/design/tileUtil';
import { TILE_TYPE_MIRROR, TILE_TYPE_OFFSET } from '@/designClass/core/define';

/**
 * 平铺
 */
export class Tile {
  /**@type {DesignerApp} 设计器*/
  $app;
  /**@type {Template} 模板*/
  $template;
  /**@type {View} 视图*/
  $view;
  /**@type {ImageDesign|BackgroundImageDesign} 视图*/
  $design;
  /**@type {boolean}*/
  isTile = true;

  /**@type {Konva.Group|null} 节点*/
  node;
  /**@type {number} 间距x*/
  gapX = 0;
  /**@type {number} 间距y*/
  gapY = 0;
  /**@type {number} 偏移量*/
  offset = 0;
  /**@type {TILE_TYPE_OFFSET} 偏移类型*/
  offsetType = TILE_TYPE_OFFSET.x;
  /**@type {TILE_TYPE_MIRROR} 镜像类型*/
  mirrorType = TILE_TYPE_MIRROR.none;

  constructor($app, $template, $view, $design) {
    this.$app = $app;
    this.$template = $template;
    this.$view = $view;
    this.$design = $design;
  }

  /**
   * 获取参数
   */
  getParam() {
    return {
      gapX: this.gapX,
      gapY: this.gapY,
      offset: this.offset,
      offsetType: this.offsetType,
      mirrorType: this.mirrorType,
    };
  }

  /**
   * 设置参数
   */
  setParam(param, force = false) {
    if (this.node || force) {
      this.gapX = param.gapX;
      this.gapY = param.gapY;
      this.offset = param.offset;
      this.offsetType = param.offsetType;
      this.mirrorType = param.mirrorType;
    }
  }

  /**
   * 重置
   */
  reset() {
    this.gapX = 0;
    this.gapY = 0;
    this.offset = 0;
    this.offsetType = TILE_TYPE_OFFSET.x;
    this.mirrorType = TILE_TYPE_MIRROR.none;
    this.destroy();
  }

  /**
   * 创建
   */
  create() {
    const image = this.$design.node;
    const print = this.$view.getInfo().print;
    const layer = this.$view.canvas.group;
    const viewImage = {
      isFlipX: this.$design.node.scaleX() < 0,
      isFlipY: this.$design.node.scaleY() < 0,
      type: this.$design.type,
    };
    const info = getTileInfo(image, print, layer, viewImage);
    const tileParams = this;

    // img的宽高 (一个小组2x2)
    const imgWidth = Math.abs(info.imageWidth) + tileParams.gapX; //水平间距
    const imgHeight = Math.abs(info.imageHeight) + tileParams.gapY; //垂直间距
    const imgGroupWidth = Math.abs(imgWidth) * 2;
    const imgGroupHeight = Math.abs(imgHeight) * 2;
    // console.log(imgWidth, imgHeight, tileParams);
    // console.log(info.a / imgWidth, info.a / imgHeight);

    // const n = 1;
    const n = Math.ceil(Math.max(info.a / imgGroupWidth, info.a / imgGroupHeight)) + 1;
    const num = 2 * n - 1;

    // const list = [
    //   [{ index: 0 }, { index: 0 }, { index: 0 }],
    //   [{ index: 0 }, { index: 0 }, { index: 0 }],
    //   [{ index: 0 }, { index: 0 }, { index: 0 }],
    // ];

    // 生成二维数组
    const list = [];
    for (let i = 0; i < num; i++) {
      let arr = [];
      for (let j = 0; j < num; j++) {
        arr.push({ rowIndex: i, colIndex: j });
      }
      list.push(arr);
    }

    // 最外层的组
    const group = createGroup(info, image);

    // 设置大组的偏移量
    const baseOffsetX = info.imageWidth / 2;
    const baseOffsetY = info.imageHeight / 2;
    group.setAttrs({
      offsetX: Math.abs(baseOffsetX + imgGroupWidth * (n - 1)),
      offsetY: Math.abs(baseOffsetY + imgGroupHeight * (n - 1)),
    });

    // 创建图片
    list.forEach((rowList, rowIndex) => {
      rowList.forEach((item, colIndex) => {
        const img = createImageGroup(info, imgWidth, imgHeight, rowIndex, colIndex, tileParams);
        group.add(img);
      });
    });

    // console.log('image', image);

    // 添加到clip
    info.clip.add(group);

    group.setAttrs({
      $design: this.$design,
      zIndex: image.getZIndex(),
    });
    this.node = group;
  }

  /**
   * 更新
   */
  change(force = false) {
    if (this.node) {
      if (force) {
        this.destroy();
        setTimeout(() => this.create());
      } else {
        this.node.setAttrs({
          rotation: this.$design.node.rotation(),
          visible: this.$design.node.visible(),
          x: this.$design.node.x(),
          y: this.$design.node.y(),
          // scaleX: this.$design.node.scaleX() < 0 ? -1 : 1,
          // scaleY: this.$design.node.scaleY() < 0 ? -1 : 1,
        });
      }
    }
  }

  /**
   * 销毁
   */
  destroy() {
    this.node?.destroy();
    this.node = null;
  }
}
