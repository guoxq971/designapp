import { Konva } from '@/fnDesigner/three/konva';

export function createDesignGroup() {
  // 设计图组-设计图/文字
  const group = new Konva.Group({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  });
  // 设计图组-背景色/背景图
  const backgroundGroup = new Konva.Group({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  });

  return {
    group,
    backgroundGroup,
  };
}
