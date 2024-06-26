import { uuid } from '@/laod/utils';
// import { getImgUrl } from '@/services/common/common';
import { vm } from '@/main';

// 截取url中的参数后去除url参数
export function redirectCurrentPage(opt) {
  opt = Object.assign(
    {
      callback: null,
    },
    opt,
  );
  if (!opt.callback) return;
  const queryParams = getQueryParams();
  if (!queryParams || !Object.keys(queryParams).length) return;
  opt.callback(queryParams);
  // if (queryParams.status) {
  //   statusTab.value = queryParams.status;
  // }

  const url = new URL(window.location.href);
  url.search = '';
  // 使用history.replaceState重置URL中的参数
  window.history.replaceState({}, document.title, url.pathname);
}

// 获取url中的参数
export function getQueryParams() {
  // 获取当前 URL 的查询字符串
  const queryString = window.location.search;

  // 创建 URLSearchParams 对象
  const urlParams = new URLSearchParams(queryString);

  // 初始化一个空对象存储键值对
  const params = {};

  // 使用 forEach 方法遍历所有参数
  urlParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

// 获取图片前缀
export async function getBasePathImg() {
  vm.basePathImg = process.env.VUE_APP_API_BASE_IMG_URL;
  return process.env.VUE_APP_API_BASE_IMG_URL;

  // if (!vm.basePathImg) {
  //   const res = await getImgUrl();
  //   vm.basePathImg = res.data.sysValue;
  //   localStorage.setItem('basePathImg', res.data.sysValue);
  //   return res.data.sysValue;
  // } else {
  //   return vm.basePathImg;
  // }
}
export function getBasePathImgUrl() {
  // return vm.basePathImg;
  vm.basePathImg = process.env.VUE_APP_API_BASE_IMG_URL;
  return process.env.VUE_APP_API_BASE_IMG_URL;
}

export function getUuid() {
  return uuid();
}

// 解决el-button点击后不会失焦的问题
export function elButtonBlur(evt) {
  let target = evt.target;
  if (target.nodeName == 'SPAN') {
    target = evt.target.parentNode;
  }
  target.blur();
}

// 获取本地用户信息
export function getLocalUserInfo() {
  // JSON.parse(localStorage.getItem('LOGIN_USER_INFORMATION'));
  const local = localStorage.getItem('LOGIN_USER_INFORMATION');
  const notList = ['undefined', 'null', 'NaN', 'false', 'true', '[]', '{}'];
  if (local && !notList.includes(local)) {
    return JSON.parse(local);
  } else {
    return null;
  }
}
