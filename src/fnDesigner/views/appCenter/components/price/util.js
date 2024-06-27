import { GRequest, METHOD } from '@/utils/request';

/**
 * 获取重组后的表头
 * @param {Array} list 模板价格列表
 * @returns {Object}
 * */
export function getHeaderObj(list) {
  const headerObj = {};
  for (const item of list) {
    // 区分尺码 | 颜色;
    const str = item.list.reduce((pre, cur) => {
      return pre + cur.num + '、' + cur.price + '、';
    }, '');
    if (!headerObj[str]) headerObj[str] = [item.prop];
    else headerObj[str].push(item.prop);
  }
  return headerObj;
}

/**
 * 数字限制，必须是对象里的字段  obj.num
 * @param value 取值
 * @param num 几位小鼠
 * @param minus  true=可以是负号, false=不可以符号
 * @param isPrefixZero
 * @returns {string}
 */
export const getMoney = (value, num = 0, minus, isPrefixZero = false) => {
  let size;
  let value1 = value;
  let valueType = typeof value;
  if (typeof value !== 'string') {
    // 转成字符串
    value1 = value.toString();
  }
  if (minus) {
    size = value1.replace(/[^-\d.]/g, '');
    let index = size.indexOf('-');
    if (index > -1) {
      if (index === 0) {
        let index2 = size.indexOf('-', 1);
        if (index2 > -1) {
          size = size.substr(0, size.length - 1);
        }
      }
      if (index > 0) {
        size = size.replace(/[-]/g, '');
      }
    }
  } else {
    size = value1.replace(/[^\d.]/g, '');
  }
  if (!isPrefixZero) {
    // 保证数字前不能有0 (如若数字前有0没有.的话,把整个数据替换成0)
    size = size.replace(/^[0]+[0-9]*$/g, 0);
  }
  //保证只有出现一个.
  size = size.replace(/\.{2,}/g, '.');
  //必须保证第一个为数字而不是.
  size = size.replace(/^\./, '');
  //保证.只出现一次，而不能出现两次以上
  size = size
    .replace('.', '$#$')
    .replace(/\./g, '')
    .replace('$#$', '.');
  //只能输入0个小数
  if (num === 0) {
    size = size.replace(/^(-)*(\d+)\.*$/, '$1$2');
  } else {
    const d = Array.from({ length: num }, () => '\\d').join('');
    const regExp = new RegExp('^(-)*(\\d+)\\.(' + d + ').*$'); // \d\d\d\d\d\d
    size = size.replace(regExp, '$1$2.$3');
  }
  // //只能输入1个小数
  // if (num === 1) {
  //   size = size.replace(/^(-)*(\d+)\.(\d).*$/, '$1$2.$3');
  // }
  // //只能输入2个小数
  // if (!num || num === 2) {
  //   size = size.replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
  // }
  // //只能输入3个小数
  // if (num === 3) {
  //   size = size.replace(/^(-)*(\d+)\.(\d\d\d).*$/, '$1$2.$3');
  // }
  // //只能输入4个小数
  // if (num === 4) {
  //   size = size.replace(/^(-)*(\d+)\.(\d\d\d\d).*$/, '$1$2.$3');
  // }
  // //只能输入5个小数
  // if (num === 5) {
  //   size = size.replace(/^(-)*(\d+)\.(\d\d\d\d\d).*$/, '$1$2.$3');
  // }
  // //只能输入6个小数
  // if (num === 6) {
  //   size = size.replace(/^(-)*(\d+)\.(\d\d\d\d\d\d).*$/, '$1$2.$3');
  // }
  let resSize = size;
  if (valueType === 'number') {
    // 转成字number类型
    resSize -= 0;
  }
  return resSize;
};

/**
 * 加载
 *  需要对方法进行同步操作
 * (1) return api().then()
 * (2) let res = await api()
 * @param loadingKey loading的key
 */
export function loading(loadingKey = 'loading') {
  return function(target, name, descriptor) {
    const method = descriptor.value;
    descriptor.value = async function() {
      const _this = this._isVue ? this : target;
      let res;
      try {
        _this[loadingKey] = true;
        // 代码走到这里，会直接调用这个额方法
        res = await method.apply(_this, arguments);
      } finally {
        _this[loadingKey] = false;
      }
      return res;
    };
  };
}

export async function pageList(obj) {
  return GRequest(`/fba-web/express/dyFbaExpressPrice/list/${obj.pageNum}/${obj.pageSize}`, METHOD.POST, obj);
}

// 校验文件后缀
export const isFileSuffixTool = {
  file: {
    excel: require('./img/excel.jpeg'),
    pdf: require('./img/pdf.jpg'),
    txt: require('./img/txt.jpeg'),
    zip: require('./img/zip.jpg'),
    doc: require('./img/doc.jpg'),
    font: require('./img/front.png'),
  },
  pass_suffix: {
    excel: ['csv', 'xls', 'xlsx'],
    pdf: ['pdf'],
    txt: ['txt'],
    zip: ['zip', 'rar'],
    doc: ['docx', 'doc'],
    font: ['ttf', 'otf'],
  },
  fields: function() {
    return [...this.pass_suffix.excel, ...this.pass_suffix.pdf, ...this.pass_suffix.txt, ...this.pass_suffix.zip, ...this.pass_suffix.doc, ...this.pass_suffix.font];
  },
  // 是否存在指定后缀 true=存在，false=不存在
  isCheckSuffix: function(url) {
    let suffix = this.suffix(url?.toLowerCase());
    return this.fields().includes(suffix);
  },
  // 返回后缀
  suffix: function(url) {
    if (url) {
      let arr = url.split('.');
      return arr[arr.length - 1]?.toLowerCase();
    }
  },
  // 返回指定图片
  getPic: function(url) {
    let suffix = this.suffix(url);
    let src = '';
    if (this.pass_suffix.excel.includes(suffix)) {
      src = this.file.excel;
    }
    if (this.pass_suffix.pdf.includes(suffix)) {
      src = this.file.pdf;
    }
    if (this.pass_suffix.txt.includes(suffix)) {
      src = this.file.txt;
    }
    if (this.pass_suffix.zip.includes(suffix)) {
      src = this.file.zip;
    }
    if (this.pass_suffix.doc.includes(suffix)) {
      src = this.file.doc;
    }
    if (this.pass_suffix.font.includes(suffix)) {
      src = this.file.font;
    }
    return src;
  },
};
