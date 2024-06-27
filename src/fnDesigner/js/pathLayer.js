// 获取path
export function getPath(pathLayer, type) {
  return pathLayer.children.find((e) => e.attrs.type === type);
}
