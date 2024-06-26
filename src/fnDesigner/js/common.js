/*
 * el-button 失去焦点
 * */
export function buttonBlur(evt) {
  if (!evt) return;
  let target = evt.target;

  if (target.nodeName == 'SPAN') {
    target = evt.target.parentNode;
  } else if (target.nodeName == 'ICONPARK-ICON') {
    target = evt.target.parentNode.parentNode;
  }
  if (target.nodeName !== 'BUTTON') {
    target = target.parentNode;
  }
  if (target.nodeName !== 'BUTTON') {
    target = target.parentNode;
  }
  if (target.nodeName !== 'BUTTON') {
    target = target.parentNode;
  }
  target.blur();
}

export function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function encodeUrl(obj) {
  const str = Object.keys(obj).reduce((pre, cur) => {
    const res = obj[cur] || '';
    return pre + `${cur}=${res}&`;
  }, '');
  return `?${encodeURI(str)}`;
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
