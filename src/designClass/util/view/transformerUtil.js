import { Konva } from '@/fnDesigner/three/konva';
import { CANVAS_TYPE_TRANSFORMER, CANVAS_TYPE_TRANSFORMER_MOUSEDOWN_FILTER, CANVAS_TYPE_TRANSFORMER_TEXT, PRIMARY_COLOR } from '@/fnDesigner/config/common';
import { Message } from 'element-ui';
import { DESIGN_TYPE, TRANSFORMER_TYPE } from '@/designClass/core/define';

export function createTransformerNode($app) {
  let transformer;
  transformer = new Konva.Transformer({
    type: CANVAS_TYPE_TRANSFORMER,
    nodes: [],
    visible: false,
    draggable: false, // 是否可拖拽
    flipEnabled: false, // 允许翻转
    ignoreStroke: false, // 忽略边框 (锚点不会被边框遮挡)
    shouldOverdrawWholeArea: true, // 是否允许绘制超出图形边界的区域
    // 锚点
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    anchorFill: '#ffffff', // 锚点的填充色
    anchorStroke: PRIMARY_COLOR, // 锚点的边框颜色
    anchorCornerRadius: 2, // 锚点的圆角
    anchorStrokeWidth: 1.5, // 锚点的边框宽度
    anchorSize: 15, // 锚点的大小
    // 旋转
    useSingleNodeRotation: true, // 是否使用单节点旋转
    rotateAnchorOffset: 50, // 旋转按钮的偏移量
    rotateAnchorCursor: 'pointer', // 旋转按钮的光标
    // 边框
    borderStrokeWidth: 1.5, // 边框的宽度
    borderStroke: PRIMARY_COLOR, // 边框的颜色
    // 缩放
    keepRatio: true, // 保持比例 (缩放时保持比例)
    centeredScaling: true, // 是否启用中心缩放
    // 限制缩放的最大值 (缩放, 旋转时都会触发)
    boundBoxFunc: (oldBox, newBox) => {
      // 是否放大
      const isUp = newBox.width > oldBox.width || newBox.height > oldBox.height;
      // 是否缩小
      const isDown = newBox.width < oldBox.width || newBox.height < oldBox.height;

      const node = transformer.nodes()[0];
      if (!node) return oldBox;

      if (isUp || isDown) {
        $app.transformerStartType = TRANSFORMER_TYPE.scale;
        // 最小检测
        if (isDown && (Math.abs(newBox.width) < 50 || Math.abs(newBox.height) < 50)) {
          return oldBox; // 返回旧的
        }

        // 最大检测
        if (
          isUp &&
          node &&
          [
            //
            DESIGN_TYPE.image,
            DESIGN_TYPE.backgroundImage,
          ].includes(node.attrs.type) &&
          isMax(node)
        ) {
          return oldBox; // 返回旧的
        } else {
          return newBox; // 返回新的(成功放大)
        }
      } else {
        $app.transformerStartType = TRANSFORMER_TYPE.rotation;
        // 绘制旋转角度
        drawRotation(transformer, oldBox, newBox);
        return newBox; // 返回新的(旋转)
      }
    },
  });

  return transformer;
}

/**
 * 绘制旋转角度
 * @param transformer
 * @param oldBox
 * @param newBox
 */
function drawRotation(transformer, oldBox, newBox) {
  const text = transformer.children.find((e) => e.attrs.name === CANVAS_TYPE_TRANSFORMER_TEXT);
  if (text && transformer.node()) {
    const node = transformer.node();

    // 如果当前是旋转操作
    if (oldBox.rotation !== newBox.rotation) {
      // 旋转的角度和坐标
      let t = node.rotation().toFixed();
      if (t < 0) {
        t = 360 + +t;
      }
      text.text(t + '°');
      text.offsetX((text.width() - newBox.width) / 2);
    }
  }
}

// 超出红线
export function overRed(transformer, print) {
  const t = transformer;
  // 不存在预览轮廓线，需要进行碰撞检测
  if (!print.d) {
    const node = t.node();
    if (node?.attrs.$design.isCollide()) {
      t.setAttrs({
        borderStroke: 'red',
        anchorStroke: 'red',
      });
    } else {
      t.setAttrs({
        borderStroke: PRIMARY_COLOR,
        anchorStroke: PRIMARY_COLOR,
      });
    }
  }
}

// 正上方添加旋转角度的text
export function createRotateText() {
  return new Konva.Text({
    name: CANVAS_TYPE_TRANSFORMER_TEXT,
    text: '',
    fontSize: 20,
    fontFamily: 'Calibri',
    align: 'center',
    fill: PRIMARY_COLOR,
    offset: { x: 0, y: 100 },
  });
}

/**
 * 设计图最大检测
 * @param {DesignNode} image
 * @returns {boolean} 是否最大 (true: 是, false: 否)
 */
let messageInstance = null;
export function isMax(image) {
  if (
    ![
      //
      DESIGN_TYPE.image,
      DESIGN_TYPE.backgroundImage,
    ].includes(image.attrs.type)
  )
    return;

  // 设计图的原始
  const inch = image.attrs.inch;

  // 设计图当前的尺寸
  const w = image.attrs.width * Math.abs(image.attrs.scaleX);
  const h = image.attrs.height * Math.abs(image.attrs.scaleY);

  if (w >= inch.width || h >= inch.height) {
    if (!messageInstance) {
      messageInstance = Message.warning({
        message: '已经最大了，不能再大了',
        onClose: () => (messageInstance = null),
      });
    }
    return true;
  }

  return false;
}

// 鼠标按下选中当前坐标的最上面那个设计
export function transformMousedown(transformer, stage, designList, e) {
  let node = transformer.nodes()[0];

  // 获取鼠标位置下的所有节点
  const nodes = getMousedownNodes(stage, designList).filter((node) => CANVAS_TYPE_TRANSFORMER_MOUSEDOWN_FILTER.includes(node.attrs.type));

  // 选中第一个节点
  if (nodes.length > 1) {
    // node = nodes.at(-1);
    node = nodes.at(0);
    if (transformer) {
      // 将node替换
      transformer.attachTo(node); // 将transformer附加到节点
      node.fire('mousedown', e); // 模拟点击
    }
  }
}

/**
 * 获取鼠标按下的节点
 * @param stage
 * @param designList
 */
export function getMousedownNodes(stage, designList) {
  // console.log('designList', designList);
  // 获取鼠标位置
  const mouseX = stage.getPointerPosition().x;
  const mouseY = stage.getPointerPosition().y;

  // 获取鼠标位置下的所有节点
  return designList.value.filter((node) => {
    return node?.intersects({ x: mouseX, y: mouseY });
  });
}
