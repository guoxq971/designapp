import Cookie from 'js-cookie';
import { defaultHome, whiteList } from '@/fnConfig/config';
import { vm } from '@/main';
import { accountOutUtil } from '@/fnComponents/accountOutDialog/util';
import { useTool } from '@/utils/tool';
import { loginInfoSave } from '@/services/common/common';
import { GRequest, METHOD } from '@/utils/request';

export const resStatusList = [
  { status: 503, errMsg: '服务异常,服务器错误', remark: '服务异常,服务器错误' },
  { status: 500, errMsg: '服务异常,服务器错误', remark: '服务异常,服务器错误' },
  { status: 400, errMsg: '服务异常,接口错误', remark: '服务异常,接口错误' },
  { status: 401, errMsg: '', remark: '鉴权失败', fn: fn401 },
  { status: 403, errMsg: '服务异常,请求被拒绝', remark: '服务异常,请求被拒绝' },
  { status: 404, errMsg: '服务异常,接口错误', remark: '服务异常,接口错误' },
];

function fn401(response) {
  // 错误日志
  // const textJson = {
  //   错误码: response.status,
  //   接口路径: response.config.url,
  //   错误原因: JSON.stringify(response.data),
  // };
  // GRequest('/base-web/logininfo/loginInfo/save', METHOD.POST, {
  //   types: 1,
  //   ssotoken: getLoginKey(),
  //   account: JSON.parse(window.localStorage.getItem('LOGIN_USER_INFORMATION'))?.accountName,
  //   contentText: JSON.stringify(textJson),
  //   url: response.config.url,
  // });
  notLogin({ msg: '登录超时或账号在其他地方登录,请重新登录!!' });
}

export function getLoginKey() {
  return Cookie.get('LOGIN_REDIS_KEY');
}

// 获取跳转的路径
export function getJumpPath() {
  let path = defaultHome;
  const fullPath = vm.$router.app._route.fullPath;
  if (!whiteList.includes(fullPath.split('?')[0])) {
    path = fullPath;
  }
  return path;
}

// 跳转默认页面
export function jumpDefaultPath() {
  const fullPath = vm.$router.app._route.fullPath;
  if (!whiteList.includes(fullPath.split('?')[0])) {
    // 页面不在白名单内跳
    vm.$router.push({ path: defaultHome });
  }
}
// 不在登陆状态下的处理
export function notLogin(opt = {}) {
  const { msg } = Object.assign({ msg: '' }, opt);
  accountOutUtil().emitAccountOutEmitter({ msg: msg });
  // 清除缓存
  useTool.clearStorage();
  useTool.clearAllCookie();
  // 跳转
  jumpDefaultPath();
}
