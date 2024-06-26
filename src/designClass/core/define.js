/**
 * @enum {string} 设计类型
 * */
export const DESIGN_TYPE = {
  text: 'text',
  image: 'image',
  backgroundImage: 'backgroundImage',
  backgroundColor: 'backgroundColor',
  tile: 'tile',
};

/**
 * @enum {string} 模板设计类型 - 通用|精细
 * */
export const TEMPLATE_DESIGN_TYPE = {
  common: 'common', //通用
  refine: 'refine', //精细
};

/**
 * @enum {string} 模式 - 预览|编辑
 * */
export const MODE_TYPE = {
  preview: 'preview', //预览
  edit: 'edit', //编辑
};

/**
 * @enum {string} 辅助线 - 按下|抬起
 * */
export const LINE_TYPE = {
  down: 'down',
  up: 'up',
};

/**
 * @enum {string} 平铺-偏移量类型
 * */
export const TILE_TYPE_OFFSET = {
  x: 'x',
  y: 'y',
};

/**
 * @enum {number} 平铺-镜像类型
 * */
export const TILE_TYPE_MIRROR = {
  none: 0,
  horizontal: 1,
  vertical: 2,
  rotate: 3,
};

/**
 * @enum {string} 选中框当前的操作类型
 * */
export const TRANSFORMER_TYPE = {
  scale: 'scale',
  rotation: 'rotation',
  none: 'none',
};

/**
 * @enum {string} 提交参数-模板类型
 * */
export const TEMPLATE_TYPE = {
  // 自产
  self: '0',
  // 外采
  out: '1',
};

/**
 * @enum {string} 提交参数-空拷贝
 * */
export const SUBMIT_TYPE_IS_NEED_COPY = {
  none: '',
  copy: '1',
};

/**
 * @enum {string} 提交参数-镜像
 * */
export const SUBMIT_TYPE_IS_USE_MIRROR = {
  none: '0',
  mirror: '1',
};

/**
 * @enum {string} 提交参数-保存类型 0:保存产品 1:全颜色合成 2:原胚设计
 * */
export const SUBMIT_TYPE_SAVE_NUM_BTN = {
  // 保存产品
  save: '0',
  // 全颜色合成
  color: '1',
  // 原胚设计
  org: '2',
  // 渲染
  render: '',
};
