import { Ghost, host } from '@/utils/request';
import Cookie from 'js-cookie';

export class ConfigDesign {
  //推荐dpi 主要用于设计器
  recommendDpi = '';
  //推荐宽 主要用于设计器
  recommendWidth = '';
  //推荐高 主要用于设计器
  recommendHeight = '';
  //工厂生产版 文件路径
  factoryProductionDocuments = '';
  // 文件名称
  fileName = '';
  constructor(obj) {
    if (obj) {
      this.recommendDpi = obj.recommendDpi;
      this.recommendWidth = obj.recommendWidth;
      this.recommendHeight = obj.recommendHeight;
      this.factoryProductionDocuments = obj.factoryProductionDocuments;
      this.fileName = obj.fileName || '';
    }
  }
}

export const downloadImg = (url, params = {}, fn = () => {}, domain = 1, mode = 1) => {
  let keys = Object.keys(params);
  let str = '';
  let domainUrl = Ghost;
  let net;
  if (keys.length === 0) {
    str += ``;
  } else {
    keys.forEach((key) => (str += `&${key}=${params[key]}`));
  }
  if (domain == 1) {
    domainUrl = Ghost;
  }
  if (domain == 2) {
    domainUrl = host;
  }
  const r = `${domainUrl}${url}?ssotoken=${Cookie.get('LOGIN_REDIS_KEY')}${str}`;
  // console.log('url', r);
  if (mode == 1) {
    net = window.open(r);
    net.addEventListener('beforeunload', () => {
      !!fn && fn();
    });
  }
  if (mode == 2) {
    window.location.href = r;
  }
};
