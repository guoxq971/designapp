import Cookie from 'js-cookie';
import { mapMutations } from 'vuex';
// import {logout} from '@/services/user'
import { loginInfoSave } from '@/services/common/common';
import { vm } from '@/main';
import { useTool } from '@/utils/tool';
import store from '@/store';
import { reqAxiosCancel, resAxiosCancel } from '@/utils/axios-interceptors-cancel';
import { setAxiosHeadersAes } from '@/utils/aes';

// 401拦截
const resp401 = {
  /**
   * 响应数据之前做点什么
   * @param response 响应对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {*}
   */
  onFulfilled(response, options) {
    // console.log('响应数据之前做点什么', response, options);
    if (!response)
      return {
        code: 0,
        data: '',
        bmNotResponse: true,
      };
    // 文件下载
    if (response.headers['content-disposition']) {
      return response;
    }
    const { message } = options;
    // 设计器
    if (response.config.url.indexOf('designerAPP-web') !== -1) {
      if (!response.data.status) {
        message.error({
          dangerouslyUseHTMLString: true,
          title: '错误',
          message: response.data.msg || '设计接口出现错误',
          duration: 0,
          showClose: true,
        });
      }
    }
    // 正常流程
    else if (Object.prototype.hasOwnProperty.call(response.data, 'code')) {
      let isOk = true;
      // response.data.code <= 100000 = 接口里面单独处理
      if (response.data.code != 0 && response.data.code <= 100000) {
        let urlList = store.state.axiosReq.list;
        let orgUrl = response.request.responseURL;
        if (urlList.some((item) => item.url === orgUrl)) {
          let d = urlList.find((item) => item.url === orgUrl);
          // 接口报错是否需要提示
          if (d && !d.isError) {
            isOk = false;
          }
        }
        if (isOk) {
          message.error({
            dangerouslyUseHTMLString: true,
            title: '错误',
            message: response.data.message,
            duration: 10000,
            showClose: true,
          });
        }
      }
      //老项目接口返回体处理
    }
    // 旧系统流程
    else if (Object.prototype.hasOwnProperty.call(response.data, 'retState')) {
      if (response.data.retState != 0) {
        message.error({
          dangerouslyUseHTMLString: true,
          title: '错误',
          message: response.data.msg || response.data.retMsg,
          duration: 10000,
          showClose: true,
        });
      }
    } else {
      return response;
    }
    return response;
  },
  /**
   * 响应出错时执行
   * @param error 错误对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {Promise<never>}
   */
  onRejected(error, options /*source*/) {
    console.log('响应出错时执行');
    const { message } = options;
    const { response } = error;
    if (response && response.status != 200) {
      if (response.status === 401) {
        console.log('401错误！！！');
        let textJson = {
          错误码: response.status,
          接口路径: response.config.url,
          错误原因: JSON.stringify(response.data),
        };
        const loginRedisKey = Cookie.get('LOGIN_REDIS_KEY');
        loginInfoSave({
          types: 1,
          ssotoken: loginRedisKey,
          account: JSON.parse(window.localStorage.getItem('LOGIN_USER_INFORMATION'))?.accountName,
          contentText: JSON.stringify(textJson),
          url: response.config.url,
        });
        if (loginRedisKey) {
          message.warning({
            title: '错误',
            message: '登录超时或账号在其他地方登录,请重新登录!!',
            duration: 10000,
            showClose: true,
          });
        }
        useTool.clearStorage();
        useTool.clearAllCookie();
        //跳转至登录页面
        vm.$router.push({ path: '/fnLogin' });
      } else {
        message.error({
          title: '错误',
          message: '系统异常,操作失败!!!',
          duration: 10000,
          showClose: true,
        });
        console.log('-------------------------------------------------------------------------');
        console.log(`错误码:${response.status}`);
        console.log(`接口路径:${response.config.url}`);
        console.log(`错误原因:${response.data}`);
        console.log('-------------------------------------------------------------------------');
      }
    }
    return Promise.reject(error);
  },
};

const resp403 = {
  onFulfilled(response, options) {
    if (!response)
      return {
        code: 0,
        data: '',
        bmNotResponse: true,
      };
    const { message } = options;
    if (response && response.code === 403) {
      message.error('请求被拒绝');
    }
    return response;
  },
  onRejected(error, options) {
    const { message } = options;
    const { response } = error;
    if (response && response.status === 403) {
      message.error('请求被拒绝');
    }
    return Promise.reject(error);
  },
};

let timeOut = null;

const reqCommon = {
  ...mapMutations('account', ['newSet']),
  /**
   * 发送请求之前做些什么
   * @param config axios config
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {*}
   */
  onFulfilled(config, options) {
    const { message } = options;
    const { xsrfCookieName, xsrfHeaderName } = config;
    setAxiosHeadersAes();
    // /auth-web/passport/loginCheck这是校验接口，不需要token
    if (Cookie.get(xsrfCookieName) && Cookie.get(xsrfCookieName) != xsrfHeaderName && config.url.indexOf('/auth-web/passport/loginCheck') === -1) {
      clearTimeout(timeOut);
      // 接口记录
      const url = `/base-web/logininfo/loginInfo/save`;
      if (config.url.indexOf(url) === -1) {
        let textJson = {
          headers: JSON.stringify(config.headers),
          接口路径: config.url,
        };
        loginInfoSave({
          types: 2,
          ssotoken: Cookie.get('LOGIN_REDIS_KEY'),
          account: JSON.parse(window.localStorage.getItem('LOGIN_USER_INFORMATION'))?.accountName,
          contentText: JSON.stringify(textJson),
          url: 'response.config.url',
        });
      }
      timeOut = setTimeout(() => {
        // 提示后在跳转登陆页
        message.warning('认证 token 已过期，请重新登录');
        setTimeout(() => {
          window.location.replace('/fnLogin');
        }, 1000);
      }, 300);
      return config;
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

export default {
  request: [reqAxiosCancel, reqCommon], // 请求拦截
  response: [resAxiosCancel, resp401, resp403], // 响应拦截
};
