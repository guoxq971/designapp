/**
 * 获取45度倍速的角度, 例：传入 30, 返回 45 ,传入 50, 返回 90 ，传入100, 返回 135
 * @param {number} angle 角度
 * @param {string} type 方向 right: 向右 left: 向左
 * @param {number} n 倍数
 * @returns {number} 角度
 */
export function getAngleMultiple(angle, type = 'right', n = 45) {
  let num;
  if (type === 'right') {
    num = Math.ceil(angle / n);
    angle % n === 0 && num++;
  }
  if (type === 'left') {
    num = Math.floor(angle / n);
    angle % n === 0 && num--;
  }
  return num * n;
}

/**
 * 最大化操作的缩放比例
 * @param {string} type width:宽度 height:高度
 */
export function getScaleMax(type = '', inch, print, imageDOM) {
  const iSize = inch;
  const pSize = print;
  const l = iSize.width / pSize.width; // l:设计图宽/打印区宽
  const p = iSize.height / pSize.height; // p:设计图高/打印区高
  let u = Math.min(l, p); // 取较小值
  if ('width' === type) u = l;
  if ('height' === type) u = p;
  if (u < 1) u = 1;

  // 最大化后的宽高
  const width = iSize.width / u;
  const height = iSize.height / u;

  // imageDom是当前使用的DOM的宽高可能是小图的宽高
  const scaleX = width / imageDOM.width;
  const scaleY = height / imageDOM.height;

  return {
    scaleX: scaleX,
    scaleY: scaleY,
  };
}

// 获取设计信息
export function getBox(node) {
  const scaleX = Math.abs(node.attrs.scaleX);
  const scaleY = Math.abs(node.attrs.scaleY);
  const offsetX = node.attrs.offsetX * scaleX;
  const offsetY = node.attrs.offsetY * scaleY;
  const design = {
    x: node.attrs.x,
    y: node.attrs.y,
    size: {
      width: node.attrs.width,
      height: node.attrs.height,
    },
    scaleX: scaleX,
    scaleY: scaleY,
  };
  // designPos
  const dp = {
    x: design.x - offsetX,
    y: design.y - offsetY,
    w: design.size.width * design.scaleX,
    width: design.size.width * design.scaleX,
    h: design.size.height * design.scaleY,
    height: design.size.height * design.scaleY,
    x2: design.x - offsetX + design.size.width * design.scaleX,
    y2: design.y - offsetY + design.size.height * design.scaleY,
    cx: design.x - offsetX + (design.size.width * design.scaleX) / 2,
    cy: design.y - offsetY + (design.size.height * design.scaleY) / 2,
  };
  return {
    bbox: dp,
  };
}

// 获取产品信息
export function getPrintBox(viewInfo) {
  const ps = {
    x: 0,
    y: 0,
    w: viewInfo.print.width,
    width: viewInfo.print.width,
    h: viewInfo.print.height,
    height: viewInfo.print.height,
    x2: viewInfo.print.width,
    y2: viewInfo.print.height,
    cx: viewInfo.print.width / 2,
    cy: viewInfo.print.height / 2,
  };
  return {
    bbox: ps,
  };
}

/**
 * 判断一个矩形是否在一个大矩形之外(不包含边界,整体在外面)
 * @param rect
 * @param bigRect
 * @returns {boolean} true:在外面 false:在里面
 */
export function isOutSideNode(rect, bigRect) {
  return rect.x2 < bigRect.x || rect.x > bigRect.x2 || rect.y2 < bigRect.y || rect.y > bigRect.y2;
}
