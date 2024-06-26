import { TextParam } from '@/designClass/interface/interface';

/**
 * @desc 获取文本节点的参数
 * @param textNode
 * @returns {TextParam}
 */
export function getTextParamByNode(textNode) {
  const opt = textNode.attrs;
  const fontStyle = opt.fontStyle.split(' ');
  const fontItalic = fontStyle[0];
  const fontWeight = fontStyle[1];
  const fontColor = opt.fill;
  return {
    fnUuid: opt.fnUuid,
    text: opt.text,
    fontColor: fontColor,
    fontSize: opt.fontSize,
    fontPath: opt.fontPath,
    fontFamily: opt.fontFamily,
    fontWeight: fontWeight,
    fontItalic: fontItalic,
    textDecoration: opt.textDecoration,
    textAlign: opt.textAlign,
    lineHeight: opt.lineHeight,
    letterSpacing: opt.letterSpacing,
  };
}
