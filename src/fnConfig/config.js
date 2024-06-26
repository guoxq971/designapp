// 默认首页
export const defaultHome = '/fnHome';

// 默认登录页
export const defaultLogin = '/fnHome';

// 路由白名单
export const whiteList = [
  { label: '404', value: '/404', isMenu: false }, // isMenu 是否需要刷新菜单栏
  { label: '403', value: '/403', isMenu: false },
  { label: '首页', value: defaultHome, isMenu: false },
  { label: '全部商品', value: '/fn/product/selection/productAll', isMenu: true },
  { label: '设计器', value: '/designApp/designPlatform/productDesignCanvas', isMenu: true },
  { label: '商品详情', value: '/fn/productInfo', isMenu: true },
];
