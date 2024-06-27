import { GRequest, METHOD } from '@/utils/request';

/**
 * 查询物流方式列表 1级 new
 * @returns {Promise<AxiosResponse<T>>}
 */
export async function getPhysicalListOneNew(obj) {
  return GRequest('/fba-web/pack/dyFbaExpressType/tree/first', METHOD.POST, obj);
}

// 根据物流方式和渠道获取派送方式
export async function dispatchList(obj, types) {
  return GRequest(`/fba-web/express/dyFbaExpressRef/get`, METHOD.POST, obj, types);
}

/**
 * 查询物流方式列表 2级 new
 * @returns {Promise<AxiosResponse<T>>}
 */
export async function getPhysicalListTwoNew(obj) {
  return GRequest('/fba-web/pack/dyFbaExpressType/tree/second', METHOD.POST, obj);
}

// 无分页列表
export async function noPageList(obj) {
  return GRequest(`/fba-web/express/dyFbaExpressDelivery/get`, METHOD.POST, obj);
}

export default {
  getPhysicalListOneNew,
  dispatchList,
  getPhysicalListTwoNew,
};
