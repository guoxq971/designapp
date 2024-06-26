import lodash from 'lodash';
import { Message } from 'element-ui';
import { GRequest, METHOD } from '@/utils/request';

// 图片分类的版本
const picVersion = 'v1.0';
// 一级分类默认值 v1.0 = '0' | v2.0 = ''
export const onePicDetailValue = '0';

class Group {
  constructor(name, seqId, value) {
    this.name = name || '';
    this.seqId = seqId || '';
    this.value = value || '';
  }
}

class Pic {
  constructor(name, seqId, value) {
    this.name = name || '';
    this.seqId = seqId || '';
    this.value = value || '';
  }
}

class PicResult {
  constructor(list, map) {
    this.list = list;
    this.map = map;
  }
}
class GroupResult {
  constructor(list, map) {
    this.list = list;
    this.map = map;
  }
}

/*
 * 处理一级小组分类
 * @param {array} list 小组列表
 * @param {GroupResult} result 小组结果
 * */
export function disposeGroupSelect(list) {
  list = lodash.cloneDeep(list);
  let map = new Map();
  let arr = [];
  list.forEach((item) => {
    arr.push(new Group(item.label, item.id, item.id));
    map.set(item.id, item.children?.map((child) => new Group(child.label, child.id, child.id)) || []);
  });
  arr.unshift(new Group('小组一级分类', '', ''));
  return new GroupResult(arr, map);
}

/*
 * 处理小组二级分类
 * @param {string} id 小组一级id
 * @param {map} map 分组好的小组map
 * @return {array} list 小组二级列表
 * */
export async function disposeGroupSelectByTwo(id, map) {
  let list = [];
  if (map.has(id)) {
    list = map.get(id);
  }
  list.unshift(new Group('小组二级分类', ''));
  return Promise.resolve(list);
}

/*
 * 这个方法由版本控制 picVersion
 * */
export async function disposePicSelect(id = onePicDetailValue) {
  if (picVersion === 'v1.0') {
    return await disposePicSelectV1(id);
  } else if (picVersion === 'v2.0') {
    return await disposePicSelectV2();
  }
}

/*
 * 处理图片分类(一级分类)v1.0
 * @param {string} id 小组一级id
 * @return {PicResult} picResult 图片分类结果
 * */
export async function disposePicSelectV1(id = onePicDetailValue) {
  let obj = { type: 1, parentId: id };
  // 获取图片一级分类
  let res = await GRequest(`/base-web/CMDesignImageTypeAct/getListByParentCode.act?type=1`, METHOD.GET, obj);
  let list = [];
  let map = new Map();
  if (res.data.retState === '0') {
    list = res.data.cmDesignImageTypes.map((item) => {
      map.set(item.seqId, item);
      return new Pic(item.name, item.seqId, item.seqId);
    });
  }
  list.unshift(new Pic('一级图片分类', onePicDetailValue, onePicDetailValue));
  return new PicResult(list, map);
}
/*
 * 处理图片分类(一级分类)v2.0[先用1.0, 2.0景聪说先不改]
 * @return {PicResult} picResult 图片分类结果
 * */
export async function disposePicSelectV2() {
  // 获取图片一级分类
  let res = await GRequest(`/base-web/CMDesignImageGxtypeAct/selectTypeFirst.act`, METHOD.GET);
  let list = [];
  let map = new Map();
  if (res.data.retState === '0') {
    list = res.data.data.map((item) => {
      map.set(item.seqId, item);
      return new Pic(item.name, item.seqId, item.seqId);
    });
  }
  list.unshift(new Pic('一级图片分类'));
  return new PicResult(list, map);
}

/*
 * 处理图片分类(二级分类)v2.0
 * @param {string} id 一级分类id
 * @param {PicResult} picResult 图片分类结果
 * */
export async function disposePicSelectByTwo(id) {
  let obj = { type: 1, parentId: id };
  let res = await GRequest(`/base-web/CMDesignImageTypeAct/getListByParentCode.act?type=1`, METHOD.GET, obj);
  // 获取图片二级分类
  let list = [];
  let map = new Map();
  if (res.data.retState === '0' && id !== onePicDetailValue) {
    list = res.data.cmDesignImageTypes.map((item) => {
      map.set(item.seqId, item);
      return new Pic(item.name, item.seqId, item.seqId);
    });
  }
  list.unshift(new Pic('二级图片分类'));
  return new PicResult(list, map);
}
/*
 * 处理图片分类(二级分类)v1.0
 * @param {string} id 一级分类id
 * @param {PicResult} picResult 图片分类结果
 * */
export async function disposePicSelectByTwo2(id) {
  // 获取图片二级分类
  let res = await GRequest(`/base-web/CMDesignImageGxtypeAct/getListByParentCode.act`, METHOD.GET, { parentId: id });
  let list = [];
  let map = new Map();
  if (res.data.retState === '0') {
    list = res.data.CMDesignImageGxtypes.map((item) => {
      map.set(item.seqId, item);
      return new Pic(item.name, item.seqId, item.seqId);
    });
    list.unshift(new Pic('二级图片分类'));
  }
  return new PicResult(list, map);
}

/*
 * 获取表格勾选的数据
 * @param {ref} tableRef 表格ref
 * @return {array} selectData 勾选的数据
 * */
export async function getTableSelectData(tableRef) {
  let selectData = tableRef?.selection || [];
  if (selectData.length === 0) {
    Message.warning('请先勾选图片再进行批量操作！');
    return Promise.reject('请先勾选图片再进行批量操作！');
  }
  return selectData;
}
