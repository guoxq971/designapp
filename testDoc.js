/**
 * @class AppTest
 * @prop {Template[]} templateList 模板列表
 * @prop {array} priceList 价格列表
 */

/**
 * @class Template
 * @prop {object} $app 应用实例
 * @prop {object} detail 模板详情
 * @prop {View[]} viewList 视图列表
 * @prop {object} config3d 3d配置
 * @prop {object} template3d 3d模板
 */

/**
 * @class View
 * @prop {object} $app 应用
 * @prop {object} $template 模板
 * @prop {string} id 视图id
 * @prop {string} name 视图名称
 * @prop {object} canvas 画布
 * @prop {Design[]} designList 设计列表
 * @prop {function} getInfo 获取信息(解析后)
 * @prop {function} updateMesh 更新材质
 */

/**
 * @class Design
 * @prop {object} $app 应用
 * @prop {object} $template 模板
 * @prop {object} $view 视图
 * @prop {string} type 设计类型
 * @prop {object} node 节点
 * @prop {object} param 文字参数
 * @prop {object} detail 图片详情
 * @prop {string} colorCode 背景颜色
 * @prop {object} tile 平铺
 */

/**
 * @extends AppTest
 */
class Test {}
