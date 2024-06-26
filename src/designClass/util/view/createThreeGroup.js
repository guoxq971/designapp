import { Konva } from '@/fnDesigner/three/konva';
import { getUuid } from '@/utils/fnUtils';
import { CANVAS_DESIGN_TYPE_BACKGROUND_COLOR_LIGHT_THREE, CANVAS_DESIGN_TYPE_BACKGROUND_COLOR_THREE } from '@/fnDesigner/config/common';

export function createThreeGroup(viewInfo) {
  // 3d组-底色
  const threeGroup = new Konva.Group({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  });
  // threeGroup铺一个隐藏的rect作底色使用
  const rect = new Konva.Rect({
    fnUuid: getUuid(),
    type: CANVAS_DESIGN_TYPE_BACKGROUND_COLOR_THREE,
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
    width: viewInfo.print.width,
    height: viewInfo.print.height,
    fill: null,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    draggable: false, // 是否可拖拽
    visible: false,
  });
  threeGroup.add(rect);

  // 3d组-高亮色
  const threeLightGroup = new Konva.Group({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    listening: false,
  });
  // threeGroup铺一个隐藏的rect作高亮使用
  const rect2 = new Konva.Rect({
    fnUuid: getUuid(),
    type: CANVAS_DESIGN_TYPE_BACKGROUND_COLOR_LIGHT_THREE,
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
    width: viewInfo.print.width,
    height: viewInfo.print.height,
    fill: null,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    draggable: false, // 是否可拖拽
    visible: true,
    opacity: 0,
  });
  threeLightGroup.add(rect2);

  return {
    threeGroup,
    threeLightGroup,
  };
}
