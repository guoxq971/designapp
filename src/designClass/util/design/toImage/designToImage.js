import Konva from 'konva';
// import { getDesignImageInfo } from '@/services/designApp/designPlatform/productDesign';
import { Message } from 'element-ui';
import { loadImage } from '@/fnDesigner/js/image';
import { getUuid } from '@/utils/fnUtils';
import { changeDpiDataUrlWithUpload, designToImage } from '@/designClass/util/design/toImage/common';
import { GRequest, METHOD } from '@/utils/request';

/**
 * 设计图转换为图片
 * @param {ImageDesign} konvaImage
 * @returns {Promise<{checkRes:import('@/design').UploadImageCheckItem}>}
 */
export async function designToImageUpload(konvaImage) {
  try {
    const $design = konvaImage;
    const $view = konvaImage.$view;
    const viewId = $view.id;

    const imageId = $design.detail.id;
    const scaleX = $design.node.attrs.scaleX;
    const scaleY = $design.node.attrs.scaleY;

    // console.log('设计图转换为图片 param=>', konvaImage);
    // 加载图片
    const result = await GRequest(`/base-web/CMDesignImageAct/getDesignImageInfo.act`, METHOD.GET, { seqId: imageId });
    // console.log('设计图转换为图片 result=>', result);
    if (result.data.retState !== '0') {
      // Message.warning('保存产品失败');
      return Promise.reject('getDesignImageInfo error');
    }
    const basePathImg = process.env.VUE_APP_API_BASE_IMG_URL;
    if (!basePathImg) {
      Message.warning('保存产品失败');
      return Promise.reject('basePathImg is null');
    }
    const image = await loadImage(basePathImg + result.data.orgImage);
    // const image = await loadImage(konvaImage.detail.hdDesignImage);
    // console.log('设计图转换为图片 image=>', [image]);

    const param = {
      scaleX: scaleX,
      scaleY: scaleY,
      image,
    };

    // 转换为指定参数的图片
    let base64 = await _designToImage(param);

    // 修改图片DPI，转为file，上传到服务器
    const name = `custom_${getUuid()}_${viewId}.png`;
    const { checkRes } = await changeDpiDataUrlWithUpload(base64, { name: name });

    return { checkRes };
  } catch (e) {
    console.log('设计图转换为图片 error=>', e);
    Message.warning('保存产品失败');
    return Promise.reject(e);
  }
}

/**
 * 设计转png图片
 * @returns {Promise<string>} base64
 */
export async function _designToImage(param) {
  const opt = {
    width: param.image.width,
    height: param.image.height,
    callback: async () => {
      return new Konva.Image({
        x: 0,
        y: 0,
        //应该用的原图的宽高 和 宽高比
        width: param.image.width,
        height: param.image.height,
        scaleX: param.scaleX < 0 ? -1 : 1,
        scaleY: param.scaleY < 0 ? -1 : 1,
        offsetX: param.scaleX < 0 ? param.image.width : 0,
        offsetY: param.scaleY < 0 ? param.image.height : 0,
        fillPatternImage: param.image, // 填充图片 (与fill互斥)
      });
    },
  };

  return designToImage(opt);
}
