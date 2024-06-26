/**
 * 裁剪函数-作用前
 * @param konvaPath
 * @returns {boolean}
 */
export function beforeClipFunc(konvaPath) {
  if (!konvaPath && !konvaPath?.dataArray) return;
  if (konvaPath?.dataArray?.length === 0) return;
  return true;
}

/**
 * 裁剪函数
 * @param {CanvasRenderingContext2D} ctx ctx
 * @param {Konva.Path} konvaPath konvaPath
 * */
export function clipFunc(ctx, konvaPath) {
  // console.log('裁剪函数 konvaPath', konvaPath);
  if (!konvaPath && !konvaPath?.dataArray) {
    return;
  }
  if (konvaPath?.dataArray?.length === 0) {
    return;
  }
  const list = konvaPath.dataArray;
  drawSvgPath(ctx, list);
}

function drawSvgPath(ctx, pathData) {
  // ctx 颜色透明
  ctx.strokeStyle = 'rgba(0,0,0,0)';
  // ctx.strokeStyle = 'red';
  ctx.beginPath();

  for (const segment of pathData) {
    const command = segment.command;
    const points = segment.points;

    if (command === 'M') {
      ctx.moveTo(points[0], points[1]);
    } else if (command === 'L') {
      ctx.lineTo(points[0], points[1]);
    } else if (command === 'C') {
      ctx.bezierCurveTo(points[0], points[1], points[2], points[3], points[4], points[5]);
    } else if (command === 'z') {
      ctx.closePath();
    }
  }

  ctx.stroke();
}
