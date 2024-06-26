import { GRequest, METHOD } from '@/utils/request';
import { TEMPLATE_DESIGN_TYPE } from '@/designClass/core/define';

export async function getTemplateConfig(templateNo) {
  // 获取通用
  const { commonConfig, isUseCommon } = await getCommon(templateNo);
  // 获取精细
  const { refineConfigList, isUseRefine } = await getRefine(templateNo);

  return {
    commonConfig,
    isUseCommon,
    refineConfigList,
    isUseRefine,
  };
}

// 获取精细尺码的详情
export async function getRefineSizeDetail(templateNo, size) {
  const res = await GRequest(`/base-web/CMProductTemplateAct/selectTemplateList4DesignWithSize.act`, METHOD.POST, { templateNo, size });
  if (res.data.code !== 0) return;
  const detail = res.data.data;
  // console.log('获取精细尺码的详情', detail);

  return detail;
}
// 获取精细尺码的详情
export async function getRefineSizeConfig3d(templateNo, size) {
  const res = await GRequest(`/base-web/template/cmProductTemplateConfig/get3dConfig/${templateNo}/${size}`, METHOD.GET);
  if (res.data.code !== 0) return;
  const config3d = res.data.data;
  // console.log('获取精细尺码的配置', config3d);

  return config3d;
}

// 获取精细
async function getRefine(templateNo) {
  // 获取精细配置
  const refineConfigRes = await GRequest(`/base-web/cm/cmProductTemplate/getSizeListByTemplateNo/${templateNo}`, METHOD.GET);
  if (refineConfigRes.data.code !== 0) return { refineConfigList: [], isUseRefine: false };
  let refineConfigList = refineConfigRes.data.data || [];
  // 过滤掉不可用
  refineConfigList = refineConfigList.filter((e) => {
    e.type = TEMPLATE_DESIGN_TYPE.refine;
    e.isUse = e.hasUpload2d === 1 && e.openflag2d === 0;
    return e.isUse;
  });
  const isUseRefine = refineConfigList.length > 0;
  // console.log('精细 (可用)', refineConfigList);

  return {
    refineConfigList,
    isUseRefine,
  };
}

// 获取通用
async function getCommon(templateNo) {
  //根据模板号获取3d配置（通用模板）
  const commonConfigRes = await GRequest(`/base-web/template/cmProductTemplateConfig/get3dConfig/${templateNo}`, METHOD.GET);
  if (commonConfigRes.data.code !== 0) return { commonConfig: {}, isUseCommon: false };
  const commonConfig = commonConfigRes.data.data;
  // 通用是否可用
  const isUseCommon = commonConfig.hasUpload2d === 1 && commonConfig.openflag2d === 0;

  commonConfig.isUse = isUseCommon;
  commonConfig.type = TEMPLATE_DESIGN_TYPE.common;
  // console.log('通用 配置', commonConfig);
  // console.log('通用 是否可用', isUseCommon);

  return {
    commonConfig,
    isUseCommon,
  };
}
