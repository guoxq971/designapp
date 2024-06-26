/**
 * 复杂多角度处理
 * @param {array} list 图片列表
 * @return {array} resultList 处理后的图片列表
 * */
export function complexMultiDispose(list) {
  // 打上组的标签 composeGroup
  list.forEach((item) => (item.composeGroup = item.composeId.split('')[0]));
  // 按标签分组存在 map
  let resultMap = new Map();
  list.forEach((e) => {
    if (!resultMap.has(e.composeGroup)) {
      resultMap.set(e.composeGroup, [e]);
    } else {
      let d = resultMap.get(e.composeGroup);
      d.push(e);
      resultMap.set(e.composeGroup, d);
    }
  });
  let tempList = [...resultMap.values()];
  let resultList = [];
  // 取组的第一个为首选，其余放在字段 multiList 中
  tempList.forEach((e) => resultList.push({ ...e[0], multiList: e }));
  return resultList;
}

/**
 * 查找多角度设计图
 * @param {array} multiDesignImgList 多角度设计图组
 * @param {string} composeId 产品的composeId
 * @param {string} multiId 产品的多角度id
 * @return {string} url 设计图的url
 * */
export function findMultiDesignImg(multiDesignImgList, composeId, multiId) {
  let url = '';
  // 复杂多角度查找
  if (composeId) {
    let d = multiDesignImgList.find((e) => e.composeId == composeId);
    if (d) url = d.img;
  }
  // 简单多角度查找
  else {
    let d = multiDesignImgList.find((e) => e.multiId == multiId);
    if (d) url = d.img;
  }
  return url;
}
