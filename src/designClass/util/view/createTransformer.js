import {
  //
  CANVAS_TYPE_TRANSFORMER_TEXT,
} from '@/fnDesigner/config/common';
import { createRotateText, createTransformerNode, overRed, transformMousedown } from './transformerUtil';
import { View } from '@/designClass/core/view/view';
import { LINE_TYPE, TILE_TYPE_OFFSET, TRANSFORMER_TYPE } from '@/designClass/core/define';

/**
 * 创建选中框
 * @param opt
 * @param opt.$app {DesignerApp} 设计器
 * @param opt.$view {View} 视图
 * @returns {Konva.Transformer}
 */
export function createTransformer(opt = {}) {
  const {
    //
    stage,
    designList,
    viewInfo,
    $app,
    $view,
  } = opt;
  const obj = {
    stage: stage,
    designList: designList || [],
    transformer: null,
    text: null,
  };

  // 创建选中框
  obj.transformer = createTransformerNode(opt.$app);

  // 正上方添加旋转角度的text
  obj.text = createRotateText();
  obj.transformer.add(obj.text);
  function delText() {
    const text = obj.transformer.findOne(`.${CANVAS_TYPE_TRANSFORMER_TEXT}`);
    if (text) {
      text.text('');
    }
  }

  // 按下|抬起
  obj.transformer.on('mousedown', (e) => {
    // 鼠标按下选中当前坐标的最上面那个设计
    transformMousedown(obj.transformer, obj.stage, obj.designList, e);
    // 辅助线
    opt.$view.drawLine(LINE_TYPE.down, obj.transformer.node().attrs.$design);
  });
  obj.transformer.on('mouseup', (e) => {
    // 辅助线
    opt.$view.drawLine(LINE_TYPE.up, obj.transformer.node().attrs.$design);
  });

  // 拖转
  obj.transformer.on('dragend', () => {
    // 更新模型
    obj.transformer.node()?.attrs?.$design?.updateMesh();
    // 超出红线
    overRed(obj.transformer, viewInfo.print);
  });
  obj.transformer.on('dragmove', () => {
    // 超出红线
    overRed(obj.transformer, viewInfo.print);
    // 磁吸
    opt.$view.magnet(obj.transformer.node()?.attrs?.$design);
  });

  // 缩放|旋转
  obj.transformer.on('transformstart', () => {
    // transformer-旋转|缩放-开始
    opt.$app.transformerStartDown = true;
  });
  obj.transformer.on('transform', () => {
    // 超出红线
    overRed(obj.transformer, viewInfo.print);
  });
  // 旋转，缩放结束
  obj.transformer.on('transformend', (transform) => {
    if (opt.$app.transformerStartType === TRANSFORMER_TYPE.scale) {
      obj.transformer.node()?.attrs?.$design?.tileClass?.change(true);
    } else {
      obj.transformer.node()?.attrs?.$design?.tileClass?.change();
    }
    // 选中框操作类型-重置为空
    opt.$app.transformerStartType = TRANSFORMER_TYPE.none;
    // transformer-旋转|缩放-结束
    opt.$app.transformerStartDown = false;
    // 更新模型
    obj.transformer.node()?.attrs?.$design?.updateMesh();
    // 移除旋转角度
    delText();
    // 更新键监听值
    obj.transformer.node()?.attrs?.$design?.updateWatch();
  });

  return obj.transformer;
}
