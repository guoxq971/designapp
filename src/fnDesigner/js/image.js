import { Message } from 'element-ui';

// 判断是否完整:有大图取值大图，没有则默认
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

/**
 * 烫印产品处理
 * @param {object} prodDetail - 产品
 * @param {object} imageDetail - 设计图详情数据
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
