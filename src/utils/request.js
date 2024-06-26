import axios from 'axios';
import Cookie from 'js-cookie';
import { Message } from 'element-ui';
import { setAxiosHeadersAes } from '@/utils/aes';
import { fnRequest } from '@/fnConfig/fnRequest';
// 跨域认证信息 header 名
export const xsrfHeaderName = 'LOGIN_REDIS_KEY';
export const xsrTokenName = 'XSRF-TOKEN_NAME';

export const Orderhost = process.env.VUE_APP_API_ORDER_URL;
export const host = '/api';
const Bhost = '/api/base-web';
export const Ghost = '/api';
export const GhostLocal = 'http://192.168.2.58:4523/m1/1874960-0-default'; // 后端本地
export const Designer = process.env.VUE_APP_API_DESIGNER_URL;
axios.defaults.timeout = 15 * 1000;
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = xsrfHeaderName;
axios.defaults.xsrfHeaderName = Cookie.get(xsrfHeaderName);
axios.defaults.headers['Content-Type'] = 'application/json; charset=UTF-8';
axios.defaults.headers['ssotoken'] = Cookie.get(xsrfHeaderName);
// axios.defaults.headers[Cookie.get(xsrTokenName)] = Cookie.get(xsrfHeaderName);
// console.log('Cookie.get(xsrTokenName)', Cookie.get(xsrTokenName)); //undefined
// console.log('xsrfCookieName', xsrfHeaderName); //LOGIN_REDIS_KEY
setAxiosHeadersAes();

// 认证类型
const AUTH_TYPE = {
  BEARER: 'Bearer',
  BASIC: 'basic',
  AUTH1: 'auth1',
  AUTH2: 'auth2',
};

// http method
const METHOD = {
  GET: 'get',
  POST: 'post',
};

/**
 * axios请求
 * @param url order请求
 * @param method {METHOD} http method
 * @param params 请求参数
 * @returns {Promise<AxiosResponse<T>>GET
 */
export async function DRequest(url, method, params, types = {}) {
  switch (method) {
    case METHOD.GET:
      return axios.get(Designer + url, { params });
    case METHOD.POST:
      return axios.post(Designer + url, params, types);
    default:
      return axios.get(Designer + url, { params });
  }
}

/**
 * axios请求
 * @param url base请求地址
 * @param method {METHOD} http method
 * @param params 请求参数
 * @returns {Promise<AxiosResponse<T>>}
 */
async function GRequest(url, method, params = {}, types = {}) {
  // return fnRequest(...arguments);
  switch (method) {
    case METHOD.GET:
      return axios.get(Ghost + url, { params, ...types });
    case METHOD.POST:
      return axios.post(Ghost + url, params, types);
    default:
      return axios.get(Ghost + url, { params, ...types });
  }
}

/**
 * 加载 axios 拦截器
 * @param interceptors
 * @param options
 */
function loadInterceptors(interceptors, options) {
  const { request, response } = interceptors;
  // 加载请求拦截器
  request.forEach((item) => {
    let { onFulfilled, onRejected } = item;
    if (!onFulfilled || typeof onFulfilled !== 'function') {
      onFulfilled = (config) => {
        return config;
      };
    }
    if (!onRejected || typeof onRejected !== 'function') {
      onRejected = (error) => Promise.reject(error);
    }
    axios.interceptors.request.use(
      (config) => {
        // 获取cookie
        const loginRedisKey = Cookie.get(xsrfHeaderName);
        config.headers['ssotoken'] = loginRedisKey;
        return onFulfilled(config, options);
      },
      (error) => onRejected(error, options),
    );
  });
  // 加载响应拦截器
  response.forEach((item) => {
    let { onFulfilled, onRejected } = item;
    if (!onFulfilled || typeof onFulfilled !== 'function') {
      onFulfilled = (response) => {
        return response;
      };
    }
    if (!onRejected || typeof onRejected !== 'function') {
      onRejected = (error) => Promise.reject(error);
    }
    axios.interceptors.response.use(
      (response) => {
        return onFulfilled(response, options);
      },
      (error) => {
        var originalRequest = error.config;
        if (originalRequest?.url) console.log('超时接口', originalRequest?.url);
        if (error.message && error.message.indexOf('timeout') != -1 && !originalRequest._retry) {
          Message.error('请求超时！');
          originalRequest._retry = true;
        }
        // 401 清除token信息并跳转到登录页面
        if (error.message && error.message.indexOf('Request failed with status code 401') != -1) {
          let timer = null;
          clearTimeout(timer);
          // 是否存在登陆的KEY
          if (Cookie.get('LOGIN_REDIS_KEY')) {
            Message.warning({
              title: '错误',
              message: '登录超时或账号在其他地方登录,请重新登录!!',
              duration: 10000,
              showClose: true,
            });
          }
          timer = setTimeout(() => {
            //跳转至登录页面
            // vm.$router.push({ path: '/fnLogin' });
          }, 1000);
        }
        onRejected(error, options /*source*/);
      },
    );
  });
}

export { METHOD, AUTH_TYPE, loadInterceptors, GRequest };
