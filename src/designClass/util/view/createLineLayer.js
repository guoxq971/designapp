import { Konva } from '@/fnDesigner/three/konva';
import { CANVAS_RADIO, PRIMARY_COLOR } from '@/fnDesigner/config/common';

/**
 * 辅助线层
 * @param {ViewPrintInfo} viewInfo
 * @returns {Konva.Layer}
 */
export function createLineLayer(viewInfo) {
  const lineLayer = new Konva.Layer({ type: 'lineLayer', listening: false, visible: false });
  const lineStep = 15;
  const w = viewInfo.print.width + lineStep;
  const h = viewInfo.print.height + lineStep;
  const bw = viewInfo.print.width;
  const bh = viewInfo.print.height;
  // 以 (0,0) (this.print.width,this.print.height) 为矩形,画出辅助线, 上下左右、中水平线、中垂直线 6条线
  const lineList = [
    { value: `M${-lineStep},0 L${w},0`, label: '上' }, // 上
    { value: `M${-lineStep},${bh} L${bw},${bh}`, label: '下' }, // 下
    { value: `M0,${-lineStep} L0,${h}`, label: '左' }, // 左
    { value: `M${bw},${-lineStep} L${bw},${h}`, label: '右' }, // 右
    { value: `M${-lineStep},${bh / 2} L${w},${bh / 2}`, label: '中水平线' }, // 中水平线
    { value: `M${bw / 2},${-lineStep} L${bw / 2},${h}`, label: '中垂直线' }, // 中垂直线
  ];
  for (const line of lineList) {
    const line1 = new Konva.Path({
      scaleX: CANVAS_RADIO,
      scaleY: CANVAS_RADIO,
      x: viewInfo.offsetX * CANVAS_RADIO,
      y: viewInfo.offsetY * CANVAS_RADIO,
      data: line.value,
      type: line.label,
      fill: null,
      stroke: PRIMARY_COLOR,
      dash: [2],
      strokeWidth: 1.6,
    });
    lineLayer.add(line1);
  }

  return lineLayer;
}
