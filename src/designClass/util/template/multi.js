import { complexMultiDispose, findMultiDesignImg } from '@/fnDesigner/js/multi';
import { Message } from 'element-ui';
import { DESIGN_TYPE, SUBMIT_TYPE_IS_NEED_COPY, SUBMIT_TYPE_IS_USE_MIRROR, SUBMIT_TYPE_SAVE_NUM_BTN, TEMPLATE_TYPE } from '@/designClass/core/define';

/**
 * 获取渲染多角度列表
 * @param {Appearance} appearance 颜色item
 * @param {array} renderMultiList 点击渲染后端返回的多角度
 * @returns {RenderMulti[]} 渲染多角度列表
 */
export function getMultiList(appearance, renderMultiList = []) {
  // 简单多角度
  const simple = appearance?.multiAngleImages || [];
  // 复杂多角度
  const complex = complexMultiDispose(appearance.multiAngleImages4Compose);
  const resultList = [...simple, ...complex];
  const list = resultList.map((item) => {
    let {
      composeId, //复杂
      multiId, //简单
    } = item;
    let designImg = findMultiDesignImg(renderMultiList, composeId, multiId);
    // 顺序 = image - mask - texture
    // image = background_white_positive
    // mask = mask_white_positive
    // texture = public_texture_white_positive [这张不需要]
    let result = {
      multiId: item.multiId, // 排序id
      composeId: item.composeId,
      id: item.multiId,
      bgImg: item.image,
      designImg: null,
      prodImg: null,
      multiItem: item,
    };
    if (composeId) {
      // 复杂
      result.designImg = item.mask;
      result.prodImg = designImg;
    } else {
      // 简单
      result.designImg = designImg || '';
      result.prodImg = item.mask;
    }
    return result;
  });
  list.sort((a, b) => a.multiId - b.multiId);

  return list;
}

/**
 * 获取提交参数
 * @param {Template} $template
 * @returns Promise<SubmitParamDesigner>
 */
export async function getSubmitParam($template) {
  const $app = $template.$app;
  const configurations = []; //设计列表
  let adminImage = ''; //是否有管理员图参与
  let isNeedCopy = SUBMIT_TYPE_IS_NEED_COPY.none; //是否空拷贝
  const saveNumBtn = SUBMIT_TYPE_SAVE_NUM_BTN.render; //保存类型

  let asyncFlag = true; // 是否异步
  let isSelf = true; //是否外采
  // 批量设计
  const static_batchid = localStorage.getItem('static_batchid') || '';
  if (static_batchid) {
    if (saveNumBtn === SUBMIT_TYPE_SAVE_NUM_BTN.color) {
      Message.warning('批量设计时，禁用全颜色合成！');
      return Promise.reject('批量设计时，禁用全颜色合成！');
    }
    asyncFlag = false;
  }

  // 判断是 自产|外采
  if ($template.detail.templateType === TEMPLATE_TYPE.out) isSelf = false;
  if (saveNumBtn === SUBMIT_TYPE_SAVE_NUM_BTN.org) isSelf = false;

  let designViewList, isSomeImage;
  // 设计图数量检测
  switch (isSelf) {
    // 自产
    case true:
      // 设计图数量不能为空
      designViewList = $template.viewList.filter((view) => view.designList.filter((design) => design.node.visible()).length);
      if (designViewList.length === 0) {
        Message.warning('请至少选择一个视图进行设计，再进行保存操作！');
        return Promise.reject('请至少选择一个视图进行设计，再进行保存操作！');
      }

      // 多面设计判断 (当前产品是对面设计,并且只设计了一个视图) isNeedCopy=空拷贝
      isNeedCopy = $template.detail.emptyCopy && $template.viewList.length > 1 && designViewList.length === 1 ? SUBMIT_TYPE_IS_NEED_COPY.copy : SUBMIT_TYPE_IS_NEED_COPY.none;
      break;

    // 外采
    case false:
      if (saveNumBtn === SUBMIT_TYPE_SAVE_NUM_BTN.org) {
        // 原胚设计
        isSomeImage = $template.viewList.some((view) => view.designList.filter((design) => design.node.visible()).length);
        if (isSomeImage) {
          Message.warning('原胚设计，不可以选择设计图！');
          return Promise.reject('原胚设计，不可以选择设计图！');
        }
      }
      break;
  }

  // 【校验】设计图碰撞检测
  const isCollide = $template.viewList
    .filter((view) => !view.getInfo().print)
    .some((view) =>
      view.designList
        .filter((design) => design.node.visible())
        .some((design) => {
          return design.isCollide();
        }),
    );
  if (isCollide) {
    Message.warning('你所设计的图案超过了打印的区域');
    return Promise.reject('你所设计的图案超过了打印的区域');
  }

  // 是否有管理图库的设计图参与设计
  adminImage = $template.viewList.some((view) => view.designList.filter((design) => design.node.visible()).some((image) => image.detail?.isAdminOrg)) ? 1 : '';

  // 组装设计图
  for (let view of $template.viewList.toReversed()) {
    const designDataList = [];
    const designList = view.designList.filter((design) => design.node.visible());
    const i = designList.findIndex((design) => [DESIGN_TYPE.backgroundColor, DESIGN_TYPE.backgroundImage].includes(design.type));
    if (i !== -1) {
      const bgDesign = designList[i];
      designList.splice(i, 1);
      designList.unshift(bgDesign);
    }
    for (const design of designList) {
      designDataList.push(await design.getSubmitData());
    }
    configurations.unshift(...designDataList);
  }

  if (configurations.length === 0) {
    Message.warning('请至少选择一个视图进行设计，再进行保存操作！');
    return Promise.reject('请至少选择一个视图进行设计，再进行保存操作！');
  }

  // 空拷贝, 进入这个判断只会有一个view设计了图案
  if (isNeedCopy && isSelf) {
    // 有设计的view
    const tempView = $template.viewList.find((view) => view.designList.length);
    const tempCgs = configurations.find((e) => e.printArea.id === tempView.id);
    for (let view of $template.viewList.toReversed()) {
      // 跳过有设计的view
      if (view.id === tempView.id) continue;
      // 复制一份
      const configurationItem = lodash.cloneDeep(tempCgs);
      configurationItem.isCopy = '1';
      configurationItem.printArea.id = view.id; //当前设计所在的视图id
      configurations.unshift(configurationItem);
    }
  }

  return {
    asyncFlag: asyncFlag,
    appearance: { id: $app.activeColorId },
    defaultValues: { defaultView: { id: $app.activeViewId } },
    templateType: $template.detail.templateType,
    productType: { id: $template.detail.id },
    isUseMirror: SUBMIT_TYPE_IS_USE_MIRROR.none,
    isNeedCopy: isNeedCopy,
    static_batchid: static_batchid,
    saveNumBtn: saveNumBtn,
    adminImage: adminImage,
    configurations: configurations,
    // 固定值
    creator: 'Tablomat8',
    fullSvg: {},
    restrictions: {
      freeColorSelection: false,
      example: false,
    },
  };
}
