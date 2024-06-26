import { changeDpiDataUrlWithUpload, designToImage } from './toImage/common';
import Konva from 'konva';
import { getUuid } from '@/utils/fnUtils';
import { DESIGN_TYPE } from '@/designClass/core/define';

/**
 * 平铺图转换为图片
 * @param {ImageDesign} konvaImage
 */
export async function TileToImage(konvaImage) {
  const $view = konvaImage.$view;
  const $template = konvaImage.$template;
  const $design = konvaImage;

  const viewId = $view.id;
  const layer = $view.canvas.group.clone();
  const print = $template.detail.printAreas
    .filter((e) => e.defaultView.id == viewId)
    .map((e) => ({
      width: e.boundary.size.width,
      height: e.boundary.size.height,
    }))[0];
  const designTile = layer.children.find((e) => e.attrs.type === DESIGN_TYPE.tile && e.attrs.$design.fnUuid === $design.fnUuid);
  const clip = new Konva.Group({});
  clip.add(designTile);
  // TODO： designTile是一个Group, 尝试将group中的所有image的DOM替换为 1500 的设计图
  //TODO: 猜想1 -> 如果生成的图是 1500x1500, 工厂用的图是服务器上 1500x1500 的原图吗;
  //TODO: 猜想2 -> 所有设计图都是正方形吗？

  // 放大倍数，用于提高图片清晰度
  const scale = 5;

  // 平铺图处理
  const width = print.width * scale;
  const height = print.height * scale;
  clip.scaleX(scale);
  clip.scaleY(scale);
  clip.x(0); //clip.x() * widthScale
  clip.y(0); //clip.y() * heightScale
  clip.clipFunc((ctx) => {
    ctx.rect(0, 0, width, height);
  });

  // 转为base64
  const base64 = await designToImage({
    width: width,
    height: height,
    test: false,
    callback: async () => {
      return clip;
    },
  });

  // 修改图片DPI，转为file，上传到服务器
  const name = `custom_${getUuid()}_${viewId}.png`;
  const { checkRes } = await changeDpiDataUrlWithUpload(base64, { name: name });

  return {
    checkRes,
    width: print.width,
    height: print.height,
  };
}
