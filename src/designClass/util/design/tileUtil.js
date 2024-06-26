import { Tile } from '@/designClass/util/design/tile';
import { DESIGN_TYPE, TILE_TYPE_OFFSET } from '@/designClass/core/define';

/**
 * @typedef TileInfo
 * @prop {boolean} viewImage.isFlipX 是否水平翻转
 * @prop {boolean} viewImage.isFlipY 是否垂直翻转
 * @prop {DESIGN_TYPE} viewImage.type 设计类型
 * @prop {Konva.Group} clip 设计组
 * @prop {Konva.Image} image 节点
 * @prop {number} stageWidth 舞台宽度
 * @prop {number} stageHeight 舞台高度
 * @prop {number} a 舞台高宽的最大值
 * @prop {number} currentX 当前节点的x坐标
 * @prop {number} currentY 当前节点的y坐标
 * @prop {number} imageWidth 当前节点的宽度
 * @prop {number} imageHeight 当前节点的高度
 */

/**
 * 获取平铺需要的信息
 * @param {Konva.Image} image
 * @param print
 * @param layer
 * @param viewImage
 * @returns TileInfo
 */
export function getTileInfo(image, print, layer, viewImage) {
  // 舞台的宽高
  const a = Math.max(print.width, print.height);
  const stageWidth = a;
  const stageHeight = a;

  // 图片当前的坐标
  const currentX = image.x();
  const currentY = image.y();

  // 图片的宽高
  const imageWidth = image.width() * image.scaleX();
  const imageHeight = image.height() * image.scaleY();

  return {
    viewImage,
    clip: layer,
    image,
    stageWidth,
    stageHeight,
    a,
    currentX,
    currentY,
    imageWidth,
    imageHeight,
  };
}

/**
 * 创建最外层的group
 * @param {object} info
 * @param {Konva.Image} image
 * @returns {Konva.Group}
 */
export function createGroup(info, image) {
  return new Konva.Group({
    type: DESIGN_TYPE.tile,
    name: DESIGN_TYPE.tile,
    image,
    x: info.currentX,
    y: info.currentY,
    width: info.a,
    height: info.a,
    rotation: image.attrs.rotation,
    visible: image.attrs.visible,
  });
}

/**
 * 创建image组 2*2
 * @param {TileInfo} info
 * @param {number} width
 * @param {number} height
 * @param {number} rowIndex
 * @param {number} colIndex
 * @param {Tile} tileParams
 */
export function createImageGroup(info, width, height, rowIndex, colIndex, tileParams) {
  // 一组会生成 2*2 个图片
  const list = [
    [{ gIndex: 1 }, { gIndex: 2 }],
    [{ gIndex: 3 }, { gIndex: 4 }],
  ];

  width = Math.abs(width);
  height = Math.abs(height);

  // 组的坐标
  const x = colIndex * width * 2;
  const y = rowIndex * height * 2;
  const g2 = new Konva.Group({
    type: DESIGN_TYPE.tile,
    rowIndex,
    colIndex,
    x: x,
    y: y,
    width: width * list[0].length,
    height: height * list.length,
  });

  // 生成图片
  list.forEach((row, rIndex) => {
    row.forEach((col, cIndex) => {
      const img = createImg(rIndex, cIndex, width, height, info, tileParams, rowIndex, colIndex, col);
      g2.add(img);
    });
  });

  return g2;
}

/**
 创建单个图片
 * @param rIndex
 * @param cIndex
 * @param width
 * @param height
 * @param {TileInfo} info
 * @param tileParams
 * @param rowIndex
 * @param colIndex
 * @param item
 * @returns {Konva.Group}
 */
function createImg(rIndex, cIndex, width, height, info, tileParams, rowIndex, colIndex, item) {
  // 交错偏移量
  let x = cIndex * width;
  let y = rIndex * height;
  if (tileParams.offset > 0) {
    if (tileParams.offsetType === TILE_TYPE_OFFSET.x && [3, 4].includes(item.gIndex)) {
      x += tileParams.offset;
    } else if (tileParams.offsetType === TILE_TYPE_OFFSET.y && [2, 4].includes(item.gIndex)) {
      y += tileParams.offset;
    }
  }

  // 镜像
  let scaleX = 1;
  let scaleY = 1;
  let offsetX = 0;
  let offsetY = 0;
  let flipX = info.viewImage.isFlipX ? -1 : 1;
  let flipY = info.viewImage.isFlipY ? -1 : 1;
  if (info.viewImage.isFlipX) {
    scaleX = -1;
  }
  if (info.viewImage.isFlipY) {
    scaleY = -1;
  }
  if (tileParams.mirrorType !== 0) {
    switch (tileParams.mirrorType) {
      // 水平镜像
      case 1:
        if ([3, 4].includes(item.gIndex)) {
          scaleY *= -1;
          offsetY = info.imageHeight * flipY;
        }
        break;

      // 垂直镜像
      case 2:
        if ([2, 4].includes(item.gIndex)) {
          scaleX *= -1;
          offsetX = info.imageWidth * flipX;
        }
        break;

      // 水平垂直镜像
      case 3:
        // if ([1].includes(item.gIndex)) {
        // }
        if ([2].includes(item.gIndex)) {
          scaleX *= -1;
          offsetX = info.imageWidth * flipX;
        }
        if ([3].includes(item.gIndex)) {
          scaleY *= -1;
          offsetY = info.imageHeight * flipY;
        }
        if ([4].includes(item.gIndex)) {
          scaleX *= -1;
          scaleY *= -1;
          offsetX = info.imageWidth * flipX;
          offsetY = info.imageHeight * flipY;
        }
        break;
    }
  }

  const g = new Konva.Group({
    x: x,
    y: y,
    width: Math.abs(width),
    height: Math.abs(height),
  });

  if (info.viewImage.type === DESIGN_TYPE.image) {
    const img = new Konva.Image({
      type: DESIGN_TYPE.tile,
      width: Math.abs(info.imageWidth),
      height: Math.abs(info.imageHeight),
      image: info.image.attrs.image,
      scaleX: scaleX,
      scaleY: scaleY,
      offsetX: offsetX,
      offsetY: offsetY,
      draggable: false,
    });
    g.add(img);
  }

  // const text = new Konva.Text({
  //   text: item.gIndex,
  //   fontSize: 30,
  // });
  // g.add(text);

  return g;
}
