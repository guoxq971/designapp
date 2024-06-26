import { Konva } from '@/fnDesigner/three/konva';
import { CANVAS_RADIO, CANVAS_SIZE, CANVAS_TYPE_TRANSFORMER } from '@/fnDesigner/config/common';
import { ViewPrintInfo } from '@/designClass/interface/interface';
import { createPathLayer } from '@/designClass/util/view/createPathLayer';
import { createThreeGroup } from '@/designClass/util/view/createThreeGroup';
import { createDesignGroup } from '@/designClass/util/view/createDesignGroup';
import { DesignerApp } from '@/designClass/core/designerAPP/designerApp';
import { DESIGN_TYPE } from '@/designClass/core/define';
import { createTransformer } from '@/designClass/util/view/createTransformer';
import { View } from '@/designClass/core/view/view';
import { computed } from 'vue';
import { getMousedownNodes } from './transformerUtil';
import { createLineLayer } from '@/designClass/util/view/createLineLayer';

/**
 * 创建画布
 * @param {object} opt
 * @param {HTMLElement} opt.container 容器
 * @param {ViewPrintInfo} opt.viewInfo 视图信息
 * @param {DesignerApp} opt.$app
 * @param {View} opt.$view
 */
export function createCanvas(opt) {
  const viewInfo = opt.viewInfo;
  const container = opt.container;
  const $app = opt.$app;
  const $view = opt.$view;

  // 舞台
  const stage = new Konva.Stage({
    container: container,
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  });
  stage.on('mousedown', (e) => {
    // 当前的选中框不在操作状态(缩放,旋转)
    if (!$app.transformerStartDown) {
      // 当前坐标节点为空,设置所有视图为非激活状态
      const nodes = getMousedownNodes(stage, designList);
      if (nodes.length === 0) {
        $app.activeTemplate.viewList.forEach((view) => view.setActiveNull());
      }
    }
  });
  stage.on('click', (e) => {
    const sureTypeList = [
      //
      DESIGN_TYPE.image,
      DESIGN_TYPE.backgroundImage,
      DESIGN_TYPE.text,
      CANVAS_TYPE_TRANSFORMER,
    ];
    if (sureTypeList.includes(e.target.attrs.type) || sureTypeList.includes(e.target?.parent?.attrs?.type)) {
      $app.setModeEdit();
    } else {
      $app.setModeChange();
    }
  });

  // 图层 = 设计组 + 选中框
  const layer = new Konva.Layer({
    x: viewInfo.offsetX * CANVAS_RADIO,
    y: viewInfo.offsetY * CANVAS_RADIO,
    scaleX: CANVAS_RADIO,
    scaleY: CANVAS_RADIO,
  });
  stage.add(layer);

  // 设计组
  const { group, backgroundGroup } = createDesignGroup();
  layer.add(group);
  layer.add(backgroundGroup);
  backgroundGroup.moveToBottom();

  // 3d组
  const { threeGroup, threeLightGroup } = createThreeGroup(viewInfo);
  layer.add(threeGroup);
  threeGroup.moveToBottom();
  layer.add(threeLightGroup);
  threeLightGroup.moveToTop();

  // 所有设计
  const designList = computed(() => {
    const groupDesignList = group.children.slice().filter((node) => node.attrs.type !== DESIGN_TYPE.tile);
    return [...groupDesignList.reverse(), ...backgroundGroup.children];
  });

  // 选中框
  const transformer = createTransformer({
    stage: stage,
    viewInfo: viewInfo,
    designList: designList,
    $app: $app,
    $view,
  });
  layer.add(transformer);
  transformer.moveToTop();

  // 车线层
  const pathLayer = createPathLayer(viewInfo);
  stage.add(pathLayer);

  // 辅助线层
  const lineLayer = createLineLayer(viewInfo);
  stage.add(lineLayer);

  return {
    designList,
    container,
    stage,
    transformer,
    group,
    backgroundGroup,
    threeGroup,
    threeLightGroup,
    pathLayer,
    layer,
    lineLayer,
  };
}
