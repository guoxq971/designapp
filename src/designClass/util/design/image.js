import { ImageDetail } from '@/designClass/interface/interface';
import { Message } from 'element-ui';
import { DESIGN_TYPE } from '@/designClass/core/define';
import { DesignerApp } from '@/designClass/core/designerAPP/designerApp';

/**
 * 获取设计图收藏id
 * @param {ImageDetail} item 设计图详情
 * @returns {string|*}
 */
export function getImageId(item) {
  let id;
  // 这是从收藏列表进来的
  if (!!item.quickimgid) {
    id = item.seqId;
  } else {
    id = item.id;
  }

  return id;
}

/**
 * 校验图片
 * @param {DESIGN_TYPE} type 设计类型
 * @param {ImageDetail|string|null} detail 设计图详情|背景色
 * @param {DesignerApp} $app 设计器
 * @returns {Promise<never>}
 */
export async function verifyImage(type, detail, $app) {
  if (!$app.activeViewId) {
    const msg = '请先选择设计面';
    Message.warning(msg);
    return Promise.reject(msg);
  }
  if (!$app.activeView.canvas) {
    const msg = '设计面出现错误';
    Message.warning(msg);
    return Promise.reject(msg);
  }

  switch (type) {
    case DESIGN_TYPE.image:
    case DESIGN_TYPE.backgroundImage:
      if (![undefined, null, ''].includes(detail)) {
        // 烫印产品校验
        await dispose_HotStamping($app.activeTemplate.detail, detail);

        // 背景图校验
        if (detail.isBg) {
          for (let item of $app.activeCanvasDesignList) {
            if (item.attrs.type === DESIGN_TYPE.backgroundImage) {
              const msg = '一个设计面只能有一个背景图';
              Message.warning(msg);
              return Promise.reject(msg);
            }
            if (item.attrs.type === DESIGN_TYPE.backgroundColor) {
              const msg = '背景色和背景图不能同时存在';
              Message.warning(msg);
              return Promise.reject(msg);
            }
          }
        }
      } else {
        // 背景色校验
        for (let item of $app.activeCanvasDesignList) {
          if (item.attrs.type === DESIGN_TYPE.backgroundImage) {
            const msg = '背景色和背景图不能同时存在';
            Message.warning(msg);
            return Promise.reject(msg);
          }
        }
      }
      break;
  }

  const MAX_COUNT = 5;
  if ($app.activeCanvasDesignList.length >= MAX_COUNT) {
    const msg = `一个设计面最多${MAX_COUNT}个图层`;
    Message.warning(msg);
    return Promise.reject(msg);
  }
}

/**
 * 烫印产品处理
 * @param {TemplateDetail} prodDetail - 产品
 * @param {ImageDetail} imageDetail - 设计图详情数据
 * @return {Promise<Boolean>} - 是否能将设计图插入到产品中
 * */
export function dispose_HotStamping(prodDetail, imageDetail) {
  // [230703 zjb] 所有烫印模板dpi改为150
  const maxDpi = 150;

  // 非烫印模板，直接返回
  if (!prodDetail.isHotStamping) {
    return Promise.resolve(true);
  }

  // 烫印模板，只能使用png格式的设计图，且分辨率≥maxDpi 像素/英寸
  if (imageDetail.designImg.split('.').pop() !== 'png') {
    const msg = '烫印模板仅允许使用png格式设计图';
    Message.warning(msg);
    return Promise.reject(msg);
  }
  if (imageDetail.dpi < maxDpi) {
    let msg = `烫印模板仅允许使用分辨率≥${maxDpi} 像素/英寸的设计图；解决方法：通过PS调整图片分辨率，然后重新上传该图片！`;
    Message.warning(msg);
    return Promise.reject(msg);
  }

  return Promise.resolve(true);
}

/**
 * 加载图片
 * @param src
 * @param param
 * @returns {Promise<unknown>}
 */
export function loadImage(src, param = {}) {
  param = Object.assign({}, param);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.crossOrigin = 'Anonymous';
    if (param.width) image.width = param.width;
    if (param.height) image.height = param.height;
    image.onload = () => {
      resolve(image);
    };
    image.onerror = () => {
      Message.warning('图片加载失败');
      reject(new Error('图片加载失败'));
    };
  });
}

/**
 * 判断是否完整:有大图取值大图，没有则默认
 * @param {ImageDetail} detail
 * @returns {string}
 */
export function getImageUrl(detail) {
  let url = ''; //designImg ,hdDesignImage
  if (isImageUrlPass(detail.hdDesignImage)) {
    url = detail.hdDesignImage;
  } else if (isImageUrlPass(detail.designImg)) {
    url = detail.designImg;
  } else {
    url = detail.previewImg;
  }

  return url;
}

// ①url是否http开头 ②'.'切割最后一段是否是图片格式
export function isImageUrlPass(url) {
  if (!url) return false;
  return !!(
    url.startsWith('http') &&
    ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(
      url
        .split('.')
        .pop()
        .toLowerCase(),
    )
  );
}
