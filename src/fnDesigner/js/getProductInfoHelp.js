// 获取图片展示
export const getShowImage = (item) => {
  if (item.templateImages && item.templateImages.length) {
    return {
      image: item.templateImages[1],
      texture: item.templateImages[0],
    };
  }
  return item.appearances[0].views[0];
};

// 获取颜色列表
export function getColorList(detail) {
  const result = [];
  detail?.appearances?.forEach((item) => {
    result.push({
      ...item,
      id: item.id,
      colorCode: item.colors[0].value,
      colorName: item.name,
    });
  });
  return result;
}

// 获取尺码列表
export function getSizeList(detail) {
  const result = [];
  if (detail) {
    detail.sizes.forEach((item) => {
      result.push({
        id: item.id,
        name: item.name,
        ...item,
        disabled: false,
      });
    });
  }
  // console.log('尺码列表', cloneDeep(result));
  return result;
}
