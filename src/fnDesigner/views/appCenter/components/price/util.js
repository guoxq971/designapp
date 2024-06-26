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
