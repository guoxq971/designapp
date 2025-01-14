import { Konva } from '@/fnDesigner/three/konva';
import {
  //
  CANVAS_LAYER_TYPE_PATH,
  CANVAS_PATH_TYPE_EDIT_D,
  CANVAS_PATH_TYPE_PREVIEW_D_2D,
  CANVAS_RADIO,
} from '@/fnDesigner/config/common';
import { TEMPLATE_DESIGN_TYPE } from '@/designClass/core/define';

/**
 * 车线层
 * @param {ViewPrintInfo} viewInfo
 * @param {Template} $template
 * @param {View} $view
 * @returns {Konva.Layer}
 */
export function createPathLayer(viewInfo, $template, $view) {
  const pathLayer = new Konva.Layer({
    type: CANVAS_LAYER_TYPE_PATH,
    listening: false,
  });
  const isRefine = $template.type === TEMPLATE_DESIGN_TYPE.refine;
  const is3d = $template.template3d.isSureLoad3d;

  if (viewInfo.printout.v) {
    let v = viewInfo.printout.v;
    // 如果是精细设计
    if (isRefine) {
      v = viewInfo?.uvV;
    }

    // 车线 - (编辑模式, 红色, 车线)
    const path = new Konva.Path({
      type: 'edit-v',
      x: viewInfo.offsetX * CANVAS_RADIO,
      y: viewInfo.offsetY * CANVAS_RADIO,
      scaleX: CANVAS_RADIO,
      scaleY: CANVAS_RADIO,
      data: v,
      fill: null,
      stroke: 'red',
      dash: [5],
      strokeWidth: 2,
      opacity: 0.7,
      visible: true,
    });
    pathLayer.add(path);
  }

  if (viewInfo.printout.d) {
    let d = viewInfo.printout.d;
    let dash = [5];
    // 如果是精细设计
    if (isRefine && is3d) {
      d = viewInfo?.uvD;
      dash = [];
    }

    // 轮廓线 -  (编辑模式, 红色, 轮廓, 超出隐藏)
    const path = new Konva.Path({
      type: CANVAS_PATH_TYPE_EDIT_D,
      x: viewInfo.offsetX * CANVAS_RADIO,
      y: viewInfo.offsetY * CANVAS_RADIO,
      scaleX: CANVAS_RADIO,
      scaleY: CANVAS_RADIO,
      data: d,
      fill: null,
      stroke: 'red',
      dash: dash,
      strokeWidth: 1.8,
      opacity: 0.7,
      visible: true,
    });
    pathLayer.add(path);
  }

  // 如果是精细产品不需要
  if (!isRefine) {
    // 轮廓线 - (编辑模式, 黑色, 产品边框)
    const step = 2;
    const step2 = step / 2;
    const w = viewInfo.print.width + step;
    const h = viewInfo.print.height + step;
    // data 的值为 this.print.width和this.print.height 组成的矩形加上step的值
    const data = `M${-step2},${-step2} L${w - step2},${-step2} L${w - step2},${h - step2} L${-step2},${h - step2} Z`;
    const path = new Konva.Path({
      type: 'edit-rect',
      x: viewInfo.offsetX * CANVAS_RADIO,
      y: viewInfo.offsetY * CANVAS_RADIO,
      scaleX: CANVAS_RADIO,
      scaleY: CANVAS_RADIO,
      data: data,
      fill: null,
      stroke: '#000',
      dash: [4],
      strokeWidth: 1.2,
      opacity: 0.7,
      visible: true,
    });
    pathLayer.add(path);
  }

  if (viewInfo.print.d_2d) {
    // 轮廓线 - (预览模式, 橙色, 轮廓, 超出隐藏, 2d)
    const path = new Konva.Path({
      type: CANVAS_PATH_TYPE_PREVIEW_D_2D,
      x: viewInfo.offsetX,
      y: viewInfo.offsetY,
      scaleX: 1,
      scaleY: 1,
      data: viewInfo.print.d_2d,
      fill: null,
      // stroke: 'orange',
      stroke: 'transparent',
      strokeWidth: 1.5,
      opacity: 0.7,
      visible: false,
    });
    pathLayer.add(path);
  }

  if (viewInfo.print.d_3d) {
    // 轮廓线 - (预览模式, 橙色, 轮廓, 超出隐藏, 3d)
    const path = new Konva.Path({
      type: 'preview-d-3d',
      x: viewInfo.offsetX,
      y: viewInfo.offsetY,
      scaleX: 1,
      scaleY: 1,
      data: viewInfo.print.d_3d,
      fill: null,
      // stroke: 'orange',
      stroke: 'transparent',
      strokeWidth: 1.5,
      opacity: 0.7,
      visible: false,
    });
    pathLayer.add(path);
  }

  return pathLayer;
}
