import { Konva } from '@/fnDesigner/three/konva';

// 3d配置
export class Config3d {
  size;
  glbPath;
  templateNo;
  viewList;
  colorList;
  useflag;
  uvdflag;
  hasUpload2d;
  hasUpload3d;
  openflag2d;
  openflag3d;

  // sizeType;
  // seqId;
  // gltlPath;
  // zipPath;
  // hasUpload3dAngle;
  // hasUpload2dCommon;
  // hasUpload3dCommon;
  // openflag2dCommon;
  // openflag3dCommon;
}

// 接口数据的视图详情
export class ViewDetail {
  id;
  name;
  viewMaps;
  // perspective;
  // size;
  // viewType;
}

// 视图的 print、printout 数据
export class ViewPrintInfo {
  uvD;
  uvV;
  width;
  height;
  offsetX;
  offsetY;
  printout = {
    d: '',
    v: '',
    x: '',
    y: '',
    width: '',
    height: '',
  };
  print = {
    d: '',
    width: '',
    height: '',
    d_3d: '',
    d_2d: '',
  };
}

/**
 * 视图的 canvas 节点数据
 * @prop {HTMLElement} container 容器
 * @prop {Konva.Stage} stage 舞台
 * @prop {Konva.Group} group 图+文
 * @prop {Konva.Group} backgroundGroup 背景色|背景图
 * @prop {Konva.Group} threeGroup 3d底色
 * @prop {Konva.Group} threeLightGroup 3d高亮
 * @prop {Konva.Layer} pathLayer 车线
 * @prop {Konva.Layer} layer 图层
 * @prop {Konva.Layer} lineLayer 辅助线层
 * @prop {Konva.Transformer} transformer 选中框
 * @prop {DesignNode[]} designList computed 设计图列表+背景图 节点
 */
export class ViewCanvas {
  container; //容器
  stage; //舞台
  group; //图+文
  backgroundGroup; //背景色|背景图
  threeGroup; //3d底色
  threeLightGroup; //3d高亮
  pathLayer; //车线
  layer; //图层
  transformer; //选中框
  designList; //computed 设计图列表+背景图 节点
  lineLayer; //辅助线层
}

// 设计图详情
export class ImageDetail {
  quickimgid;
  seqId;
  name;
  description;
  isAll;
  imageCode;
  orderNums;
  count;
  dpi;
  standard = {
    width: '',
    height: '',
    size: '',
    unit: '',
  };
  creator;
  size = {
    width: '',
    height: '',
    unit: '',
  };
  colors = [];
  designCategories = [];
  id = '';
  isBg;
  tortType;
  previewImg;
  designImg;
  hdDesignImage;
  isRisk;
  lowRiskWords;
  highRiskWords;
  isHasRisk;
}

// 文字参数
export class TextParam {
  fnUuid;
  text;
  fontColor;
  fontSize;
  fontPath;
  fontFamily;
  fontWeight;
  fontItalic;
  textDecoration;
  textAlign;
  lineHeight;
  letterSpacing;
}
