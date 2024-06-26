import axios from 'axios';
import { vm } from '@/main';

function createKek(config) {
  // 请求地址
  let requestUrl = config.url;
  try {
    requestUrl = config.url.split('.com')[1].split('?')[0];
  } catch (e) {
    const domain = config.url.match(/(\S*)(?=\/.+?-web\/)/);
    requestUrl = config.url.replace(domain[0], '').split('?')[0];
    // requestUrl = config.url.split('?')[0];
  }
  // console.log('requestUrl', requestUrl);
  // 路由
  const path = vm.$route.path;
  return path + requestUrl + config.bmIsCancel;
}
function removeCancelByKey(key) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].key === key) {
      list.splice(i, 1);
      break;
    }
  }
}
// 请求列表
export const list = [];
/*
【独立页面】内的【接口】在【上一次请求】没回来之前【再请求】的话就【取消上一次请求】
key:路由 + 请求地址 + 标识(是否会被下一个同样的请求取消的标识 1 2 3 4)
* */
class CancelType {
  key = '';
  cancel = null;
  constructor(key, cancel) {
    this.key = key;
    this.cancel = cancel;
  }

  cancelFn() {
    this.cancel();
    removeCancelByKey(this.key);
  }
}
export const reqAxiosCancel = {
  /**
   * 发送请求之前做些什么
   * @param config axios config
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {*}
   */
  onFulfilled(config, options) {
    // 是否记录取消请求
    if (config.bmIsCancel) {
      const key = createKek(config);
      // console.log('key', key);
      // 取消上一个请求
      for (let item of list) {
        if (item.key === key) {
          // console.log('取消上一个请求', item);
          item.cancelFn(); //取消请求
        }
      }
      // 每个请求都有一个cancel函数
      config.cancelToken = new axios.CancelToken(function(c) {
        list.push(new CancelType(key, c));
      });
    }
    return config;
  },
  /**
   * 请求出错时做点什么
   * @param error 错误对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {Promise<never>}
   */
  onRejected(error, options) {
    const { message } = options;
    message.error(error.message);
    return Promise.reject(error);
  },
};
export const resAxiosCancel = {
  /**
   * 响应数据之前做点什么
   * @param response 响应对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {*}
   */
  onFulfilled(response, options) {
    // console.log(response.config, options);
    removeCancelByKey(createKek(response.config));
    return response;
  },
  /**
   * 响应出错时执行
   * @param error 错误对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {Promise<never>}
   */
  onRejected(error, options, source) {
    // console.log('响应出错时执行', error, options, source);
    return Promise.reject(error);
  },
};
