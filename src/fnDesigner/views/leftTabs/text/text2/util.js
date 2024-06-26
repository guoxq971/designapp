export const textParam = {
  text: '',
  fontColor: '#000',
  fontSize: 20,
  fontPath: '', //字体路径
  fontFamily: 'sans-serif', //'微软雅黑',
  fontWeight: 'normal', //normal,bold
  fontItalic: 'normal', //normal,italic
  textDecoration: 'none', //none,underline
  textAlign: 'left', //left,center,right
  lineHeight: 1, //字体行高
  letterSpacing: 0, //字体间距
};

export class FontFamily {
  constructor(label, value, remark) {
    this.label = label || '';
    this.value = value || '';
    this.remark = remark || '';
  }
}

export const fontFamilyList = [
  new FontFamily('默认', 'sans-serif', 'default'),
  // new FontFamily('test', 'test', 'custom'),
  // new FontFamily('OZ焦糖体', 'OzCaramel', 'custom'),
  new FontFamily('851手写杂书体', 'tegakizatsu', 'custom'),
  new FontFamily('iSlide云犹体', 'iSlide云犹体', 'custom'),
  new FontFamily('Aa剑豪体', 'Aa剑豪体', 'custom'),
  // new FontFamily('element-icons', 'element-icons', 'default'),
  new FontFamily('fantasy', 'fantasy', 'default'),
  new FontFamily('微软雅黑', 'Microsoft YaHei', 'default'),
  new FontFamily('宋体', 'SimSun', 'default'),
  new FontFamily('黑体', 'SimHei', 'default'),
  new FontFamily('楷体', 'KaiTi', 'default'),
  new FontFamily('隶书', 'LiSu', 'default'),
  new FontFamily('幼圆', 'YouYuan', 'default'),
  new FontFamily('华文行楷', 'STXingkai', 'default'),
  new FontFamily('华文楷体', 'STKaiti', 'default'),
  new FontFamily('华文宋体', 'STSong', 'default'),
  new FontFamily('华文中宋', 'STZhongsong', 'default'),
  new FontFamily('华文新魏', 'STXinwei', 'default'),
  new FontFamily('华文细黑', 'STXinghei', 'default'),
  new FontFamily('华文仿宋', 'STFangsong', 'default'),
  new FontFamily('华文彩云', 'STCaiyun', 'default'),
  new FontFamily('华文琥珀', 'STHupo', 'default'),
  new FontFamily('华文隶书', 'STLiti', 'default'),
  new FontFamily('方正舒体', 'FZShuTi', 'default'),
  new FontFamily('方正姚体', 'FZYaoti', 'default'),
  // new FontFamily('方正粗黑宋简体', 'FZCuHei-B01S', 'default'),
  // new FontFamily('方正粗倩简体', 'FZCuQian-M03S', 'default'),
  // new FontFamily('方正粗雅宋简体', 'FZCuYuan-M03S', 'default'),
  // new FontFamily('方正大标宋简体', 'FZDaBiaoSong-B05S', 'default'),
  // new FontFamily('方正大黑简体', 'FZDaHei-B02S', 'default'),
  // new FontFamily('方正大黑_GBK1', 'FZDaHei-G01S', 'default'),
  // new FontFamily('方正大黑_GBK2', 'FZDaHei-G', 'default'),
];

export const presetColors = [
  '#F51E30',
  '#F76707',
  '#F2DE33',
  '#EAC588',
  '#FFC0CB',
  '#0099FF',
  '#1E9658',
  '#FFFFFF',
  '#00224C',
  '#4C2075',
  '#C0C0C0',
  '#665544',
  '#333333',
  '#750033',
  '#07462C',
  '#000000',
];
