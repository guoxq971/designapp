import Konva from 'konva';
import { GRequest, METHOD } from '@/utils/request';
import { changeDpiDataUrlWithUpload, designToImage } from '@/designClass/util/design/toImage/common';
import { getUuid } from '@/utils/fnUtils';

/**
 * 保存文字参数
 * @param {import('@/design').SaveProdResponse} prodRes 参数
 * @param {SubmitParamDesigner} param 参数
 */
export async function saveTextWord(prodRes, param) {
  const textList = param.configurations?.filter((e) => e.isText) || [];
  if (textList.length === 0) return;

  await GRequest(`/base-web/cm/cmProductWord/save`, METHOD.POST, {
    productId: prodRes.id,
    productCode: prodRes.code,
    wordParam: JSON.stringify(textList.map((e) => e.fnData)),
  });
}

/**
 * 文字转png图片并上传
 * @prop {TextDesign} konvaText
 */
export async function textToImageUpload(konvaText) {
  const $design = konvaText;
  const $view = $design.$view;
  const attrs = $design.node.attrs;
  const param = $design.param;
  const print = $view.getInfo().print;

  const viewId = $view.id;
  const imgWidth = print.width;
  const imgHeight = print.height;
  const textParam = {
    x: attrs.x,
    y: attrs.y,
    rotation: attrs.rotation || 0,
    scaleX: attrs.scaleX || 1,
    scaleY: attrs.scaleY || 1,
    text: param.text,
    fontColor: param.fontColor,
    fontSize: param.fontSize,
    fontFamily: param.fontFamily,
    fontWeight: param.fontWeight,
    fontItalic: param.fontItalic,
    textDecoration: param.textDecoration,
    param: param,
  };
  // 将文字通过konva canvas转成图片, 上传到服务器, 得到designId
  const base64 = await textToImage(textParam, imgWidth, imgHeight);

  // 修改图片DPI，转为file，上传到服务器
  const name = `custom_${getUuid()}_${viewId}.png`;
  const { checkRes } = await changeDpiDataUrlWithUpload(base64, { name: name });

  return { checkRes, textParam, imgWidth, imgHeight };
}

/**
 * 文字转png图片
 * @param {import('@/design').TextToImageParam} param
 * @param {number} width
 * @param {number} height
 * @returns {Promise<string>} base64
 */
export async function textToImage(param, width, height) {
  const opt = {
    width: width,
    height: height,
    callback: async () => {
      // 创建文字
      const fontStyle = [param.fontWeight, param.fontItalic].filter(Boolean).join(' ');
      const t = new Konva.Text({
        // x: param.x,
        // y: param.y,
        // scaleX: param.scaleX,
        // scaleY: param.scaleY,
        // rotation: param.rotation,
        text: param.text,
        fontSize: param.fontSize,
        fontStyle: fontStyle,
        textDecoration: param.textDecoration, // 下划线
        fontFamily: param.fontFamily,
        fill: param.fontColor,
      });
      const offsetX = t.width() / 2;
      const offsetY = t.height() / 2;
      t.setAttrs({
        offsetX,
        offsetY,
        x: offsetX,
        y: offsetY,
        scaleX: param.scaleX,
        scaleY: param.scaleY,
      });
      t.setAttrs({
        // x: (t.width() * t.scaleX()) / 2 + param.x,
        x: param.x,
        // y: (t.height() * t.scaleY()) / 2 + param.y,
        y: param.y,
        rotation: param.rotation,
      });

      return t;
    },
  };

  return await designToImage(opt);
}
