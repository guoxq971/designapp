import { downloadImg, isFileSuffixTool, uuid } from '@/laod/utils';
import lodash from 'lodash';
import _ from 'lodash';
import Cookie from 'js-cookie';
import axios from 'axios';
import { vm } from '@/main';
import { useLocalCache } from '@/utils/useLocalCache';
import { AnCore } from '@/pages/home/home/home/components/Core';

const _proto_ = (type) => {
  return Object.prototype.toString.call(type);
};
export const isUndefined = (val) => {
  return _proto_(val) == '[object Undefined]';
};
export const isNull = (val) => {
  return _proto_(val) == '[object Null]';
};
export const isFunction = (val) => {
  return _proto_(val) == '[object Function]';
};
export const isNumber = (val) => {
  return _proto_(val) == '[object Number]';
};
export const isSymbol = (val) => {
  return _proto_(val) == '[object Symbol]';
};
export const isBooleam = (val) => {
  return _proto_(val) == '[object Booleam]';
};
export const isString = (val) => {
  return _proto_(val) == '[object String]';
};
export const isObject = (val) => {
  return _proto_(val) == '[object Object]';
};
export const isArray = (val) => {
  return _proto_(val) == '[object Array]';
};
export const useTool = {
  imgUrl,
  // 根据seqIds获取小组数据
  getGroupItem(groupIds) {
    let groupItem = [];
    useTool.localCache.getGroup().forEach((item) => {
      if (groupIds.includes(item.seqId)) {
        groupItem.push(item);
      }
    });
    return groupItem;
  },
  // 本地缓存
  localCache: {
    getGroup() {
      return JSON.parse(localStorage.getItem('GROUP_CACHE')) || [];
    },
  },
  // 账号退出时候的动作
  logout() {
    // 清空所有的localStorage
    useTool.clearStorage();
    // 清空本地sessionStorage缓存
    useTool.clearSession();
    // 清空所有cookies
    useTool.clearAllCookie();
    // 清除存储在axios中的cookie
    axios.defaults.xsrfHeaderName = '';
    if (vm) {
      // 清除vuex中的数据
      vm.$store.commit('globalSelectArray/clearAllList');
      // 清除设计师缓存
      vm.$store.commit('globalSelectArray/clearDesigner');
      // 清除工厂模板数据缓存
      vm.$store.commit('globalSelectArray/clearGroupOfTemplate');
    }
  },
  // 清空本地localStorage缓存
  clearStorage: () => {
    //不需要清除的缓存
    const KEYS = [
      'historySearchMenu',
      'deliveryCodeList', // 工厂送货单样品交接记录
      AnCore.KEY, //公告详情页面的提醒按钮
      'operationSummary', // 运营情况汇总列表字段权限
      ...Object.values(useLocalCache.keys),
    ];
    // 清除本地存储，除了 historySearchMenu
    Object.keys(window.localStorage).forEach((key) => {
      if (!KEYS.includes(key)) {
        window.localStorage.removeItem(key);
      }
    });
  },
  // 清空本地sessionStorage缓存
  clearSession: () => {
    //不需要清除的缓存
    const KEYS = [];
    // 清除本地存储
    Object.keys(window.sessionStorage).forEach((key) => {
      if (!KEYS.includes(key)) {
        window.sessionStorage.removeItem(key);
      }
    });
  },
  // 数据深拷贝
  deepClone: lodash.cloneDeep,
  // 导出文件
  downloadImg: downloadImg,
  lodash: lodash,
  tableArraySpanMethod: tableArraySpanMethod,
  // 数组合并 details
  arrayMergeDetails: arrayMergeDetails,
  // 表格合并使用, 产生 mergeRow
  arrayTableByMerge: arrayTableByMerge,
  isEmptyPlus: isEmptyPlus,
  isEmptyPlusReturnKey: isEmptyPlusReturnKey,
  /*
   *   判断是否不为空
   *   @return true=不为空 or false=为空
   * */
  isNotEmpty,
  /*
   *   判断是否为空
   *   @return true=为空 or false=不为空
   * */
  isEmpty,
  // 设置Cookie
  setCookie,
  // 设置Cookie不存一级域名下
  setCookieNoDomain,
  // 清除cookie
  clearAllCookie,
  // 判断cookie是否过期或者退出
  uuid: uuid,
  sameCookie,
  // 按钮权限列表
  btnList,
};

function imgUrl(src) {
  let url = '';
  // 是否是指定后缀图片
  if (isFileSuffixTool.isCheckSuffix(src)) {
    url = isFileSuffixTool.getPic(src);
  } else {
    let result1 = true; //是否需要加前缀
    let result2 = (src + '').indexOf('http') === -1; //url中如果存在 http 就不加前缀
    let result4 = (src + '').indexOf('https') === -1; //url中如果存在 https 就不加前缀
    let result3 = src !== ''; //图片不能为空
    if (result3 && result1 && result2 && result4) {
      url = vm.basePathImg + src;
    } else {
      url = src;
    }
  }

  return url;
}

function isEmptyPlus() {
  for (let i = 0; i < arguments.length; i++) {
    const argument = arguments[i];
    // 先判断是否为数字
    if (lodash.isNumber(argument)) {
      return false;
    }
    if (!lodash.isEmpty(argument)) {
      return false;
    }
  }
  return true;
}

function isEmptyPlusReturnKey() {
  for (let i = 0; i < arguments.length; i++) {
    const argument = arguments[i];
    // 先判断是否为数字
    if (lodash.isNumber(argument)) {
      return { flag: false, key: argument };
    }
    if (!lodash.isEmpty(argument)) {
      return { flag: false, key: argument };
    }
  }
  return { flag: true, key: '' };
}

/*
 * 表格合并使用
 * @param fields 需要合并的字段
 * @fields {array} 需要合并的字段
 * @isReverse {boolean} fields不需要合并的字段
 * */
function tableArraySpanMethod(fields, row, column, isReverse = false, mergeRowField = '') {
  let flag = fields.includes(column.property);
  if (isReverse) flag = !fields.includes(column.property);
  if (flag) {
    const mergeRow = mergeRowField ? row[`${mergeRowField}BmSpan`] : row.mergeRow;
    if (mergeRow !== 0) {
      return [mergeRow, 1];
    } else {
      return [0, 0];
    }
  } else {
    return [1, 1];
  }
}

// 数组合并 details
function arrayMergeDetails(list, idField = 'seqId', detailsField = 'details') {
  let newList = [];
  list.forEach((item) => {
    if (item[detailsField].length) {
      item[detailsField].forEach((detailItem) => {
        newList.push({
          ...item,
          ...detailItem,
          parentSeqId: item[idField],
          detailSeqId: detailItem[idField],
          bmDetail: detailItem,
        });
      });
    } else {
      newList.push({
        ...item,
        parentSeqId: item[idField],
        detailSeqId: '',
        bmDetail: {},
      });
    }
  });
  return newList;
}

/***
 * el-table 表格数据合并需要
 * @param arr
 * @param field 根据什么字段做合并
 * @param field2
 * @param isClone
 */
function arrayTableByMerge(arr, field, field2 = '', isClone = true) {
  let list = isClone ? _.cloneDeep(arr) : arr;
  let value = '@#￥@#%￥%#@#@￥@#￥@#%￥%#@#@￥@#￥@#%￥%#@#@￥';
  let headId = '';
  const obj = {};
  for (let item of list) {
    item.uuid = uuid();
    if (item[field] !== value) {
      value = item[field];
      headId = item.uuid;
      item.mergeRow = 1; //合并行数
      item[`${field}BmSpan`] = 1; //合并行数
      item.headId = item.uuid; //唯一标识
      if (field2) obj[headId] = [item];
    } else {
      let index = list.findIndex((e) => e.uuid === headId);
      if (index > -1) {
        list[index][`${field}BmSpan`] += 1;
        item[`${field}BmSpan`] = 0;
        list[index].mergeRow += 1;
        item.mergeRow = 0;
        item.headId = headId;
        if (field2) obj[headId].push(item);
      }
    }
  }
  if (field2) {
    for (let key of Object.keys(obj)) {
      arrayTableByMerge(obj[key], field2, '', false);
    }
  }
  return list;
}

function isEmpty(val) {
  let result = false;
  // 如果是数组
  if (Array.isArray(val) || isArray(val)) {
    result = val.length === 0;
  }
  // 如果是字符串
  else if (isString(val)) {
    if (val === '' || val === undefined || val === null) {
      result = true;
    }
  }
  // 如果是 undefined null
  else if (val === '' || val === undefined || val === null) {
    result = true;
  }
  // 如果是对象
  else if (isObject(val)) {
    result = Object.keys(val).length === 0;
  }
  // 如果是数字
  else if (isNumber(val)) {
    result = false;
  }
  // 如果是 null 或者 undefined
  else if (isNull(val) || isUndefined(val)) {
    result = true;
  } else {
    throw new Error(`${val}该参数既不是数组，也不是字符串，也不是数字，也不是对象`);
  }
  return result;
}

function isNotEmpty(val) {
  let result = true;
  // 如果是数组
  if (Array.isArray(val) || isArray(val)) {
    result = val.length !== 0;
  }
  // 如果是字符串
  else if (isString(val)) {
    if (val === '' || val === undefined || val === null) {
      result = false;
    }
  }
  // 如果是 undefined null
  else if (val === '' || val === undefined || val === null) {
    result = false;
  }
  // 如果是对象
  else if (isObject(val)) {
    result = Object.keys(val).length !== 0;
  }
  // 如果是数字
  else if (isNumber(val)) {
    result = true;
  } else if (isNull(val) || isUndefined(val)) {
    result = false;
  } else {
    throw new Error('该参数既不是数组，也不是字符串，也不是数字，也不是对象');
  }
  return result;
}

/**
 * 设置cookie
 * @param name-名称
 * @param value-值
 * @param day-时间
 * @param isDay-是否按天
 * @domain domain-域名
 */
function setCookie(name, value, day, isDay = true, domain) {
  if (isDay) {
    let date = new Date();
    date.setDate(date.getDate() + day);
    // 没有设置domain表示存在三级域名下面
    document.cookie = name + '=' + value + ';expires=' + date + ';path=/';
  } else {
    let date = new Date();
    date.setTime(date.getTime() + day * 60 * 60 * 1000);
    //domain=.cnblogs.com;写入cookie到主域 子域名都可用,path=/表示本站全部路径都可使用,expires过期时间
    document.cookie = `${name}=${value};expires=${date.toGMTString()};domain=.${domain};path=/`;
  }
  Cookie.set(name, value, { expires: day });
}

/**
 * 设置cookie,不存域名
 * @param name-名称
 * @param value-值
 * @param hour-过期时间(小时)
 */
function setCookieNoDomain(name, value, hour) {
  let date = new Date();
  date.setTime(date.getTime() + hour * 60 * 60 * 1000);
  // expires: 过期时间
  Cookie.set(name, value, { expires: date });
}

/**
 * 清除Cookie
 */

function clearAllCookie() {
  const keys = document.cookie.match(/[^ =;]+(?==)/g);
  if (keys) {
    for (let i = keys.length; i--; ) {
      // 清除当前域名路径的有限日期
      document.cookie = keys[i] + '=0;path=/;expires=' + new Date(0).toUTCString();
      // Domain Name域名 清除当前域名的
      document.cookie = keys[i] + '=0;path=/;domain=' + document.domain + ';expires=' + new Date(0).toUTCString();
      // 清除一级域名下的或指定的
      document.cookie =
        keys[i] +
        '=0;path=/;domain=' +
        document.domain
          .split('.')
          .slice(-2)
          .join('.') +
        ';expires=' +
        new Date(0).toUTCString();
    }
  }
  Cookie.remove('LOGIN_REDIS_KEY');
}

/**
 * 判断cookie和axios在请求头设置的xsrfHeaderName是否一致，不一致说明退出了或者是cookie过期了
 */
function sameCookie() {
  const loginRedisKey = Cookie.get('LOGIN_REDIS_KEY');
  const xsrfHeaderName = axios.defaults.xsrfHeaderName;
  if (loginRedisKey && loginRedisKey === xsrfHeaderName) {
    return true;
  } else {
    return false;
  }
}

/**
 * 按钮权限列表
 */

function btnList() {
  const BTN_LIST = JSON.parse(localStorage.getItem('LOGIN_USER_BTN_LIST'));
  if (BTN_LIST) {
    return BTN_LIST;
  } else {
    return [];
  }
}
